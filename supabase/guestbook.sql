-- Little Archive moderated guestbook (run once in Supabase SQL Editor)
create extension if not exists pgcrypto;

create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  category text not null default 'Others' check (category in ('Lovers','Family','Friends','Others')),
  message text not null check (char_length(message) between 1 and 2500),
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.guestbook enable row level security;

-- Remove table privileges that might have been granted by defaults, then grant only what the public form needs.
revoke all on table public.guestbook from anon, authenticated;
grant select, insert on table public.guestbook to anon;

-- Visitors can read approved entries only.
drop policy if exists "Public can read approved guestbook notes" on public.guestbook;
create policy "Public can read approved guestbook notes"
on public.guestbook for select to anon
using (status = 'approved');

-- Visitors can submit pending notes only; they cannot approve or edit entries.
drop policy if exists "Public can submit pending guestbook notes" on public.guestbook;
create policy "Public can submit pending guestbook notes"
on public.guestbook for insert to anon
with check (
  status = 'pending'
  and char_length(trim(name)) between 1 and 60
  and char_length(trim(message)) between 1 and 2500
  and category in ('Lovers','Family','Friends','Others')
);
