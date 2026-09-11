# SalesPilot AI — Supabase v1
Adds email/password login, Supabase Auth, secure per-user lead storage, recent leads, and sign out.

## Setup
1. Supabase → SQL Editor → paste `supabase.sql` → Run.
2. Supabase → Project Settings → API. Copy Project URL and Publishable key.
3. Vercel → Settings → Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   Select Production, Preview, Development.
4. Redeploy.

If email confirmation is enabled, confirm the new user's email before signing in.
Never put a Supabase secret/service-role key in `NEXT_PUBLIC_*` variables.
