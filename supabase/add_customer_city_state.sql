-- One-time migration: lets customer signup capture city + state alongside
-- the existing address/pincode fields. Run this once in the Supabase SQL Editor.

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '';
