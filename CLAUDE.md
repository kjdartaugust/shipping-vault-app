# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # local dev server (http://localhost:3000)
npm run build    # production build (run before deploying; catches type errors)
npm run start    # serve the production build
npm run lint     # next lint
```

There is no test suite yet. Database changes are applied by running `supabase/schema.sql` in the Supabase SQL editor (or `supabase db push`); the schema is idempotent and safe to re-run.

## Environment

Copy `.env.example` to `.env.local`. The app degrades gracefully when Supabase
vars are absent (`isSupabaseConfigured` in `src/lib/env.ts` gates auth/middleware),
so it boots for UI work without credentials. Required for full function:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, and `VAULT_ENCRYPTION_KEY` (64 hex chars / 32 bytes).

## Architecture

Next.js 14 App Router + Supabase (Postgres, Auth, RLS) + Tailwind. Path alias `@/*` → `src/*`.

**Three Supabase clients, used deliberately — do not mix them up:**
- `src/lib/supabase/client.ts` — browser (anon key), client components only.
- `src/lib/supabase/server.ts` — request-scoped, reads auth cookie, respects RLS. Default for server components & actions.
- `src/lib/supabase/admin.ts` — service role, **bypasses RLS**. Server-only, trusted paths (admin tasks, audit writes) exclusively.

**Auth/session flow:** `src/middleware.ts` → `src/lib/supabase/middleware.ts#updateSession` refreshes the cookie on every request and redirects unauthenticated users away from `/dashboard`, `/admin`, `/vault`. A Postgres trigger (`handle_new_user`) auto-creates a `profiles` row on signup. Roles (`user`/`agent`/`admin`) live on `profiles.role`; RLS checks them via the `SECURITY DEFINER` helpers `current_role()` / `is_admin()` (defined this way to avoid recursive policy evaluation).

**Vault encryption is the core security boundary.** Plaintext document content is **never** stored in Postgres. `src/lib/crypto.ts` (AES-256-GCM, `server-only`) encrypts on the server before insert and decrypts only after an ownership + time-lock check. Consequences:
- `vault_items` RLS is strictly owner-scoped — even admins cannot read ciphertext; they only ever see the audit trail.
- Time-locked release is enforced in the app layer at decrypt time (compare `now()` to `unlock_at`), not by hiding the row.
- Mutations to `vault_items` fire triggers that write `vault_audit_log` (created/updated/deleted); view/decrypt events are logged from server actions.

**Data-change side effects live in the DB, not the app.** Shipment status changes auto-emit a `shipment_events` row (tracking timeline) and a `notifications` row via triggers. Prefer adding such logic as triggers in `schema.sql` over duplicating it in TypeScript.

**Server Actions** in `src/lib/actions/*` are the write path (auth, shipments, vault). Use `useFormState`/`useFormStatus` on the client; revalidate with `revalidatePath`.

## UI conventions

Theming uses CSS variables in `src/app/globals.css` with `next-themes` (`class` strategy, dark default). The `vault` color (purple) is reserved for security/vault surfaces; `primary` (cyan) for general/shipping. Build on the primitives in `src/components/ui/*` and the `cn()` helper rather than ad-hoc styling. Status/category display metadata is centralized in `src/lib/utils.ts` (`SHIPMENT_STATUS_META`, `VAULT_CATEGORY_LABEL`, `TRACKING_FLOW`).
