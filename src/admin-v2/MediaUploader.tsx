import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { MiraDB } from '@/lib/supabase.js';

interface MediaUploaderProps {
  folder: string;
  accept: 'image/*' | 'video/*' | 'image/*,video/*';
  label: string;
  onUploaded: (url: string) => void;
}

export function MediaUploader({ folder, accept, label, onUploaded }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    setUploading(true);
    const url = await MiraDB.uploadMedia(file, folder, MiraDB.adminClient);
    setUploading(false);

    if (!url) {
      setError('Upload failed. Please try again.');
      return;
    }
    onUploaded(url);
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border-2 border-dashed border-cream-300 text-sm font-medium text-charcoal-600 hover:border-maroon-400 hover:text-maroon-700 transition-colors disabled:opacity-60 w-full justify-center"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading…' : label}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
