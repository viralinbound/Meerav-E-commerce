-- Real newsletter subscriber list, backing the footer's "Drop your email"
-- form -- which previously just showed a fake "check your inbox" message
-- and saved nothing anywhere.
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed boolean NOT NULL DEFAULT false,
  unsubscribed_at timestamptz
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous storefront visitors) can subscribe -- this
-- mirrors "public write orders": an insert-only public policy, no read
-- access, so nobody can enumerate the subscriber list from the browser.
DROP POLICY IF EXISTS "public subscribe" ON public.newsletter_subscribers;
CREATE POLICY "public subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only admins can read the list (needed to send broadcast offer emails)
-- or update it (e.g. marking unsubscribed).
DROP POLICY IF EXISTS "admins read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admins read subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "admins update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admins update subscribers" ON public.newsletter_subscribers
  FOR UPDATE TO authenticated USING (is_admin((SELECT auth.uid())));
