-- Fix increment_post_views: remove published filter that was blocking updates
create or replace function public.increment_post_views(post_slug text)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts
  set view_count = coalesce(view_count, 0) + 1
  where slug = post_slug;
end;
$$;
