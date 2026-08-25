-- =============================================================================
-- UPDATE REAL-TIME CUSTOMER & TESTIMONIAL PORTRAIT AVATARS IN SUPABASE CLOUD
-- =============================================================================
--
-- These are one-off data updates for the seed rows only — run by an admin
-- (via the SQL editor or the migration tool, which both bypass RLS), so no
-- new RLS policy is needed or added here. Do NOT add a public-write policy
-- on customers/testimonials to make this "work" from the browser — that
-- would expose every real customer's name/phone/email/address to anyone on
-- the internet. Customers already have "own or admin read/write" policies
-- from the main schema; this file only ever needs to be run with elevated
-- (service-role / migration) access.

-- 1. Update Testimonials table with authentic real customer person portraits
UPDATE public.testimonials
SET avatar = 'assets/images/avatar_pooja.jpg'
WHERE name ILIKE '%Pooja%';

UPDATE public.testimonials
SET avatar = 'assets/images/avatar_vikram.jpg'
WHERE name ILIKE '%Vikram%';

UPDATE public.testimonials
SET avatar = 'assets/images/avatar_ananya.jpg'
WHERE name ILIKE '%Ananya%';

-- 2. Update Customers table with authentic real customer portraits
UPDATE public.customers
SET avatar = 'assets/images/avatar_pooja.jpg'
WHERE name ILIKE '%Pooja%';

UPDATE public.customers
SET avatar = 'assets/images/avatar_vikram.jpg'
WHERE name ILIKE '%Vikram%';

UPDATE public.customers
SET avatar = 'assets/images/avatar_ananya.jpg'
WHERE name ILIKE '%Ananya%';

UPDATE public.customers
SET avatar = 'assets/images/avatar_amit.jpg'
WHERE name ILIKE '%Amit%' OR name ILIKE '%Singhal%';

UPDATE public.customers
SET avatar = 'assets/images/avatar_sneha.jpg'
WHERE name ILIKE '%Sneha%' OR name ILIKE '%Patel%';
