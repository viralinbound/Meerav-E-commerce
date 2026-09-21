import { Fragment, useEffect, useState } from 'react';
import { MiraDB } from '@/lib/supabase.js';
import { Card, LoadingState, ErrorState, EmptyState, StatusBadge, TableScroller } from '../ui';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];

interface OrderRow {
  id: string;
  customer: { name?: string; phone?: string; address?: string } | null;
  items: { name: string; qty: number }[];
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  date: string;
}

export function Orders() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    MiraDB.fetchOrders(MiraDB.adminClient)
      .then((data: OrderRow[]) => setOrders(data))
      .catch((e: any) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const prev = orders;
    setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o)));
    const ok = await MiraDB.dbUpdateOrderStatus(orderId, newStatus, MiraDB.adminClient);
    if (!ok) setOrders(prev);
    setUpdatingId(null);
  };

  if (loading) return <LoadingState label="Loading orders…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  // Compare as real dates, not raw strings — some existing orders have
  // date values that aren't in a directly-sortable ISO format, so a plain
  // string comparison put them out of chronological order.
  const sorted = [...orders].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  // Group into date-wise sections (Today / Yesterday / a full date) so the
  // admin can scan orders the way they actually think about them, instead
  // of one long undifferentiated table.
  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Unknown date';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const groups: { label: string; orders: OrderRow[] }[] = [];
  for (const o of sorted) {
    const label = dayLabel(o.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.orders.push(o);
    else groups.push({ label, orders: [o] });
  }

  return (
    <Card>
      <div className="px-5 py-4 border-b border-cream-200">
        <h3 className="font-serif text-lg font-bold text-maroon-900">All Orders</h3>
        <p className="text-sm text-charcoal-400">Grouped by date, newest first — update status directly and it saves immediately.</p>
      </div>
      {sorted.length === 0 ? (
        <EmptyState label="No orders yet" hint="Orders placed on the storefront will appear here." />
      ) : (
        <TableScroller>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide border-b border-cream-200">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <Fragment key={group.label}>
                  <tr className="bg-cream-100">
                    <td colSpan={6} className="px-5 py-2 text-xs font-bold text-maroon-800 uppercase tracking-wide">
                      {group.label} <span className="font-normal text-charcoal-400 normal-case">({group.orders.length} order{group.orders.length === 1 ? '' : 's'})</span>
                    </td>
                  </tr>
                  {group.orders.map((o) => (
                    <tr key={o.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50 transition-colors align-top">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-maroon-800">#{o.id}</p>
                        <p className="text-xs text-charcoal-400">
                          {new Date(o.date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-charcoal-800 font-medium">{o.customer?.name || '—'}</p>
                        <p className="text-xs text-charcoal-400">{o.customer?.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-charcoal-600 max-w-[220px]">
                        {(o.items || []).map((it: any) => `${it.name} x${it.qty ?? it.quantity ?? 1}`).join(', ')}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-charcoal-800">₹{o.totalAmount}</td>
                      <td className="px-5 py-3.5 text-charcoal-500">{o.paymentMethod}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <select
                            value={o.orderStatus}
                            disabled={updatingId === o.id}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="text-xs font-medium border border-cream-300 rounded-lg px-2 py-1.5 min-h-[36px] bg-white focus:outline-none focus:border-maroon-500 disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <StatusBadge status={o.orderStatus} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </TableScroller>
      )}
    </Card>
  );
}
