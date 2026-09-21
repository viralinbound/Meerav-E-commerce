import { useEffect, useMemo, useState } from 'react';
import { IndianRupee, ClipboardList, Package, TrendingUp, Star, X } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { useAdminAuth } from '../useAdminAuth';
import { logChange } from '../activityLog';
import { Card, LoadingState, ErrorState, EmptyState, StatusBadge, TableScroller, MetricCard } from '../ui';

interface DashOrder {
  id: string;
  customer: { name?: string } | null;
  totalAmount: number;
  orderStatus: string;
  date: string;
  items?: { productId: string; name: string; quantity: number; image?: string }[];
}

interface DashProduct {
  id: string;
  name: string;
  tag?: string;
  image?: string;
}

export function Dashboard() {
  const { admin: me } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<DashProduct[]>([]);
  const [orders, setOrders] = useState<DashOrder[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([MiraDB.fetchProducts(), MiraDB.fetchOrders(MiraDB.adminClient)])
      .then(([prods, ords]) => {
        setProducts(prods as DashProduct[]);
        setOrders(ords as DashOrder[]);
      })
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const topSellers = useMemo(() => {
    const soldByProduct = new Map<string, number>();
    for (const o of orders) {
      for (const item of o.items || []) {
        soldByProduct.set(item.productId, (soldByProduct.get(item.productId) || 0) + (item.quantity || 0));
      }
    }
    return [...soldByProduct.entries()]
      .map(([productId, unitsSold]) => ({ product: products.find((p) => p.id === productId), productId, unitsSold }))
      .filter((r) => r.product)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 6);
  }, [orders, products]);

  const isBestseller = (tag?: string) => (tag || '').toLowerCase().includes('best');

  // Sales grouped by calendar day for the last 14 days, oldest first, so the
  // trend chart below reads left-to-right like a normal timeline.
  const salesByDay = useMemo(() => {
    const days: { key: string; label: string; total: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        key: d.toDateString(),
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        total: 0,
        orders: 0,
      });
    }
    const byKey = new Map(days.map((d) => [d.key, d]));
    for (const o of orders) {
      const d = new Date(o.date);
      if (isNaN(d.getTime())) continue;
      const entry = byKey.get(d.toDateString());
      if (entry) {
        entry.total += o.totalAmount || 0;
        entry.orders += 1;
      }
    }
    return days;
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) counts.set(o.orderStatus, (counts.get(o.orderStatus) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const toggleBestseller = async (product: DashProduct) => {
    setBusyId(product.id);
    const before = { ...product };
    const nextTag = isBestseller(product.tag) ? '' : 'Best Seller';
    const { error: updErr } = await MiraDB.adminClient.from('products').update({ tag: nextTag }).eq('id', product.id);
    setBusyId(null);
    if (updErr) { alert('Could not update this product. Please try again.'); return; }
    setProducts((cur) => cur.map((p) => (p.id === product.id ? { ...p, tag: nextTag } : p)));
    await logChange(me, 'product.update', product.name, 'products', product.id, before, { ...product, tag: nextTag });
  };

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const recent = [...orders]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Sales" value={`₹${totalSales.toLocaleString('en-IN')}`} sublabel="Real-time calculated" icon={IndianRupee} />
        <MetricCard label="Total Orders" value={orders.length} sublabel="Processed orders" icon={ClipboardList} />
        <MetricCard label="Catalog Items" value={products.length} sublabel="Active products" icon={Package} />
        <MetricCard label="Best Sellers" value={products.filter((p) => isBestseller(p.tag)).length} sublabel="Tagged products" icon={Star} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="px-5 py-4 border-b border-cream-200">
            <h3 className="font-serif text-lg font-bold text-maroon-900 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-maroon-700" /> Sales — Last 14 Days
            </h3>
            <p className="text-sm text-charcoal-400">Daily revenue from real order data.</p>
          </div>
          <div className="p-5">
            {salesByDay.every((d) => d.total === 0) ? (
              <EmptyState label="No sales yet" hint="Once orders come in, the daily trend shows up here." />
            ) : (
              <SalesTrendChart data={salesByDay} />
            )}
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-cream-200">
            <h3 className="font-serif text-lg font-bold text-maroon-900">Order Status</h3>
            <p className="text-sm text-charcoal-400">All-time breakdown.</p>
          </div>
          {statusBreakdown.length === 0 ? (
            <EmptyState label="No orders yet" />
          ) : (
            <div className="p-5 space-y-3">
              {statusBreakdown.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between gap-3">
                  <StatusBadge status={status} />
                  <div className="flex-1 h-2 bg-cream-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-maroon-600 rounded-full"
                      style={{ width: `${(count / orders.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-charcoal-700 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-cream-200">
          <h3 className="font-serif text-lg font-bold text-maroon-900 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-maroon-700" /> Top Sellers
          </h3>
          <p className="text-sm text-charcoal-400">Auto-built from real order data — units sold, most first.</p>
        </div>
        {topSellers.length === 0 ? (
          <EmptyState label="No sales yet" hint="Once orders come in, your best-selling products will show up here automatically." />
        ) : (
          <div className="divide-y divide-cream-100">
            {topSellers.map(({ product, unitsSold }) => (
              <div key={product!.id} className="flex items-center gap-3 px-5 py-3.5">
                <img
                  src={product!.image?.startsWith('http') ? product!.image : `/${product!.image}`}
                  alt={product!.name}
                  className="w-11 h-11 rounded-lg object-contain bg-cream-100 shrink-0 p-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-800 truncate">{product!.name}</p>
                  <p className="text-xs text-charcoal-400">{unitsSold} units sold</p>
                </div>
                <button
                  onClick={() => toggleBestseller(product!)}
                  disabled={busyId === product!.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 ${
                    isBestseller(product!.tag)
                      ? 'bg-saffron-100 text-saffron-800 hover:bg-saffron-200'
                      : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
                  }`}
                >
                  {isBestseller(product!.tag) ? (
                    <>
                      <X className="w-3.5 h-3.5" /> Remove Tag
                    </>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5" /> Mark Bestseller
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-maroon-900">Recent Orders</h3>
        </div>
        {recent.length === 0 ? (
          <EmptyState label="No orders yet" hint="Orders placed on the storefront will show up here in real time." />
        ) : (
          <TableScroller>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide border-b border-cream-200">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-maroon-800">#{o.id}</td>
                    <td className="px-5 py-3.5 text-charcoal-700">{o.customer?.name || '—'}</td>
                    <td className="px-5 py-3.5 font-medium text-charcoal-800">₹{o.totalAmount}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.orderStatus} /></td>
                    <td className="px-5 py-3.5 text-charcoal-400">
                      {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="text-charcoal-300">
                        {' '}· {new Date(o.date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroller>
        )}
      </Card>
    </div>
  );
}

function SalesTrendChart({ data }: { data: { key: string; label: string; total: number; orders: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const width = 700;
  const height = 200;
  const barGap = 6;
  const barWidth = (width - barGap * (data.length - 1)) / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height + 28}`} className="w-full h-56" preserveAspectRatio="none">
      {data.map((d, i) => {
        const barHeight = (d.total / max) * height;
        const x = i * (barWidth + barGap);
        const y = height - barHeight;
        return (
          <g key={d.key}>
            <title>
              {d.label}: ₹{d.total.toLocaleString('en-IN')} ({d.orders} order{d.orders === 1 ? '' : 's'})
            </title>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, d.total > 0 ? 3 : 0)}
              rx={3}
              className={d.total > 0 ? 'fill-maroon-600' : 'fill-cream-200'}
            />
            <text
              x={x + barWidth / 2}
              y={height + 18}
              textAnchor="middle"
              className="fill-charcoal-400"
              style={{ fontSize: 10 }}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
