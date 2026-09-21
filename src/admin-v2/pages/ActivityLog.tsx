import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw, ArrowLeft, Activity, RotateCw, AlertTriangle, Clock } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { useAdminAuth } from '../useAdminAuth';
import { undoEntry, type ActivityEntry } from '../activityLog';
import { Card, LoadingState, ErrorState, EmptyState, StatusBadge, TableScroller, MetricCard } from '../ui';

function fieldDiff(before: any, after: any) {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  const skip = new Set(['created_at', 'updated_at']);
  const rows: { key: string; from: string; to: string }[] = [];
  for (const key of keys) {
    if (skip.has(key)) continue;
    const a = JSON.stringify(before?.[key]);
    const b = JSON.stringify(after?.[key]);
    if (a !== b) rows.push({ key, from: a ?? '—', to: b ?? '—' });
  }
  return rows;
}

function LogRowDetail({ entry }: { entry: ActivityEntry }) {
  const { before, after } = entry.details || {};
  if (before === undefined && after === undefined) {
    return <p className="text-sm text-charcoal-400 px-5 py-3">No detail recorded for this entry.</p>;
  }
  if (before === null) {
    return <p className="text-sm text-charcoal-500 px-5 py-3">Created new record — no previous version.</p>;
  }
  if (after === null) {
    return <p className="text-sm text-charcoal-500 px-5 py-3">Record was deleted.</p>;
  }
  const diff = fieldDiff(before, after);
  if (diff.length === 0) {
    return <p className="text-sm text-charcoal-400 px-5 py-3">No field-level changes recorded.</p>;
  }
  return (
    <div className="px-5 py-3 space-y-2 bg-cream-50">
      {diff.map((d) => (
        <div key={d.key} className="text-sm">
          <span className="font-semibold text-charcoal-700">{d.key}:</span>{' '}
          <span className="text-red-600 line-through">{d.from}</span>{' '}
          <span className="text-charcoal-400">→</span>{' '}
          <span className="text-green-700">{d.to}</span>
        </div>
      ))}
    </div>
  );
}

interface ActivityLogProps {
  initialFilter?: { id: string; name: string } | null;
  onFilterChange?: (filter: { id: string; name: string } | null) => void;
}

export function ActivityLog({ initialFilter = null, onFilterChange }: ActivityLogProps) {
  const { admin: me } = useAdminAuth();
  const [rows, setRows] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterAdmin, setFilterAdminState] = useState<{ id: string; name: string } | null>(initialFilter);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const setFilterAdmin = (f: { id: string; name: string } | null) => {
    setFilterAdminState(f);
    onFilterChange?.(f);
  };

  const load = () => {
    setLoading(true);
    setError(null);
    const fetcher = filterAdmin ? MiraDB.fetchActivityForAdmin(filterAdmin.id) : MiraDB.fetchActivityLog();
    fetcher
      .then((data: ActivityEntry[]) => setRows(data))
      .catch((e: any) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filterAdmin]);

  const summary = useMemo(() => {
    if (!filterAdmin) return null;
    const byAction: Record<string, number> = {};
    let warningsReceived = 0;
    let undoneCount = 0;
    let lastActive: string | null = null;
    for (const r of rows) {
      byAction[r.action] = (byAction[r.action] || 0) + 1;
      if (r.action === 'admin.warn') warningsReceived += 1;
      if (r.undone) undoneCount += 1;
      if (!lastActive || new Date(r.created_at) > new Date(lastActive)) lastActive = r.created_at;
    }
    const topAction = Object.entries(byAction).sort((a, b) => b[1] - a[1])[0];
    return {
      total: rows.length,
      warningsReceived,
      undoneCount,
      lastActive,
      topAction: topAction ? `${topAction[0]} (${topAction[1]})` : '—',
    };
  }, [rows, filterAdmin]);

  const handleUndo = async (entry: ActivityEntry) => {
    if (!confirm(`Undo "${entry.action}" on "${entry.target}" by ${entry.admin_name}? They'll be automatically notified.`)) return;
    setUndoingId(entry.id);
    const result = await undoEntry(entry);
    setUndoingId(null);
    if (!result.ok) return alert(result.error || 'Could not undo this change.');
    load();
  };

  if (loading) return <LoadingState label="Loading activity log…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Actions" value={summary.total} icon={Activity} sublabel={filterAdmin?.name} />
          <MetricCard
            label="Most Common"
            value={summary.topAction.split(' (')[0] || '—'}
            sublabel={summary.topAction.includes('(') ? `${summary.topAction.split('(')[1]?.replace(')', '')} times` : undefined}
            icon={RotateCw}
          />
          <MetricCard label="Warnings Received" value={summary.warningsReceived} icon={AlertTriangle} sublabel="For undone changes" />
          <MetricCard
            label="Last Active"
            value={summary.lastActive ? new Date(summary.lastActive).toLocaleDateString() : '—'}
            sublabel={summary.lastActive ? new Date(summary.lastActive).toLocaleTimeString() : undefined}
            icon={Clock}
          />
        </div>
      )}
      <Card>
      <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
        <div>
          {filterAdmin ? (
            <button
              onClick={() => setFilterAdmin(null)}
              className="flex items-center gap-1.5 text-sm font-medium text-maroon-700 hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All admins
            </button>
          ) : null}
          <h3 className="font-serif text-lg font-bold text-maroon-900">
            {filterAdmin ? `${filterAdmin.name}'s Activity` : 'Admin Activity Log'}
          </h3>
          <p className="text-sm text-charcoal-400">
            {filterAdmin ? 'Every change made by this admin.' : 'Click an admin\'s name to see their full activity. Root can undo any change.'}
          </p>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState label="No activity recorded yet" />
      ) : (
        <TableScroller>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide border-b border-cream-200">
                <th className="px-5 py-3 w-8" />
                <th className="px-5 py-3">Admin</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Status</th>
                {me?.role === 'root' && <th className="px-5 py-3 text-right">Undo</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isOpen = expandedId === r.id;
                const canUndo = me?.role === 'root' && !r.undone && r.details?.before !== undefined;
                return (
                  <Fragment key={r.id}>
                    <tr className="border-b border-cream-100 last:border-0 hover:bg-cream-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <button onClick={() => setExpandedId(isOpen ? null : r.id)} className="text-charcoal-400 hover:text-maroon-700">
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setFilterAdmin({ id: r.admin_id, name: r.admin_name })}
                          className="font-medium text-maroon-700 hover:underline text-left"
                        >
                          {r.admin_name}
                        </button>
                        <p className="text-xs text-charcoal-400 capitalize">{r.admin_role}</p>
                      </td>
                      <td className="px-5 py-3.5 text-charcoal-700">{r.action}</td>
                      <td className="px-5 py-3.5 text-charcoal-500">{r.target}</td>
                      <td className="px-5 py-3.5 text-charcoal-400">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        {r.undone ? <StatusBadge status="Undone" /> : <span className="text-xs text-charcoal-300">—</span>}
                      </td>
                      {me?.role === 'root' && (
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleUndo(r)}
                            disabled={!canUndo || undoingId === r.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={canUndo ? 'Revert this change' : 'Nothing to revert'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Undo
                          </button>
                        </td>
                      )}
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={me?.role === 'root' ? 7 : 6} className="p-0">
                          <LogRowDetail entry={r} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </TableScroller>
      )}
      </Card>
    </div>
  );
}
