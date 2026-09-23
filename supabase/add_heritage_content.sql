-- One-time migration: lets the Heritage banner's title/subtitle/button
-- (an overlay on top of the photo, editable from Admin > Heritage Banner)
-- be managed live, instead of the section only ever showing the photo.
-- Run this once in the Supabase SQL Editor.
-- Title/subtitle start empty so nothing changes visually until the admin
-- types something (matches how hero_banners.title works).

CREATE TABLE IF NOT EXISTS public.heritage_content (
    id TEXT PRIMARY KEY DEFAULT 'heritage',
    title TEXT NOT NULL DEFAULT '',
    subtitle TEXT NOT NULL DEFAULT '',
    cta TEXT NOT NULL DEFAULT 'Explore Our Snacks',
    title_size TEXT NOT NULL DEFAULT 'md',
    subtitle_size TEXT NOT NULL DEFAULT 'md',
    title_color TEXT NOT NULL DEFAULT '#7a2026',
    button_size TEXT NOT NULL DEFAULT 'md',
    button_bg_color TEXT NOT NULL DEFAULT '#fdf9f0',
    button_text_color TEXT NOT NULL DEFAULT '#7a2026',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.heritage_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.heritage_content
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage heritage content" ON public.heritage_content
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.admins))
    WITH CHECK (auth.uid() IN (SELECT id FROM public.admins));

INSERT INTO public.heritage_content (id, cta) VALUES ('heritage', 'Explore Our Snacks')
ON CONFLICT (id) DO NOTHING;

-- Enables realtime: any admin edit here pushes instantly to every open
-- storefront tab, no page refresh needed.
ALTER PUBLICATION supabase_realtime ADD TABLE public.heritage_content;
