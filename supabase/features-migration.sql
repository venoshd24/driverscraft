-- ============================================
-- 1. RSVP table
-- ============================================
create table if not exists public.meet_rsvps (
  id uuid primary key default gen_random_uuid(),
  meet_id uuid references public.car_meets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(meet_id, user_id)
);

alter table public.meet_rsvps enable row level security;

-- Users can see their own RSVPs
create policy "Users can manage own rsvps"
  on public.meet_rsvps for all
  using (auth.uid() = user_id);

-- Admins can see all RSVPs
create policy "Admins can read all rsvps"
  on public.meet_rsvps for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ============================================
-- 2. Newsletter subscribers table
-- ============================================
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz default now(),
  active boolean default true
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can insert (subscribe)
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only admins can read the list
create policy "Admins can read subscribers"
  on public.newsletter_subscribers for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ============================================
-- 3. Mock meets data
-- ============================================
insert into public.car_meets (title, date, location, description) values
(
  'Shah Alam Midnight Run',
  (current_date + interval '18 days')::date,
  'Dataran Shah Alam, Section 14',
  'Monthly midnight meet at the dataran. Bring your ride, bring your crew. We park, we chat, we eat at the mamak after. All makes welcome — JDM, Euro, local, doesn''t matter.'
),
(
  'Sepang Circuit Day — Community Laps',
  (current_date + interval '45 days')::date,
  'Sepang International Circuit, Sepang',
  'driversCraft x Sepang. We''ve booked a community track day. Limited slots — open to all experience levels. Helmet required, rollcage optional. Full details dropping soon.'
),
(
  'TTDI Garage Showcase',
  (current_date + interval '7 days')::date,
  'TTDI Park, Kuala Lumpur',
  'Static show at the park. Best stance, best clean, best modified. Informal judging by the community. Bring your cameras.'
),
(
  'Bukit Tinggi Hill Run',
  (current_date - interval '14 days')::date,
  'Bukit Tinggi, Pahang',
  'Morning convoy up the hill. 40 cars, one road. We stopped at the top for breakfast. What a morning.'
),
(
  'Subang Old Town Kopitiam Meet',
  (current_date - interval '35 days')::date,
  'SS15 Subang Jaya',
  'Casual weeknight meet at the old kopitiam. Turned into a 4-hour session. Classic driversCraft energy.'
),
(
  'Berjaya Hills Twilight Run',
  (current_date - interval '60 days')::date,
  'Berjaya Hills, Bentong',
  'Sunset convoy through the hills. One of our best turnouts — 60+ cars. The road was perfect.'
)
on conflict do nothing;
