-- Bug fix: only admins can UPDATE the orders table (RLS "admins update
-- orders"), so CheckoutModal's customer-side call to mark stock_deducted =
-- true after a COD order was silently blocked by RLS -- the flag never
-- actually got set, so cancelling that order later skipped the stock
-- restore entirely. This RPC is SECURITY DEFINER (like decrement/restore
-- above) so it can flip just this one flag regardless of caller, without
-- opening up general UPDATE access to orders for customers.
CREATE OR REPLACE FUNCTION public.mark_order_stock_deducted(p_order_id text, p_deducted boolean)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.orders SET stock_deducted = p_deducted WHERE id = p_order_id;
$$;

GRANT EXECUTE ON FUNCTION public.mark_order_stock_deducted(text, boolean) TO anon, authenticated;
