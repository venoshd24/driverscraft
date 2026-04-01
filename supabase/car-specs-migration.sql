-- Add car spec fields to profiles table
alter table public.profiles
  add column if not exists engine        text,
  add column if not exists power         text,
  add column if not exists suspension    text,
  add column if not exists wheels        text,
  add column if not exists tyres         text,
  add column if not exists exterior_mods text,
  add column if not exists other_mods    text,
  add column if not exists car_photo_url text;

-- Storage bucket for car profile photos
insert into storage.buckets (id, name, public)
values ('car-photos', 'car-photos', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view car photos"             on storage.objects;
drop policy if exists "Users can upload own car photo"        on storage.objects;
drop policy if exists "Users can update own car photo"        on storage.objects;

create policy "Anyone can view car photos"
  on storage.objects for select
  using (bucket_id = 'car-photos');

create policy "Users can upload own car photo"
  on storage.objects for insert
  with check (bucket_id = 'car-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own car photo"
  on storage.objects for update
  using (bucket_id = 'car-photos' and auth.uid()::text = (storage.foldername(name))[1]);
