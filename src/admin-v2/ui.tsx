import type { ReactNode } from 'react';

// Splits a "₹12,345" style value so the currency mark can sit smaller and
// lighter than the digits — reads like a hand-set price tag, not a raw
// string dump.
function MetricValue({ value, className }: { value: string | number; className: string }) {
  const str = String(value);
  const match = str.match(/^(₹)(.+)$/);
  if (!match) return <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>{str}</span>;
  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span className="text-[0.55em] font-semibold align-top mr-0.5 opacity-70">₹</span>
      {match[2]}
    </span>
  );
}

export function MetricCard({
  label, value, sublabel, featured = false,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <div className="relative bg-royal-gradient rounded-2xl shadow-md p-5 overflow-hidden transition-transform duration-200 ease-out hover:-translate-y-0.5">
        <p className="text-[11px] font-semibold text-saffron-200 uppercase tracking-[0.12em] relative">{label}</p>
        <MetricValue value={value} className="block font-sans text-4xl font-extrabold text-cream-50 tracking-tighter leading-none mt-3 relative" />
        {sublabel && <p className="text-xs text-cream-200/80 mt-2 relative">{sublabel}</p>}
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 border-l-[3px] border-l-saffron-400 p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-[0.12em] mb-3">{label}</p>
      <MetricValue value={value} className="block font-sans text-[1.75rem] font-extrabold text-maroon-900 tracking-tighter leading-none" />
      {sublabel && <p className="text-xs text-charcoal-400 mt-2">{sublabel}</p>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-charcoal-400">
      <p className="text-sm animate-pulse">{label}</p>
    </div>
  );
}

export function EmptyState({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <p className="text-charcoal-700 font-medium">{label}</p>
      {hint && <p className="text-sm text-charcoal-400 mt-1 max-w-sm">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
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
