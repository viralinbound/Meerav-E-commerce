// Rows from the `products`/`categories`/`testimonials`/etc. tables store image
// paths without a leading slash (e.g. "assets/images/foo.jpg"). Used directly
// as an <img src>, the browser resolves that relative to the CURRENT route —
// which breaks on any nested path like /product/:id or /category/:catId.
// This normalizes any DB-sourced path to an absolute, site-root-relative URL.
export function resolveImagePath(path) {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/") || path.startsWith("data:")) {
    return path;
  }
  return `/${path}`;
}
