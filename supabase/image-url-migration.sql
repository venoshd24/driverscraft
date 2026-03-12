-- Add image_url to posts table
alter table public.posts add column if not exists image_url text;

-- You can update existing posts with image URLs like:
-- update public.posts set image_url = 'https://your-image-url.jpg' where slug = 'monaco-hidden-sector';
