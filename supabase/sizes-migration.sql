-- Add sizes support to products
alter table public.products add column if not exists has_sizes boolean default false;
alter table public.products add column if not exists available_sizes text[] default '{}';

-- product_gallery already exists from previous migration
-- Just ensure it's there
create table if not exists public.product_gallery (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);
