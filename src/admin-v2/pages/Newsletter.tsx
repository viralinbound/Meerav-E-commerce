import { useEffect, useState, type FormEvent } from 'react';
import { Send, Users } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';
import { Card, LoadingState } from '../ui';
import { useAdminAuth } from '../useAdminAuth';
import { logChange } from '../activityLog';

export function Newsletter() {
  const { admin: me } = useAdminAuth();
  const [count, setCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    MiraDB.fetchSubscriberCount(MiraDB.adminClient)
      .then(setCount)
      .finally(() => setLoadingCount(false));
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return setError('Subject and message are both required.');
    if (!confirm(`Send this email to all ${count ?? ''} subscribers? This can't be undone.`)) return;

    setSending(true);
    setError(null);
    setResult(null);

    const res = await MiraDB.sendBroadcastEmail(subject.trim(), message.trim(), MiraDB.adminClient);
    setSending(false);

    if (res.error) {
      setError(res.error);
      return;
    }
    setResult({ sent: res.sent, total: res.total });
    await logChange(me, 'newsletter.broadcast', subject.trim(), 'newsletter_subscribers', 'broadcast', null, { subject, sent: res.sent, total: res.total });
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-maroon-900">Newsletter Subscribers</h3>
            <p className="text-sm text-charcoal-400">Everyone who signed up through the "Drop your email" footer form.</p>
          </div>
          <div className="flex items-center gap-2 text-maroon-800">
            <Users className="w-5 h-5" />
            <span className="font-serif text-2xl font-bold">
              {loadingCount ? <LoadingState label="" /> : count ?? 0}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-cream-200">
          <h3 className="font-serif text-lg font-bold text-maroon-900">Send Offer / Announcement Email</h3>
          <p className="text-sm text-charcoal-400">Goes out to every subscriber above the moment you send it — there's no draft or schedule.</p>
        </div>
        <form onSubmit={handleSend} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. 20% off this weekend only!"
              className="w-full px-3 py-2.5 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Write the offer details here..."
              className="w-full px-3 py-2.5 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {result && (
            <p className="text-sm text-green-700">
              Sent to {result.sent} of {result.total} subscribers.
              {result.sent < result.total && ' Some emails failed — check the function logs for details.'}
            </p>
          )}

          <button
            type="submit"
            disabled={sending || !count}
            className="flex items-center gap-2 px-5 py-2.5 bg-maroon-700 text-cream-50 font-medium rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending…' : `Send to ${count ?? 0} Subscribers`}
          </button>
        </form>
      </Card>
    </div>
  );
}
