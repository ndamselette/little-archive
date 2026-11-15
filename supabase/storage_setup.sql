-- Run in Supabase SQL Editor after replacing the admin UUID below.
-- Public READ, authenticated ADMIN-ONLY upload. Never put service_role keys in browser code.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('archive-media', 'archive-media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','audio/mpeg','audio/mp3','audio/ogg','audio/wav','audio/x-wav','audio/mp4'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Little Archive public media read" on storage.objects;
create policy "Little Archive public media read" on storage.objects
for select to anon, authenticated using (bucket_id = 'archive-media');

drop policy if exists "Little Archive admin media upload" on storage.objects;
create policy "Little Archive admin media upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'archive-media'
  and auth.uid() = '651aa9ca-0c95-45dc-8aab-af4d6167c938'::uuid);
