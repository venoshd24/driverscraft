-- RPC that returns profiles joined with auth.users email + last_sign_in
-- SECURITY DEFINER runs as postgres, bypasses all RLS
-- Only admins can call it (checked inside the function)
create or replace function public.get_admin_users()
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  favourite_driver text,
  car text,
  car_year text,
  location text,
  bio text,
  is_admin boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Only admins can call this
  if not exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Access denied';
  end if;

  return query
    select
      p.id,
      u.email,
      p.first_name,
      p.last_name,
      p.favourite_driver,
      p.car,
      p.car_year,
      p.location,
      p.bio,
      p.is_admin,
      p.created_at,
      u.last_sign_in_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

grant execute on function public.get_admin_users() to authenticated;
