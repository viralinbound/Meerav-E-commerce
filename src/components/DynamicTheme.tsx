import { useSettings } from '@/lib/useSettings';

// Google Fonts commonly offered in the Store Settings font pickers (see
// public/js/theme.js FONT_MAP) — loaded on demand so choosing a font in
// Settings doesn't require a code change or new <link> tag.
const FONT_FAMILIES = [
  'Playfair Display', 'Poppins', 'Merriweather', 'Newsreader', 'Manrope',
  'Nunito Sans', 'Cormorant Garamond', 'Baloo 2', 'Fredoka', 'Work Sans',
  'Fraunces', 'Plus Jakarta Sans', 'Outfit', 'Josefin Sans', 'Cinzel',
];

function fontLink(family?: string) {
  if (!family || !FONT_FAMILIES.includes(family)) return null;
  const q = family.replace(/ /g, '+');
  return `https://fonts.googleapis.com/css2?family=${q}:wght@400;500;600;700;800&display=swap`;
}

// Applies the live Store Settings (colors, fonts, text) on top of the
// storefront's default Tailwind theme. Overrides the specific utility
// classes the components actually use, via CSS variables, so an admin can
// re-brand the whole site from the CMS without a redeploy — falls back to
// the built-in maroon/saffron look when a field is left blank.
export function DynamicTheme() {
  const { settings } = useSettings();
  if (!settings) return null;

  const {
    primaryColor, secondaryColor, accentColor, accentLightColor,
    headingColor, textColor, backgroundColor,
    fontFamily, headingFontFamily,
  } = settings;

  const headingLink = fontLink(headingFontFamily);
  const bodyLink = fontLink(fontFamily);

  const css = `
    :root {
      ${primaryColor ? `--color-primary: ${primaryColor};` : ''}
      ${secondaryColor ? `--color-secondary: ${secondaryColor};` : ''}
      ${accentColor ? `--color-accent: ${accentColor};` : ''}
      ${accentLightColor ? `--color-accent-light: ${accentLightColor};` : ''}
      ${headingColor ? `--color-heading: ${headingColor};` : ''}
      ${textColor ? `--color-text: ${textColor};` : ''}
      ${backgroundColor ? `--color-bg: ${backgroundColor};` : ''}
      ${headingFontFamily ? `--font-heading: '${headingFontFamily}';` : ''}
      ${fontFamily ? `--font-body: '${fontFamily}';` : ''}
    }
    ${primaryColor ? `
      .bg-maroon-700 { background-color: var(--color-primary) !important; }
      .text-maroon-700 { color: var(--color-primary) !important; }
      .border-maroon-700 { border-color: var(--color-primary) !important; }
      .hover\\:bg-maroon-700:hover { background-color: var(--color-primary) !important; }
      .hover\\:text-maroon-700:hover { color: var(--color-primary) !important; }
    ` : ''}
    ${secondaryColor ? `
      .bg-maroon-800 { background-color: var(--color-secondary) !important; }
      .text-maroon-800 { color: var(--color-secondary) !important; }
      .hover\\:bg-maroon-800:hover { background-color: var(--color-secondary) !important; }
    ` : ''}
    ${accentColor ? `
      .bg-saffron-500 { background-color: var(--color-accent) !important; }
      .text-saffron-500 { color: var(--color-accent) !important; }
      .border-saffron-500 { border-color: var(--color-accent) !important; }
      .hover\\:bg-saffron-500:hover { background-color: var(--color-accent) !important; }
      .hover\\:bg-saffron-600:hover { background-color: var(--color-accent) !important; filter: brightness(0.92); }
    ` : ''}
    ${accentLightColor ? `
      .bg-saffron-400 { background-color: var(--color-accent-light) !important; }
      .text-saffron-400 { color: var(--color-accent-light) !important; }
      .fill-saffron-400 { fill: var(--color-accent-light) !important; }
    ` : ''}
    ${headingColor ? `
      h1, h2, h3, .font-serif { color: var(--color-heading); }
    ` : ''}
    ${textColor ? `body { color: var(--color-text); }` : ''}
    ${backgroundColor ? `body { background-color: var(--color-bg); }` : ''}
    ${headingFontFamily ? `.font-serif, h1, h2, h3 { font-family: var(--font-heading), 'Playfair Display', serif !important; }` : ''}
    ${fontFamily ? `body { font-family: var(--font-body), 'Poppins', sans-serif !important; }` : ''}
  `;

  return (
    <>
      {headingLink && <link rel="stylesheet" href={headingLink} />}
      {bodyLink && bodyLink !== headingLink && <link rel="stylesheet" href={bodyLink} />}
      <style>{css}</style>
    </>
  );
}
