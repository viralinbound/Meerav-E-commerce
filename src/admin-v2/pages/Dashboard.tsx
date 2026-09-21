import { useEffect, useState } from 'react';
import { IndianRupee, ClipboardList, Package, Layers } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { Card, LoadingState, ErrorState, EmptyState, StatusBadge, TableScroller, MetricCard } from '../ui';

interface DashOrder {
  id: string;
  customer: { name?: string } | null;
  totalAmount: number;
  orderStatus: string;
  date: string;
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [orders, setOrders] = useState<DashOrder[]>([]);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([MiraDB.fetchProducts(), MiraDB.fetchCategories(), MiraDB.fetchOrders(MiraDB.adminClient)])
      .then(([products, categories, ords]) => {
        setProductCount(products.length);
        setCategoryCount(categories.filter((c: any) => c.id !== 'all').length);
        setOrders(ords as DashOrder[]);
      })
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const recent = [...orders]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Sales" value={`₹${totalSales.toLocaleString('en-IN')}`} sublabel="Real-time calculated" icon={IndianRupee} />
        <MetricCard label="Total Orders" value={orders.length} sublabel="Processed orders" icon={ClipboardList} />
        <MetricCard label="Catalog Items" value={productCount} sublabel="Active products" icon={Package} />
        <MetricCard label="Categories" value={categoryCount} sublabel="Active snack categories" icon={Layers} />
      </div>

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
                    <td className="px-5 py-3.5 text-charcoal-400">{o.date}</td>
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
