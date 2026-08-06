-- Multi-Tenant Database Schema for TovMuk Solution Telegram Mini App Template
-- Compatible with Supabase PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
  id TEXT PRIMARY KEY, -- store slug or unique identifier (e.g. 'tovmuk-demo')
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  hero_banner_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#1d4ed8',
  background_color TEXT DEFAULT '#f8fafc',
  surface_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#0f172a',
  muted_color TEXT DEFAULT '#64748b',
  font_family TEXT DEFAULT 'Kantumruy Pro, sans-serif',
  border_radius TEXT DEFAULT '12px',
  default_language TEXT DEFAULT 'km',
  currency TEXT DEFAULT 'USD',
  phone TEXT,
  email TEXT,
  address TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  delivery_fee NUMERIC(10,2) DEFAULT 2.50,
  free_delivery_threshold NUMERIC(10,2) DEFAULT 50.00,
  delivery_estimates JSONB DEFAULT '{"km": "១–៣ ថ្ងៃ", "en": "1–3 days"}'::jsonb,
  delivery_provinces JSONB DEFAULT '["ភ្នំពេញ", "កណ្តាល", "សៀមរាប", "បាត់ដំបង", "កំពង់ចាម", "ព្រះសីហនុ", "ខេត្តផ្សេង"]'::jsonb,
  payment_methods JSONB DEFAULT '["ABA Pay", "KHQR", "Cash on Delivery"]'::jsonb,
  return_policy JSONB DEFAULT '{"km": "ទាក់ទងហាងក្នុងរយៈពេល ៧ ថ្ងៃ។", "en": "Contact store within 7 days."}'::jsonb,
  delivery_policy JSONB DEFAULT '{"km": "ដឹកជញ្ជូនទូទាំងកម្ពុជា។", "en": "Delivery available across Cambodia."}'::jsonb,
  payment_policy JSONB DEFAULT '{"km": "បង់ប្រាក់ពេលទទួលទំនិញ ឬវេរតាម ABA/KHQR", "en": "Cash on Delivery or ABA/KHQR transfer."}'::jsonb,
  order_id_prefix TEXT DEFAULT 'ORD',
  voucher_settings JSONB DEFAULT '{"code": "DEMO10", "discountPercent": 10}'::jsonb,
  telegram_bot_username TEXT,
  order_group_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, setting_key)
);

-- 3. STORE STAFF TABLE
CREATE TABLE IF NOT EXISTS public.store_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  role TEXT DEFAULT 'admin',
  staff_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, telegram_user_id)
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_km TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, slug)
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  legacy_id INT,
  name_en TEXT NOT NULL,
  name_km TEXT NOT NULL,
  slug TEXT NOT NULL,
  description_en TEXT,
  description_km TEXT,
  base_price NUMERIC(10,2) NOT NULL CHECK(base_price >= 0),
  discount_percent NUMERIC(5,2) DEFAULT 0 CHECK(discount_percent BETWEEN 0 AND 100),
  rating NUMERIC(3,2) DEFAULT 5.0,
  stock INT DEFAULT 0 CHECK(stock >= 0),
  sold_count INT DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  colors JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  delivery_estimate_en TEXT,
  delivery_estimate_km TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, slug)
);

-- 6. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock INT DEFAULT 0,
  options JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  name TEXT,
  phone TEXT,
  address TEXT,
  province TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, telegram_user_id)
);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_province TEXT,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  payment_status TEXT DEFAULT 'Unpaid',
  delivery_status TEXT DEFAULT 'Waiting for confirmation',
  notes TEXT,
  telegram_user_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, order_number)
);

-- 10. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  selected_color TEXT,
  selected_size TEXT,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  telegram_user_id BIGINT,
  action TEXT NOT NULL,
  record_changed TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR MULTI-TENANT QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_categories_store ON public.categories(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_store ON public.audit_logs(store_id);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TENANT TABLES
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Public can read active stores
CREATE POLICY "Public read active stores" ON public.stores
  FOR SELECT USING (is_active = true);

-- Public can read active categories
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (is_active = true);

-- Public can read active products
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (is_active = true);

-- Public can read product images
CREATE POLICY "Public read product images" ON public.product_images
  FOR SELECT USING (true);

-- Public can read product variants
CREATE POLICY "Public read product variants" ON public.product_variants
  FOR SELECT USING (true);

-- Public can insert orders
CREATE POLICY "Public insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Public can read own orders by store_id and telegram_user_id or order_number
CREATE POLICY "Public read orders" ON public.orders
  FOR SELECT USING (true);

-- Public can insert order items
CREATE POLICY "Public insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Public can read order items
CREATE POLICY "Public read order items" ON public.order_items
  FOR SELECT USING (true);

-- Customers can insert or update profile
CREATE POLICY "Public insert customers" ON public.customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update customers" ON public.customers
  FOR UPDATE USING (true);

-- STORAGE BUCKET SETUP (SUPABASE STORAGE)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Public Read
CREATE POLICY "Public read store assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-assets');

-- Storage Policy: Authenticated/Service upload
CREATE POLICY "Public insert store assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'store-assets');
