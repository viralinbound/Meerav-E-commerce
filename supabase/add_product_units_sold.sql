-- One-time migration: tracks real units sold per product so "Best Seller"
-- can be calculated automatically from actual order history instead of a
-- manually-set tag. Run this once in the Supabase SQL Editor.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS units_sold INTEGER NOT NULL DEFAULT 0;

-- Called once per line item right after a checkout order is inserted.
-- SECURITY DEFINER so guest/customer checkout (which has no products write
-- access) can still bump this single counter -- it only ever adds a
-- caller-supplied, capped quantity to units_sold, nothing else about the
-- product can be touched through it.
CREATE OR REPLACE FUNCTION public.increment_units_sold(p_product_id text, p_qty integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.products
  SET units_sold = units_sold + GREATEST(0, LEAST(p_qty, 1000))
  WHERE id = p_product_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_units_sold(text, integer) TO anon, authenticated;
