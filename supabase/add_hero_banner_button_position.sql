-- One-time migration: lets each hero banner's "Shop Now" button be
-- dragged to a custom position (instead of a fixed spot shared by every
-- slide). Run this once in the Supabase SQL Editor, after
-- add_hero_banners.sql has already been run.
-- button_x / button_y are percentages (0-100) of the banner's width/height,
-- measured from the top-left -- matches how the drag control in the admin
-- panel positions the button preview.

ALTER TABLE public.hero_banners
  ADD COLUMN IF NOT EXISTS button_x NUMERIC(5,2) NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS button_y NUMERIC(5,2) NOT NULL DEFAULT 82;
