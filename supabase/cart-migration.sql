-- ============================================================
-- driversCraft — Cart Persistence Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  items jsonb not null default '[]',
  updated_at timestamptz default now()
);

alter table public.carts enable row level security;

create policy "Users can manage own cart"
  on public.carts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Function to notify users when cart item goes out of stock
-- (called manually or via trigger when stock hits 0)
create or replace function public.notify_cart_stockout(p_product_id uuid)
returns void language plpgsql security definer as $$
declare
  v_product_name text;
  v_cart record;
begin
  select name into v_product_name from public.products where id = p_product_id;

  -- Find all carts containing this product
  for v_cart in
    select c.user_id, au.email
    from public.carts c
    join auth.users au on au.id = c.user_id
    where c.items @> jsonb_build_array(jsonb_build_object('id', p_product_id::text))
  loop
    -- Insert into a notifications table (you can hook this to email via Supabase edge functions)
    insert into public.stockout_notifications (user_id, product_id, product_name, email)
    values (v_cart.user_id, p_product_id, v_product_name, v_cart.email)
    on conflict do nothing;
  end loop;
end;
$$;

-- Notifications log table
create table if not exists public.stockout_notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  product_name text,
  email text,
  sent_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.stockout_notifications enable row level security;
create policy "Admins can read notifications"
  on public.stockout_notifications for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
