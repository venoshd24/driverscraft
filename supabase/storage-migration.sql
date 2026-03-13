-- Create storage buckets for product and article images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Authenticated users can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

create policy "Authenticated users can upload article images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'article-images');

-- Allow public to read images
create policy "Public can view product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

create policy "Public can view article images"
on storage.objects for select
to public
using (bucket_id = 'article-images');

-- Allow authenticated users to delete/update their uploads
create policy "Authenticated users can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images');

create policy "Authenticated users can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images');

create policy "Authenticated users can update article images"
on storage.objects for update
to authenticated
using (bucket_id = 'article-images');

create policy "Authenticated users can delete article images"
on storage.objects for delete
to authenticated
using (bucket_id = 'article-images');

-- Add image_url column to products if not already there
alter table public.products add column if not exists image_url text;
