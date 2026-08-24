-- =============================================================================
-- MEERAV NAMKEENS & SWEETS - SUPABASE DATABASE SCHEMA & INITIAL DATA SEED
-- Systematic Cloud Architecture: Categories -> Products -> Media Storage
--
-- This file mirrors the hardened production schema running on the live
-- project (RLS is admin-gated everywhere it needs to be — not just
-- public-read — and every auth-checking policy wraps auth.uid()/is_admin()
-- in `(select ...)` so Postgres evaluates it once per statement, not once
-- per row). Running this end-to-end sets up a fresh project identically.
-- =============================================================================

-- 0. is_admin() — SECURITY DEFINER helper used throughout RLS below. Only
-- `authenticated` gets EXECUTE (real admin sessions are always authenticated
-- Supabase Auth users) so it can't be probed anonymously as a public RPC.
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  select exists(select 1 from public.admins where id = uid);
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS TABLE (With Systematic Category FK and JSONB Variants & Nutrition)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL,
    tag TEXT DEFAULT 'Signature Pack',
    rating NUMERIC(3,1) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 100,
    spice_level TEXT DEFAULT 'Classic Bikaneri',
    dietary JSONB DEFAULT '["100% Veg", "Pure Oil", "No Palm Oil"]'::jsonb,
    image TEXT,
    video TEXT,
    sample_image TEXT,
    photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    videos JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT NOT NULL,
    ingredients TEXT,
    nutrition JSONB DEFAULT '{"energy": "520 kcal", "fat": "30g", "carbs": "50g", "protein": "12g"}'::jsonb,
    in_stock BOOLEAN DEFAULT TRUE,
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer JSONB NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'Completed',
    order_status TEXT NOT NULL DEFAULT 'Pending',
    order_date TEXT,
    tracking_number TEXT,
    driver JSONB DEFAULT '{}'::jsonb,
    notifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. SITE SETTINGS TABLE (single row, id='default') — admin-editable branding,
--    theme, and payment gateway configuration for the storefront.
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name TEXT NOT NULL DEFAULT 'MEERAV Namkeens & Sweets',
    tagline TEXT DEFAULT 'From the Heart of Bikaner',
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT NOT NULL DEFAULT '#4A0713',
    secondary_color TEXT NOT NULL DEFAULT '#32040C',
    accent_color TEXT NOT NULL DEFAULT '#E59819',
    accent_light_color TEXT NOT NULL DEFAULT '#FBBF24',
    background_type TEXT NOT NULL DEFAULT 'solid', -- 'solid' | 'gradient' | 'image'
    background_color TEXT NOT NULL DEFAULT '#FFF9ED',
    background_gradient JSONB NOT NULL DEFAULT '["#FFF9ED","#FDF1D0","#E59819"]'::jsonb,
    background_image_url TEXT,
    background_pattern_overlay BOOLEAN NOT NULL DEFAULT FALSE, -- deprecated, superseded by background_pattern
    background_pattern TEXT NOT NULL DEFAULT 'none', -- 'none' | 'dots' | 'grid' | 'stripes' | 'waves' | 'custom-image'
    background_pattern_image_url TEXT, -- used when background_pattern = 'custom-image': an admin-uploaded tileable texture
    admin_panel_color TEXT NOT NULL DEFAULT '#1F0307', -- the admin ops sidebar/login-gate's own dark background, separate from the storefront theme
    admin_panel_type TEXT NOT NULL DEFAULT 'solid', -- 'solid' | 'gradient'
    admin_panel_gradient JSONB NOT NULL DEFAULT '["#32040C","#1F0307","#030712"]'::jsonb,
    text_color TEXT NOT NULL DEFAULT '#1F2937',
    heading_color TEXT NOT NULL DEFAULT '#32040C',
    font_family TEXT NOT NULL DEFAULT 'Outfit',
    heading_font_family TEXT NOT NULL DEFAULT 'Outfit',
    base_font_size TEXT NOT NULL DEFAULT '16px',
    announcement_text TEXT DEFAULT '✨ Prepared in Pure & Clean Oil • Use coupon MEERAV10 for 10% Off!',
    whatsapp_number TEXT DEFAULT '+919876543210',
    contact_email TEXT DEFAULT 'hello@meeravnamkeens.com',
    contact_phone TEXT DEFAULT '+91 98765 43210',
    contact_address TEXT DEFAULT 'Bikaner, Rajasthan, India',
    footer_text TEXT DEFAULT '© 2026 All Rights Reserved.',
    instagram_url TEXT,
    facebook_url TEXT,
    payment_upi_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    payment_upi_id TEXT DEFAULT 'meeravnamkeens@upi',
    payment_cod_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    payment_card_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    payment_netbanking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    payment_razorpay_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    payment_razorpay_key_id TEXT,
    payment_stripe_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    payment_stripe_publishable_key TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 4b. PAGE CONTENT TABLE — admin-editable copy for headings/subheadings/
-- descriptions across the site (a generic key/value store so new editable
-- text blocks can be added without a schema change).
CREATE TABLE IF NOT EXISTS public.page_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    page TEXT NOT NULL DEFAULT 'home',
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.page_content (key, value, label, page, sort_order) VALUES
('home.hero.badge', 'FROM THE HEART OF BIKANER • AN AUTHENTIC BIKANERI TASTE', 'Hero Badge Text', 'home', 1),
('home.hero.title_line1', 'Royal Bikaneri', 'Hero Title (Line 1)', 'home', 2),
('home.hero.title_highlight', 'Namkeens & Sev', 'Hero Title (Highlighted Word)', 'home', 3),
('home.hero.subtitle', 'Made with finest ingredients and authentic Bikaneri recipes. Prepared fresh daily in <strong>100% pure & clean oil</strong> with zero palm oil.', 'Hero Subtitle', 'home', 4),
('home.showcase.heading', 'Select a Category to Explore Snacks', 'Category Showcase Heading', 'home', 5),
('home.showcase.subheading', 'Click any traditional category below to view its handcrafted snacks, live prices & pack sizes', 'Category Showcase Subheading', 'home', 6),
('home.trust.item1.title', 'Pure & Clean Oil', 'Trust Badge 1 - Title', 'home', 7),
('home.trust.item1.desc', 'Prepared exclusively in pure cold-pressed groundnut & vegetable oils with zero palm oil.', 'Trust Badge 1 - Description', 'home', 8),
('home.trust.item2.title', 'Bikaneri Heritage', 'Trust Badge 2 - Title', 'home', 9),
('home.trust.item2.desc', 'Authentic traditional spices, moth dal flour, and slow-fried craftsmanship from Bikaner.', 'Trust Badge 2 - Description', 'home', 10),
('home.trust.item3.title', 'Multi-Layer Airtight Pack', 'Trust Badge 3 - Title', 'home', 11),
('home.trust.item3.desc', 'Food-grade nitrogen flushed airtight packaging guarantees crisp crunch for 6+ months.', 'Trust Badge 3 - Description', 'home', 12),
('home.trust.item4.title', 'Live WhatsApp Alerts', 'Trust Badge 4 - Title', 'home', 13),
('home.trust.item4.desc', 'Instant WhatsApp notifications with courier tracking and live GPS route maps.', 'Trust Badge 4 - Description', 'home', 14)
ON CONFLICT (key) DO NOTHING;

-- 5. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    pincode TEXT,
    lat NUMERIC,
    lng NUMERIC,
    avatar TEXT,
    wishlist TEXT[] DEFAULT '{}',
    saved_addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- 6. NOTIFICATIONS TABLE (WhatsApp/Email log shown in the admin Notification Hub)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    type TEXT,
    recipient TEXT,
    template TEXT,
    notif_time TEXT,
    status TEXT,
    status_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ADMINS TABLE — gates every admin-only RLS policy via is_admin() above.
-- Rows are created by the "admin-manage" Edge Function (service_role), which
-- also creates the matching Supabase Auth user; this table is never
-- self-service INSERTable by anyone, including other admins.
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin', -- 'root' or 'admin'
    created_by UUID REFERENCES public.admins(id),
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admins_created_by ON public.admins(created_by);

-- 8. ADMIN ACTIVITY LOG — every catalog/order/notification/settings change a
-- signed-in admin makes; only the root admin can read it.
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admins(id),
    admin_name TEXT NOT NULL,
    admin_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    undone BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON public.admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON public.admin_activity_log(created_at DESC);

-- 9. ADMIN WARNINGS — root can flag a sub-admin; they see it until acknowledged.
CREATE TABLE IF NOT EXISTS public.admin_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.admins(id),
    message TEXT NOT NULL,
    issued_by UUID REFERENCES public.admins(id),
    issued_by_name TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_warnings_admin_id ON public.admin_warnings(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_warnings_issued_by ON public.admin_warnings(issued_by);

-- Useful lookup indexes for admin dashboard queries.
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 10. ENABLE ROW LEVEL SECURITY (RLS) EVERYWHERE
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_warnings ENABLE ROW LEVEL SECURITY;

-- 11. RLS POLICIES — public can only ever read the catalog + create
-- orders/customer accounts; every write to products/categories/orders'
-- status/settings/admin data requires is_admin(). auth.uid()/is_admin() are
-- wrapped in `(select ...)` so Postgres caches the check once per statement
-- instead of re-running it per row (Supabase perf-linter best practice).

-- Categories: public read, admin write
CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "admins write categories" ON public.categories FOR INSERT WITH CHECK (is_admin((select auth.uid())));
CREATE POLICY "admins update categories" ON public.categories FOR UPDATE USING (is_admin((select auth.uid())));
CREATE POLICY "admins delete categories" ON public.categories FOR DELETE USING (is_admin((select auth.uid())));

-- Products: public read, admin write
CREATE POLICY "public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "admins write products" ON public.products FOR INSERT WITH CHECK (is_admin((select auth.uid())));
CREATE POLICY "admins update products" ON public.products FOR UPDATE USING (is_admin((select auth.uid())));
CREATE POLICY "admins delete products" ON public.products FOR DELETE USING (is_admin((select auth.uid())));

-- Orders: anyone can place an order (checkout is guest-friendly); only admins read/update status
CREATE POLICY "public write orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read orders" ON public.orders FOR SELECT USING (is_admin((select auth.uid())));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE USING (is_admin((select auth.uid())));

-- Site settings: public read (storefront theming), admin write
CREATE POLICY "Public settings read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins insert settings" ON public.site_settings FOR INSERT WITH CHECK (is_admin((select auth.uid())));
CREATE POLICY "admins update settings" ON public.site_settings FOR UPDATE USING (is_admin((select auth.uid())));
CREATE POLICY "admins delete settings" ON public.site_settings FOR DELETE USING (is_admin((select auth.uid())));

-- Page content: public read (storefront copy), admin write
CREATE POLICY "public read page content" ON public.page_content FOR SELECT USING (true);
CREATE POLICY "admins write page content" ON public.page_content FOR INSERT WITH CHECK (is_admin((select auth.uid())));
CREATE POLICY "admins update page content" ON public.page_content FOR UPDATE USING (is_admin((select auth.uid())));
CREATE POLICY "admins delete page content" ON public.page_content FOR DELETE USING (is_admin((select auth.uid())));

-- Customers: guests/self can register & update their own profile; admins (or the owner) can read it
CREATE POLICY "customers insert own or guest" ON public.customers FOR INSERT
    WITH CHECK ((select auth.uid()) IS NULL OR (select auth.uid())::text = id);
CREATE POLICY "customers update own or guest" ON public.customers FOR UPDATE
    USING ((select auth.uid()) IS NULL OR (select auth.uid())::text = id);
CREATE POLICY "own or admin read customers" ON public.customers FOR SELECT
    USING ((select auth.uid())::text = id OR is_admin((select auth.uid())));

-- Notifications: anyone can log one (storefront + admin broadcast), only admins read the log
CREATE POLICY "public write notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read notifications" ON public.notifications FOR SELECT USING (is_admin((select auth.uid())));

-- Admins: any signed-in admin can see the admin roster (needed for the Admin Accounts page)
CREATE POLICY "admins can view admin list" ON public.admins FOR SELECT USING (is_admin((select auth.uid())));

-- Admin activity log: any admin can log their own actions; only root reads/undoes
CREATE POLICY "admins can log their own activity" ON public.admin_activity_log FOR INSERT
    WITH CHECK (is_admin((select auth.uid())));
CREATE POLICY "only root can read activity log" ON public.admin_activity_log FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.id = (select auth.uid()) AND admins.role = 'root'));
CREATE POLICY "root can mark activity undone" ON public.admin_activity_log FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.id = (select auth.uid()) AND admins.role = 'root'));

-- Admin warnings: the targeted admin or root can read; only the targeted admin can acknowledge
CREATE POLICY "own or root read warnings" ON public.admin_warnings FOR SELECT
    USING ((select auth.uid()) = admin_id OR EXISTS (SELECT 1 FROM public.admins WHERE admins.id = (select auth.uid()) AND admins.role = 'root'));
CREATE POLICY "own admin can acknowledge warning" ON public.admin_warnings FOR UPDATE
    USING ((select auth.uid()) = admin_id) WITH CHECK ((select auth.uid()) = admin_id);

-- Both `anon` and `authenticated` need EXECUTE here — RLS evaluates
-- is_admin(auth.uid()) under the connecting role for every policy above,
-- including ones anonymous storefront visitors hit (e.g. orders/customers
-- SELECT), so anon must be able to call it and get back `false`, not a hard
-- permission error. (This does mean it's technically probeable as a public
-- RPC returning true/false for a given UUID — a known, accepted tradeoff.)
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;

-- 12. REALTIME — storefront + admin portal subscribe to live changes on these tables.
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_content;

-- 13. STORAGE BUCKET (meerav-media)
-- Systematic folder layout: meerav-media/categories/{category_id}/products/{product_id}/{photos|videos}/{filename}
INSERT INTO storage.buckets (id, name, public)
VALUES ('meerav-media', 'meerav-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public storage read" ON storage.objects FOR SELECT USING (bucket_id = 'meerav-media');
CREATE POLICY "Public storage insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'meerav-media');
CREATE POLICY "Public storage update" ON storage.objects FOR UPDATE USING (bucket_id = 'meerav-media');

-- 14. BOOTSTRAP THE FIRST ROOT ADMIN
-- Sign up a real Supabase Auth user first (Dashboard → Authentication →
-- Add User, or via admin.html once one root exists), then run:
--   INSERT INTO public.admins (id, email, name, role, must_change_password)
--   VALUES ('<the auth user''s UUID>', 'you@example.com', 'Your Name', 'root', false);
-- After that, use the Admin Portal's "Admin Accounts" page to register
-- sub-admins — it creates their Auth user + admins row together via the
-- "admin-manage" Edge Function.

-- 15. SEED CATEGORIES DATA
INSERT INTO public.categories (id, name, icon, description) VALUES
('all', 'All Delicacies', 'fas fa-border-all', 'Complete Bikaner royal heritage snack collection'),
('bhujia-sev', 'Bhujia & Sev', 'fas fa-fire', 'Thin, crispy golden sev & authentic Bikaneri bhujia prepared in pure oil'),
('mixture-farsan', 'Namkeen & Mixtures', 'fas fa-bowl-rice', 'Rich royal medleys with cashews, raisins, boondi & crunchy namkeens'),
('mathri', 'Papad & Mathri', 'fas fa-sun', 'Flaky handmade mathri, sun-dried papad, and authentic Rajasthani crisps'),
('roasted-diet', 'Roasted Diet Snacks', 'fas fa-seedling', 'Slow-roasted superfoods, crispy moong dal, and diet makhana with zero palm oil'),
('sweets-combos', 'Sweets & Hampers', 'fas fa-gift', 'Traditional Bikaneri sweets, festive combo boxes, and luxury gift hampers')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

-- SEED ALL 75 PRODUCTS DATA
INSERT INTO public.products (id, name, category, tag, rating, reviews_count, spice_level, dietary, image, video, sample_image, description, ingredients, nutrition, variants, in_stock) VALUES
('p1', 'Meerav Authentic Aloo Bhujia', 'bhujia-sev', 'Best Seller', 5, 684, 'Mild-Tangy Mint (🌶️)', '["100% Veg","Pure & Clean Oil","No Palm Oil"]'::jsonb, 'assets/images/cinematic_bhujia.jpg', 'assets/videos/clip_bhujia.mp4', NULL, 'Crafted with authentic potato flakes, tepary moth bean flour, and refreshing fresh mint seasoning. Prepared daily in pure & clean oil.', 'Potato Flakes, Moth Bean Flour, Gram Flour, Pure Groundnut Oil, Mint Powder, Desert Rock Salt, Dry Mango Extract.', '{"energy":"530 kcal","fat":"32g","carbs":"50g","protein":"10g"}'::jsonb, '[{"weight":"200 g","price":99,"originalPrice":120},{"weight":"500 g","price":229,"originalPrice":260},{"weight":"1 kg","price":429,"originalPrice":480}]'::jsonb, true),
('p2', 'Meerav Royal Bikaneri Papad & Moth Bhujia', 'bhujia-sev', 'Heritage GI Tag', 5, 512, 'Classic Bikaneri (🌶️🌶️)', '["100% Veg","GI Tagged","Pure Oil"]'::jsonb, 'assets/images/cinematic_papad.jpg', 'assets/videos/clip_papad.mp4', NULL, 'The crown jewel of Bikaner made with 100% authentic ground Moth dal, black pepper, and desert cardamom. Extra crispy and light.', 'Moth Dal Flour, Besan, Pure Groundnut Oil, Black Pepper, Desert Spices, Cardamom, Sendha Namak.', '{"energy":"550 kcal","fat":"35g","carbs":"44g","protein":"15g"}'::jsonb, '[{"weight":"200 g","price":110,"originalPrice":130},{"weight":"500 g","price":249,"originalPrice":280},{"weight":"1 kg","price":469,"originalPrice":520}]'::jsonb, true),
('p3', 'Meerav Royal Ratlami Laung Sev', 'bhujia-sev', 'Clove Infused', 4.9, 420, 'Medium-Hot (🌶️🌶️🌶️)', '["100% Veg","Jain Friendly","Pure Oil"]'::jsonb, 'assets/images/pack_ratlami_sev.svg', NULL, NULL, 'Thick, spicy gram flour sev tempered with aromatic cloves (laung) and Malwa spices. Perfectly fiery and crunchy.', 'Besan, Pure Groundnut Oil, Clove (Laung), Black Pepper, Asafoetida (Hing), Red Chili, Rock Salt.', '{"energy":"540 kcal","fat":"34g","carbs":"42g","protein":"14g"}'::jsonb, '[{"weight":"200 g","price":129,"originalPrice":149},{"weight":"500 g","price":289,"originalPrice":329},{"weight":"1 kg","price":549,"originalPrice":619}]'::jsonb, true),
('p9', 'Meerav Royal Bikaneri Hing Sev', 'bhujia-sev', 'Hing Aroma', 4.9, 275, 'Medium-Spicy (🌶️🌶️)', '["100% Veg","Jain Friendly","Pure Groundnut Oil"]'::jsonb, 'assets/images/pack_hing_sev.svg', NULL, NULL, 'Thin, crispy golden sev infused with pure roasted Hing (asafoetida), black pepper, and authentic Rajasthani spices.', 'Besan (Gram Flour), Pure Groundnut Oil, Roasted Hing (Asafoetida), Ajwain, Black Pepper, Rock Salt.', '{"energy":"530 kcal","fat":"32g","carbs":"44g","protein":"13g"}'::jsonb, '[{"weight":"200 g","price":119,"originalPrice":139},{"weight":"500 g","price":269,"originalPrice":299},{"weight":"1 kg","price":519,"originalPrice":579}]'::jsonb, true),
('p12', 'Meerav Salted Crispy Moong Dal', 'bhujia-sev', 'Classic Crunch', 4.9, 460, 'Salted Mild (🧂)', '["100% Veg","Gluten-Free","Pure Oil"]'::jsonb, 'assets/images/cinematic_moong_dal.jpg', 'assets/videos/clip_moong_dal.mp4', NULL, 'Carefully selected split yellow green gram fried in clean peanut oil and lightly dusted with Sendha Namak (rock salt).', 'Moong Dal (Yellow Gram), Pure Peanut Oil, Sendha Namak (Rock Salt).', '{"energy":"490 kcal","fat":"24g","carbs":"48g","protein":"20g"}'::jsonb, '[{"weight":"200 g","price":89,"originalPrice":110},{"weight":"500 g","price":199,"originalPrice":230},{"weight":"1 kg","price":379,"originalPrice":429}]'::jsonb, true),
('p15', 'Meerav Bikaneri Garlic Lasun Sev', 'bhujia-sev', 'Spicy Garlic', 4.8, 340, 'Hot Garlic (🌶️🌶️🌶️)', '["100% Veg","Fresh Garlic","Pure Oil"]'::jsonb, 'assets/images/pack_ratlami_sev.svg', NULL, NULL, 'Crispy thick gram flour sev infused with roasted Rajasthani garlic paste and Kashmiri red chili.', 'Gram Flour, Fresh Garlic Paste, Mustard Oil Hint, Red Chili, Ajwain, Sea Salt.', '{"energy":"535 kcal","fat":"33g","carbs":"43g","protein":"13g"}'::jsonb, '[{"weight":"200 g","price":109,"originalPrice":129},{"weight":"500 g","price":239,"originalPrice":270},{"weight":"1 kg","price":449,"originalPrice":499}]'::jsonb, true),
('p16', 'Meerav Shahi Urad Dal Bhujia', 'bhujia-sev', 'Protein Rich', 4.9, 290, 'Medium (🌶️🌶️)', '["100% Veg","Urad Flour","Pure Groundnut Oil"]'::jsonb, 'assets/images/pack_bikaneri_bhujia.svg', NULL, NULL, 'Delicate and airy bhujia kneaded from washed white Urad lentils and flavored with crushed mace and nutmeg.', 'Urad Dal Flour, Moth Flour, Groundnut Oil, Mace, Nutmeg, Rock Salt.', '{"energy":"525 kcal","fat":"31g","carbs":"45g","protein":"17g"}'::jsonb, '[{"weight":"200 g","price":119,"originalPrice":139},{"weight":"500 g","price":259,"originalPrice":290},{"weight":"1 kg","price":489,"originalPrice":539}]'::jsonb, true),
('p17', 'Meerav Bikaneri Nylon Zero Sev', 'bhujia-sev', 'Chaat Special', 4.9, 380, 'Mild (🌱)', '["100% Veg","Zero Thickness","Chaat Topper"]'::jsonb, 'assets/images/pack_hing_sev.svg', NULL, NULL, 'Ultra-fine, melt-in-mouth golden sev specially crafted for garnishing Bhelpuri, Sev Puri, and Rajasthani poha.', 'Finest Besan, Refined Groundnut Oil, Turmeric, Sendha Namak.', '{"energy":"510 kcal","fat":"29g","carbs":"51g","protein":"11g"}'::jsonb, '[{"weight":"200 g","price":85,"originalPrice":105},{"weight":"500 g","price":189,"originalPrice":220},{"weight":"1 kg","price":359,"originalPrice":400}]'::jsonb, true),
('p18', 'Meerav Palak Pudina Green Sev', 'bhujia-sev', 'Herbal Mint', 4.7, 210, 'Tangy Mint (🌿)', '["100% Veg","Natural Spinach","Pure Oil"]'::jsonb, 'assets/images/pack_ratlami_sev.svg', NULL, NULL, 'Vibrant emerald sev made with fresh spinach puree, crushed garden mint, and roasted cumin seeds.', 'Gram Flour, Fresh Spinach Puree, Mint Leaf Extract, Cumin, Amchur, Pure Oil.', '{"energy":"495 kcal","fat":"27g","carbs":"51g","protein":"12g"}'::jsonb, '[{"weight":"200 g","price":115,"originalPrice":135},{"weight":"500 g","price":249,"originalPrice":280},{"weight":"1 kg","price":469,"originalPrice":519}]'::jsonb, true),
('p46', 'Meerav Bhavnagri Gathiya Sev', 'bhujia-sev', 'Puffy Soft Sev', 4.8, 320, 'Mild Ajwain (🌶️)', '["100% Veg","Soft Crunch","Pure Groundnut Oil"]'::jsonb, 'assets/images/pack_bikaneri_bhujia.svg', NULL, NULL, 'Thick and fluffy yellow gathiya extruded with traditional brass moulds and spiced with cracked ajwain.', 'Pure Besan, Cold Pressed Groundnut Oil, Ajwain, Black Salt, Papdi Khar.', '{"energy":"515 kcal","fat":"30g","carbs":"46g","protein":"13g"}'::jsonb, '[{"weight":"200 g","price":95,"originalPrice":115},{"weight":"500 g","price":215,"originalPrice":245},{"weight":"1 kg","price":399,"originalPrice":450}]'::jsonb, true),
('p47', 'Meerav Jodhpuri Mirchi Bhujia', 'bhujia-sev', 'Mathania Chili', 5, 450, 'Extra Hot (🌶️🌶️🌶️🌶️)', '["100% Veg","Rajasthani Chili","Pure Oil"]'::jsonb, 'assets/images/pack_ratlami_sev.svg', NULL, NULL, 'Fiery Bikaneri bhujia spiced with authentic stone-ground Mathania sun-dried red chilies.', 'Moth Flour, Besan, Mathania Red Chili, Groundnut Oil, Desert Spices, Rock Salt.', '{"energy":"545 kcal","fat":"34g","carbs":"43g","protein":"14g"}'::jsonb, '[{"weight":"200 g","price":125,"originalPrice":145},{"weight":"500 g","price":279,"originalPrice":310},{"weight":"1 kg","price":529,"originalPrice":589}]'::jsonb, true),
('p48', 'Meerav Malwi Jeera Roasted Sev', 'bhujia-sev', 'Roasted Cumin', 4.8, 260, 'Earthy Cumin (🌶️)', '["100% Veg","Jain Friendly","Pure Oil"]'::jsonb, 'assets/images/pack_hing_sev.svg', NULL, NULL, 'Medium-thick besan sev tempered with dry-roasted cumin seeds, black pepper, and rock salt.', 'Gram Flour, Roasted Cumin (Jeera), Pure Oil, Black Pepper, Himalayan Salt.', '{"energy":"520 kcal","fat":"31g","carbs":"45g","protein":"12g"}'::jsonb, '[{"weight":"200 g","price":105,"originalPrice":125},{"weight":"500 g","price":229,"originalPrice":260},{"weight":"1 kg","price":439,"originalPrice":489}]'::jsonb, true),
('p49', 'Meerav Bikaneri Spiced Chana Dal', 'bhujia-sev', 'Nutty Crunch', 4.9, 390, 'Tangy Spiced (🌶️🌶️)', '["100% Veg","High Protein","Pure Oil"]'::jsonb, 'assets/images/pack_moong_dal.svg', NULL, NULL, 'Split Bengal gram pulses fried golden crisp and dusted with tangy amchur and red chili powder.', 'Chana Dal (Bengal Gram), Pure Groundnut Oil, Dry Mango Powder, Red Chili, Sea Salt.', '{"energy":"495 kcal","fat":"22g","carbs":"50g","protein":"21g"}'::jsonb, '[{"weight":"200 g","price":89,"originalPrice":110},{"weight":"500 g","price":199,"originalPrice":230},{"weight":"1 kg","price":379,"originalPrice":429}]'::jsonb, true),
('p50', 'Meerav Tamatar Tangy Sev', 'bhujia-sev', 'Sun-Dried Tomato', 4.7, 230, 'Sweet & Tangy (🌶️)', '["100% Veg","Real Tomato Extract","Pure Oil"]'::jsonb, 'assets/images/meerav_aloo_bhujia_pack.png', NULL, NULL, 'Crispy fine sev infused with real sun-dried tomato powder, roasted cumin, and sweet paprika.', 'Besan, Tomato Powder, Pure Oil, Paprika, Sugar Powder, Rock Salt.', '{"energy":"510 kcal","fat":"29g","carbs":"49g","protein":"11g"}'::jsonb, '[{"weight":"200 g","price":105,"originalPrice":125},{"weight":"500 g","price":229,"originalPrice":260},{"weight":"1 kg","price":439,"originalPrice":489}]'::jsonb, true),
('p51', 'Meerav Ajwaini Tikha Sev', 'bhujia-sev', 'Carom Spiced', 4.8, 310, 'Spicy (🌶️🌶️🌶️)', '["100% Veg","Pure Groundnut Oil","Digestive Ajwain"]'::jsonb, 'assets/images/pack_ratlami_sev.svg', NULL, NULL, 'Extra crunchy golden sev seasoned with crushed wild ajwain seeds and pungent black pepper.', 'Gram Flour, Wild Ajwain, Black Pepper, Pure Oil, Rock Salt.', '{"energy":"530 kcal","fat":"32g","carbs":"44g","protein":"13g"}'::jsonb, '[{"weight":"200 g","price":110,"originalPrice":130},{"weight":"500 g","price":239,"originalPrice":270},{"weight":"1 kg","price":449,"originalPrice":499}]'::jsonb, true),
('p4', 'Meerav Shahi Kaju Dry Fruit Mixture', 'mixture-farsan', 'Royal Festive', 5, 380, 'Mild Royal (🌶️)', '["100% Veg","Jain Friendly","Rich in Cashews"]'::jsonb, 'assets/images/cinematic_mixture.jpg', 'assets/videos/clip_mixture.mp4', NULL, 'Rich festive mixture generously loaded with whole roasted cashews, California almonds, raisins, and delicate golden sev.', 'Cashews, Almonds, Golden Raisins, Gram Flour Sev, Pure Vegetable Oil, Cardamom Hint, Rock Salt.', '{"energy":"610 kcal","fat":"40g","carbs":"44g","protein":"16g"}'::jsonb, '[{"weight":"200 g","price":219,"originalPrice":249},{"weight":"500 g","price":489,"originalPrice":549},{"weight":"1 kg","price":929,"originalPrice":1049}]'::jsonb, true),
('p5', 'Meerav Khatta Meetha Special Mixture', 'mixture-farsan', 'Family Favorite', 4.8, 295, 'Sweet & Tangy (🌶️)', '["100% Veg","Tangy Mango","Zero Palm Oil"]'::jsonb, 'assets/images/pack_khatta_meetha.svg', NULL, NULL, 'A delightful sweet and tangy harmony of crispy sev, boondi, roasted peanuts, puffed rice, and dry mango seasonings.', 'Gram Flour, Puffed Rice, Peanuts, Green Peas, Sugar Powder, Dry Mango (Amchur), Curry Leaves, Turmeric.', '{"energy":"520 kcal","fat":"30g","carbs":"48g","protein":"12g"}'::jsonb, '[{"weight":"200 g","price":99,"originalPrice":119},{"weight":"500 g","price":219,"originalPrice":249},{"weight":"1 kg","price":419,"originalPrice":469}]'::jsonb, true),
('p13', 'Meerav Shahi Navratan Royal Mixture', 'mixture-farsan', '9-Jewel Royal', 5, 390, 'Sweet & Spicy (🌶️🌶️)', '["100% Veg","Royal Dry Fruits","Zero Palm Oil"]'::jsonb, 'assets/images/pack_navratan_mixture.svg', NULL, NULL, 'Imperial 9-jewel medley of cashews, golden raisins, crispy potato sticks, moth sev, gram pulses, and spicy boondi pearls.', 'Cashews, Raisins, Potato Flakes, Gram Flour, Moth Flour, Peanuts, Pure Oil, Cardamom, Desert Spices.', '{"energy":"560 kcal","fat":"35g","carbs":"46g","protein":"14g"}'::jsonb, '[{"weight":"200 g","price":159,"originalPrice":180},{"weight":"500 g","price":349,"originalPrice":390},{"weight":"1 kg","price":659,"originalPrice":740}]'::jsonb, true),
('p19', 'Meerav Golden Cornflakes Potato Chips & Mixture', 'mixture-farsan', 'Crispy Crunch', 4.8, 260, 'Sweet & Savory (🌶️)', '["100% Veg","Crispy Corn & Potato","Zero Palm Oil"]'::jsonb, 'assets/images/cinematic_chips.jpg', 'assets/videos/clip_chips.mp4', NULL, 'Sun-ripened crunchy cornflakes and golden potato chips fried to perfection and tossed with roasted cashew splits, curry leaves, and raisins.', 'Cornflakes, Potato Wafers, Cashews, Peanuts, Raisins, Pure Groundnut Oil, Powdered Sugar, Rock Salt.', '{"energy":"515 kcal","fat":"28g","carbs":"56g","protein":"10g"}'::jsonb, '[{"weight":"200 g","price":125,"originalPrice":145},{"weight":"500 g","price":279,"originalPrice":310},{"weight":"1 kg","price":529,"originalPrice":589}]'::jsonb, true),
('p20', 'Meerav Royal Kashmiri Dalmoth Mixture', 'mixture-farsan', 'Almond Loaded', 4.9, 310, 'Mild Cardamom (🌶️)', '["100% Veg","Kashmiri Spices","Rich Almonds"]'::jsonb, 'assets/images/pack_kaju_mixture.svg', NULL, NULL, 'Traditional North Indian whole brown lentil dalmoth blended with toasted almond slivers and golden melon seeds.', 'Masoor Dal (Brown Lentils), Almonds, Magaz (Melon Seeds), Gram Flour, Saffron Essence, Pure Oil.', '{"energy":"570 kcal","fat":"36g","carbs":"42g","protein":"18g"}'::jsonb, '[{"weight":"200 g","price":179,"originalPrice":199},{"weight":"500 g","price":389,"originalPrice":430},{"weight":"1 kg","price":749,"originalPrice":820}]'::jsonb, true),
('p21', 'Meerav Bikaneri Panchrattan Mixture', 'mixture-farsan', '5-Jewel Blend', 4.9, 280, 'Savory (🌶️🌶️)', '["100% Veg","Potato Matchsticks","Pure Oil"]'::jsonb, 'assets/images/pack_navratan_mixture.svg', NULL, NULL, 'Crispy fried potato salli, whole cashews, almonds, raisins, and spicy green peas seasoned with Sendha Namak.', 'Potato Salli, Cashews, Almonds, Kishmish, Green Peas, Sendha Namak, Pure Oil.', '{"energy":"545 kcal","fat":"33g","carbs":"50g","protein":"12g"}'::jsonb, '[{"weight":"200 g","price":169,"originalPrice":189},{"weight":"500 g","price":369,"originalPrice":410},{"weight":"1 kg","price":699,"originalPrice":770}]'::jsonb, true),
('p22', 'Meerav All-In-One Imperial Namkeen', 'mixture-farsan', 'Signature Blend', 4.8, 350, 'Medium Spicy (🌶️🌶️)', '["100% Veg","Multi-Texture","Clean Oil"]'::jsonb, 'assets/images/cinematic_namkeen.jpg', 'assets/videos/clip_namkeen.mp4', NULL, 'The ultimate 12-snack medley combining gathiya, papdi, bhujia, peanuts, boondi, and roasted lentils in one royal pack.', 'Gram Flour, Moth Dal, Peanuts, Lentils, Spices, Pure Oil, Rock Salt.', '{"energy":"530 kcal","fat":"31g","carbs":"48g","protein":"13g"}'::jsonb, '[{"weight":"200 g","price":109,"originalPrice":129},{"weight":"500 g","price":239,"originalPrice":270},{"weight":"1 kg","price":449,"originalPrice":499}]'::jsonb, true),
('p23', 'Meerav Spicy Farali Falahari Mixture', 'mixture-farsan', 'Vrat & Upwas', 5, 420, 'Tangy Rock Salt (🧂)', '["100% Veg","Vrat Friendly","Sabudana & Potato"]'::jsonb, 'assets/images/pack_kaju_mixture.svg', NULL, NULL, 'Crispy sabudana pearls, potato flakes, and roasted peanuts seasoned with rock salt. Perfect for religious fasting.', 'Tapioca Pearls (Sabudana), Potato Wafers, Peanuts, Rock Salt, Pure Groundnut Oil.', '{"energy":"510 kcal","fat":"26g","carbs":"60g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":135,"originalPrice":155},{"weight":"500 g","price":295,"originalPrice":330},{"weight":"1 kg","price":569,"originalPrice":629}]'::jsonb, true),
('p24', 'Meerav Masala Raita Boondi Pearls', 'mixture-farsan', 'Raita & Snack', 4.8, 230, 'Spicy Tangy (🌶️🌶️)', '["100% Veg","Crispy Pearls","Pure Oil"]'::jsonb, 'assets/images/cinematic_raita_boondi.jpg', 'assets/videos/clip_raita_boondi.mp4', NULL, 'Golden, crispy gram flour pearls seasoned with crushed curry leaves, black salt, and red chili.', 'Besan (Gram Flour), Pure Oil, Curry Leaves, Black Salt, Red Chili Powder.', '{"energy":"525 kcal","fat":"32g","carbs":"47g","protein":"11g"}'::jsonb, '[{"weight":"200 g","price":79,"originalPrice":99},{"weight":"500 g","price":175,"originalPrice":205},{"weight":"1 kg","price":329,"originalPrice":379}]'::jsonb, true),
('p52', 'Meerav Badam Lachha Royal Mixture', 'mixture-farsan', 'Almond Matchsticks', 5, 310, 'Mild Sweet & Salty (🌶️)', '["100% Veg","Real Almonds","Pure Oil"]'::jsonb, 'assets/images/pack_kaju_mixture.svg', NULL, NULL, 'Crispy shredded potato lachha fried to a golden hue and mixed with sliced California almonds and rock salt.', 'Potato Slices (Lachha), California Almonds, Pure Ghee/Oil, Rock Salt, Mild Sugar Powder.', '{"energy":"580 kcal","fat":"38g","carbs":"46g","protein":"14g"}'::jsonb, '[{"weight":"200 g","price":189,"originalPrice":215},{"weight":"500 g","price":419,"originalPrice":469},{"weight":"1 kg","price":799,"originalPrice":889}]'::jsonb, true),
('p53', 'Meerav Kolhapuri Teekha Mixture', 'mixture-farsan', 'Fiery Crunch', 4.8, 370, 'Extra Fiery (🌶️🌶️🌶️🌶️)', '["100% Veg","Red Chili Lavangi","Pure Oil"]'::jsonb, 'assets/images/pack_navratan_mixture.svg', NULL, NULL, 'Spicy puffed grains, fried lentils, peanuts, and gathiya tossed with fiery Kolhapuri red chili spice paste.', 'Gram Flour, Roasted Peanuts, Lentils, Kolhapuri Red Chili, Cumin, Mustard, Pure Oil.', '{"energy":"535 kcal","fat":"33g","carbs":"44g","protein":"13g"}'::jsonb, '[{"weight":"200 g","price":105,"originalPrice":125},{"weight":"500 g","price":229,"originalPrice":260},{"weight":"1 kg","price":439,"originalPrice":489}]'::jsonb, true),
('p54', 'Meerav Royal Bikaneri Chivda', 'mixture-farsan', 'Crispy Puffed Rice', 4.9, 410, 'Mild Mustard (🌶️)', '["100% Veg","Puffed Rice & Dal","Pure Oil"]'::jsonb, 'assets/images/pack_khatta_meetha.svg', NULL, NULL, 'Crispy puffed rice (murmura) tossed with golden roasted chana dal, peanuts, mustard seeds, and fresh curry leaves.', 'Puffed Rice (Murmura), Peanuts, Roasted Gram, Turmeric, Green Chili, Pure Oil.', '{"energy":"460 kcal","fat":"20g","carbs":"60g","protein":"11g"}'::jsonb, '[{"weight":"200 g","price":79,"originalPrice":99},{"weight":"500 g","price":175,"originalPrice":205},{"weight":"1 kg","price":329,"originalPrice":379}]'::jsonb, true),
('p55', 'Meerav Sweet & Sour Gujarati Farsan', 'mixture-farsan', 'Amchur Glaze', 4.8, 290, 'Sweet & Tangy (🌶️)', '["100% Veg","No Onion-Garlic","Zero Palm Oil"]'::jsonb, 'assets/images/pack_khatta_meetha.svg', NULL, NULL, 'Mild crunchy mixture with puffed grain flakes, sweet boondi pearls, and roasted peanuts seasoned with raw mango powder.', 'Cornflakes, Besan Boondi, Peanuts, Powdered Cane Sugar, Dry Mango (Amchur), Salt.', '{"energy":"515 kcal","fat":"27g","carbs":"55g","protein":"10g"}'::jsonb, '[{"weight":"200 g","price":95,"originalPrice":115},{"weight":"500 g","price":215,"originalPrice":245},{"weight":"1 kg","price":399,"originalPrice":450}]'::jsonb, true),
('p56', 'Meerav Masala Roasted Peanuts', 'mixture-farsan', 'Crunchy Peanuts', 4.9, 340, 'Spiced Masala (🌶️🌶️)', '["100% Veg","High Protein","Gujarat Peanuts"]'::jsonb, 'assets/images/cinematic_masala_peanuts.jpg', 'assets/videos/clip_masala_peanuts.mp4', NULL, 'Jumbo Gujarat peanuts roasted crisp in cold-pressed oil and generously coated in spicy chaat masala and rock salt.', 'Gujarat Peanuts, Cold Pressed Oil, Chaat Masala, Sendha Namak.', '{"energy":"540 kcal","fat":"35g","carbs":"36g","protein":"22g"}'::jsonb, '[{"weight":"200 g","price":110,"originalPrice":130},{"weight":"500 g","price":239,"originalPrice":270},{"weight":"1 kg","price":449,"originalPrice":499}]'::jsonb, true),
('p57', 'Meerav Saffron Dry Fruit Royal Medley', 'mixture-farsan', 'Imperial Saffron', 5, 480, 'Royal Saffron (👑)', '["100% Veg","100% Dry Fruits","Kashmiri Kesar"]'::jsonb, 'assets/images/pack_kaju_mixture.svg', NULL, NULL, 'Luxury blend of whole Iranian pistachios, roasted cashews, Mamra almonds, raisins, and genuine Kashmiri saffron strands.', 'Cashews, Almonds, Pistachios, Golden Raisins, Pure Kashmiri Kesar, Rock Salt.', '{"energy":"630 kcal","fat":"44g","carbs":"40g","protein":"18g"}'::jsonb, '[{"weight":"200 g","price":299,"originalPrice":349},{"weight":"500 g","price":679,"originalPrice":759},{"weight":"1 kg","price":1299,"originalPrice":1450}]'::jsonb, true),
('p7', 'Meerav Handcrafted Kasuri Methi Mathri', 'mathri', 'Chai Companion', 4.7, 188, 'Medium (🌶️🌶️)', '["100% Veg","Handmade","No Onion-Garlic"]'::jsonb, 'assets/images/pack_methi_mathri.svg', NULL, NULL, 'Flaky, multi-layered crispy diamond bites kneaded with aromatic Kasuri methi and cracked whole black pepper.', 'Wheat Flour, Pure Ghee, Dried Kasuri Methi, Ajwain Seeds, Black Pepper, Rock Salt.', '{"energy":"500 kcal","fat":"28g","carbs":"52g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":109,"originalPrice":129},{"weight":"500 g","price":239,"originalPrice":269},{"weight":"1 kg","price":449,"originalPrice":499}]'::jsonb, true),
('p14', 'Meerav Handcrafted Masala Karela Mathri', 'mathri', 'Tea-Time Special', 4.8, 215, 'Ajwain Spiced (🌶️)', '["100% Veg","Handmade","Pure Desi Ghee"]'::jsonb, 'assets/images/pack_masala_karela.svg', NULL, NULL, 'Spindle-shaped flaky wheat crackers kneaded with wild ajwain seeds, kasuri methi, and black pepper. Perfect with hot masala chai.', 'Wheat Flour, Pure Desi Cow Ghee, Ajwain (Carom Seeds), Kasuri Methi, Crushed Pepper, Rock Salt.', '{"energy":"510 kcal","fat":"29g","carbs":"51g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":119,"originalPrice":139},{"weight":"500 g","price":259,"originalPrice":289},{"weight":"1 kg","price":489,"originalPrice":549}]'::jsonb, true),
('p25', 'Meerav Bikaneri Namak Para Diamonds', 'mathri', 'Traditional Crisps', 4.9, 310, 'Carom Salted (🧂)', '["100% Veg","Diamond Cut","Pure Ghee"]'::jsonb, 'assets/images/pack_methi_mathri.svg', NULL, NULL, 'Classic diamond-cut wheat crisps flavored with whole ajwain seeds and sea salt. Crispy, golden, and non-greasy.', 'Fine Wheat Flour, Pure Cow Ghee, Ajwain Seeds, Sea Salt, Refined Oil.', '{"energy":"490 kcal","fat":"25g","carbs":"55g","protein":"8g"}'::jsonb, '[{"weight":"200 g","price":89,"originalPrice":109},{"weight":"500 g","price":199,"originalPrice":230},{"weight":"1 kg","price":379,"originalPrice":429}]'::jsonb, true),
('p26', 'Meerav Shahi Achari Masala Mathri', 'mathri', 'Pickle Spiced', 4.8, 240, 'Spicy Tangy (🌶️🌶️🌶️)', '["100% Veg","Mango Pickle Spices","Handmade"]'::jsonb, 'assets/images/pack_masala_karela.svg', NULL, NULL, 'Crispy round mathris infused with traditional Rajasthani mango pickle spices, fennel seeds, and nigella (kalonji).', 'Wheat Flour, Kalonji (Nigella), Fennel Seeds, Red Mustard, Desi Ghee, Sea Salt.', '{"energy":"515 kcal","fat":"30g","carbs":"50g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":125,"originalPrice":145},{"weight":"500 g","price":269,"originalPrice":299},{"weight":"1 kg","price":499,"originalPrice":559}]'::jsonb, true),
('p27', 'Meerav Besan Papdi Gathiya', 'mathri', 'Soft & Crisp', 5, 410, 'Mild Ajwain (🌱)', '["100% Veg","Melt In Mouth","Pure Oil"]'::jsonb, 'assets/images/pack_methi_mathri.svg', NULL, NULL, 'Silky, ribbon-shaped Gujarati-Rajasthani besan papdi tempered with hing and carom seeds. Melts on the tongue.', 'Pure Besan (Gram Flour), Groundnut Oil, Ajwain, Papdi Khar, Black Salt.', '{"energy":"520 kcal","fat":"31g","carbs":"46g","protein":"14g"}'::jsonb, '[{"weight":"200 g","price":95,"originalPrice":115},{"weight":"500 g","price":215,"originalPrice":245},{"weight":"1 kg","price":399,"originalPrice":450}]'::jsonb, true),
('p28', 'Meerav Mini Dry Fruit Samosa Bites', 'mathri', 'Party Favorite', 4.9, 360, 'Sweet & Spicy (🌶️🌶️)', '["100% Veg","Moong Dal & Cashew Stuffed","6 Months Fresh"]'::jsonb, 'assets/images/pack_masala_karela.svg', NULL, NULL, 'Bite-sized pyramid samosas stuffed with spiced yellow moong dal, cashew pieces, raisins, and sweet fennel.', 'Wheat Flour, Moong Dal, Cashews, Raisins, Fennel, Cloves, Pure Oil.', '{"energy":"540 kcal","fat":"32g","carbs":"51g","protein":"11g"}'::jsonb, '[{"weight":"200 g","price":139,"originalPrice":159},{"weight":"500 g","price":299,"originalPrice":340},{"weight":"1 kg","price":569,"originalPrice":630}]'::jsonb, true),
('p29', 'Meerav Mini Khasta Kachori Crisps', 'mathri', 'Lentil Stuffed', 4.8, 290, 'Hot Hing Masala (🌶️🌶️🌶️)', '["100% Veg","Urad Dal Stuffed","Crispy Crust"]'::jsonb, 'assets/images/pack_methi_mathri.svg', NULL, NULL, 'Puffed, flaky golden spheres filled with spicy roasted urad dal, asafoetida, and dry ginger powder.', 'Fine Flour, Urad Dal, Asafoetida, Dry Ginger (Saunth), Desi Ghee, Pure Oil.', '{"energy":"535 kcal","fat":"31g","carbs":"52g","protein":"12g"}'::jsonb, '[{"weight":"200 g","price":139,"originalPrice":159},{"weight":"500 g","price":299,"originalPrice":340},{"weight":"1 kg","price":569,"originalPrice":630}]'::jsonb, true),
('p30', 'Meerav Flaky Wheat Farsi Puri', 'mathri', 'Ghee Layered', 4.7, 195, 'Black Pepper Salt (🧂)', '["100% Veg","Desi Cow Ghee","Flaky Layers"]'::jsonb, 'assets/images/pack_masala_karela.svg', NULL, NULL, 'Multi-layered flaky circular puris rolled in pure desi cow ghee and studded with cracked black pepper corns.', 'Whole Wheat Flour, Pure Cow Ghee, Coarse Black Pepper, Cumin, Rock Salt.', '{"energy":"495 kcal","fat":"27g","carbs":"53g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":115,"originalPrice":135},{"weight":"500 g","price":249,"originalPrice":280},{"weight":"1 kg","price":469,"originalPrice":519}]'::jsonb, true),
('p31', 'Meerav Kali Mirch Gol Mathri', 'mathri', 'Black Pepper', 4.8, 220, 'Cracked Pepper (🌶️🌶️)', '["100% Veg","Malabar Pepper","Crisp Texture"]'::jsonb, 'assets/images/pack_methi_mathri.svg', NULL, NULL, 'Thick, rustic round mathris topped with coarsely crushed Malabar black peppercorns and sea salt.', 'Wheat Flour, Crushed Black Pepper, Ajwain, Pure Ghee, Rock Salt.', '{"energy":"505 kcal","fat":"28g","carbs":"52g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":109,"originalPrice":129},{"weight":"500 g","price":239,"originalPrice":269},{"weight":"1 kg","price":449,"originalPrice":499}]'::jsonb, true),
('p58', 'Meerav Sweet Shakarpara Diamonds', 'mathri', 'Sugar Glazed', 4.9, 380, 'Cardamom Sweet (🍯)', '["100% Veg","Crispy Sweet","Pure Desi Ghee"]'::jsonb, 'assets/images/pack_methi_mathri.svg', NULL, NULL, 'Traditional diamond-shaped crispy wheat bites coated in a crystalline cardamom sugar glaze.', 'Wheat Flour, Pure Cow Ghee, Cardamom (Elaichi), Sugar Coating.', '{"energy":"490 kcal","fat":"22g","carbs":"68g","protein":"7g"}'::jsonb, '[{"weight":"200 g","price":95,"originalPrice":115},{"weight":"500 g","price":215,"originalPrice":245},{"weight":"1 kg","price":399,"originalPrice":450}]'::jsonb, true),
('p59', 'Meerav Handcrafted Suvali Puri', 'mathri', 'Sesame Crisps', 4.8, 210, 'Sesame Salted (🧂)', '["100% Veg","White Til","Extra Thin"]'::jsonb, 'assets/images/pack_masala_karela.svg', NULL, NULL, 'Paper-thin crispy circular wheat crisps speckled with white sesame seeds (til) and black pepper.', 'Wheat Flour, White Sesame Seeds, Black Pepper, Pure Ghee, Sea Salt.', '{"energy":"485 kcal","fat":"26g","carbs":"54g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":110,"originalPrice":130},{"weight":"500 g","price":239,"originalPrice":270},{"weight":"1 kg","price":449,"originalPrice":499}]'::jsonb, true),
('p60', 'Meerav Marwari Pyaz Mathri', 'mathri', 'Onion & Nigella', 4.9, 350, 'Savory (🌶️🌶️)', '["100% Veg","Dehydrated Onion","Handmade"]'::jsonb, 'assets/images/pack_methi_mathri.svg', NULL, NULL, 'Flaky circular mathris kneaded with dehydrated sweet Marwari onions, kalonji, and crushed cumin.', 'Wheat Flour, Dehydrated Onion, Kalonji (Nigella), Cumin, Ghee, Rock Salt.', '{"energy":"510 kcal","fat":"28g","carbs":"52g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":119,"originalPrice":139},{"weight":"500 g","price":259,"originalPrice":290},{"weight":"1 kg","price":489,"originalPrice":539}]'::jsonb, true),
('p61', 'Meerav Methi Masala Khari Puff', 'mathri', '100-Layer Puff', 4.8, 290, 'Mild Herb (🌿)', '["100% Veg","Airy & Light","Pure Butter/Ghee"]'::jsonb, 'assets/images/pack_masala_karela.svg', NULL, NULL, 'Ultra-flaky layered puff biscuits seasoned with dried fenugreek leaves and desert rock salt. Ideal chai dip.', 'Refined Wheat Flour, Ghee, Kasuri Methi, Rock Salt.', '{"energy":"520 kcal","fat":"30g","carbs":"54g","protein":"8g"}'::jsonb, '[{"weight":"200 g","price":105,"originalPrice":125},{"weight":"500 g","price":229,"originalPrice":260},{"weight":"1 kg","price":429,"originalPrice":479}]'::jsonb, true),
('p62', 'Meerav Chana Masala Papdi', 'mathri', 'Chana Dal Base', 4.9, 330, 'Spicy Tangy (🌶️🌶️)', '["100% Veg","High Fiber","Pure Oil"]'::jsonb, 'assets/images/pack_methi_mathri.svg', NULL, NULL, 'Crispy flat papdis kneaded with roasted chickpea flour, red chili, and dry pomegranate seeds (anardana).', 'Chickpea Flour, Wheat Flour, Anardana Powder, Red Chili, Pure Oil, Salt.', '{"energy":"495 kcal","fat":"26g","carbs":"51g","protein":"13g"}'::jsonb, '[{"weight":"200 g","price":99,"originalPrice":119},{"weight":"500 g","price":219,"originalPrice":249},{"weight":"1 kg","price":419,"originalPrice":469}]'::jsonb, true),
('p63', 'Meerav Tikona Ajwain Mathri', 'mathri', 'Tri-Angle Cut', 4.8, 240, 'Ajwain Clove (🌶️)', '["100% Veg","Hand Folded","Pure Desi Ghee"]'::jsonb, 'assets/images/pack_masala_karela.svg', NULL, NULL, 'Hand-folded three-cornered flaky mathris spiked with whole clove studs and carom seeds.', 'Wheat Flour, Whole Clove (Laung), Ajwain, Desi Ghee, Sea Salt.', '{"energy":"505 kcal","fat":"28g","carbs":"53g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":115,"originalPrice":135},{"weight":"500 g","price":249,"originalPrice":280},{"weight":"1 kg","price":469,"originalPrice":519}]'::jsonb, true),
('p6', 'Meerav Roasted Himalayan Pink Salt Makhana', 'roasted-diet', 'Diet & Guilt-Free', 4.9, 240, 'Mild Pink Salt (🌿)', '["100% Veg","Gluten-Free","Roasted","Jain Friendly"]'::jsonb, 'assets/images/pack_makhana.svg', NULL, NULL, 'Jumbo fox-nuts slow-roasted in pure cow ghee and seasoned with organic Himalayan pink rock salt.', 'Lotus Seeds (Makhana), Pure Desi Cow Ghee, Himalayan Pink Salt, Black Pepper Extract.', '{"energy":"380 kcal","fat":"12g","carbs":"58g","protein":"10g"}'::jsonb, '[{"weight":"200 g","price":179,"originalPrice":199},{"weight":"500 g","price":399,"originalPrice":449},{"weight":"1 kg","price":759,"originalPrice":849}]'::jsonb, true),
('p11', 'Meerav Chana Jor Garam Tangy Crisps', 'roasted-diet', 'High Protein', 4.8, 310, 'Tangy Chaat Masala (🌶️🌶️)', '["100% Veg","Roasted","High Fiber","Vegan"]'::jsonb, 'assets/images/pack_chana_jor.svg', NULL, NULL, 'Flattened black Bengal gram slow-roasted to a golden crunch and tossed with tangy dry mango powder, rock salt, and green chilies.', 'Bengal Gram (Chana), Cold Pressed Mustard Oil Hint, Dry Mango Powder, Cumin, Black Salt, Red Chili.', '{"energy":"410 kcal","fat":"10g","carbs":"55g","protein":"22g"}'::jsonb, '[{"weight":"200 g","price":99,"originalPrice":120},{"weight":"500 g","price":229,"originalPrice":260},{"weight":"1 kg","price":429,"originalPrice":480}]'::jsonb, true),
('p32', 'Meerav Roasted Peri Peri Makhana', 'roasted-diet', 'Fiery Crunch', 4.9, 290, 'Zesty Peri Peri (🌶️🌶️🌶️)', '["100% Veg","Gluten-Free","Low Calorie"]'::jsonb, 'assets/images/pack_makhana.svg', NULL, NULL, 'Jumbo lotus foxnuts tossed with African Bird''s Eye chili, garlic powder, and tangy oregano herbs.', 'Foxnuts (Makhana), Desi Ghee, Peri Peri Seasoning, Paprika, Citric Salt.', '{"energy":"390 kcal","fat":"13g","carbs":"57g","protein":"10g"}'::jsonb, '[{"weight":"200 g","price":189,"originalPrice":210},{"weight":"500 g","price":419,"originalPrice":469},{"weight":"1 kg","price":799,"originalPrice":889}]'::jsonb, true),
('p33', 'Meerav Roasted Diet Poha Chivda', 'roasted-diet', 'Zero Oil Diet', 4.8, 340, 'Mild Turmeric (🌱)', '["100% Veg","Zero Deep Frying","Roasted"]'::jsonb, 'assets/images/pack_chana_jor.svg', NULL, NULL, 'Paper-thin beaten rice dry-roasted in hot sand and mixed with roasted peanuts, curry leaves, and green chilies.', 'Roasted Flattened Rice (Poha), Roasted Peanuts, Roasted Dal, Mustard Seeds, Curry Leaves, Turmeric.', '{"energy":"360 kcal","fat":"8g","carbs":"65g","protein":"9g"}'::jsonb, '[{"weight":"200 g","price":89,"originalPrice":109},{"weight":"500 g","price":199,"originalPrice":230},{"weight":"1 kg","price":379,"originalPrice":429}]'::jsonb, true),
('p34', 'Meerav Ghee-Roasted 5-Grain Mixture', 'roasted-diet', 'Superfood Medley', 5, 270, 'Savory Herb (🌿)', '["100% Veg","Multigrain","High Protein"]'::jsonb, 'assets/images/pack_makhana.svg', NULL, NULL, 'Roasted wheat, jowar, bajra, ragi, and puffed rice tossed in pure desi cow ghee and pink Himalayan rock salt.', 'Jowar, Bajra, Ragi Puffs, Roasted Wheat, Cow Ghee, Sendha Namak.', '{"energy":"375 kcal","fat":"9g","carbs":"62g","protein":"14g"}'::jsonb, '[{"weight":"200 g","price":145,"originalPrice":165},{"weight":"500 g","price":319,"originalPrice":359},{"weight":"1 kg","price":599,"originalPrice":669}]'::jsonb, true),
('p35', 'Meerav Roasted Salted Soybean Crisps', 'roasted-diet', '40% Protein', 4.7, 180, 'Light Salted (🧂)', '["100% Veg","Keto Friendly","High Protein"]'::jsonb, 'assets/images/pack_chana_jor.svg', NULL, NULL, 'Slow-roasted organic yellow soybeans seasoned with rock salt. Exceptional protein density for gym and fitness enthusiasts.', 'Organic Soybeans, Mustard Oil Hint, Sendha Namak.', '{"energy":"420 kcal","fat":"14g","carbs":"30g","protein":"38g"}'::jsonb, '[{"weight":"200 g","price":95,"originalPrice":115},{"weight":"500 g","price":215,"originalPrice":245},{"weight":"1 kg","price":399,"originalPrice":450}]'::jsonb, true),
('p36', 'Meerav Roasted Pumpkin & Flax Seed Crunch', 'roasted-diet', 'Omega-3 Rich', 4.9, 230, 'Chaat Masala (🌶️)', '["100% Veg","Omega-3","Raw Roasted"]'::jsonb, 'assets/images/pack_makhana.svg', NULL, NULL, 'Toasted pumpkin seeds, sunflower seeds, flax seeds, and chia seeds spiced with black salt and amchur.', 'Pumpkin Seeds, Flax Seeds, Sunflower Seeds, Chia Seeds, Sendha Namak, Cumin.', '{"energy":"510 kcal","fat":"35g","carbs":"22g","protein":"24g"}'::jsonb, '[{"weight":"200 g","price":199,"originalPrice":229},{"weight":"500 g","price":449,"originalPrice":499},{"weight":"1 kg","price":849,"originalPrice":949}]'::jsonb, true),
('p37', 'Meerav Roasted Mint Quinoa Puffs', 'roasted-diet', 'Ancient Grain', 4.8, 165, 'Cool Mint (🌿)', '["100% Veg","Gluten-Free","Low GI"]'::jsonb, 'assets/images/pack_chana_jor.svg', NULL, NULL, 'Puffed royal white quinoa roasted crisp and dusted with Himalayan rock salt and garden mint.', 'White Quinoa, Olive Oil Spray, Dried Mint, Black Salt.', '{"energy":"385 kcal","fat":"7g","carbs":"64g","protein":"13g"}'::jsonb, '[{"weight":"200 g","price":185,"originalPrice":210},{"weight":"500 g","price":399,"originalPrice":449},{"weight":"1 kg","price":769,"originalPrice":859}]'::jsonb, true),
('p38', 'Meerav Roasted Jowar Millet Puffs', 'roasted-diet', 'Desi Millet', 4.9, 280, 'Hing Jeera (🌶️)', '["100% Veg","Millet Power","Diabetic Friendly"]'::jsonb, 'assets/images/pack_makhana.svg', NULL, NULL, 'Light and airy popped sorghum (jowar) grains roasted with hing, cumin, and sea salt.', 'Popped Jowar (Sorghum), Cold Pressed Oil Spray, Hing, Roasted Cumin, Rock Salt.', '{"energy":"350 kcal","fat":"6g","carbs":"68g","protein":"11g"}'::jsonb, '[{"weight":"200 g","price":95,"originalPrice":115},{"weight":"500 g","price":215,"originalPrice":245},{"weight":"1 kg","price":399,"originalPrice":450}]'::jsonb, true),
('p64', 'Meerav Roasted Cheese & Herbs Makhana', 'roasted-diet', 'Cheddar & Herbs', 4.9, 340, 'Cheesy Herb (🧀)', '["100% Veg","Gluten-Free","Rich Calcium"]'::jsonb, 'assets/images/pack_makhana.svg', NULL, NULL, 'Ghee-roasted jumbo lotus foxnuts seasoned with organic cheddar cheese powder, oregano, and dried basil.', 'Foxnuts, Desi Ghee, Cheddar Cheese Powder, Oregano, Basil, Salt.', '{"energy":"410 kcal","fat":"15g","carbs":"54g","protein":"11g"}'::jsonb, '[{"weight":"200 g","price":199,"originalPrice":225},{"weight":"500 g","price":439,"originalPrice":489},{"weight":"1 kg","price":829,"originalPrice":919}]'::jsonb, true),
('p65', 'Meerav Roasted Moong Jor Tangy Crisps', 'roasted-diet', 'Flattened Moong', 4.8, 220, 'Tangy Chaat (🌶️🌶️)', '["100% Veg","High Protein","Vegan Roasted"]'::jsonb, 'assets/images/pack_chana_jor.svg', NULL, NULL, 'Whole green gram lentils pressed flat and roasted till crackling crisp. Tossed in lemon and black salt.', 'Whole Green Moong, Mustard Oil Hint, Black Salt, Lemon Powder, Red Chili.', '{"energy":"395 kcal","fat":"9g","carbs":"56g","protein":"24g"}'::jsonb, '[{"weight":"200 g","price":105,"originalPrice":125},{"weight":"500 g","price":229,"originalPrice":260},{"weight":"1 kg","price":429,"originalPrice":479}]'::jsonb, true),
('p66', 'Meerav Roasted Bajra Pearl Millet Puffs', 'roasted-diet', 'Iron Rich Bajra', 4.9, 270, 'Salt & Cumin (🧂)', '["100% Veg","Gluten-Free","Winter Superfood"]'::jsonb, 'assets/images/pack_makhana.svg', NULL, NULL, 'Popped Rajasthani pearl millet grains dry-roasted with Sendha Namak and crushed cumin seeds.', 'Popped Bajra (Pearl Millet), Mustard Oil Spray, Cumin, Rock Salt.', '{"energy":"365 kcal","fat":"8g","carbs":"63g","protein":"12g"}'::jsonb, '[{"weight":"200 g","price":95,"originalPrice":115},{"weight":"500 g","price":215,"originalPrice":245},{"weight":"1 kg","price":399,"originalPrice":450}]'::jsonb, true),
('p67', 'Meerav Roasted Ragi Finger Millet Crisps', 'roasted-diet', 'Calcium Power', 4.8, 190, 'Curry Leaf Masala (🌿)', '["100% Veg","Ragi Superfood","Zero Maida"]'::jsonb, 'assets/images/pack_chana_jor.svg', NULL, NULL, 'Roasted finger millet discs spiced with South Indian curry leaves, asafoetida, and sea salt.', 'Ragi Flour (Finger Millet), Rice Flour, Cold Pressed Oil, Curry Leaves, Salt.', '{"energy":"370 kcal","fat":"7g","carbs":"66g","protein":"10g"}'::jsonb, '[{"weight":"200 g","price":110,"originalPrice":130},{"weight":"500 g","price":239,"originalPrice":270},{"weight":"1 kg","price":449,"originalPrice":499}]'::jsonb, true),
('p68', 'Meerav Roasted Masala Wheat Flakes', 'roasted-diet', 'High Fiber', 4.7, 230, 'Tangy Mint (🌶️)', '["100% Veg","Sand Roasted","Digestive"]'::jsonb, 'assets/images/pack_makhana.svg', NULL, NULL, 'Whole wheat flakes dry-roasted in hot desert sand and seasoned with mint, amchur, and roasted cumin.', 'Whole Wheat Flakes, Mint, Cumin, Amchur, Black Salt.', '{"energy":"355 kcal","fat":"6g","carbs":"67g","protein":"12g"}'::jsonb, '[{"weight":"200 g","price":89,"originalPrice":109},{"weight":"500 g","price":199,"originalPrice":230},{"weight":"1 kg","price":379,"originalPrice":429}]'::jsonb, true),
('p69', 'Meerav Roasted Chia & Sesame Power Crunch', 'roasted-diet', 'Super Seed Mix', 5, 310, 'Light Chaat (🌿)', '["100% Veg","Keto Superfood","Raw Seeds"]'::jsonb, 'assets/images/pack_makhana.svg', NULL, NULL, 'Roasted organic chia seeds, brown sesame, sunflower seeds, and watermelon kernels tossed with Sendha Namak.', 'Chia Seeds, Sesame, Watermelon Seeds, Sunflower Seeds, Rock Salt.', '{"energy":"520 kcal","fat":"36g","carbs":"20g","protein":"23g"}'::jsonb, '[{"weight":"200 g","price":219,"originalPrice":249},{"weight":"500 g","price":489,"originalPrice":549},{"weight":"1 kg","price":929,"originalPrice":1049}]'::jsonb, true),
('p8', 'Meerav Grand Celebration Bikaneri Gift Box', 'sweets-combos', 'Luxury Gift Hamper', 5, 310, 'Assorted Royal Flavors', '["100% Veg","Gift Packaging","Assorted 6 Items"]'::jsonb, 'assets/images/pack_festive_box.svg', NULL, NULL, 'Royal packaging featuring Meerav Aloo Bhujia, Bikaneri Bhujia, Ratlami Sev, Kaju Mixture, Methi Mathri & Himalayan Makhana.', 'Assorted Bikaneri Savories, Whole Cashews, Ghee-Roasted Makhana in airtight keepsake gift box.', '{"energy":"Varies per snack","fat":"-","carbs":"-","protein":"-"}'::jsonb, '[{"weight":"1.2 kg Box","price":899,"originalPrice":1099},{"weight":"2.5 kg Grand Box","price":1699,"originalPrice":1999}]'::jsonb, true),
('p10', 'Meerav Bikaneri Spongy Rasgulla Tin', 'sweets-combos', 'Royal Sweet Tin', 5, 520, 'Cardamom Sweet (🍯)', '["100% Veg","Pure Cow Milk","No Preservatives"]'::jsonb, 'assets/images/pack_bikaneri_rasgulla.svg', NULL, NULL, 'Legendary melt-in-mouth spongy Rasgullas crafted from fresh cow milk chhena dipped in cardamom and saffron-infused sugar syrup.', 'Fresh Cow Milk Chhena, Sugar, Purified Water, Cardamom (Elaichi), Saffron (Kesar).', '{"energy":"260 kcal","fat":"4g","carbs":"52g","protein":"6g"}'::jsonb, '[{"weight":"1 kg Tin","price":299,"originalPrice":349},{"weight":"2 kg Family Pack","price":569,"originalPrice":669}]'::jsonb, true),
('p39', 'Meerav Desi Ghee Gulab Jamun Tin', 'sweets-combos', 'Desi Ghee Fried', 5, 480, 'Rose Cardamom (🍯)', '["100% Veg","Pure Desi Ghee","Fresh Mawa"]'::jsonb, 'assets/images/pack_bikaneri_rasgulla.svg', NULL, NULL, 'Rich khoya mawa dumplings deep-fried in pure desi cow ghee and steeped in fragrant rose and green cardamom syrup.', 'Fresh Mawa (Khoya), Pure Desi Cow Ghee, Sugar Syrup, Rose Water, Elaichi.', '{"energy":"340 kcal","fat":"14g","carbs":"48g","protein":"7g"}'::jsonb, '[{"weight":"1 kg Tin","price":349,"originalPrice":399},{"weight":"2 kg Family Pack","price":659,"originalPrice":749}]'::jsonb, true),
('p40', 'Meerav Traditional Bikaneri Soan Papdi', 'sweets-combos', 'Flaky Desi Ghee', 4.9, 390, 'Pistachio Almond (🍯)', '["100% Veg","Pure Desi Ghee","Flaky Texture"]'::jsonb, 'assets/images/pack_festive_box.svg', NULL, NULL, 'Feather-light, multi-layered flaky cubes of gram flour caramelized in pure desi ghee and topped with crunchy pistachios.', 'Gram Flour, Pure Desi Ghee, Sugar, Almonds, Pistachios, Green Cardamom.', '{"energy":"510 kcal","fat":"26g","carbs":"62g","protein":"6g"}'::jsonb, '[{"weight":"500 g Box","price":249,"originalPrice":289},{"weight":"1 kg Gift Pack","price":479,"originalPrice":549}]'::jsonb, true),
('p41', 'Meerav Royal Kaju Katli Keepsake Box', 'sweets-combos', 'Silver Foiled', 5, 620, 'Pure Cashew (🍯)', '["100% Veg","100% Goa Cashews","Silver Vark"]'::jsonb, 'assets/images/pack_festive_box.svg', NULL, NULL, 'Diamond-cut fudge made exclusively with Grade-A whole cashews and pure desi sugar. Embellished with pure vegetarian silver foil.', 'Whole Cashew Nuts (Kaju), Sugar, Purified Water, Pure Silver Foil (Vark).', '{"energy":"480 kcal","fat":"22g","carbs":"61g","protein":"10g"}'::jsonb, '[{"weight":"500 g Luxury Box","price":549,"originalPrice":629},{"weight":"1 kg Royal Box","price":1049,"originalPrice":1199}]'::jsonb, true),
('p42', 'Meerav Bikaneri Badaam Halwa Luxury Tin', 'sweets-combos', 'Almond Halwa', 5, 290, 'Saffron Almond (🍯)', '["100% Veg","Rich Almond Paste","Desi Ghee"]'::jsonb, 'assets/images/pack_bikaneri_rasgulla.svg', NULL, NULL, 'Rich dessert crafted from slow-cooked Mamra almond paste, pure desi cow ghee, milk, and saffron.', 'Almonds (Badaam), Pure Cow Ghee, Milk Solids, Saffron (Kesar), Sugar.', '{"energy":"540 kcal","fat":"32g","carbs":"48g","protein":"12g"}'::jsonb, '[{"weight":"500 g Tin","price":499,"originalPrice":579},{"weight":"1 kg Tin","price":949,"originalPrice":1099}]'::jsonb, true),
('p43', 'Meerav Shahi Dry Fruit Sugar-Free Laddu', 'sweets-combos', 'No Added Sugar', 4.9, 340, 'Date & Nut (🍯)', '["100% Veg","Sugar-Free","Natural Dates & Nuts"]'::jsonb, 'assets/images/pack_festive_box.svg', NULL, NULL, 'Healthy royal energy balls made with Arabian dates, roasted cashews, almonds, pistachios, and figs. 100% natural sweetness.', 'Dates (Khajoor), Dried Figs (Anjeer), Cashews, Almonds, Pistachios, Cow Ghee.', '{"energy":"460 kcal","fat":"24g","carbs":"52g","protein":"11g"}'::jsonb, '[{"weight":"500 g Box","price":599,"originalPrice":699},{"weight":"1 kg Gift Pack","price":1149,"originalPrice":1299}]'::jsonb, true),
('p44', 'Meerav Traditional Malai Ghewar', 'sweets-combos', 'Rajasthani Royal', 5, 410, 'Saffron Rabri (🍯)', '["100% Veg","Honeycomb Texture","Desi Ghee"]'::jsonb, 'assets/images/pack_festive_box.svg', NULL, NULL, 'Iconic disc-shaped Rajasthani honeycomb sweet fried in desi ghee, topped with thickened saffron rabri and slivered nuts.', 'Flour, Pure Desi Ghee, Saffron Rabri (Thickened Milk), Pistachios, Cardamom.', '{"energy":"490 kcal","fat":"26g","carbs":"58g","protein":"8g"}'::jsonb, '[{"weight":"500 g Disc","price":399,"originalPrice":459},{"weight":"1 kg Dual Box","price":769,"originalPrice":879}]'::jsonb, true),
('p45', 'Meerav Royal Rajbhog Saffron Tin', 'sweets-combos', 'King Sized Sweet', 5, 380, 'Kesar Pistachio (🍯)', '["100% Veg","Pure Cow Chhena","Kashmiri Saffron"]'::jsonb, 'assets/images/pack_bikaneri_rasgulla.svg', NULL, NULL, 'Jumbo saffron-infused cottage cheese dumplings stuffed with pistachio slivers and cardamom, steeped in aromatic sugar syrup.', 'Fresh Cow Milk Chhena, Saffron (Kesar), Pistachio Core, Sugar Syrup, Rose Essence.', '{"energy":"280 kcal","fat":"5g","carbs":"54g","protein":"7g"}'::jsonb, '[{"weight":"1 kg Tin","price":349,"originalPrice":399},{"weight":"2 kg Family Pack","price":659,"originalPrice":749}]'::jsonb, true),
('p70', 'Meerav Desi Ghee Besan Laddu Box', 'sweets-combos', 'Cardamom Ghee', 4.9, 430, 'Nutty Sweet (🍯)', '["100% Veg","Slow-Roasted Besan","Pure Desi Ghee"]'::jsonb, 'assets/images/pack_festive_box.svg', NULL, NULL, 'Golden spheres of coarsely ground gram flour roasted patiently in pure desi cow ghee with cardamom and almond crunch.', 'Gram Flour (Besan), Pure Desi Cow Ghee, Bura Sugar, Green Cardamom, Cashews.', '{"energy":"510 kcal","fat":"28g","carbs":"58g","protein":"9g"}'::jsonb, '[{"weight":"500 g Box","price":329,"originalPrice":379},{"weight":"1 kg Box","price":629,"originalPrice":719}]'::jsonb, true),
('p71', 'Meerav Royal Motichoor Laddu Box', 'sweets-combos', 'Fine Ghee Pearls', 5, 540, 'Saffron Rose (🍯)', '["100% Veg","Fine Gram Pearls","Pure Ghee"]'::jsonb, 'assets/images/pack_festive_box.svg', NULL, NULL, 'Melt-in-mouth royal laddus fashioned from micro gram flour boondi pearls drenched in saffron sugar syrup.', 'Besan, Pure Desi Ghee, Saffron, Rose Water, Magaz (Melon Seeds), Sugar.', '{"energy":"495 kcal","fat":"24g","carbs":"62g","protein":"7g"}'::jsonb, '[{"weight":"500 g Box","price":349,"originalPrice":399},{"weight":"1 kg Box","price":669,"originalPrice":759}]'::jsonb, true),
('p72', 'Meerav Bikaneri Pista Kesar Sandesh', 'sweets-combos', 'Fresh Chhena Fudge', 4.8, 310, 'Cardamom Saffron (🍯)', '["100% Veg","Fresh Cow Milk","No Chemicals"]'::jsonb, 'assets/images/pack_bikaneri_rasgulla.svg', NULL, NULL, 'Delicate Bengali-Rajasthani fudge created from kneaded fresh chhena, pistachio paste, and Kashmiri saffron.', 'Fresh Cow Milk Chhena, Saffron (Kesar), Pistachios, Sugar, Cardamom.', '{"energy":"320 kcal","fat":"11g","carbs":"46g","protein":"10g"}'::jsonb, '[{"weight":"500 g Box","price":389,"originalPrice":449},{"weight":"1 kg Box","price":749,"originalPrice":849}]'::jsonb, true),
('p73', 'Meerav Royal Dodha Barfi Luxury Box', 'sweets-combos', 'Caramel Milk Fudge', 4.9, 360, 'Caramel Nutty (🍯)', '["100% Veg","Slow Caramelized Milk","Rich Nuts"]'::jsonb, 'assets/images/pack_festive_box.svg', NULL, NULL, 'Dense, chewy caramelized milk fudge studded with sprouted wheat and loaded with toasted cashews and almonds.', 'Condensed Whole Milk, Sprouted Wheat Flour, Cashews, Almonds, Pure Ghee, Sugar.', '{"energy":"480 kcal","fat":"22g","carbs":"56g","protein":"11g"}'::jsonb, '[{"weight":"500 g Box","price":419,"originalPrice":479},{"weight":"1 kg Box","price":799,"originalPrice":899}]'::jsonb, true),
('p74', 'Meerav Moong Dal Halwa Keepsake Tin', 'sweets-combos', 'Royal Moong Halwa', 5, 460, 'Cardamom Desi Ghee (🍯)', '["100% Veg","Desi Ghee Roasted","Ready To Eat"]'::jsonb, 'assets/images/pack_bikaneri_rasgulla.svg', NULL, NULL, 'Legendary winter delicacy made by slow-roasting soaked moong dal paste in generous pure desi ghee and mawa.', 'Moong Dal Paste, Pure Desi Cow Ghee, Mawa, Sugar, Almonds, Saffron.', '{"energy":"560 kcal","fat":"34g","carbs":"52g","protein":"12g"}'::jsonb, '[{"weight":"500 g Tin","price":449,"originalPrice":519},{"weight":"1 kg Tin","price":859,"originalPrice":989}]'::jsonb, true),
('p75', 'Meerav Royal Imperial 4-Tin Hamper', 'sweets-combos', 'Velvet Gift Box', 5, 520, 'Assorted Royal Sweets & Savories', '["100% Veg","Luxury Velvet Box","4 Keepsake Tins"]'::jsonb, 'assets/images/pack_festive_box.svg', NULL, NULL, 'Imperial gift hamper with Rasgulla Tin (1kg), Gulab Jamun Tin (1kg), Kaju Mixture (500g), and Aloo Bhujia (500g).', 'Assorted Bikaneri Sweets and Savories packed in royal velvet gift casing.', '{"energy":"Varies per sweet","fat":"-","carbs":"-","protein":"-"}'::jsonb, '[{"weight":"3 kg Grand Hamper","price":2199,"originalPrice":2599},{"weight":"5 kg Imperial Hamper","price":3499,"originalPrice":3999}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    tag = EXCLUDED.tag,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    spice_level = EXCLUDED.spice_level,
    dietary = EXCLUDED.dietary,
    image = EXCLUDED.image,
    video = EXCLUDED.video,
    sample_image = EXCLUDED.sample_image,
    description = EXCLUDED.description,
    ingredients = EXCLUDED.ingredients,
    nutrition = EXCLUDED.nutrition,
    variants = EXCLUDED.variants,
    in_stock = EXCLUDED.in_stock;
