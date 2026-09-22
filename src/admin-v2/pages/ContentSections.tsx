import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { Card, LoadingState, ErrorState, EmptyState } from '../ui';
import { MediaUploader } from '../MediaUploader';

interface AdminTestimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviewText: string;
  avatar: string;
  sortOrder: number;
  isVisible: boolean;
}

interface AdminFaq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function ContentSections() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [faqs, setFaqs] = useState<AdminFaq[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([MiraDB.fetchTestimonials(MiraDB.adminClient), MiraDB.fetchFaqs(MiraDB.adminClient)])
      .then(([testi, faqRows]: [AdminTestimonial[], AdminFaq[]]) => {
        setTestimonials(testi);
        setFaqs(faqRows);
      })
      .catch((e: any) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // ---- Testimonials ----

  const editTestimonialLocally = (id: string, patch: Partial<AdminTestimonial>) => {
    setTestimonials((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const persistTestimonial = async (t: AdminTestimonial) => {
    setSavingId(t.id);
    const ok = await MiraDB.dbUpsertTestimonial(t, MiraDB.adminClient);
    setSavingId(null);
    if (!ok) {
      alert('Could not save this review. Please try again.');
      load();
    }
  };

  const addTestimonial = () => {
    const t: AdminTestimonial = {
      id: newId('testi'),
      name: '',
      city: '',
      rating: 5,
      reviewText: '',
      avatar: '',
      sortOrder: testimonials.length + 1,
      isVisible: true,
    };
    setTestimonials((cur) => [...cur, t]);
    persistTestimonial(t);
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Remove this review?')) return;
    setSavingId(id);
    const ok = await MiraDB.dbDeleteTestimonial(id, MiraDB.adminClient);
    setSavingId(null);
    if (ok) setTestimonials((cur) => cur.filter((t) => t.id !== id));
    else alert('Could not remove this review. Please try again.');
  };

  const reorderTestimonials = async (list: AdminTestimonial[]) => {
    setTestimonials(list);
    for (let i = 0; i < list.length; i++) {
      await MiraDB.dbUpsertTestimonial({ ...list[i], sortOrder: i + 1 }, MiraDB.adminClient);
    }
  };

  const handleDropTestimonial = (targetId: string) => {
    const sourceId = dragId.current;
    dragId.current = null;
    if (!sourceId || sourceId === targetId) return;
    const list = [...testimonials];
    const fromIdx = list.findIndex((t) => t.id === sourceId);
    const toIdx = list.findIndex((t) => t.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    reorderTestimonials(list);
  };

  // ---- FAQs ----

  const editFaqLocally = (id: string, patch: Partial<AdminFaq>) => {
    setFaqs((cur) => cur.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const persistFaq = async (f: AdminFaq) => {
    setSavingId(f.id);
    const ok = await MiraDB.dbUpsertFaq(f, MiraDB.adminClient);
    setSavingId(null);
    if (!ok) {
      alert('Could not save this FAQ. Please try again.');
      load();
    }
  };

  const addFaq = () => {
    const f: AdminFaq = {
      id: newId('faq'),
      question: '',
      answer: '',
      sortOrder: faqs.length + 1,
      isVisible: true,
    };
    setFaqs((cur) => [...cur, f]);
    persistFaq(f);
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('Remove this FAQ?')) return;
    setSavingId(id);
    const ok = await MiraDB.dbDeleteFaq(id, MiraDB.adminClient);
    setSavingId(null);
    if (ok) setFaqs((cur) => cur.filter((f) => f.id !== id));
    else alert('Could not remove this FAQ. Please try again.');
  };

  const reorderFaqs = async (list: AdminFaq[]) => {
    setFaqs(list);
    for (let i = 0; i < list.length; i++) {
      await MiraDB.dbUpsertFaq({ ...list[i], sortOrder: i + 1 }, MiraDB.adminClient);
    }
  };

  const handleDropFaq = (targetId: string) => {
    const sourceId = dragId.current;
    dragId.current = null;
    if (!sourceId || sourceId === targetId) return;
    const list = [...faqs];
    const fromIdx = list.findIndex((f) => f.id === sourceId);
    const toIdx = list.findIndex((f) => f.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    reorderFaqs(list);
  };

  if (loading) return <LoadingState label="Loading testimonials & FAQs…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <Card>
        <div className="px-5 py-4 border-b border-cream-200">
          <h3 className="font-serif text-lg font-bold text-maroon-900">Customer Testimonials</h3>
          <p className="text-sm text-charcoal-400">Drag to reorder — changes save live, no publish step needed.</p>
        </div>

        {testimonials.length === 0 ? (
          <EmptyState label="No testimonials yet" hint="Add one below to get started." />
        ) : (
          <div className="divide-y divide-cream-100">
            {testimonials.map((t) => (
              <div
                key={t.id}
                draggable
                onDragStart={() => (dragId.current = t.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropTestimonial(t.id)}
                className={`flex flex-col sm:flex-row gap-4 px-5 py-4 transition-opacity ${savingId === t.id ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <GripVertical className="w-5 h-5 text-charcoal-300 cursor-grab active:cursor-grabbing shrink-0" />
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-cream-100 border border-cream-300 shrink-0 flex items-center justify-center">
                    {t.avatar ? (
                      <img src={t.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-charcoal-400 font-semibold">{(t.name || '?').slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      value={t.name}
                      onChange={(e) => editTestimonialLocally(t.id, { name: e.target.value })}
                      onBlur={() => persistTestimonial(t)}
                      placeholder="Customer name"
                      className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
                    />
                    <input
                      value={t.city}
                      onChange={(e) => editTestimonialLocally(t.id, { city: e.target.value })}
                      onBlur={() => persistTestimonial(t)}
                      placeholder="City, State"
                      className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
                    />
                    <select
                      value={t.rating}
                      onChange={(e) => persistTestimonial({ ...t, rating: Number(e.target.value) })}
                      className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} {'★'.repeat(n)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={t.reviewText}
                    onChange={(e) => editTestimonialLocally(t.id, { reviewText: e.target.value })}
                    onBlur={() => persistTestimonial(t)}
                    placeholder="Review text"
                    rows={2}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white resize-none"
                  />
                  <MediaUploader
                    folder="testimonials"
                    accept="image/*"
                    label={t.avatar ? 'Replace Photo' : 'Add Customer Photo'}
                    onUploaded={(url) => persistTestimonial({ ...t, avatar: url })}
                  />
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  <button
                    onClick={() => persistTestimonial({ ...t, isVisible: !t.isVisible })}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-charcoal-500 hover:bg-cream-200 transition-colors"
                    aria-label={t.isVisible ? 'Hide review' : 'Show review'}
                    title={t.isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
                  >
                    {t.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-charcoal-300" />}
                  </button>
                  <button
                    onClick={() => deleteTestimonial(t.id)}
                    disabled={savingId === t.id}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    aria-label="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-5 border-t border-cream-200">
          <button
            onClick={addTestimonial}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-maroon-700 text-cream-50 text-sm font-semibold hover:bg-maroon-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-cream-200">
          <h3 className="font-serif text-lg font-bold text-maroon-900">Frequently Asked Questions</h3>
          <p className="text-sm text-charcoal-400">Drag to reorder — changes save live, no publish step needed.</p>
        </div>

        {faqs.length === 0 ? (
          <EmptyState label="No FAQs yet" hint="Add one below to get started." />
        ) : (
          <div className="divide-y divide-cream-100">
            {faqs.map((f) => (
              <div
                key={f.id}
                draggable
                onDragStart={() => (dragId.current = f.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropFaq(f.id)}
                className={`flex flex-col sm:flex-row gap-4 px-5 py-4 transition-opacity ${savingId === f.id ? 'opacity-60' : ''}`}
              >
                <GripVertical className="w-5 h-5 text-charcoal-300 cursor-grab active:cursor-grabbing shrink-0 mt-2" />
                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    value={f.question}
                    onChange={(e) => editFaqLocally(f.id, { question: e.target.value })}
                    onBlur={() => persistFaq(f)}
                    placeholder="Question"
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm font-medium focus:outline-none focus:border-maroon-500 bg-white"
                  />
                  <textarea
                    value={f.answer}
                    onChange={(e) => editFaqLocally(f.id, { answer: e.target.value })}
                    onBlur={() => persistFaq(f)}
                    placeholder="Answer"
                    rows={2}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white resize-none"
                  />
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  <button
                    onClick={() => persistFaq({ ...f, isVisible: !f.isVisible })}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-charcoal-500 hover:bg-cream-200 transition-colors"
                    aria-label={f.isVisible ? 'Hide FAQ' : 'Show FAQ'}
                    title={f.isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
                  >
                    {f.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-charcoal-300" />}
                  </button>
                  <button
                    onClick={() => deleteFaq(f.id)}
                    disabled={savingId === f.id}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    aria-label="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-5 border-t border-cream-200">
          <button
            onClick={addFaq}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-maroon-700 text-cream-50 text-sm font-semibold hover:bg-maroon-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>
      </Card>
    </div>
  );
}
