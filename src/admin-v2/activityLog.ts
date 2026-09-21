import { MiraDB } from '@/lib/supabase.js';
import type { AdminProfile } from './useAdminAuth';

// Every write from the admin panel is logged with a before/after snapshot so
// a change can actually be reverted later — not just flagged. `table` + `pk`
// tell undoActivity() where to write the snapshot back to.
export async function logChange(
  admin: AdminProfile | null,
  action: string,
  targetLabel: string,
  table: 'products' | 'categories' | 'site_settings',
  pk: string,
  before: any,
  after: any
) {
  if (!admin) return;
  await MiraDB.logAdminActivity(admin, action, targetLabel, { table, pk, before, after });
}

export interface ActivityEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_role: string;
  action: string;
  target: string;
  details: { table?: string; pk?: string; before?: any; after?: any };
  undone: boolean;
  created_at: string;
}

// Writes the entry's "before" snapshot back to its table, marks the entry
// undone, and automatically warns the admin whose change was reverted —
// root-only, enforced by the caller (ActivityLog only renders the button
// for root).
export async function undoEntry(entry: ActivityEntry): Promise<{ ok: boolean; error?: string }> {
  const { table, pk, before } = entry.details || {};
  if (!table || !pk || before === undefined) {
    return { ok: false, error: 'This entry has no recorded previous state to restore.' };
  }

  let error;
  if (before === null) {
    // The row didn't exist before this change (e.g. a product creation) — undo means delete it.
    ({ error } = await MiraDB.adminClient.from(table).delete().eq('id', pk));
  } else {
    ({ error } = await MiraDB.adminClient.from(table).upsert(before));
  }
  if (error) return { ok: false, error: error.message || 'Could not restore the previous version.' };

  await MiraDB.markActivityUndone(entry.id);

  if (entry.admin_id) {
    await MiraDB.warnAdmin(
      entry.admin_id,
      `Your change "${entry.action}" on "${entry.target}" was reverted by the root admin.`
    );
  }

  return { ok: true };
}
