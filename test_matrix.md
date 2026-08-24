# MEERAV Website — Comprehensive Test Matrix

This document maps the **static storefront** (`index.html`, `category.html`, `product.html`) and **admin portal** (`admin.html`) against the **Supabase backend** used as the API/database layer. There are no separate `frontend/` or `backend/` directories; the equivalent split is:

| Layer | Location |
|---|---|
| Storefront UI | `index.html`, `category.html`, `product.html`, `js/store.js`, `js/auth.js`, `js/product-detail.js`, `js/category-page.js`, `js/chatbot.js`, `js/map.js` |
| Admin UI | `admin.html`, `js/admin.js` |
| Legacy in-page demo controller | `js/app.js` (older combined store+admin; not the live multi-page flow) |
| Local catalog fallback | `js/data.js` (`MIRA_DATA`) |
| Backend client | `js/supabase-client.js` (`MiraDB`) |
| Schema seed | `supabase/schema.sql`, `scripts/supabase_setup.sql` |
| Hosting | Vercel static site (`vercel.json`); env injected via `npm run build` → `js/env-config.js` |

**Important schema drift:** `schema.sql` defines four public tables (`categories`, `products`, `orders`, `customers`) with very open RLS (`USING (true)`). Runtime JS also reads/writes `photos`, `videos`, `sort_order`, `lat`/`lng`, `wishlist`, `saved_addresses`, `order_date`, `tracking_number`, `driver`, `notifications` (JSON on orders), plus tables `notifications`, `admins`, `admin_warnings`, `admin_activity_log`, Edge Function `admin-manage`, and Auth. Tests should treat **JS + live Supabase** as source of truth for behavior and **schema.sql** as the seed baseline.

**Dead / unused wrappers:** `store.js`, `category-page.js`, and `chatbot.js` call `MeeravSupabase.*` if defined. That object is **not implemented** in-repo. Cloud sync therefore falls through to `fetchCategories`/`fetchProducts`/`fetchOrders` (store home) or local `MIRA_DATA` (category page if the wrapper is missing). `setupStoreRealtime()` is defined in `store.js` but **never invoked**.

---

## 1. Frontend pages and user flows

```
Guest / Customer
  index.html          Home: brand film, category cards, video reels, search/filter catalog, cart, checkout, tracking
  category.html?cat=  Category explorer (aliases: papad-mathri→mathri, healthy-roasted→roasted-diet)
  product.html?id=    PDP gallery, qty, add/buy, related products
  Auth modal          Sign up / sign in / profile / order history (name+phone match)
  Chatbot             Recommend, add/buy, order-help intents (track/invoice/address/cancel)
  Admin
  admin.html          Login → optional forced password → dashboard pages
```

### 1.1 Storefront happy-path (end-to-end)

1. Load `index.html` → local catalog paints immediately → (if env present) Supabase catalog/orders load.
2. Browse category card → `category.html?cat={id}`.
3. Open product → `product.html?id={id}` → select variant/qty → Add to Cart or Express Buy.
4. Apply coupon → Checkout (name, phone, address, pincode, optional email/GPS) → Payment tab → Confirm.
5. Order inserted; cart cleared; tracking view shown; last order id in `localStorage`.
6. Optional: sign in → profile shows orders matched by name/phone → Track / Help Bot.

### 1.2 Admin happy-path

1. Open `admin.html` (login gate).
2. Sign in with admin email/password → `admins` row must exist and `banned` must be false.
3. If `must_change_password`, forced password screen (min 8 chars, match confirm).
4. Dashboard: overview KPIs, orders, catalog CRUD, categories, customers, notifications; **root-only** admin accounts.

---

## 2. API routes (Supabase)

Base URL: `{SUPABASE_URL}`. Client uses the **anon/publishable key**. Admin portal uses a second client with storage key `sb-meerav-admin-auth`.

Auth: customer session vs admin session are isolated. Product/category writes and most privileged reads are intended to use `adminSupabaseClient`. Checkout inserts use the storefront client.

### 2.1 Auth (`/auth/v1`)

| ID | Method | Route | Caller | Auth | Notes |
|---|---|---|---|---|---|
| A1 | POST | `/auth/v1/signup` | `signUpCustomer` | Public | Body: email, password, `data.name`/`data.phone` |
| A2 | POST | `/auth/v1/token?grant_type=password` | `signInCustomer`, `signInAdmin` | Public | Email+password |
| A3 | POST | `/auth/v1/logout` | `signOutCustomer`, `signOutAdmin` | Session | Separate clients |
| A4 | GET | `/auth/v1/user` | `getCurrentAdminProfile` | Admin session | |
| A5 | GET | `/auth/v1/session` (SDK) | `getCurrentSession`, `getAdminSession` | Cookie/storage | Storefront auto-login; admin waits for `INITIAL_SESSION` |

### 2.2 PostgREST tables (`/rest/v1/{table}`)

| ID | Method | Table / filter | Caller | Intended auth | Body / query |
|---|---|---|---|---|---|
| R1 | GET | `categories?select=*&order=sort_order` | `fetchCategories` | Public read | |
| R2 | POST/PATCH | `categories` upsert | `dbUpsertCategory` | Admin client | `{id,name,icon,description}` |
| R3 | DELETE | `categories?id=eq.{id}` | `dbDeleteCategory` | Admin client | |
| R4 | GET | `products?select=*&order=created_at` | `fetchProducts` | Public read | |
| R5 | POST | `products` upsert | `dbUpsertProduct` | Admin client | See product model |
| R6 | DELETE | `products?id=eq.{id}` | `dbDeleteProduct` | Admin client | |
| R7 | GET | `orders?select=*&order=created_at.desc` | `fetchOrders` | **All rows** (storefront + admin) | |
| R8 | POST | `orders` insert | `dbInsertOrder` | Public (checkout) | See order model |
| R9 | PATCH | `orders?id=eq.{id}` `{order_status}` | `dbUpdateOrderStatus` | Admin client | Status string only |
| R10 | GET | `customers` all, `created_at desc` | `fetchCustomers` | Admin client | |
| R11 | GET | `customers?id=eq.{auth.uid}` | `getOrCreateCustomerProfile` | Customer session | |
| R12 | POST | `customers` upsert | `dbUpsertCustomer` | Storefront client | Guest checkout also upserts |
| R13 | GET | `notifications` limit 100 | `fetchNotifications` | Admin client | |
| R14 | POST | `notifications` insert | `dbInsertNotification` | Storefront (order) + admin | |
| R15 | GET | `admins?id=eq.{uid}` | `getCurrentAdminProfile` | Admin session | Gate: not admin → sign out |
| R16 | GET | `admins` all | `fetchAdmins` | Admin session | |
| R17 | GET | `admin_warnings?admin_id=eq.{uid}&acknowledged=eq.false` | `fetchMyWarnings` | Admin | |
| R18 | GET | `admin_warnings?admin_id=eq.{id}` | `fetchWarningsForAdmin` | Root (UI) | |
| R19 | PATCH | `admin_warnings` `{acknowledged:true}` | `acknowledgeWarning` | Target admin | |
| R20 | POST | `admin_activity_log` | `logAdminActivity` | Any signed-in admin | |
| R21 | GET | `admin_activity_log` limit 200 | `fetchActivityLog` | Root (RLS) | |
| R22 | GET | `admin_activity_log?admin_id=eq.{id}` | `fetchActivityForAdmin` | Root | |
| R23 | PATCH | `admin_activity_log` `{undone:true}` | `markActivityUndone` | Root | |

Realtime: `postgres_changes` on `products`, `categories`, `orders`, `notifications`, `admin_activity_log`. Admin dashboard subscribes after login. Storefront subscription helper exists but is unused.

### 2.3 Storage (`/storage/v1`)

| ID | Method | Path | Caller | Auth | Validation in app |
|---|---|---|---|---|---|
| S1 | POST | `object/meerav-media/{folder}/{timestamp}-{rand}.{ext}` | `uploadMedia` | Anon client | File required; `upsert:false`; `cacheControl:3600` |
| S2 | GET | public URL from `getPublicUrl` | After upload | Public bucket | Folders used: `avatars`, `products` |

No delete-object API is called when photos/videos are removed from a gallery (orphan files).

### 2.4 Edge Function (`/functions/v1/admin-manage`)

Invoked as `adminSupabaseClient.functions.invoke('admin-manage', { body })`. JWT of the **admin** session is sent. Service role stays on the server.

| ID | `action` | Extra body | Who (UI) | Success payload |
|---|---|---|---|---|
| E1 | `register` | `email`, `name` | Root | `{ tempPassword, ... }` |
| E2 | `reset_password` | `adminId` | Root | `{ tempPassword }` |
| E3 | `change_password` | `newPassword` | Any signed-in admin | Clears `must_change_password` (server) |
| E4 | `ban` | `adminId` | Root | |
| E5 | `unban` | `adminId` | Root | |
| E6 | `warn` | `adminId`, `message` | Root | |
| E7 | `remove` | `adminId` | Root | Deletes Auth user; cascade `admins` |

Client error parsing: JSON `{error}` from function response body.

---

## 3. Database models

### 3.1 `categories` (seed + runtime)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | TEXT PK | Yes | Slug; `'all'` is a seed row, filtered out of admin category table |
| `name` | TEXT | Yes | |
| `icon` | TEXT | Yes (DB); UI defaults `fas fa-cookie` | Font Awesome class |
| `description` | TEXT | Optional | |
| `created_at` | timestamptz | Default now | |
| `sort_order` | (runtime query) | Not in schema.sql | `order('sort_order')` — missing column → fetch error → `[]` |

FK: `products.category` → `categories.id` ON DELETE SET NULL.

### 3.2 `products` (seed + runtime extras)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | TEXT PK | Yes | Seed `p1`–`p75`; new products `p-{Date.now()}` |
| `name` | TEXT | Yes | |
| `category` | TEXT FK | Optional after delete | |
| `tag` | TEXT | Default `Signature Pack` | |
| `rating` | NUMERIC(3,1) | Default 5.0 | New products hardcoded `5.0` |
| `reviews_count` | INTEGER | Default 100 | New products `1` |
| `spice_level` | TEXT | Default Classic Bikaneri | |
| `dietary` | JSONB array | Default veg/oil tags | New: `["100% Veg","Pure & Clean Oil"]` |
| `image` | TEXT | Yes in schema.sql | Cover = `photos[0]` |
| `video` | TEXT | Optional | Cover reel = `videos[0]` |
| `sample_image` | TEXT | Optional | Mapped `sampleImage` |
| `photos` | JSONB/array | Runtime | Unlimited gallery |
| `videos` | JSONB/array | Runtime | Optional |
| `description` | TEXT | Yes | |
| `ingredients` | TEXT | Optional | New products get generic string |
| `nutrition` | JSONB | `{energy,fat,carbs,protein}` | New: `520 kcal / 30g / 48g / 12g` |
| `in_stock` | BOOLEAN | Default true | Toggle in admin; **not checked** on add-to-cart |
| `variants` | JSONB | Default `[]` | `{weight, price, originalPrice}[]` |
| `created_at` | timestamptz | Default now | |

**Variant rules (business, not DB):** Typical SKU has 200g / 500g / 1kg. Gift/sweet SKUs may have 2 packs (e.g. 1.2 kg / 2.5 kg). Admin save **always writes three** 200g/500g/1kg rows — overwrites gift pack weights on edit.

### 3.3 `orders`

| Field | Type | Required | App mapping |
|---|---|---|---|
| `id` | TEXT PK | Yes | `MEERAV-{1000–9999}` random — collision possible |
| `customer` | JSONB | Yes | `{name,phone,email,city,address,pincode,lat,lng}` |
| `items` | JSONB | Yes | `{name, qty, price}[]` (name includes weight) |
| `total_amount` | NUMERIC | Yes | Grand total **after** coupon/shipping, snapshotted at checkout |
| `discount_amount` | NUMERIC | Default 0 | **Not written** by `appOrderToDb` |
| `shipping_charge` | NUMERIC | Default 0 | **Not written** by `appOrderToDb` |
| `payment_method` | TEXT | Yes | UPI / Card / NetBanking / COD strings |
| `payment_status` | TEXT | Default Completed | `'Paid'` or `'Unpaid (COD)'` if method includes `COD` |
| `order_status` | TEXT | Default Order Placed | Inserted as **`Dispatched`**; admin: Pending, Processing, Dispatched, Delivered |
| `order_date` | TEXT (runtime) | | Locale `en-IN` medium+short |
| `tracking_number` | TEXT | | `DTDC-{8 digits}` |
| `driver` | JSONB | | Simulated van from warehouse coords |
| `notifications` | JSONB | | `{whatsappSent, emailSent}` from checkboxes |
| `created_at` | timestamptz | Default now | |

### 3.4 `customers`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | TEXT PK | Yes | Auth `user.id` **or** guest `usr-{timestamp}` |
| `name`, `phone` | TEXT | Yes | Phone format not validated beyond HTML `tel` |
| `email` | TEXT | Optional | Signup required; checkout optional (synthesized `{name}@example.com`) |
| `address`, `pincode` | TEXT | Optional in DB; required on signup/checkout UI | |
| `lat`, `lng` | (runtime) | | Checkout map / guest upsert |
| `avatar` | TEXT | | Storage public URL |
| `wishlist` | JSONB | Runtime | Not updated by `toggleWishlist` |
| `saved_addresses` | JSONB | Runtime | Not used in checkout UI |

Admin CRM recomputes `ordersCount` / `totalSpent` in memory by matching **name (case-insensitive)** or **last 10 phone digits**.

### 3.5 `notifications`

| Field | App | Notes |
|---|---|---|
| `id` | `NOTIF-{100–999}` | Collision likely |
| `type` | WhatsApp / Email | |
| `recipient` | Phone (name) or target string | |
| `template` | Message / truncated 30 chars + `...` | |
| `notif_time` | `'Just now'` | |
| `status`, `status_color` | Delivered & Read / green or blue | **Simulated** — no WhatsApp/email provider |

### 3.6 `admins` / `admin_warnings` / `admin_activity_log`

**admins:** `id` (auth uid), `name`, `email`, `role` (`root` \| other), `banned`, `must_change_password`, `created_at`.

**admin_warnings:** `id`, `admin_id`, `issued_by_name`, `message`, `acknowledged`, `created_at`.

**admin_activity_log:** `admin_id`, `admin_name`, `admin_role`, `action`, `target`, `details` JSON (`before`, `from`/`to`, `productId`, …), `undone`, `created_at`.

Undoable actions: `product.update|create|delete|toggle_stock`, `category.update|create|delete`, `order.status_update`. Not undoable: `notification.broadcast`, `admin.undo`.

### 3.7 Storage object model

Path: `{folder}/{Date.now()}-{6-char-rand}.{ext}` under bucket `meerav-media`. schema.sql also documents a hierarchical `categories/{id}/products/{id}/photos|videos/` layout used by upload scripts, **not** by `uploadMedia`.

---

## 4. Auth matrix (who can do what)

| Capability | Guest | Customer session | Sub-admin | Root | Banned / non-admin Auth user |
|---|---|---|---|---|---|
| Read catalog | Yes | Yes | Yes | Yes | Yes (public) |
| Cart / checkout / simulated pay | Yes | Yes | n/a | n/a | n/a |
| Sign up / sign in | Yes | — | — | — | — |
| Profile, avatar, order history UI | No | Yes (history via name/phone, not `customer.id`) | — | — | — |
| Insert order | Yes | Yes | — | — | — |
| Upsert customer (self / guest) | Yes (guest id) | Yes | — | — | — |
| Upload storage object (anon) | Yes (avatars + any folder) | Yes | Yes (products) | Yes | Yes if they hit client |
| Product/category CRUD | No (intended RLS) | No | Yes | Yes | No |
| Update order status | No | No | Yes | Yes | No |
| Read all customers/notifications | schema.sql: anyone; JS: admin client | | Yes | Yes | |
| Register/ban/warn/remove admins | No | No | UI hidden + toast | Yes | No |
| Activity log + undo | No | No | RLS empty | Yes | No |
| Change own password (edge) | No | No | Yes | Yes | No |

Checkout does **not** require login. Guest checkout still upserts a `customers` row with a non-Auth id.

---

## 5. Pricing / coupon / shipping rules (store.js)

| Rule | Expected |
|---|---|
| Subtotal | `sum(price * qty)` using **cart snapshot prices** (not live catalog) |
| Shipping | `0` if subtotal `> 499` or cart empty; else `₹50` |
| `MIRA10` / `MEERAV10` | 10% of subtotal, `Math.round` |
| `FREESHIP` | Shipping `0` even if subtotal ≤ 499 |
| Invalid coupon | Toast; no change |
| Grand total | `max(0, subtotal - discount + shipping)` |
| Discount % display | `round((originalPrice - price) / originalPrice * 100)` — **NaN/Infinity if originalPrice is 0** |
| One coupon at a time | Last successful apply wins |

`js/app.js` accepts only `MIRA10` (not `MEERAV10`) if that file is loaded.

---

## 6. Feature test matrix

Legend: **HP** happy path · **EC** edge case · **AU** auth · **VA** validation.

### F1 — Environment / boot

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F1-HP-01 | HP | `.env` present, `npm run build`, load site | `window.__ENV__` set; Supabase client created |
| F1-EC-01 | EC | Missing `SUPABASE_URL` or `SUPABASE_ANON_KEY` | `supabase-client.js` throws; page JS dies |
| F1-EC-02 | EC | Supabase down / RLS error on categories | Console error; `fetch*` returns `[]`; home falls back to `MIRA_DATA` / localStorage |
| F1-EC-03 | EC | `sort_order` column missing | `fetchCategories` fails → empty categories until local fallback |
| F1-AU-01 | AU | Anon key only in client | Service role never in browser |

### F2 — Home storefront (`index.html`)

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F2-HP-01 | HP | Load home | Hero/brand film, 5 category cards with live counts, product grid, cart badge 0 |
| F2-HP-02 | HP | Click category card | Navigate `category.html?cat={id}` |
| F2-HP-03 | HP | Reels with `video` products | Cards render; hover plays muted; Add uses variant index 0 |
| F2-EC-01 | EC | No products have `video` | Reels track stays empty / unchanged |
| F2-EC-02 | EC | `MeeravSupabase` undefined | Cloud block skipped; `fetchOrders` still used in `Promise.all` — if that throws, catch warns |
| F2-EC-03 | EC | Stale `mira_products_db` in localStorage | Instant render uses stale catalog until cloud overwrite |
| F2-EC-04 | EC | `setupStoreRealtime` never called | Admin price/stock edits require refresh to appear |
| F2-HP-04 | HP | Search input | Filters name, description, dietary (case-insensitive) |
| F2-HP-05 | HP | Dietary pill | Match if any `dietary[]` **includes** tag substring |
| F2-EC-05 | EC | Combined filters yield 0 | Empty state; reset sets category+dietary `all` (does not clear search) |
| F2-HP-06 | HP | Brand film modal | Play/pause; mute toggle on hero |

### F3 — Category page

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F3-HP-01 | HP | `?cat=bhujia-sev` | Header/title/tabs for that category; products filtered |
| F3-HP-02 | HP | `?cat=all` or missing | All products |
| F3-VA-01 | VA | `?cat=papad-mathri` | Normalized to `mathri` |
| F3-VA-02 | VA | `?cat=healthy-roasted` | Normalized to `roasted-diet` |
| F3-EC-01 | EC | Unknown `?cat=` | Header falls back to “All…” if category not found |
| F3-EC-02 | EC | Cloud wrapper missing | Stays on `MIRA_DATA` / localStorage; no `fetchCategories()` |

### F4 — Product detail (`product.html`)

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F4-HP-01 | HP | `?id=p1` | Title, spice, rating, nutrition, variants, media slides |
| F4-HP-02 | HP | Change variant | Prices/qty totals update (`price * quantity`) |
| F4-HP-03 | HP | Qty +/− | Qty never below 1; sticky mobile bar matches |
| F4-HP-04 | HP | Add to cart | Adds `pdpState.quantity` of selected variant; opens cart |
| F4-HP-05 | HP | Buy now | Add then checkout modal |
| F4-HP-06 | HP | Gallery swipe / arrows / thumbs / Escape | Slide change; fullscreen close |
| F4-HP-07 | HP | Realtime product update for same id | PDP re-renders |
| F4-EC-01 | EC | Missing `?id` | Defaults `p1` |
| F4-EC-02 | EC | Unknown id | First product in list (or redirect home if none) |
| F4-EC-03 | EC | Product with 2 variants | Both pills; no crash |
| F4-EC-04 | EC | No photos/videos | Placeholder pack SVG |
| F4-EC-05 | EC | `inStock=false` | Still addable (no stock gate) |
| F4-EC-06 | EC | Product deleted while viewing | Subscription returns early on DELETE |

### F5 — Cart

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F5-HP-01 | HP | Add item | Line `{productId}-{weight}`; qty 1; toast; drawer opens |
| F5-HP-02 | HP | Add same variant again | Qty increments |
| F5-HP-03 | HP | Add different weight | Separate line |
| F5-HP-04 | HP | +/− / trash | Qty 0 removes line |
| F5-EC-01 | EC | Empty cart checkout | Toast “Your cart is empty!” |
| F5-EC-02 | EC | Empty cart UI | Summary hidden; Start Shopping closes drawer |
| F5-EC-03 | EC | Refresh page | **Cart lost** (memory only) |
| F5-EC-04 | EC | Invalid product id | `addToCart` no-op |
| F5-EC-05 | EC | Admin changes price after add | Cart keeps old `price` |
| F5-VA-01 | VA | Badges | Cart = sum qty; wishlist = unique product ids |

### F6 — Wishlist

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F6-HP-01 | HP | Heart on card/PDP | Toggle; toast; badge |
| F6-EC-01 | EC | Refresh | Wishlist **not persisted** |
| F6-EC-02 | EC | Logged-in customer | `customers.wishlist` **not updated** |
| F6-AU-01 | AU | Guest | Allowed |

### F7 — Coupons

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F7-HP-01 | HP | `meerav10` / `mira10` (trim, upper) | 10% off subtotal |
| F7-HP-02 | HP | `FREESHIP` with subtotal 400 | Shipping FREE (was 50) |
| F7-HP-03 | HP | Subtotal 500, no coupon | Shipping FREE |
| F7-HP-04 | HP | Subtotal 499, no coupon | Shipping ₹50 |
| F7-EC-01 | EC | Empty / unknown code | Error toast |
| F7-EC-02 | EC | Apply FREESHIP then MEERAV10 | Replaces coupon (loses free ship unless subtotal > 499) |
| F7-EC-03 | EC | 10% of 99.5-style totals | Integer rupees via `Math.round` |
| F7-VA-01 | VA | Whitespace-only | Invalid |

### F8 — Checkout + map

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F8-HP-01 | HP | Logged-in customer, empty fields | Prefill name/phone/email/address/pincode |
| F8-HP-02 | HP | Fill required + proceed | Payment modal; pending payload stored |
| F8-HP-03 | HP | Drag/click map | Lat/lng on pending checkout; display updates |
| F8-HP-04 | HP | Detect GPS success | Pin at coords; toast |
| F8-EC-01 | EC | GPS denied / timeout 8s | Fallback 19.0596, 72.8295 (Bandra demo) |
| F8-EC-02 | EC | Leaflet not loaded | Map skip; lat/lng default 19.0596, 72.8295 on submit |
| F8-VA-01 | VA | Missing name/phone/address/pincode | Toast; stay on checkout (`proceedToPaymentGateway`) |
| F8-VA-02 | VA | HTML `required` on those fields | Browser native block if form submit used |
| F8-VA-03 | VA | Email empty | Synthesize `{sanitizedName}@example.com` |
| F8-VA-04 | VA | Phone/pincode format | **No** length/regex (any non-empty string) |
| F8-VA-05 | VA | Email field | HTML `type=email` only; JS does not re-validate |
| F8-AU-01 | AU | Guest checkout | Allowed |
| F8-EC-03 | EC | Logged in but fields already filled | Prefill **does not overwrite** |

### F9 — Payment (simulated)

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F9-HP-01 | HP | UPI confirm | Method `UPI (QR Auto-Verified)`, `paymentStatus: Paid` |
| F9-HP-02 | HP | Card confirm | `Credit / Debit Card`, Paid |
| F9-HP-03 | HP | NetBanking bank button (home only) | `NetBanking ({Bank})`, Paid |
| F9-HP-04 | HP | COD | `Cash on Delivery (COD)`, `Unpaid (COD)` |
| F9-EC-01 | EC | Confirm with no `pendingCheckoutData` | “Checkout session expired” |
| F9-EC-02 | EC | Close payment without paying | Cart unchanged; pending data remains until success |
| F9-EC-03 | EC | category/product pages | No NetBanking tab (UPI/Card/COD only) |
| F9-VA-01 | VA | Card number/UPI VPA | **Not validated** — any click succeeds |
| F9-AU-01 | AU | No payment gateway auth | Simulation only |

### F10 — Place order

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F10-HP-01 | HP | Complete payment | `orders` insert; cart empty; coupon cleared; tracking opens |
| F10-HP-02 | HP | `mira_last_order_id` set | Reload can restore `activeTrackingOrder` from local orders |
| F10-HP-03 | HP | WhatsApp notif row | Always inserted on success (not gated on opt-in) |
| F10-EC-01 | EC | Insert fails | Error logged; UI still clears cart and shows success (no rollback) |
| F10-EC-02 | EC | Duplicate random id | Second insert fails; same as above |
| F10-EC-03 | EC | Guest | Upserts customer `usr-{ts}` **without Auth**; header shows as logged in locally |
| F10-EC-04 | EC | Logged-in customer | Does **not** update profile address from checkout |
| F10-AU-01 | AU | Public INSERT orders | Succeeds with anon key (schema.sql) |
| F10-VA-01 | VA | `orderStatus` | Always `Dispatched` even for brand-new COD |
| F10-VA-02 | VA | Items | Names include `(weight)`; no `productId` stored |

### F11 — Order tracking + notifications preview

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F11-HP-01 | HP | After order / Track Map | Map warehouse→destination; simulated moving rider |
| F11-HP-02 | HP | Return to storefront | Main content shown |
| F11-EC-01 | EC | No orders | Toast “No orders found to track” |
| F11-EC-02 | EC | Missing customer lat/lng | Destination offset from warehouse |
| F11-HP-03 | HP | WA / email preview | Modal with order lines (preview only) |
| F11-EC-03 | EC | Realtime order update | Would refresh tracking **if** `setupStoreRealtime` ran |

### F12 — Customer auth & profile

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F12-HP-01 | HP | Sign up all required + password ≥6 | Auth user + `customers` row; auto login if confirmation off |
| F12-HP-02 | HP | Email confirmation ON | `needsConfirmation`; toast; switch to Sign In |
| F12-HP-03 | HP | Sign in | Profile loaded; badge first name + avatar |
| F12-HP-04 | HP | Reload with session | Auto login via `getCurrentSession` |
| F12-HP-05 | HP | Logout | Session cleared; guest badge |
| F12-HP-06 | HP | Avatar before signup | Upload `avatars/`; attached on profile if signup succeeds |
| F12-HP-07 | HP | Avatar while logged in | Upsert customer |
| F12-EC-01 | EC | Duplicate email | Auth error toast; button re-enabled |
| F12-EC-02 | EC | Wrong password | Invalid email/password toast |
| F12-EC-03 | EC | Upload fail | Toast; signup continues without photo |
| F12-EC-04 | EC | Auth user without customer row | `getOrCreateCustomerProfile` inserts fallback |
| F12-EC-05 | EC | Order history | Match name **or** last 10 digits; **not** `orders.customer.id`; may miss/over-match |
| F12-EC-06 | EC | Guest checkout “login” | Not a real Auth session; `onAuthChange` SIGNED_OUT can wipe it |
| F12-VA-01 | VA | Signup: name, email, password minlength 6, phone, address, pincode required | HTML5 |
| F12-VA-02 | VA | Sign in: email + password required | No minlength on sign-in password |
| F12-AU-01 | AU | Customer session storage | Must not clobber `sb-meerav-admin-auth` |

### F13 — Chatbot / sommelier

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F13-HP-01 | HP | Open widget | Greeting; optional saved prefs; 2 recs |
| F13-HP-02 | HP | Quick pills / free text spicy/diet/gift/mathri | Category-matched cards (max 2) |
| F13-HP-03 | HP | In-chat Add / Buy | `addToCart` / checkout; personalization localStorage |
| F13-HP-04 | HP | Order Help from profile | Order-help buttons; track/invoice/address/cancel copy |
| F13-HP-05 | HP | Invoice intent | Opens email preview if `previewEmailNotification` exists |
| F13-EC-01 | EC | Empty submit | No-op |
| F13-EC-02 | EC | Cancel intent | Copy only — **does not** update `order_status` |
| F13-EC-03 | EC | Address change intent | Toast only — **does not** PATCH order |
| F13-EC-04 | EC | `mira_customer_session` vs MiraDB session | Chatbot still reads old localStorage key; may greet wrong name |
| F13-EC-05 | EC | Makhana keyword | Filters `p.id === 'p46'` (Bhavnagri Gathiya) — **wrong SKU vs p6** |
| F13-AU-01 | AU | Personalization | localStorage; cloud upsert only if `MeeravSupabase` exists |

### F14 — Maps (standalone)

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F14-HP-01 | HP | Address picker | OSM tiles; draggable pin |
| F14-HP-02 | HP | Live tracking | Warehouse + house + dashed route + interval animation |
| F14-EC-01 | EC | Re-open maps | Previous Leaflet instance destroyed |
| F14-EC-02 | EC | Geolocation unsupported | Error toast |

### F15 — Admin login & session

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F15-HP-01 | HP | Valid admin email/password | Dashboard; identity badge; data load; realtime |
| F15-HP-02 | HP | Refresh with valid admin session | `INITIAL_SESSION` → auto enter (no flash-wrong logout) |
| F15-HP-03 | HP | `must_change_password` | Dashboard hidden; force-pw gate |
| F15-HP-04 | HP | Matching new passwords ≥8 | Edge `change_password`; then dashboard |
| F15-HP-05 | HP | Logout | Login gate |
| F15-EC-01 | EC | Customer credentials | Sign in then “not registered as an admin”; admin signed out |
| F15-EC-02 | EC | Banned admin | Sign out; banned message |
| F15-EC-03 | EC | Wrong password | Error box; button restored |
| F15-EC-04 | EC | Mismatched force passwords | “Passwords do not match” |
| F15-AU-01 | AU | Direct `admin.html` | Gate until authenticated |
| F15-AU-02 | AU | Sub-admin opens Admins nav | Toast; redirected to overview |
| F15-VA-01 | VA | Login email required `type=email` | |
| F15-VA-02 | VA | Force pw `minlength=8` | Stricter than customer 6 |

### F16 — Admin overview & orders

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F16-HP-01 | HP | Overview | Revenue = sum `totalAmount`; counts; last 5 orders |
| F16-HP-02 | HP | Orders filter | `all` / status case-insensitive |
| F16-HP-03 | HP | Change status dropdown | PATCH `order_status`; notif insert; activity `order.status_update` |
| F16-HP-04 | HP | New storefront order (realtime) | Unshift + toast |
| F16-EC-01 | EC | Empty tables | KPIs 0; empty tbody |
| F16-AU-01 | AU | Status update with storefront client | Should fail if RLS tightened; admin client required |
| F16-VA-01 | VA | Status enum | Pending / Processing / Dispatched / Delivered only in UI |

### F17 — Admin catalog (products)

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F17-HP-01 | HP | Search | Name, category, tag |
| F17-HP-02 | HP | Add product | Defaults 99/120, 229/260, 429/480; dietary/nutrition stub; upsert |
| F17-HP-03 | HP | Edit | Loads photos/videos/variants[0–2] |
| F17-HP-04 | HP | Multi photo/video upload | Sequential `uploadMedia`; cover = index 0 |
| F17-HP-05 | HP | Remove photo from grid | Array only; storage file remains |
| F17-HP-06 | HP | Toggle stock | Upsert `in_stock`; activity log |
| F17-HP-07 | HP | Delete + confirm | DELETE; activity with `before` |
| F17-EC-01 | EC | Delete cancel | No change |
| F17-EC-02 | EC | Partial media upload fail | Status “some failed”; toast |
| F17-EC-03 | EC | Empty name | HTML required if form has it; JS only trims |
| F17-EC-04 | EC | Edit 2-variant gift SKU | Saves **3** 200g/500g/1kg variants — **data loss** |
| F17-EC-05 | EC | No photos | Fallback `prod-form-image` or default SVG |
| F17-EC-06 | EC | Blank prices | Coerce Number or fallbacks (`p500 = p200 * 2.3`) |
| F17-AU-01 | AU | Sub-admin | Allowed (not root-only) |
| F17-VA-01 | VA | Duplicate id upsert | Update path |

### F18 — Admin categories

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F18-HP-01 | HP | Add | Slug from name if id empty: lowercase, non-alnum → `-` |
| F18-HP-02 | HP | Edit / delete confirm | Upsert/delete; product dropdown refresh |
| F18-EC-01 | EC | Delete category with products | DB SET NULL on FK; products orphan category |
| F18-EC-02 | EC | Row `id=all` | Hidden from admin table |
| F18-VA-01 | VA | Empty name | Should block (form required) |
| F18-AU-01 | AU | Same as product CRUD | Admin session |

### F19 — Admin customers CRM

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F19-HP-01 | HP | Search | Name, phone substring, email |
| F19-HP-02 | HP | Stats | Recomputed from orders |
| F19-HP-03 | HP | WhatsApp link | `wa.me/{digits}` |
| F19-HP-04 | HP | View History | `alert()` with name-matched orders |
| F19-EC-01 | EC | Two customers same name | Orders/stats collide |
| F19-EC-02 | EC | Guest `usr-*` vs Auth uuid | Both listed if RLS allows |
| F19-AU-01 | AU | Intended: admin-only SELECT | schema.sql currently public SELECT |

### F20 — Admin notifications broadcast

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F20-HP-01 | HP | Type + target + message | Insert log; activity `notification.broadcast`; clear message |
| F20-VA-01 | VA | Empty target or message | Toast; no insert |
| F20-EC-01 | EC | Template | First 30 chars + `...` even if shorter |
| F20-AU-01 | AU | Not a real send | UI “success” regardless of WhatsApp/email |

### F21 — Root admin management + undo

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F21-HP-01 | HP | Register name+email | Temp password modal (once); `must_change_password` |
| F21-HP-02 | HP | Copy temp password | Clipboard toast |
| F21-HP-03 | HP | Reset password | New temp; old password dead |
| F21-HP-04 | HP | Ban / unban | Confirm; login blocked when banned |
| F21-HP-05 | HP | Warn | Message on target dashboard until acknowledge |
| F21-HP-06 | HP | Acknowledge | PATCH; banner dismiss |
| F21-HP-07 | HP | Remove | Confirm; Auth user deleted |
| F21-HP-08 | HP | Undo product.update | Restore `details.before`; mark undone; log `admin.undo` |
| F21-EC-01 | EC | Register existing email | Function error surfaced |
| F21-EC-02 | EC | Remove/ban root | UI hides actions; server must reject |
| F21-EC-03 | EC | Undo without `before` | Toast “No prior state…” |
| F21-EC-04 | EC | Undo product.create | Deletes product (including if orders reference name only) |
| F21-EC-05 | EC | Undo toggle_stock if product gone | Error toast |
| F21-EC-06 | EC | Self row | No ban/remove on self |
| F21-AU-01 | AU | Sub-admin `register` | Edge function must 403; UI hidden |
| F21-AU-02 | AU | Activity SELECT as sub-admin | Empty list |
| F21-VA-01 | VA | Warn empty message | `sendWarningToAdmin` returns early |
| F21-VA-02 | VA | Register email | HTML email + name required |

### F22 — Storage

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F22-HP-01 | HP | Image/video File | Public URL returned |
| F22-EC-01 | EC | Duplicate path | `upsert:false` → fail (timestamp+rand makes rare) |
| F22-EC-02 | EC | No file | `uploadMedia` returns null |
| F22-AU-01 | AU | schema.sql public INSERT | Unauthenticated upload possible — **security test** |
| F22-VA-01 | VA | MIME | Passed through `contentType: file.type`; no size/type whitelist in JS |

### F23 — Realtime / multi-tab

| ID | Type | Steps / condition | Expected |
|---|---|---|---|
| F23-HP-01 | HP | Two admin tabs | Product/order/category/notif stay in sync after login |
| F23-EC-01 | EC | Storefront tab vs admin catalog edit | Storefront **may not** update until refresh |
| F23-EC-02 | EC | PDP open | Updates if product id matches |

### F24 — Cross-cutting / regression risks

| ID | Type | Steps / condition | Expected / risk |
|---|---|---|---|
| F24-EC-01 | EC | `photos`/`videos` columns missing | Upsert products fail |
| F24-EC-02 | EC | schema.sql RLS `FOR ALL USING (true)` | Anyone with anon key can mutate catalog/orders |
| F24-EC-03 | EC | `fetchOrders` on storefront | Customer can read **all** orders in network tab |
| F24-EC-04 | EC | `js/app.js` vs `store.js` | Duplicate globals if both loaded; coupon/order-id prefix differ (`MIRA-` vs `MEERAV-`) |
| F24-EC-05 | EC | originalPrice 0 | `% OFF` NaN in cards |
| F24-EC-06 | EC | XSS | Product names interpolated into HTML/onclick without sanitization |
| F24-EC-07 | EC | Admin name with `'` in detail actions | Partial escape in onclick strings |
| F24-AU-01 | AU | Isolation | Customer logged in on index + admin on admin.html in same browser |

---

## 7. Suggested test data

| Role | Use |
|---|---|
| Guest | Full checkout COD + UPI |
| Customer A | Unique email, phone ending distinct 10 digits, password 6+ chars |
| Customer B | Same display name as A (history collision) |
| Root admin | Admins page, register/ban/undo |
| Sub-admin | Forced password, catalog CRUD, cannot open Admins |
| Banned admin | Login rejected |
| SKU `p1` | 3 variants, video |
| SKU `p8` / `p75` | 2-pack gift — admin edit regression |
| Coupon | `MEERAV10`, `FREESHIP`, `MIRA10`, junk |
| Cart | Subtotals 400, 499, 500, 0 |

---

## 8. Out of scope / not implemented (still test as negative)

- Real UPI/card capture, GST invoice PDF, DTDC AWB API, WhatsApp Business send.
- Server-side stock decrement / payment verification.
- Cart/wishlist persistence and checkout login requirement.
- `MeeravSupabase` helper and storefront realtime wiring.
- Storage delete and hierarchical folder uploads from the admin UI.
- Order cancel/address change from chatbot.

Use this matrix as the checklist for QA: each **HP** should pass on the current UI; **EC/AU/VA** rows document both intended rules and known gaps so failures can be classified as bugs vs accepted demo behavior.
