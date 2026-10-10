-- Little Archive curated content tables.
-- BEFORE RUNNING: create your admin user in Supabase Auth > Users, copy its UUID,
-- then replace EVERY occurrence of REPLACE_WITH_ADMIN_AUTH_USER_UUID below with that UUID.
-- Keep guestbook.sql separate; this file does not change guestbook moderation.

create table if not exists public.archive_entries (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('movies','ships','songs','hobbies')),
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  metadata jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists archive_entries_section_order_idx
  on public.archive_entries (section, sort_order, created_at desc);

alter table public.archive_entries enable row level security;
revoke all on table public.archive_entries from anon, authenticated;
grant select on table public.archive_entries to anon, authenticated;
grant insert, update, delete on table public.archive_entries to authenticated;

drop policy if exists "Public can read published archive entries" on public.archive_entries;
create policy "Public can read published archive entries"
on public.archive_entries for select to anon, authenticated
using (
  is_published = true
  or auth.uid() = 'REPLACE_WITH_ADMIN_AUTH_USER_UUID'::uuid
);

drop policy if exists "Only archive admin can insert entries" on public.archive_entries;
create policy "Only archive admin can insert entries"
on public.archive_entries for insert to authenticated
with check (auth.uid() = 'REPLACE_WITH_ADMIN_AUTH_USER_UUID'::uuid);

drop policy if exists "Only archive admin can update entries" on public.archive_entries;
create policy "Only archive admin can update entries"
on public.archive_entries for update to authenticated
using (auth.uid() = 'REPLACE_WITH_ADMIN_AUTH_USER_UUID'::uuid)
with check (auth.uid() = 'REPLACE_WITH_ADMIN_AUTH_USER_UUID'::uuid);

drop policy if exists "Only archive admin can delete entries" on public.archive_entries;
create policy "Only archive admin can delete entries"
on public.archive_entries for delete to authenticated
using (auth.uid() = 'REPLACE_WITH_ADMIN_AUTH_USER_UUID'::uuid);

-- No public INSERT/UPDATE/DELETE grants are given to anon. The only write path
-- is an authenticated session whose user UUID matches your private admin UUID.
