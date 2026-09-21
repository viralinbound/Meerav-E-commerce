import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';

interface Warning {
  id: string;
  message: string;
  created_at: string;
}

export function WarningsBanner() {
  const [warnings, setWarnings] = useState<Warning[]>([]);

  const load = () => {
    MiraDB.fetchMyWarnings().then((data: Warning[]) => setWarnings(data));
  };

  useEffect(load, []);

  if (warnings.length === 0) return null;

  const acknowledge = async (id: string) => {
    await MiraDB.acknowledgeWarning(id);
    setWarnings((w) => w.filter((x) => x.id !== id));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 space-y-2">
      {warnings.map((w) => (
        <div key={w.id} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">Warning from the root admin</p>
            <p className="text-sm text-red-700">{w.message}</p>
          </div>
          <button
            onClick={() => acknowledge(w.id)}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-red-500 hover:bg-red-100 transition-colors"
            aria-label="Acknowledge warning"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
