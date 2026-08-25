-- =============================================================================
-- TRUST & GUARANTEE FEATURE BADGES - SUPABASE SCHEMA & RLS SETUP
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.trust_badges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    sort_order INTEGER DEFAULT 1,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies — public can read, only real admins (is_admin()) can write.
-- (Not anon/authenticated with USING(true) — that would let any site visitor
-- rewrite or delete every badge.)
ALTER TABLE public.trust_badges ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'trust_badges' AND policyname = 'public read trust_badges'
    ) THEN
        CREATE POLICY "public read trust_badges"
        ON public.trust_badges FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'trust_badges' AND policyname = 'admins write trust_badges'
    ) THEN
        CREATE POLICY "admins write trust_badges"
        ON public.trust_badges FOR INSERT
        WITH CHECK (is_admin((select auth.uid())));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'trust_badges' AND policyname = 'admins update trust_badges'
    ) THEN
        CREATE POLICY "admins update trust_badges"
        ON public.trust_badges FOR UPDATE
        USING (is_admin((select auth.uid())));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'trust_badges' AND policyname = 'admins delete trust_badges'
    ) THEN
        CREATE POLICY "admins delete trust_badges"
        ON public.trust_badges FOR DELETE
        USING (is_admin((select auth.uid())));
    END IF;
END $$;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE trust_badges;

-- Seed Initial Feature Badges with Real Images
INSERT INTO public.trust_badges (id, title, description, image, sort_order, is_visible) VALUES
('tb-1', 'Pure & Clean Oil', 'Prepared exclusively in pure cold-pressed groundnut & vegetable oils with zero palm oil.', 'assets/images/feature_oil.jpg', 1, true),
('tb-2', 'Bikaneri Heritage', 'Authentic traditional spices, moth dal flour, and slow-fried craftsmanship from Bikaner.', 'assets/images/feature_heritage.jpg', 2, true),
('tb-3', 'Multi-Layer Airtight Pack', 'Food-grade nitrogen flushed airtight packaging guarantees crisp crunch for 6+ months.', 'assets/images/feature_packaging.jpg', 3, true),
('tb-4', 'Live WhatsApp Alerts', 'Instant WhatsApp notifications with courier tracking and live GPS route maps.', 'assets/images/feature_whatsapp.jpg', 4, true)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible;
