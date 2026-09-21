import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import type { Category } from '@/data/products';
import { Card, LoadingState, ErrorState, EmptyState, TableScroller } from '../ui';
import { useAdminAuth } from '../useAdminAuth';
import { logChange } from '../activityLog';
import { MediaUploader } from '../MediaUploader';

type CategoryForm = Category & { image?: string | null };

function blankCategory(): CategoryForm {
  return { id: '', name: '', description: '', icon: 'fas fa-cookie', image: null };
}

export function Categories() {
  const { admin: me } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryForm[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<CategoryForm | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([MiraDB.fetchCategories(), MiraDB.fetchProducts()])
      .then(([cats, prods]) => {
        const list = (cats as CategoryForm[]).filter((c) => c.id !== 'all');
        setCategories(list);
        const counts: Record<string, number> = {};
        for (const p of prods as any[]) counts[p.category] = (counts[p.category] || 0) + 1;
        setProductCounts(counts);
      })
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (productCounts[id]) {
      alert(`Can't delete — ${productCounts[id]} product(s) still use this category. Reassign them first.`);
      return;
    }
    if (!confirm('Delete this category permanently?')) return;
    setDeletingId(id);
    const { data: beforeRow } = await MiraDB.adminClient.from('categories').select('*').eq('id', id).maybeSingle();
    const ok = await MiraDB.dbDeleteCategory(id, MiraDB.adminClient);
    setDeletingId(null);
    if (ok) {
      setCategories((cur) => cur.filter((c) => c.id !== id));
      await logChange(me, 'category.delete', beforeRow?.name || id, 'categories', id, beforeRow || null, null);
    }
    else alert('Could not delete this category. Please try again.');
  };

  if (loading) return <LoadingState label="Loading categories…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <Card>
        <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-maroon-900">Snack Categories</h3>
            <p className="text-sm text-charcoal-400">{categories.length} categories</p>
          </div>
          <button
            onClick={() => setEditing(blankCategory())}
            className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg bg-maroon-700 text-cream-50 text-sm font-semibold hover:bg-maroon-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <EmptyState label="No categories yet" hint="Add your first snack category." />
        ) : (
          <TableScroller>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide border-b border-cream-200">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-charcoal-800">{c.name}</p>
                      <p className="text-xs text-charcoal-400">{c.id}</p>
                    </td>
                    <td className="px-5 py-3.5 text-charcoal-500 max-w-xs truncate">{c.description}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cream-200 text-charcoal-700">
                        {productCounts[c.id] || 0} products
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(c)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-maroon-700 hover:bg-maroon-50 transition-colors"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          aria-label={`Delete ${c.name}`}
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
        <CategoryFormModal
          category={editing}
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

function CategoryFormModal({
  category, onClose, onSaved,
}: { category: CategoryForm; onClose: () => void; onSaved: () => void }) {
  const { admin: me } = useAdminAuth();
  const [form, setForm] = useState<CategoryForm>(category);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !category.id;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError('Category name is required.');

    setSaving(true);
    const id = isNew ? form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : form.id;
    const { data: beforeRow } = await MiraDB.adminClient.from('categories').select('*').eq('id', id).maybeSingle();
    const ok = await MiraDB.dbUpsertCategory({ ...form, id }, MiraDB.adminClient);
    setSaving(false);
    if (!ok) return setError('Could not save the category. Please try again.');
    const { data: afterRow } = await MiraDB.adminClient.from('categories').select('*').eq('id', id).maybeSingle();
    await logChange(me, isNew ? 'category.create' : 'category.update', form.name, 'categories', id, beforeRow || null, afterRow);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-cream-50 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-maroon-800 text-cream-50 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-serif text-lg font-bold">{isNew ? 'Add Category' : `Edit: ${category.name}`}</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Category Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-maroon-500 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Category Photo</label>
            {form.image && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-cream-100 border border-cream-300 mb-2 group">
                <img src={form.image.startsWith('http') ? form.image : `/${form.image}`} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image: null }))}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
            <MediaUploader
              folder={`categories/${form.id || 'new'}`}
              accept="image/*"
              label={form.image ? 'Replace Photo' : 'Upload Photo'}
              onUploaded={(url) => setForm((f) => ({ ...f, image: url }))}
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium text-charcoal-600 hover:bg-cream-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold bg-maroon-700 text-cream-50 hover:bg-maroon-800 transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
