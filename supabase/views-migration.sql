-- Add view_count to posts
alter table public.posts add column if not exists view_count integer default 0;

-- RPC function to increment view count safely (no RLS bypass needed)
create or replace function public.increment_post_views(post_slug text)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts
  set view_count = coalesce(view_count, 0) + 1
  where slug = post_slug and published = true;
end;
$$;

-- Allow anyone to call the increment function
grant execute on function public.increment_post_views(text) to anon, authenticated;
