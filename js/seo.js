/**
 * MEERAV — SHARED SEO HELPERS
 *
 * Keeps canonical/Open Graph URLs correct on whatever domain the site is
 * served from (local, preview, production) without hardcoding a hostname,
 * and injects JSON-LD structured data.
 *
 * NOTE: social scrapers (WhatsApp/Facebook) do not execute JavaScript. If you
 * want perfect link previews there, hardcode your production origin below
 * once — everything else picks it up automatically.
 */
const MEERAV_SITE_ORIGIN = ''; // e.g. 'https://meerav.com' — leave blank to auto-detect

function meeravOrigin() {
  return MEERAV_SITE_ORIGIN || window.location.origin;
}

function meeravAbsoluteUrl(path) {
  if (!path) return meeravOrigin();
  if (/^https?:\/\//i.test(path)) return path;
  return meeravOrigin() + '/' + String(path).replace(/^\/+/, '');
}

/** Creates or updates a <meta> tag by name or property. */
function meeravSetMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Creates or updates <link rel="canonical">. */
function meeravSetCanonical(url) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

/** Appends a JSON-LD block. `id` prevents duplicates on re-render. */
function meeravAddJsonLd(data, id) {
  const scriptId = id || 'ld-' + (data['@type'] || 'thing').toLowerCase();
  let el = document.getElementById(scriptId);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = scriptId;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Applies page-level SEO. Call once per page with whatever is known at load;
 * the PDP calls it again with real product data once that resolves.
 */
function meeravApplySeo(opts) {
  opts = opts || {};
  const url = opts.url || window.location.href.split('#')[0];
  const title = opts.title || document.title;
  const description = opts.description || '';
  const image = meeravAbsoluteUrl(opts.image || 'assets/images/meerav_logo.png');

  if (opts.title) document.title = opts.title;
  meeravSetCanonical(url);

  meeravSetMeta('name', 'description', description);
  meeravSetMeta('property', 'og:type', opts.type || 'website');
  meeravSetMeta('property', 'og:site_name', 'MEERAV Namkeens & Sweets');
  meeravSetMeta('property', 'og:title', title);
  meeravSetMeta('property', 'og:description', description);
  meeravSetMeta('property', 'og:url', url);
  meeravSetMeta('property', 'og:image', image);
  meeravSetMeta('property', 'og:locale', 'en_IN');

  meeravSetMeta('name', 'twitter:card', 'summary_large_image');
  meeravSetMeta('name', 'twitter:title', title);
  meeravSetMeta('name', 'twitter:description', description);
  meeravSetMeta('name', 'twitter:image', image);
}

/** Organization + WebSite schema — homepage only. */
function meeravAddOrganizationSchema() {
  meeravAddJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MEERAV Namkeens & Sweets',
    url: meeravOrigin(),
    logo: meeravAbsoluteUrl('assets/images/meerav_logo.png'),
    description: 'Authentic Bikaneri namkeens, bhujia and sweets, fried fresh in pure groundnut oil since 1983.',
    foundingDate: '1983',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bikaner',
      addressRegion: 'Rajasthan',
      addressCountry: 'IN'
    }
  }, 'ld-organization');

  meeravAddJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MEERAV Namkeens & Sweets',
    url: meeravOrigin(),
    potentialAction: {
      '@type': 'SearchAction',
      target: meeravOrigin() + '/category?cat=all&q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }, 'ld-website');
}

/** BreadcrumbList schema. `trail` = [{name, path}] in order. */
function meeravAddBreadcrumbSchema(trail) {
  if (!trail || !trail.length) return;
  meeravAddJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: meeravAbsoluteUrl(crumb.path)
    }))
  }, 'ld-breadcrumb');
}

/** Product schema, built from a real product record. */
function meeravAddProductSchema(p) {
  if (!p) return;
  const variants = (p.variants && p.variants.length) ? p.variants : [{ price: 0 }];
  const prices = variants.map(v => v.price).filter(n => typeof n === 'number');
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: (p.photos && p.photos.length ? p.photos : [p.image]).filter(Boolean).map(meeravAbsoluteUrl),
    brand: { '@type': 'Brand', name: 'MEERAV' },
    category: p.category,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: Math.min.apply(null, prices.length ? prices : [0]),
      highPrice: Math.max.apply(null, prices.length ? prices : [0]),
      offerCount: variants.length,
      availability: p.inStock === false
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock'
    }
  };

  if (p.rating && p.reviewsCount) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.rating,
      reviewCount: p.reviewsCount
    };
  }

  meeravAddJsonLd(data, 'ld-product');
}
