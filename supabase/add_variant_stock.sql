-- One-time migration: adds per-variant stock tracking. Stock lives inside
-- each variant object in products.variants (jsonb), e.g.
-- {"weight": "200 g", "price": 80, "stock": 25} -- a variant with no
-- "stock" key is treated as unlimited (backward compatible with existing
-- products that never set it). Safe to re-run.

-- Decrements one variant's stock by qty (clamped at 0), only touching
-- variants that actually have a "stock" key set -- called once per order
-- line, right after a COD order is placed or an online payment is
-- confirmed by payu-callback.
CREATE OR REPLACE FUNCTION public.decrement_variant_stock(p_product_id text, p_weight text, p_qty integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.products
  SET variants = (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'weight' = p_weight AND (elem ? 'stock')
        THEN jsonb_set(elem, '{stock}', to_jsonb(GREATEST(0, (elem->>'stock')::int - GREATEST(0, p_qty))))
        ELSE elem
      END
    )
    FROM jsonb_array_elements(variants) elem
  )
  WHERE id = p_product_id;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_variant_stock(text, text, integer) TO anon, authenticated;
