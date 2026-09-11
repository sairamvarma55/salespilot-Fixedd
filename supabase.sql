create extension if not exists pgcrypto;
create table if not exists public.leads (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 lead_name text not null, company text, product text not null, goal text, tone text, conversation text, message text not null,
 created_at timestamptz not null default now()
);
alter table public.leads enable row level security;
revoke all on table public.leads from anon;
grant select, insert, delete on table public.leads to authenticated;
drop policy if exists "Users can view their own leads" on public.leads;
create policy "Users can view their own leads" on public.leads for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own leads" on public.leads;
create policy "Users can create their own leads" on public.leads for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their own leads" on public.leads;
create policy "Users can delete their own leads" on public.leads for delete to authenticated using ((select auth.uid()) = user_id);
create index if not exists leads_user_id_idx on public.leads(user_id);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
