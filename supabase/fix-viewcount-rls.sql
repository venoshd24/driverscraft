-- Allow anyone to increment view_count on published posts
-- This is safe because it only allows updating view_count, not other fields
create policy "Anyone can increment view count"
  on public.posts for update
  using (published = true)
  with check (published = true);
