-- Fix: allow admins to read ALL posts (including drafts)
-- Run this in Supabase SQL Editor

create policy "Admins can read all posts"
  on public.posts for select
  using (
    published = true
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Note: this replaces the logic of the existing "Anyone can read published posts" policy.
-- The existing policy still works for public users (published = true).
-- Admins get access to all posts via the OR clause.
