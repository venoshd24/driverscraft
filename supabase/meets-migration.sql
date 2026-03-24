-- Create car_meets table
create table if not exists public.car_meets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  location text not null,
  description text,
  poster_url text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.car_meets enable row level security;

-- Anyone can read meets
create policy "Anyone can read meets"
  on public.car_meets for select
  using (true);

-- Only admins can insert/update/delete
create policy "Admins can manage meets"
  on public.car_meets for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
