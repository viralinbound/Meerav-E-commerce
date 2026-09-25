-- One-time migration: tracks whether an order's items have already had
-- stock deducted (COD at placement, online once payu-callback confirms
-- payment), so cancelling it can safely add that stock back exactly once --
-- never restoring stock for an order that was cancelled before it ever
-- actually reduced anything (e.g. a still-pending online payment). Safe to
-- re-run.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN NOT NULL DEFAULT FALSE;

-- Mirror of decrement_variant_stock -- adds qty back to a variant's stock
-- (only variants that actually track stock; untouched otherwise).
CREATE OR REPLACE FUNCTION public.restore_variant_stock(p_product_id text, p_weight text, p_qty integer)
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
        THEN jsonb_set(elem, '{stock}', to_jsonb((elem->>'stock')::int + GREATEST(0, p_qty)))
        ELSE elem
      END
    )
    FROM jsonb_array_elements(variants) elem
  )
  WHERE id = p_product_id;
$$;

GRANT EXECUTE ON FUNCTION public.restore_variant_stock(text, text, integer) TO anon, authenticated;
