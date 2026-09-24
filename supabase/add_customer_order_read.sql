-- One-time migration: lets a signed-in customer read back their OWN past
-- orders (previously only admins could SELECT from orders at all, so the
-- storefront had no real order-history feature). Safe to re-run.
--
-- orders.customer is a JSONB blob containing { id: <auth.users uuid>, ... }
-- set at checkout time (see CheckoutModal.tsx) -- this policy matches that
-- id against the caller's own auth.uid(), so nobody can see anyone else's
-- orders. Run this once in the Supabase SQL Editor.

DROP POLICY IF EXISTS "customers read own orders" ON public.orders;
CREATE POLICY "customers read own orders" ON public.orders
    FOR SELECT USING ((select auth.uid())::text = (customer->>'id'));
