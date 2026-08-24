/**
 * MEERAV NAMKEENS - LIVE SITE THEME & SETTINGS APPLIER
 * Loaded on every page right after supabase-client.js. Fetches the single
 * `site_settings` row and applies branding (logo/favicon/name), theme
 * (colors/font), and storefront copy (announcement bar, WhatsApp number,
 * UPI id, footer) at runtime — so admin edits on the Settings page show up
 * everywhere without touching a single hardcoded HTML file.
 *
 * Colors: Tailwind's CDN build compiles arbitrary classes like
 * `bg-[#4A0713]` to literal hex at parse time, so they can't read a CSS
 * variable directly. Instead we inject a small override <style> tag that
 * re-targets every utility built from the four known brand hexes to the
 * admin's chosen colors, with !important so it always wins.
 */

const DEFAULT_SITE_SETTINGS = {
  siteName: 'MEERAV Namkeens & Sweets',
  tagline: 'From the Heart of Bikaner',
  logoUrl: 'assets/images/meerav_logo.png',
  faviconUrl: 'assets/images/meerav_logo.png',
  primaryColor: '#4A0713',
  secondaryColor: '#32040C',
  accentColor: '#E59819',
  accentLightColor: '#FBBF24',
  backgroundType: 'solid',
  backgroundColor: '#FFF9ED',
  backgroundGradient: ['#FFF9ED', '#FDF1D0', '#E59819'],
  backgroundImageUrl: '',
  backgroundPatternOverlay: false,
  backgroundPattern: 'none',
  backgroundPatternImageUrl: '',
  adminPanelColor: '#1F0307',
  adminPanelType: 'solid',
  adminPanelGradient: ['#32040C', '#1F0307', '#030712'],
  textColor: '#1F1517',
  headingColor: '#32040C',
  fontFamily: 'Outfit',
  headingFontFamily: 'Outfit',
  baseFontSize: '16px',
  announcementText: '✨ Prepared in Pure & Clean Oil • Use coupon MEERAV10 for 10% Off!',
  whatsappNumber: '+919876543210',
  contactEmail: 'hello@meeravnamkeens.com',
  contactPhone: '+91 98765 43210',
  contactAddress: 'Bikaner, Rajasthan, India',
  footerText: '© 2026 All Rights Reserved.',
  instagramUrl: '',
  facebookUrl: '',
  paymentUpiEnabled: true,
  paymentUpiId: 'meeravnamkeens@upi',
  paymentCodEnabled: true,
  paymentCardEnabled: true,
  paymentNetbankingEnabled: true,
  paymentRazorpayEnabled: false,
  paymentRazorpayKeyId: '',
  paymentStripeEnabled: false,
  paymentStripePublishableKey: ''
};

window.SITE_SETTINGS = { ...DEFAULT_SITE_SETTINGS };

const GOOGLE_FONT_STACKS = {
  'Outfit': "'Outfit', sans-serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
  'Poppins': "'Poppins', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  'Inter': "'Inter', sans-serif",
  'Montserrat': "'Montserrat', sans-serif",
  'Merriweather': "'Merriweather', serif",
  'Lora': "'Lora', serif",
  'Roboto': "'Roboto', sans-serif",
  'Nunito': "'Nunito', sans-serif",
  'Raleway': "'Raleway', sans-serif",
  'Work Sans': "'Work Sans', sans-serif",
  'DM Sans': "'DM Sans', sans-serif",
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'Cormorant Garamond': "'Cormorant Garamond', serif",
  'Cinzel': "'Cinzel', serif",
  'Bebas Neue': "'Bebas Neue', sans-serif",
  'Josefin Sans': "'Josefin Sans', sans-serif"
};

function digitsOnly(str) {
  return (str || '').replace(/\D/g, '');
}

function applyBrandColors(s) {
  const swatches = [
    { from: '4A0713', to: s.primaryColor },
    { from: '32040C', to: s.secondaryColor },
    { from: 'E59819', to: s.accentColor },
    { from: 'FBBF24', to: s.accentLightColor },
    { from: 'FFF9ED', to: s.backgroundColor },
    { from: '1F1517', to: s.textColor },
    { from: '1F0307', to: s.adminPanelColor }
  ];

  const prefixes = ['bg', 'text', 'border', 'ring', 'from', 'to', 'via', 'decoration', 'divide', 'outline', 'shadow', 'fill', 'stroke', 'accent', 'caret'];
  const stateVariants = ['', 'hover:', 'focus:', 'active:', 'group-hover:', 'sm:', 'md:', 'lg:'];
  let css = '';

  swatches.forEach(({ from, to }) => {
    if (!to || to.toUpperCase() === `#${from}`) return;
    prefixes.forEach(prefix => {
      stateVariants.forEach(state => {
        const escapedState = state.replace(':', '\\:');
        css += `.${escapedState}${prefix}-\\[\\#${from}\\]{${cssPropFor(prefix)}:${to} !important;}\n`;
      });
    });
    // Opacity-suffixed variants used for borders/backgrounds, e.g. border-[#E59819]/40
    ['10', '20', '30', '40', '50', '60', '70', '80', '90'].forEach(op => {
      css += `.bg-\\[\\#${from}\\]\\/${op}{background-color:${hexToRgba(to, op)} !important;}\n`;
      css += `.border-\\[\\#${from}\\]\\/${op}{border-color:${hexToRgba(to, op)} !important;}\n`;
      css += `.text-\\[\\#${from}\\]\\/${op}{color:${hexToRgba(to, op)} !important;}\n`;
    });
  });

  // Gradient stops also need --tw-gradient-from/to set directly (Tailwind reads these custom props).
  swatches.forEach(({ from, to }) => {
    if (!to || to.toUpperCase() === `#${from}`) return;
    css += `.from-\\[\\#${from}\\]{--tw-gradient-from:${to} var(--tw-gradient-from-position) !important;}\n`;
    css += `.to-\\[\\#${from}\\]{--tw-gradient-to:${to} var(--tw-gradient-to-position) !important;}\n`;
  });

  // css/admin.css has its own hand-written rules (not Tailwind utility
  // classes) for the sidebar and active-nav-item backgrounds — the generic
  // swatch loop above only touches `bg-[#hex]`-style classes, so these need
  // their own explicit override to actually follow the chosen colors.
  const adminGradientStops = (s.adminPanelType === 'gradient' && Array.isArray(s.adminPanelGradient) && s.adminPanelGradient.length >= 2)
    ? s.adminPanelGradient.filter(Boolean).join(', ')
    : `${s.adminPanelColor}, ${darkenHex(s.adminPanelColor, 0.65)}`;
  css += `.admin-sidebar{background:linear-gradient(180deg, ${adminGradientStops}) !important;}\n`;
  css += `.admin-nav-item.active{background:linear-gradient(135deg, ${s.primaryColor} 0%, ${s.secondaryColor} 100%) !important;}\n`;

  // Three-stop gradients bake the `via-*` color directly into --tw-gradient-stops
  // at Tailwind's compile time, so it can't be swapped out through a variable —
  // override the whole background-image on the two known admin-panel gradients
  // (login gate + notification card), each keeping its own direction.
  css += `.from-\\[\\#32040C\\].via-\\[\\#1F0307\\].to-gray-950{background-image:linear-gradient(to bottom right, ${adminGradientStops}) !important;}\n`;
  css += `.bg-gradient-to-r.from-\\[\\#32040C\\].via-\\[\\#1F0307\\].to-gray-950{background-image:linear-gradient(to right, ${adminGradientStops}) !important;}\n`;

  css += `:root{--meerav-maroon:${s.primaryColor};--meerav-maroon-dark:${s.secondaryColor};--meerav-maroon-light:${s.primaryColor};--meerav-gold:${s.accentColor};--meerav-gold-light:${s.accentLightColor};--meerav-cream:${s.backgroundColor};--meerav-cream-dark:${s.backgroundColor};--meerav-text-dark:${s.textColor};}\n`;
  css += `body{color:${s.textColor} !important;}\n`;

  let styleTag = document.getElementById('dynamic-brand-theme');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-brand-theme';
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = css;
}

function cssPropFor(prefix) {
  const map = {
    bg: 'background-color', text: 'color', border: 'border-color', ring: '--tw-ring-color',
    decoration: 'text-decoration-color', divide: 'border-color', outline: 'outline-color',
    shadow: '--tw-shadow-color', fill: 'fill', stroke: 'stroke', accent: 'accent-color', caret: 'caret-color',
    from: '--tw-gradient-from', to: '--tw-gradient-to', via: '--tw-gradient-via'
  };
  return map[prefix] || 'color';
}

function hexToRgba(hex, opacityPercent) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${Number(opacityPercent) / 100})`;
}

/** Scales a hex color's RGB channels down toward black — used to derive a second gradient stop from a single admin color. */
function darkenHex(hex, factor) {
  const clean = hex.replace('#', '');
  const r = Math.round(parseInt(clean.substring(0, 2), 16) * factor);
  const g = Math.round(parseInt(clean.substring(2, 4), 16) * factor);
  const b = Math.round(parseInt(clean.substring(4, 6), 16) * factor);
  return `rgb(${r},${g},${b})`;
}

function applyFont(s) {
  const bodyFamily = s.fontFamily || 'Outfit';
  const headingFamily = s.headingFontFamily || bodyFamily;

  const linkId = 'dynamic-google-font';
  let link = document.getElementById(linkId);
  const families = [...new Set([bodyFamily, headingFamily])]
    .map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800;900`)
    .join('&');
  const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  if (!link) {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;

  const bodyStack = GOOGLE_FONT_STACKS[bodyFamily] || `'${bodyFamily}', sans-serif`;
  const headingStack = GOOGLE_FONT_STACKS[headingFamily] || `'${headingFamily}', sans-serif`;

  let styleTag = document.getElementById('dynamic-font-override');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-font-override';
    document.head.appendChild(styleTag);
  }
  // Tailwind's text-xs/sm/base/lg/etc are all in rem, so scaling the root
  // font-size proportionally scales every piece of text on the site at once.
  // Headings (h1-h6, .brand-font) get their own font + color, independent
  // of the body's — a common "display font + body font" brand kit setup.
  styleTag.textContent = `
    html{font-size:${s.baseFontSize || '16px'};}
    body{font-family:${bodyStack};}
    h1,h2,h3,h4,h5,h6,.brand-font{font-family:${headingStack} !important;color:${s.headingColor} !important;}
  `;
}

/**
 * Background: solid color (default), a multi-color gradient ("tri-colour"
 * segments, or more — any number of stops), or an uploaded image — plus an
 * optional decorative dot-pattern overlay on top of any of the three.
 */
function applyBackground(s) {
  let bg = s.backgroundColor;

  if (s.backgroundType === 'gradient' && Array.isArray(s.backgroundGradient) && s.backgroundGradient.length >= 2) {
    bg = `linear-gradient(135deg, ${s.backgroundGradient.join(', ')})`;
  } else if (s.backgroundType === 'image' && s.backgroundImageUrl) {
    bg = `url('${s.backgroundImageUrl}') center/cover fixed no-repeat, ${s.backgroundColor}`;
  }

  let styleTag = document.getElementById('dynamic-background');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-background';
    document.head.appendChild(styleTag);
  }

  let css = `body{background:${bg} !important;background-color:${s.backgroundColor} !important;}\n`;

  const patternCss = buildPatternCss(s.backgroundPattern, s.primaryColor, s.accentColor, s.backgroundPatternImageUrl);
  // No z-index/position games needed on body's children — an unstacked
  // ::before with default (auto) stacking simply paints behind all of
  // body's normal-flow content, so it can't cover the nav/modals/etc.
  if (patternCss) {
    css += `body::before{content:'';position:fixed;inset:0;pointer-events:none;${patternCss}}\n`;
  }

  styleTag.textContent = css;
}

/** A handful of pure-CSS decorative background patterns, plus an admin-uploaded tileable image. */
function buildPatternCss(pattern, primaryColor, accentColor, patternImageUrl) {
  switch (pattern) {
    case 'dots':
      return `background-image:radial-gradient(${accentColor} 0.75px, transparent 0.75px), radial-gradient(${primaryColor} 0.75px, transparent 0.75px);background-size:30px 30px;background-position:0 0, 15px 15px;opacity:0.12;`;
    case 'grid':
      return `background-image:linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px);background-size:32px 32px;opacity:0.08;`;
    case 'stripes':
      return `background-image:repeating-linear-gradient(45deg, ${accentColor}, ${accentColor} 2px, transparent 2px, transparent 18px);opacity:0.08;`;
    case 'waves':
      return `background-image:radial-gradient(circle at 50% 0, transparent 24%, ${accentColor} 25%, ${accentColor} 26%, transparent 27%, transparent 74%, ${primaryColor} 75%, ${primaryColor} 76%, transparent 77%, transparent);background-size:56px 100px;opacity:0.07;`;
    case 'custom-image':
      if (!patternImageUrl) return '';
      return `background-image:url('${patternImageUrl}');background-repeat:repeat;background-size:120px;opacity:0.15;`;
    default:
      return '';
  }
}

/**
 * Theme Presets — full brand kits (colors + fonts + background) an admin
 * can apply in one click for an instant, complete site transform. Each
 * preset only overrides the visual/theme fields; identity (site name,
 * logo, payment, contact info) is left untouched.
 */
const THEME_PRESETS = [
  {
    key: 'royal-heritage', name: 'Royal Heritage', swatches: ['#4A0713', '#E59819', '#FFF9ED'],
    values: { primaryColor: '#4A0713', secondaryColor: '#32040C', accentColor: '#E59819', accentLightColor: '#FBBF24', headingColor: '#32040C', textColor: '#1F1517', backgroundType: 'solid', backgroundColor: '#FFF9ED', backgroundGradient: ['#FFF9ED', '#FDF1D0', '#E59819', '#E59819'], backgroundPattern: 'dots', fontFamily: 'Plus Jakarta Sans', headingFontFamily: 'Outfit', adminPanelColor: '#1F0307' }
  },
  {
    key: 'ocean-breeze', name: 'Ocean Breeze', swatches: ['#0C4A6E', '#0EA5E9', '#F0F9FF'],
    values: { primaryColor: '#0C4A6E', secondaryColor: '#082F49', accentColor: '#0EA5E9', accentLightColor: '#7DD3FC', headingColor: '#0C4A6E', textColor: '#1E293B', backgroundType: 'gradient', backgroundColor: '#F0F9FF', backgroundGradient: ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC'], backgroundPattern: 'waves', fontFamily: 'Inter', headingFontFamily: 'Space Grotesk', adminPanelColor: '#031B2E' }
  },
  {
    key: 'forest-fresh', name: 'Forest Fresh', swatches: ['#14532D', '#65A30D', '#F7FEE7'],
    values: { primaryColor: '#14532D', secondaryColor: '#052E16', accentColor: '#65A30D', accentLightColor: '#A3E635', headingColor: '#14532D', textColor: '#1C1917', backgroundType: 'solid', backgroundColor: '#F7FEE7', backgroundGradient: ['#F7FEE7', '#ECFCCB', '#65A30D', '#65A30D'], backgroundPattern: 'grid', fontFamily: 'Nunito', headingFontFamily: 'Josefin Sans', adminPanelColor: '#031A0E' }
  },
  {
    key: 'midnight-luxury', name: 'Midnight Luxury', swatches: ['#0A0A0A', '#D4AF37', '#1A1A1A'],
    values: { primaryColor: '#0A0A0A', secondaryColor: '#000000', accentColor: '#D4AF37', accentLightColor: '#F5D580', headingColor: '#D4AF37', textColor: '#E5E5E5', backgroundType: 'solid', backgroundColor: '#141414', backgroundGradient: ['#141414', '#0A0A0A', '#D4AF37', '#D4AF37'], backgroundPattern: 'none', fontFamily: 'Josefin Sans', headingFontFamily: 'Cinzel', adminPanelColor: '#000000' }
  },
  {
    key: 'pastel-bakery', name: 'Pastel Bakery', swatches: ['#BE185D', '#F472B6', '#FDF2F8'],
    values: { primaryColor: '#BE185D', secondaryColor: '#831843', accentColor: '#F472B6', accentLightColor: '#FBCFE8', headingColor: '#831843', textColor: '#44403C', backgroundType: 'gradient', backgroundColor: '#FDF2F8', backgroundGradient: ['#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4'], backgroundPattern: 'dots', fontFamily: 'Poppins', headingFontFamily: 'Cormorant Garamond', adminPanelColor: '#3B0A20' }
  },
  {
    key: 'monochrome-modern', name: 'Monochrome Modern', swatches: ['#18181B', '#71717A', '#FAFAFA'],
    values: { primaryColor: '#18181B', secondaryColor: '#09090B', accentColor: '#71717A', accentLightColor: '#A1A1AA', headingColor: '#18181B', textColor: '#3F3F46', backgroundType: 'solid', backgroundColor: '#FAFAFA', backgroundGradient: ['#FAFAFA', '#F4F4F5', '#71717A', '#71717A'], backgroundPattern: 'none', fontFamily: 'Work Sans', headingFontFamily: 'Bebas Neue', adminPanelColor: '#000000' }
  }
];
window.THEME_PRESETS = THEME_PRESETS;

function applyBranding(s) {
  // Logo — every <img> across the site references the same packaged filename.
  document.querySelectorAll('img[src*="meerav_logo"]').forEach(img => {
    if (s.logoUrl) img.src = s.logoUrl;
  });

  // Favicon
  let favicon = document.getElementById('site-favicon');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.id = 'site-favicon';
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  favicon.href = s.faviconUrl || s.logoUrl || 'assets/images/meerav_logo.png';

  // Title — keep whatever page-specific suffix already follows the brand's " - "
  if (s.siteName && document.title.includes(' - ')) {
    document.title = document.title.replace(/^[^-]+-/, `${s.siteName} -`);
  } else if (s.siteName) {
    document.title = s.siteName;
  }

  const announcementEl = document.getElementById('announcement-bar-text');
  if (announcementEl && s.announcementText) announcementEl.innerHTML = s.announcementText;

  const whatsappNumEl = document.getElementById('whatsapp-header-number');
  const whatsappLinkEl = document.getElementById('whatsapp-header-link');
  if (s.whatsappNumber) {
    const digits = digitsOnly(s.whatsappNumber);
    if (whatsappLinkEl) whatsappLinkEl.href = `https://wa.me/${digits}`;
    if (whatsappNumEl) whatsappNumEl.textContent = `Order on WhatsApp: ${s.whatsappNumber}`;
  }

  const upiDisplayEl = document.getElementById('upi-id-display');
  if (upiDisplayEl && s.paymentUpiId) upiDisplayEl.textContent = `UPI: ${s.paymentUpiId}`;

  const footerNameEl = document.getElementById('footer-brand-name');
  if (footerNameEl && s.siteName) footerNameEl.textContent = s.siteName;

  const footerCopyEl = document.getElementById('footer-copyright');
  if (footerCopyEl && s.footerText) footerCopyEl.textContent = s.footerText;

  // Payment method tabs (checkout modal on index.html) — hide whatever the admin disabled.
  const tabMap = { upi: s.paymentUpiEnabled, card: s.paymentCardEnabled, netbanking: s.paymentNetbankingEnabled, cod: s.paymentCodEnabled };
  Object.entries(tabMap).forEach(([key, enabled]) => {
    const btn = document.getElementById(`payment-btn-${key}`);
    if (btn) btn.classList.toggle('hidden', !enabled);
  });
}

function applySiteTheme(settings) {
  const s = { ...DEFAULT_SITE_SETTINGS, ...settings };
  applyBrandColors(s);
  applyBackground(s);
  applyFont(s);
  applyBranding(s);
}

/**
 * Page copy (headings/subheadings/descriptions) — any element in the HTML
 * tagged `data-ck="some.key"` gets its innerHTML replaced by the matching
 * row's value from `page_content`. Elements with no matching key keep
 * whatever's already in the HTML (which is the same text the DB is seeded
 * with, so there's no flash of different content on first load).
 */
function applyPageContent(map) {
  document.querySelectorAll('[data-ck]').forEach(el => {
    const key = el.getAttribute('data-ck');
    if (map[key] !== undefined) el.innerHTML = map[key];
  });
}

window.SITE_PAGE_CONTENT = {};

async function initSiteTheme() {
  if (typeof MiraDB === 'undefined') return;
  const settings = await MiraDB.fetchSiteSettings();
  window.SITE_SETTINGS = settings || { ...DEFAULT_SITE_SETTINGS };
  applySiteTheme(window.SITE_SETTINGS);

  const content = await MiraDB.fetchPageContent();
  window.SITE_PAGE_CONTENT = content.map;
  applyPageContent(content.map);

  // Live-reflect admin edits on already-open tabs (storefront + admin portal).
  MiraDB.subscribeTable('site_settings', async () => {
    const updated = await MiraDB.fetchSiteSettings();
    if (updated) {
      window.SITE_SETTINGS = updated;
      applySiteTheme(updated);
    }
  });

  MiraDB.subscribeTable('page_content', async () => {
    const updatedContent = await MiraDB.fetchPageContent();
    window.SITE_PAGE_CONTENT = updatedContent.map;
    applyPageContent(updatedContent.map);
  });
}

initSiteTheme();
