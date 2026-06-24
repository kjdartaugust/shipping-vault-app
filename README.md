# ShipVault — Secure Shipping & Document Vault

A premium full-stack logistics platform with a **bank-grade document vault**.
Book and track shipments, generate waybills, assign delivery agents — and store
the high-value paperwork that proves a shipment's worth (certificates, contracts,
customs docs) in an **AES-256-GCM encrypted, time-lockable, fully audited** vault.

Built with **Next.js 14 (App Router)**, **Supabase** (Postgres + Auth + RLS),
**Tailwind CSS**, and a high-security dark/light UI.

## Features

**Shipping**
- Booking with auto-generated tracking numbers
- Live tracking timeline (status milestones via DB triggers)
- One-click waybill generation
- Delivery-agent assignment (admin dispatch)

**Vault**
- Field-level AES-256-GCM encryption — plaintext never hits the database
- Categorization (certificate, contract, invoice, customs, insurance, identity)
- **Time-locked release** — documents stay sealed until a chosen date
- Immutable audit trail of every create/view/decrypt/delete
- Owner-only Row Level Security — even admins can't read your ciphertext

**Platform**
- Email/password auth, user + admin dashboards
- Notifications, dark/light mode, responsive premium UI
- Vercel deploy-ready

## Tech & architecture

See [`CLAUDE.md`](./CLAUDE.md) for the architectural deep-dive (three Supabase
clients, the encryption boundary, trigger-driven side effects, RLS model).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
```

1. **Create a Supabase project** → copy the Project URL and anon/service keys
   into `.env.local`.
2. **Generate a vault key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Put it in `VAULT_ENCRYPTION_KEY`.
3. **Apply the schema** — paste `supabase/schema.sql` into the Supabase SQL
   editor and run it (creates tables, triggers, and all RLS policies).
4. **(Optional)** make yourself an admin after signing up:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
5. **Run it:**
   ```bash
   npm run dev
   ```

## Deploy to Vercel

Import the repo, set the four env vars (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`VAULT_ENCRYPTION_KEY`) in the project settings, and deploy. Add your Vercel URL
to Supabase → Authentication → URL Configuration.

> **Security note:** the vault encryption key lives only in env vars. Losing it
> makes stored documents unrecoverable; rotating it requires re-encrypting
> existing items. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
