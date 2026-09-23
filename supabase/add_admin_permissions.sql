-- One-time migration: lets the root admin choose exactly which admin
-- pages each sub-admin can see/use (role distribution), instead of every
-- non-root admin automatically getting every page.
-- Run this once in the Supabase SQL Editor.
--
-- permissions is an array of page ids matching admin-v2/AdminShell.tsx's
-- AdminPage values, e.g. ["products","heroBanners","orders"]. An empty
-- array (the default) means "full access", so every existing admin keeps
-- working exactly as before the moment this migration runs.

ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Lets a signed-in root/host admin update any admin row (needed so they can
-- set another admin's permissions or name directly from the client, without
-- going through the admin-manage server function). Non-root admins can't
-- update any admin row this way, including their own.
-- Checks both 'root' and 'host' since different environments use either
-- string for the account owner's role.
CREATE OR REPLACE FUNCTION public.is_root_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  select exists(select 1 from public.admins where id = uid and role IN ('root', 'host'));
$$;

DROP POLICY IF EXISTS "root can update admin permissions" ON public.admins;
CREATE POLICY "root can update admin permissions" ON public.admins
    FOR UPDATE USING (public.is_root_admin((select auth.uid())))
    WITH CHECK (public.is_root_admin((select auth.uid())));

-- Lets ANY signed-in admin (host or sub-admin) rename themselves without
-- needing host approval. SECURITY DEFINER + hardcoded "id = auth.uid()"
-- means it can only ever touch the caller's own row, and only the name
-- column — it can't be used to change role, permissions, or anyone else.
CREATE OR REPLACE FUNCTION public.update_own_admin_name(new_name text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.admins SET name = new_name WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.update_own_admin_name(text) TO authenticated;
