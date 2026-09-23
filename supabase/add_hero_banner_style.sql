-- One-time migration: lets each hero banner's title/subtitle/button be
-- styled from the admin panel (size + color) instead of being fixed.
-- Run this once in the Supabase SQL Editor, after add_hero_banners.sql and
-- add_hero_banner_button_position.sql have already been run.
-- *_size accepts 'sm' | 'md' | 'lg'. Colors are hex strings.

ALTER TABLE public.hero_banners
  ADD COLUMN IF NOT EXISTS title_size TEXT NOT NULL DEFAULT 'md',
  ADD COLUMN IF NOT EXISTS subtitle_size TEXT NOT NULL DEFAULT 'md',
  ADD COLUMN IF NOT EXISTS title_color TEXT NOT NULL DEFAULT '#fdf9f0',
  ADD COLUMN IF NOT EXISTS button_size TEXT NOT NULL DEFAULT 'md',
  ADD COLUMN IF NOT EXISTS button_bg_color TEXT NOT NULL DEFAULT '#fdf9f0',
  ADD COLUMN IF NOT EXISTS button_text_color TEXT NOT NULL DEFAULT '#7a2026';
