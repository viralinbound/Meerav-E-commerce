-- One-time migration: adds product display-order support.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Seed existing products with their current (created_at) order so nothing
-- jumps around the first time the admin reorder UI is used.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM public.products
)
UPDATE public.products p
SET sort_order = ranked.rn
FROM ranked
WHERE p.id = ranked.id;
