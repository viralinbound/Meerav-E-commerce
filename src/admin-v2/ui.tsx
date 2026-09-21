import type { ReactNode } from 'react';
import { Loader2, Inbox, AlertTriangle } from 'lucide-react';

export function MetricCard({
  label, value, sublabel, icon: Icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: typeof Loader2;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-cream-200 p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">{label}</p>
        <div className="w-9 h-9 rounded-lg bg-maroon-50 flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-maroon-700" />
        </div>
      </div>
      <p className="font-serif text-3xl font-bold text-maroon-900">{value}</p>
      {sublabel && <p className="text-xs text-charcoal-400 mt-1">{sublabel}</p>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-charcoal-400">
      <Loader2 className="w-8 h-8 animate-spin mb-3 text-maroon-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-cream-200 flex items-center justify-center mb-4">
        <Inbox className="w-6 h-6 text-charcoal-400" />
      </div>
      <p className="text-charcoal-700 font-medium">{label}</p>
      {hint && <p className="text-sm text-charcoal-400 mt-1 max-w-sm">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-charcoal-700 font-medium">Something went wrong</p>
      <p className="text-sm text-charcoal-400 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 min-h-[44px] rounded-lg bg-maroon-700 text-cream-50 text-sm font-medium hover:bg-maroon-800 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Processing: 'bg-mustard-100 text-mustard-800',
  Pending: 'bg-mustard-100 text-mustard-800',
  Dispatched: 'bg-saffron-100 text-saffron-800',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] || 'bg-charcoal-100 text-charcoal-700';
  return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{status}</span>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow-md border border-cream-200 ${className}`}>{children}</div>;
}

export function TableScroller({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto -mx-4 sm:mx-0"><div className="min-w-[720px] sm:min-w-0 px-4 sm:px-0">{children}</div></div>;
}
