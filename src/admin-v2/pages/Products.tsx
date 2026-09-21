import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import type { Category } from '@/data/products';
import { Card, LoadingState, ErrorState, EmptyState, TableScroller } from '../ui';
import { ProductFormModal, blankProduct, type AdminProduct } from './ProductFormModal';
import { useAdminAuth } from '../useAdminAuth';
import { logChange } from '../activityLog';

export function Products() {
  const { admin: me } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([MiraDB.fetchProducts(), MiraDB.fetchCategories()])
      .then(([prods, cats]) => {
        setProducts(prods as AdminProduct[]);
        setCategories((cats as Category[]).filter((c) => c.id !== 'all'));
      })
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently? This cannot be undone.')) return;
    setDeletingId(id);
    const { data: beforeRow } = await MiraDB.adminClient.from('products').select('*').eq('id', id).maybeSingle();
    const ok = await MiraDB.dbDeleteProduct(id, MiraDB.adminClient);
    setDeletingId(null);
    if (ok) {
      setProducts((cur) => cur.filter((p) => p.id !== id));
      await logChange(me, 'product.delete', beforeRow?.name || id, 'products', id, beforeRow || null, null);
    } else {
      alert('Could not delete this product. Please try again.');
    }
  };

  if (loading) return <LoadingState label="Loading products…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || id;

  return (
    <>
      <Card>
        <div className="px-5 py-4 border-b border-cream-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-maroon-900">Product Catalog</h3>
            <p className="text-sm text-charcoal-400">{products.length} products across {categories.length} categories</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="pl-9 pr-3 py-2.5 min-h-[44px] border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white w-full sm:w-56"
              />
            </div>
            <button
              onClick={() => setEditing(blankProduct(categories[0]?.id || ''))}
              className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg bg-maroon-700 text-cream-50 text-sm font-semibold hover:bg-maroon-800 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState label="No products found" hint={search ? 'Try a different search term.' : 'Add your first product to get started.'} />
        ) : (
          <TableScroller>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide border-b border-cream-200">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image?.startsWith('http') ? p.image : `/${p.image}`}
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-contain bg-cream-100 shrink-0 p-0.5"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-charcoal-800 truncate max-w-[200px]">{p.name}</p>
                          {p.tag && <p className="text-xs text-saffron-700">{p.tag}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-600">{categoryName(p.category)}</td>
                    <td className="px-5 py-3.5 font-medium text-charcoal-800">
                      ₹{p.variants?.[0]?.price ?? '—'}
                      {p.variants?.length > 1 && <span className="text-xs text-charcoal-400"> +{p.variants.length - 1} more</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(p)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-maroon-700 hover:bg-maroon-50 transition-colors"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroller>
        )}
      </Card>

      {editing && (
        <ProductFormModal
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}
