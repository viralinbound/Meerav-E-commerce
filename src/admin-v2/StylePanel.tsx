import { TEXT_SIZE_OPTIONS, type TextSize } from '@/lib/bannerStyle';

export interface Styleable {
  titleSize?: TextSize;
  subtitleSize?: TextSize;
  titleColor?: string;
  buttonSize?: TextSize;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

// Shared title/subtitle/button size + color controls, used by both the
// Hero Banners admin page and the Heritage Banner admin page so styling
// a banner works identically in both places.
export function StylePanel({
  value,
  onChange,
}: {
  value: Styleable;
  onChange: (patch: Partial<Styleable>) => void;
}) {
  return (
    <div className="px-5 pb-4 grid sm:grid-cols-2 gap-4">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">Title</p>
        <label className="block">
          <span className="text-xs text-charcoal-500 mb-1 block">Size</span>
          <select
            value={value.titleSize || 'md'}
            onChange={(e) => onChange({ titleSize: e.target.value as TextSize })}
            className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
          >
            {TEXT_SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs text-charcoal-500">Color</span>
          <input
            type="color"
            value={value.titleColor || '#fdf9f0'}
            onChange={(e) => onChange({ titleColor: e.target.value })}
            className="w-9 h-9 rounded border border-cream-300 cursor-pointer bg-white"
          />
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">Subtitle</p>
        <label className="block">
          <span className="text-xs text-charcoal-500 mb-1 block">Size</span>
          <select
            value={value.subtitleSize || 'md'}
            onChange={(e) => onChange({ subtitleSize: e.target.value as TextSize })}
            className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
          >
            {TEXT_SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3 sm:col-span-2 pt-2 border-t border-cream-200">
        <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">Button</p>
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="text-xs text-charcoal-500 mb-1 block">Size</span>
            <select
              value={value.buttonSize || 'md'}
              onChange={(e) => onChange({ buttonSize: e.target.value as TextSize })}
              className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-maroon-500 bg-white"
            >
              {TEXT_SIZE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-xs text-charcoal-500">Background</span>
            <input
              type="color"
              value={value.buttonBgColor || '#fdf9f0'}
              onChange={(e) => onChange({ buttonBgColor: e.target.value })}
              className="w-9 h-9 rounded border border-cream-300 cursor-pointer bg-white"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-xs text-charcoal-500">Text</span>
            <input
              type="color"
              value={value.buttonTextColor || '#7a2026'}
              onChange={(e) => onChange({ buttonTextColor: e.target.value })}
              className="w-9 h-9 rounded border border-cream-300 cursor-pointer bg-white"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
