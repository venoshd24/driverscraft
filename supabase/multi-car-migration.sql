-- Add cars JSONB column to support multiple cars per user
-- Each car: { year, model, engine, power, suspension, wheels, tyres, exterior_mods, other_mods, photo_url }
alter table public.profiles
  add column if not exists cars jsonb default '[]'::jsonb;
