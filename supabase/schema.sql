-- ============================================================================
--  Shipping & Vault — database schema, RLS policies, triggers
--  Run in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
--  ENUMS
-- ----------------------------------------------------------------------------
do $$ begin
  create type user_role        as enum ('user', 'agent', 'admin');
  create type shipment_status  as enum ('pending','booked','in_transit','out_for_delivery','delivered','cancelled','exception');
  create type service_type     as enum ('standard','express','overnight','freight');
  create type vault_category    as enum ('certificate','contract','invoice','customs','insurance','identity','other');
  create type vault_access      as enum ('private','restricted','time_locked');
  create type notification_type as enum ('info','success','warning','security');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
--  PROFILES (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        user_role not null default 'user',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- SECURITY DEFINER helper avoids recursive RLS when checking roles.
create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
--  SHIPMENTS
-- ----------------------------------------------------------------------------
create table if not exists public.shipments (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references public.profiles(id) on delete cascade,
  agent_id           uuid references public.profiles(id) on delete set null,
  tracking_number    text not null unique default ('SV' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  status             shipment_status not null default 'pending',
  service            service_type not null default 'standard',
  origin             text not null,
  destination        text not null,
  recipient_name     text not null,
  recipient_phone    text,
  weight_kg          numeric(10,2) not null default 0,
  declared_value     numeric(12,2) not null default 0,
  notes              text,
  estimated_delivery date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists shipments_owner_idx on public.shipments(owner_id);
create index if not exists shipments_agent_idx on public.shipments(agent_id);

create table if not exists public.shipment_events (
  id          uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status      shipment_status not null,
  location    text,
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists shipment_events_shipment_idx on public.shipment_events(shipment_id);

create table if not exists public.waybills (
  id             uuid primary key default gen_random_uuid(),
  shipment_id    uuid not null unique references public.shipments(id) on delete cascade,
  waybill_number text not null unique default ('WB' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  payload        jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

-- Log the initial event + keep updated_at fresh, and emit a tracking event on status change.
create or replace function public.shipment_after_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.shipment_events(shipment_id, status, location, note)
    values (new.id, new.status, new.origin, 'Shipment created');
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.shipment_events(shipment_id, status, location, note)
    values (new.id, new.status, new.destination, 'Status updated to ' || new.status);
    insert into public.notifications(user_id, title, body, type)
    values (new.owner_id, 'Shipment ' || new.tracking_number,
            'Status changed to ' || replace(new.status::text,'_',' '), 'info');
  end if;
  return new;
end $$;

drop trigger if exists shipments_insert_evt on public.shipments;
create trigger shipments_insert_evt after insert on public.shipments
  for each row execute function public.shipment_after_change();

drop trigger if exists shipments_update_evt on public.shipments;
create trigger shipments_update_evt after update on public.shipments
  for each row execute function public.shipment_after_change();

-- ----------------------------------------------------------------------------
--  VAULT — encrypted, access-controlled document storage
-- ----------------------------------------------------------------------------
create table if not exists public.vault_items (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles(id) on delete cascade,
  shipment_id      uuid references public.shipments(id) on delete set null,
  category         vault_category not null default 'other',
  access_level     vault_access not null default 'private',
  title            text not null,
  description      text,
  -- Ciphertext + AES-256-GCM parameters. Plaintext NEVER touches the database.
  encrypted_content text not null,
  content_iv        text not null,
  content_tag       text not null,
  file_name         text,
  mime_type         text,
  byte_size         integer not null default 0,
  -- Time-locked release: content is withheld until now() >= unlock_at.
  unlock_at        timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists vault_owner_idx on public.vault_items(owner_id);

-- True when an item is readable right now (no lock, or lock elapsed).
create or replace function public.vault_is_unlocked(item public.vault_items)
returns boolean language sql immutable as $$
  select item.unlock_at is null or item.unlock_at <= now();
$$;

create table if not exists public.vault_audit_log (
  id            uuid primary key default gen_random_uuid(),
  vault_item_id uuid references public.vault_items(id) on delete set null,
  actor_id      uuid references public.profiles(id) on delete set null,
  action        text not null,           -- created | viewed | decrypted | updated | deleted | unlock_denied
  detail        text,
  created_at    timestamptz not null default now()
);
create index if not exists vault_audit_item_idx on public.vault_audit_log(vault_item_id);
create index if not exists vault_audit_actor_idx on public.vault_audit_log(actor_id);

create or replace function public.vault_after_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.vault_audit_log(vault_item_id, actor_id, action, detail)
    values (new.id, new.owner_id, 'created', new.title);
    return new;
  elsif (tg_op = 'UPDATE') then
    new.updated_at = now();
    insert into public.vault_audit_log(vault_item_id, actor_id, action, detail)
    values (new.id, auth.uid(), 'updated', new.title);
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.vault_audit_log(vault_item_id, actor_id, action, detail)
    values (old.id, auth.uid(), 'deleted', old.title);
    return old;
  end if;
  return null;
end $$;

drop trigger if exists vault_insert_evt on public.vault_items;
create trigger vault_insert_evt after insert on public.vault_items
  for each row execute function public.vault_after_change();
drop trigger if exists vault_update_evt on public.vault_items;
create trigger vault_update_evt before update on public.vault_items
  for each row execute function public.vault_after_change();
drop trigger if exists vault_delete_evt on public.vault_items;
create trigger vault_delete_evt after delete on public.vault_items
  for each row execute function public.vault_after_change();

-- ----------------------------------------------------------------------------
--  NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  body       text,
  type       notification_type not null default 'info',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id);

-- ============================================================================
--  ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles        enable row level security;
alter table public.shipments       enable row level security;
alter table public.shipment_events enable row level security;
alter table public.waybills        enable row level security;
alter table public.vault_items     enable row level security;
alter table public.vault_audit_log enable row level security;
alter table public.notifications   enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- shipments -----------------------------------------------------------------
drop policy if exists shipments_select on public.shipments;
create policy shipments_select on public.shipments for select
  using (owner_id = auth.uid() or agent_id = auth.uid() or public.is_admin());
drop policy if exists shipments_insert on public.shipments;
create policy shipments_insert on public.shipments for insert
  with check (owner_id = auth.uid());
drop policy if exists shipments_update on public.shipments;
create policy shipments_update on public.shipments for update
  using (owner_id = auth.uid() or agent_id = auth.uid() or public.is_admin());
drop policy if exists shipments_delete on public.shipments;
create policy shipments_delete on public.shipments for delete
  using (owner_id = auth.uid() or public.is_admin());

-- shipment_events (read follows parent shipment; writes via triggers/agents) -
drop policy if exists events_select on public.shipment_events;
create policy events_select on public.shipment_events for select
  using (exists (select 1 from public.shipments s where s.id = shipment_id
                 and (s.owner_id = auth.uid() or s.agent_id = auth.uid() or public.is_admin())));
drop policy if exists events_insert on public.shipment_events;
create policy events_insert on public.shipment_events for insert
  with check (exists (select 1 from public.shipments s where s.id = shipment_id
                 and (s.agent_id = auth.uid() or s.owner_id = auth.uid() or public.is_admin())));

-- waybills ------------------------------------------------------------------
drop policy if exists waybills_select on public.waybills;
create policy waybills_select on public.waybills for select
  using (exists (select 1 from public.shipments s where s.id = shipment_id
                 and (s.owner_id = auth.uid() or s.agent_id = auth.uid() or public.is_admin())));
drop policy if exists waybills_insert on public.waybills;
create policy waybills_insert on public.waybills for insert
  with check (exists (select 1 from public.shipments s where s.id = shipment_id and s.owner_id = auth.uid()));

-- vault_items — strictly owner-scoped. Even admins cannot read ciphertext;
-- they only ever see the audit trail. This is the privacy guarantee.
drop policy if exists vault_select on public.vault_items;
create policy vault_select on public.vault_items for select
  using (owner_id = auth.uid());
drop policy if exists vault_insert on public.vault_items;
create policy vault_insert on public.vault_items for insert
  with check (owner_id = auth.uid());
drop policy if exists vault_update on public.vault_items;
create policy vault_update on public.vault_items for update
  using (owner_id = auth.uid());
drop policy if exists vault_delete on public.vault_items;
create policy vault_delete on public.vault_items for delete
  using (owner_id = auth.uid());

-- vault_audit_log — owners see their items' trail; admins see everything.
drop policy if exists audit_select on public.vault_audit_log;
create policy audit_select on public.vault_audit_log for select
  using (actor_id = auth.uid() or public.is_admin()
         or exists (select 1 from public.vault_items v where v.id = vault_item_id and v.owner_id = auth.uid()));
drop policy if exists audit_insert on public.vault_audit_log;
create policy audit_insert on public.vault_audit_log for insert with check (true);

-- notifications -------------------------------------------------------------
drop policy if exists notif_select on public.notifications;
create policy notif_select on public.notifications for select using (user_id = auth.uid());
drop policy if exists notif_update on public.notifications;
create policy notif_update on public.notifications for update using (user_id = auth.uid());
drop policy if exists notif_insert on public.notifications;
create policy notif_insert on public.notifications for insert with check (true);
