-- One-time migration: lets the admin panel manage hero banner photos
-- (add/remove/reorder as many as you want) instead of them being
-- hardcoded in the app's source code.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

CREATE TABLE IF NOT EXISTS public.hero_banners (
    id TEXT PRIMARY KEY,
    image TEXT NOT NULL,
    title TEXT DEFAULT '',
    subtitle TEXT DEFAULT '',
    cta TEXT DEFAULT 'Shop Now',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Anyone (including the storefront's anonymous visitors) can read banners.
CREATE POLICY "Public read access" ON public.hero_banners
    FOR SELECT USING (true);

-- Only signed-in admins can add/edit/remove/reorder banners.
CREATE POLICY "Admins can manage banners" ON public.hero_banners
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.admins))
    WITH CHECK (auth.uid() IN (SELECT id FROM public.admins));

-- Seed with the 3 banners that were previously hardcoded, so nothing
-- changes visually the moment this migration runs.
INSERT INTO public.hero_banners (id, image, title, subtitle, cta, sort_order) VALUES
    ('h2', 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/hero/royal-treat-banner.webp', '', '', 'Shop Now', 1),
    ('h1', 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/hero/nani-fry-banner.webp', '', '', 'Shop Now', 2),
    ('h3', 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/hero/crunch-banner.webp', '', '', 'Shop Now', 3)
ON CONFLICT (id) DO NOTHING;
