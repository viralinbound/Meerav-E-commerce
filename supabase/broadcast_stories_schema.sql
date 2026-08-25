-- =============================================================================
-- BROADCAST STORIES & 4K REELS - SUPABASE SCHEMA & RLS SETUP
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.broadcast_stories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    tag TEXT DEFAULT '4K Reel',
    media_type TEXT NOT NULL DEFAULT 'video', -- 'video' | 'photo'
    media_url TEXT NOT NULL,
    poster_url TEXT,
    product_id TEXT,
    price NUMERIC(10,2) DEFAULT 99.00,
    original_price NUMERIC(10,2) DEFAULT 120.00,
    sort_order INTEGER DEFAULT 1,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies — public can read, only real admins (is_admin()) can write.
-- (Not anon/authenticated with USING(true) — that would let any site visitor
-- rewrite or delete every story.)
ALTER TABLE public.broadcast_stories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'broadcast_stories' AND policyname = 'public read broadcast_stories'
    ) THEN
        CREATE POLICY "public read broadcast_stories"
        ON public.broadcast_stories FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'broadcast_stories' AND policyname = 'admins write broadcast_stories'
    ) THEN
        CREATE POLICY "admins write broadcast_stories"
        ON public.broadcast_stories FOR INSERT
        WITH CHECK (is_admin((select auth.uid())));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'broadcast_stories' AND policyname = 'admins update broadcast_stories'
    ) THEN
        CREATE POLICY "admins update broadcast_stories"
        ON public.broadcast_stories FOR UPDATE
        USING (is_admin((select auth.uid())));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'broadcast_stories' AND policyname = 'admins delete broadcast_stories'
    ) THEN
        CREATE POLICY "admins delete broadcast_stories"
        ON public.broadcast_stories FOR DELETE
        USING (is_admin((select auth.uid())));
    END IF;
END $$;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE broadcast_stories;

-- Seed Initial Broadcast Stories
INSERT INTO public.broadcast_stories (id, title, tag, media_type, media_url, poster_url, product_id, price, original_price, sort_order, is_visible) VALUES
('story-1', 'Royal Aloo Bhujia Slow Crunch', '4K Signature Reel', 'video', 'assets/videos/clip_bhujia.mp4', 'assets/images/cinematic_bhujia.jpg', 'p1', 99.00, 120.00, 1, true),
('story-2', 'Bikaneri Papad Handcrafting', 'Heritage Kitchen', 'video', 'assets/videos/clip_papad.mp4', 'assets/images/cinematic_papad.jpg', 'p2', 249.00, 280.00, 2, true),
('story-3', 'Crispy Moong Dal Live Fry', 'Pure Oil Story', 'video', 'assets/videos/clip_moong_dal.mp4', 'assets/images/cinematic_moong_dal.jpg', 'p12', 89.00, 110.00, 3, true),
('story-4', 'Royal Cashew Mixture Blend', 'Fresh Roasted', 'video', 'assets/videos/clip_mixture.mp4', 'assets/images/cinematic_mixture.jpg', 'p4', 489.00, 549.00, 4, true),
('story-5', 'Masala Peanuts Crafting', 'Crunch Story', 'video', 'assets/videos/clip_masala_peanuts.mp4', 'assets/images/cinematic_masala_peanuts.jpg', 'p14', 99.00, 119.00, 5, true)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    tag = EXCLUDED.tag,
    media_type = EXCLUDED.media_type,
    media_url = EXCLUDED.media_url,
    poster_url = EXCLUDED.poster_url,
    product_id = EXCLUDED.product_id,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible;
