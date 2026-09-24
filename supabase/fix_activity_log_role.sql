-- Fixes the same 'root' vs 'host' role-string bug found earlier this
-- session, but in the activity log's RLS policies -- these hardcoded
-- role = 'root', so on this project (where the owner account's role is
-- 'host') NOBODY could ever read the activity log or undo a change, even
-- though every admin action was being logged correctly all along.
-- Safe to re-run. Requires is_root_admin() from add_admin_permissions.sql.

DROP POLICY IF EXISTS "only root can read activity log" ON public.admin_activity_log;
CREATE POLICY "only root can read activity log" ON public.admin_activity_log FOR SELECT
    USING (public.is_root_admin((select auth.uid())));

DROP POLICY IF EXISTS "root can mark activity undone" ON public.admin_activity_log;
CREATE POLICY "root can mark activity undone" ON public.admin_activity_log FOR UPDATE
    USING (public.is_root_admin((select auth.uid())));

-- Cleans up a harmless one-off test row inserted while diagnosing this bug.
DELETE FROM public.admin_activity_log WHERE action = 'debug.test';
