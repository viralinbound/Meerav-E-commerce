import { useEffect, useMemo, useState } from 'react';
import { IndianRupee, ClipboardList, Package, Layers, TrendingUp, Star, X } from 'lucide-react';
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
  const [categoryCount, setCategoryCount] = useState(0);
  const [orders, setOrders] = useState<DashOrder[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([MiraDB.fetchProducts(), MiraDB.fetchCategories(), MiraDB.fetchOrders(MiraDB.adminClient)])
      .then(([prods, categories, ords]) => {
        setProducts(prods as DashProduct[]);
        setCategoryCount(categories.filter((c: any) => c.id !== 'all').length);
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
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Sales" value={`₹${totalSales.toLocaleString('en-IN')}`} sublabel="Real-time calculated" icon={IndianRupee} />
        <MetricCard label="Total Orders" value={orders.length} sublabel="Processed orders" icon={ClipboardList} />
        <MetricCard label="Catalog Items" value={products.length} sublabel="Active products" icon={Package} />
        <MetricCard label="Categories" value={categoryCount} sublabel="Active snack categories" icon={Layers} />
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
