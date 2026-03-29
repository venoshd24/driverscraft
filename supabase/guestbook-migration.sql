-- ============================================================
-- guestbook-migration.sql (idempotent — safe to re-run)
-- ============================================================

-- 1. meet_comments table
create table if not exists public.meet_comments (
  id          uuid primary key default gen_random_uuid(),
  meet_id     uuid not null references public.car_meets(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  message     text not null check (char_length(message) <= 300),
  image_url   text,
  created_at  timestamptz default now()
);

alter table public.meet_comments enable row level security;

-- Policies (drop first so re-running never errors)
drop policy if exists "Anyone can read comments"              on public.meet_comments;
drop policy if exists "Users can post comments"               on public.meet_comments;
drop policy if exists "Users can delete own comments"         on public.meet_comments;
drop policy if exists "Admins can delete any comment"         on public.meet_comments;

create policy "Anyone can read comments"
  on public.meet_comments for select using (true);

create policy "Users can post comments"
  on public.meet_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.meet_comments for delete
  using (auth.uid() = user_id);

create policy "Admins can delete any comment"
  on public.meet_comments for delete
  using (public.is_admin());

-- 2. Storage bucket
insert into storage.buckets (id, name, public)
values ('meet-comments', 'meet-comments', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view comment images"                  on storage.objects;
drop policy if exists "Authenticated users can upload comment images"   on storage.objects;
drop policy if exists "Users can delete own comment images"             on storage.objects;

create policy "Anyone can view comment images"
  on storage.objects for select
  using (bucket_id = 'meet-comments');

create policy "Authenticated users can upload comment images"
  on storage.objects for insert
  with check (bucket_id = 'meet-comments' and auth.role() = 'authenticated');

create policy "Users can delete own comment images"
  on storage.objects for delete
  using (bucket_id = 'meet-comments' and auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Index
create index if not exists meet_comments_meet_id_idx
  on public.meet_comments(meet_id, created_at desc);
