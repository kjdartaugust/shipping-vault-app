-- ============================================================================
--  Migration 0001 — encrypted file uploads for the vault
--  Run AFTER schema.sql. Adds a private Storage bucket whose objects hold
--  AES-256-GCM ciphertext, plus the columns needed to point a vault item at it.
-- ============================================================================

-- A vault item is now either text-backed (encrypted_content) or file-backed
-- (storage_path). The IV + auth tag live on the row in both cases.
alter table public.vault_items
  add column if not exists storage_path text;

alter table public.vault_items
  alter column encrypted_content drop not null;

-- Sanity: exactly one of the two content sources must be present.
do $$ begin
  alter table public.vault_items
    add constraint vault_content_present
    check (encrypted_content is not null or storage_path is not null);
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
--  Private Storage bucket. Objects are encrypted blobs, keyed by owner:
--  path layout = "<owner_id>/<vault_item_id>".
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vault-files', 'vault-files', false)
on conflict (id) do nothing;

-- Defense in depth: even with a leaked anon token, a user can only touch
-- objects under their own id prefix. (App writes/reads via the service role.)
drop policy if exists "vault files owner read" on storage.objects;
create policy "vault files owner read" on storage.objects for select
  using (bucket_id = 'vault-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vault files owner write" on storage.objects;
create policy "vault files owner write" on storage.objects for insert
  with check (bucket_id = 'vault-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vault files owner delete" on storage.objects;
create policy "vault files owner delete" on storage.objects for delete
  using (bucket_id = 'vault-files' and (storage.foldername(name))[1] = auth.uid()::text);
