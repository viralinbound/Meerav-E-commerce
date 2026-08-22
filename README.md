# 🍿 MEERAV Authentic Bikaneri Namkeens & Sweets
> **Full-Stack D2C E-Commerce Platform with Supabase Cloud Integration** — 75 Signature Delicacies, 4K Product Media, Mobile-First UI, Real-Time Orders & Delivery Tracking.

---

## 🔐 Environment Variables (no keys live in source code)

The Supabase URL and publishable key are **never hardcoded** in any `.js`/`.html` file. They're injected at build time from environment variables into a generated, git-ignored `js/env-config.js`:

```
.env (local, git-ignored)  ──┐
Vercel Env Vars (production) ─┴──▶  npm run build  ──▶  js/env-config.js  ──▶  window.__ENV__  ──▶  js/supabase-client.js
```

**Local setup:**
```bash
cp .env.example .env      # then fill in your real Supabase values
npm run build              # generates js/env-config.js
npm run dev                # serves the site on http://localhost:8080
```

Required variables (see [`.env.example`](.env.example)):

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase **publishable/anon** key (safe for client-side use — this is what it's designed for; Row Level Security is what actually protects your data, not hiding this key) |
| `SUPABASE_STORAGE_BUCKET` | Public bucket name for product/category/avatar media (`meerav-media`) |

---

## 🚀 Deploy to Vercel

1. Push this repo to GitHub (already done: [viralinbound/Meerav-E-commerce](https://github.com/viralinbound/Meerav-E-commerce)).
2. In Vercel, **Import Project** from that GitHub repo.
3. Framework preset: **Other**. Vercel will read [`vercel.json`](vercel.json) automatically (`buildCommand: npm run build`, `outputDirectory: .`).
4. In **Project Settings → Environment Variables**, add:
   - `SUPABASE_URL` = `https://rudiggwblncwkjmqqemd.supabase.co`
   - `SUPABASE_ANON_KEY` = *(your publishable key, from Supabase Project Settings → API)*
5. Deploy. Vercel runs `npm run build` on every deploy, which regenerates `js/env-config.js` fresh from those Environment Variables — the real values never touch the git repo.

---

## 🗄️ Systematic Cloud Database Schema

The complete database schema with Row Level Security (RLS) policies and all 75 product seeds is available in [`supabase/schema.sql`](supabase/schema.sql).

### 1. Categories (`public.categories`)
* `id` (TEXT, PK): `bhujia-sev`, `mixture-farsan`, `mathri`, `roasted-diet`, `sweets-combos`
* `name` (TEXT): Category display name
* `icon` (TEXT): FontAwesome / Luxury badge identifier
* `description` (TEXT): Authentic culinary description

### 2. Products (`public.products`)
* `id` (TEXT, PK): `p1` to `p75`
* `name` (TEXT): Product name
* `category` (TEXT, FK): References `categories(id)`
* `tag` (TEXT): *Best Seller*, *Signature Pack*, *Heritage GI Tag*
* `rating` (NUMERIC): 4.8 - 5.0
* `reviews_count` (INTEGER): Verified customer review count
* `spice_level` (TEXT): Spice rating & description
* `dietary` (JSONB): Dietary badges (*100% Veg, Pure Oil, No Palm Oil*)
* `image` (TEXT): Cloud storage path to high-res packaging photo
* `video` (TEXT): Cloud storage path to 4K cinematic video reel
* `sample_image` (TEXT): Cloud storage path to sample serving photo
* `description` (TEXT): Heritage recipe story
* `ingredients` (TEXT): Authentic ingredients list
* `nutrition` (JSONB): Energy, fat, carbohydrates, protein breakdown
* `variants` (JSONB): Pack weight options (`200 g`, `500 g`, `1 kg`) with offer & original prices
* `in_stock` (BOOLEAN): Real-time availability flag

### 3. Orders (`public.orders`)
* `id` (TEXT, PK): Order ID (e.g. `ORD-88210`)
* `customer` (JSONB): Name, phone, email, delivery address, GPS coordinates
* `items` (JSONB): Array of cart items, pack weights, quantities, and prices
* `total_amount` (NUMERIC): Grand total payable
* `payment_method` (TEXT): *UPI (QR Auto-Verified)*, *Credit/Debit Card*, *COD*
* `order_status` (TEXT): *Order Placed*, *Processing*, *Dispatched*, *Delivered*

### 4. Storage Bucket Structure (`product-media`)
Systematic hierarchical folder layout:
```
product-media/
├── categories/
│   ├── bhujia-sev/
│   │   └── products/
│   │       ├── p1/
│   │       │   ├── photos/meerav_aloo_bhujia.jpg
│   │       │   └── videos/clip_bhujia.mp4
│   │       └── p2/
│   │           ├── photos/meerav_papad.jpg
│   │           └── videos/clip_papad.mp4
│   ├── mixture-farsan/
│   ├── mathri/
│   ├── roasted-diet/
│   └── sweets-combos/
└── brand/
    └── videos/meerav_brand_film.mp4
```

---

## 🚀 How to Setup Supabase Database

1. Open your **[Supabase Project Dashboard](https://supabase.com/dashboard/project/rudiggwblncwkjmqqemd)**.
2. Navigate to the **SQL Editor**.
3. Open [`supabase/schema.sql`](supabase/schema.sql) in this repository, copy its entire contents, paste into the SQL Editor, and click **RUN**.
4. That's it! All tables, RLS security policies, and 75 products are seeded instantly!

---

## 📂 Web Architecture

| Page | URL / File | Purpose |
|---|---|---|
| 🛍️ **Customer Storefront** | [`index.html`](index.html) | Embedded 4K Master Brand Film, authentic squircle category cards, live cart drawer, GPS delivery map. |
| 🏷️ **Category Explorer** | [`category.html`](category.html) | 5 Category tabs, 75 delicacies, live search & dietary filter pills. |
| 🍿 **Product Detail Open Page** | [`product.html`](product.html) | Multi-slide image & 4K video carousel, touch-swipe, tap-to-fullscreen lightbox, sticky mobile bar. |
| 🛡️ **Admin Portal** | [`admin.html`](admin.html) | Real-time operations center, live order statuses, product catalog & customer CRM. |
