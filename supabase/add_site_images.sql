-- One-time migration: lets the admin panel replace the site's key promotional
-- photos (Heritage banner, Our Tradition photo, Gift Collection cards)
-- instead of them being hardcoded in the app's source code.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

CREATE TABLE IF NOT EXISTS public.site_images (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    image TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Anyone (including the storefront's anonymous visitors) can read images.
CREATE POLICY "Public read access" ON public.site_images
    FOR SELECT USING (true);

-- Only signed-in admins can replace them.
CREATE POLICY "Admins can manage site images" ON public.site_images
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.admins))
    WITH CHECK (auth.uid() IN (SELECT id FROM public.admins));

-- Seed with the photos that were previously hardcoded, so nothing changes
-- visually the moment this migration runs.
INSERT INTO public.site_images (id, label, image, sort_order) VALUES
    ('heritage-banner', 'Heritage Banner (below Fan Favourites)', 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/sections/heritage-section-banner.webp', 1),
    ('tradition-banner', 'Our Tradition Photo', 'https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media/sections/our-tradition-banner.webp', 2),
    ('gift-boxes', 'Curated Collections — Gift Boxes', 'https://images.pexels.com/photos/28769884/pexels-photo-28769884.jpeg?auto=compress&cs=tinysrgb&h=600&w=600', 3),
    ('handmade-gourmet', 'Curated Collections — Handmade Gourmet', 'https://images.pexels.com/photos/8887061/pexels-photo-8887061.jpeg?auto=compress&cs=tinysrgb&h=600&w=600', 4),
    ('festive-specials', 'Curated Collections — Festive Specials', 'https://images.pexels.com/photos/8887011/pexels-photo-8887011.jpeg?auto=compress&cs=tinysrgb&h=600&w=600', 5)
ON CONFLICT (id) DO NOTHING;

-- Enables realtime: any admin photo replacement here pushes instantly to
-- every open storefront tab, no page refresh needed.
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_images;
