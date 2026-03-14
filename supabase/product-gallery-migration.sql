-- Product gallery table for multiple images per product
create table if not exists public.product_gallery (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.product_gallery enable row level security;

-- Public can read gallery
create policy "Public can view product gallery"
on public.product_gallery for select
to public
using (true);

-- Authenticated (admin) can manage gallery
create policy "Authenticated can manage product gallery"
on public.product_gallery for all
to authenticated
using (true)
with check (true);
