import type { TextSize } from './useCatalog';

// Tailwind class sets for admin-selectable title/subtitle sizes, used by
// both the Hero carousel and the Heritage banner overlay so "small/medium/
// large" reads the same way in both places.
export const TITLE_SIZE_CLASSES: Record<TextSize, string> = {
  sm: 'text-3xl sm:text-4xl lg:text-5xl',
  md: 'text-4xl sm:text-5xl lg:text-6xl',
  lg: 'text-5xl sm:text-6xl lg:text-7xl',
};

export const SUBTITLE_SIZE_CLASSES: Record<TextSize, string> = {
  sm: 'text-sm sm:text-base',
  md: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
};

// clamp()-based fluid button sizing (matches the existing per-breakpoint
// scaling already used on these buttons), just at 3 selectable scales.
export const BUTTON_SIZE_STYLE: Record<TextSize, { padding: string; fontSize: string; gap: string }> = {
  sm: {
    padding: 'clamp(0.2rem, 1.1vw, 0.7rem) clamp(0.5rem, 2.4vw, 1.4rem)',
    fontSize: 'clamp(0.55rem, 1.4vw, 0.85rem)',
    gap: 'clamp(0.15rem, 0.55vw, 0.35rem)',
  },
  md: {
    padding: 'clamp(0.25rem, 1.4vw, 1rem) clamp(0.6rem, 3vw, 2rem)',
    fontSize: 'clamp(0.6rem, 1.8vw, 1.125rem)',
    gap: 'clamp(0.18rem, 0.7vw, 0.5rem)',
  },
  lg: {
    padding: 'clamp(0.35rem, 1.8vw, 1.3rem) clamp(0.8rem, 3.8vw, 2.6rem)',
    fontSize: 'clamp(0.75rem, 2.3vw, 1.4rem)',
    gap: 'clamp(0.22rem, 0.9vw, 0.65rem)',
  },
};

export const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];
