-- Seed data for TovMuk Solution Demo Store

INSERT INTO public.stores (
  id, slug, name, short_name, description, logo_url, favicon_url, hero_banner_url,
  primary_color, secondary_color, background_color, surface_color, text_color, muted_color,
  font_family, border_radius, default_language, currency, phone, email, address,
  social_links, delivery_fee, free_delivery_threshold, delivery_estimates, delivery_provinces,
  payment_methods, return_policy, delivery_policy, payment_policy, order_id_prefix,
  voucher_settings, telegram_bot_username, order_group_id, is_active
) VALUES (
  'tovmuk-demo',
  'tovmuk-demo',
  'TovMuk Store',
  'TovMuk',
  'A reusable white-label Telegram Mini App storefront template by TovMuk Solution.',
  '/branding/demo-logo.png',
  '/branding/demo-logo.png',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
  '#2563eb',
  '#1d4ed8',
  '#f8fafc',
  '#ffffff',
  '#0f172a',
  '#64748b',
  'Kantumruy Pro, sans-serif',
  '12px',
  'km',
  'USD',
  '+855 12 345 678',
  'contact@tovmuk.com',
  'Phnom Penh, Cambodia',
  '{"facebook": "https://facebook.com/tovmuk", "instagram": "https://instagram.com/tovmuk", "tiktok": "https://tiktok.com/@tovmuk"}'::jsonb,
  2.50,
  50.00,
  '{"km": "១–៣ ថ្ងៃ", "en": "1–3 days"}'::jsonb,
  '["ភ្នំពេញ", "កណ្តាល", "សៀមរាប", "បាត់ដំបង", "កំពង់ចាម", "ព្រះសីហនុ", "ខេត្តផ្សេង"]'::jsonb,
  '["ABA Pay", "KHQR", "Cash on Delivery"]'::jsonb,
  '{"km": "ទាក់ទងហាងក្នុងរយៈពេល ៧ ថ្ងៃ។", "en": "Contact store within 7 days."}'::jsonb,
  '{"km": "ដឹកជញ្ជូនទូទាំងកម្ពុជា។", "en": "Delivery available across Cambodia."}'::jsonb,
  '{"km": "បង់ប្រាក់ពេលទទួលទំនិញ ឬ ABA/KHQR", "en": "Cash on Delivery or ABA/KHQR."}'::jsonb,
  'TOV',
  '{"code": "TOVMUK10", "discountPercent": 10}'::jsonb,
  '@TovMukStoreBot',
  '-100123456789',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = EXCLUDED.description;

-- Insert Categories
INSERT INTO public.categories (id, store_id, name_en, name_km, slug, icon, sort_order, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'tovmuk-demo', 'Electronics', 'អេឡិចត្រូនិក', 'electronics', '📱', 1, true),
  ('c2000000-0000-0000-0000-000000000002', 'tovmuk-demo', 'Accessories', 'គ្រឿងបន្លាស់', 'accessories', '🎧', 2, true),
  ('c3000000-0000-0000-0000-000000000003', 'tovmuk-demo', 'Fashion', 'សម្លៀកបំពាក់', 'fashion', '👕', 3, true),
  ('c4000000-0000-0000-0000-000000000004', 'tovmuk-demo', 'Lifestyle', 'រៀបចំការរស់នៅ', 'lifestyle', '☕', 4, true)
ON CONFLICT (store_id, slug) DO NOTHING;

-- Insert Products
INSERT INTO public.products (
  id, store_id, category_id, name_en, name_km, slug, description_en, description_km,
  base_price, discount_percent, rating, stock, sold_count, is_new, is_bestseller, is_active,
  colors, sizes, delivery_estimate_en, delivery_estimate_km
) VALUES
(
  'p1000000-0000-0000-0000-000000000001',
  'tovmuk-demo',
  'c1000000-0000-0000-0000-000000000001',
  'Wireless Noise-Canceling Headphones',
  'កាសឥតខ្សែទប់សំឡេងរំខាន',
  'wireless-noise-canceling-headphones',
  'High-fidelity acoustic audio with active noise cancellation and 30-hour battery life.',
  'សំឡេងច្បាស់ល្អ ការពារសំឡេងរំខាន ថ្មកាន់បាន ៣០ ម៉ោង។',
  149.00,
  15.00,
  4.9,
  25,
  120,
  true,
  true,
  true,
  '["#000000", "#ffffff", "#3b82f6"]'::jsonb,
  '["Standard"]'::jsonb,
  '1-2 days',
  '១-២ ថ្ងៃ'
),
(
  'p2000000-0000-0000-0000-000000000002',
  'tovmuk-demo',
  'c1000000-0000-0000-0000-000000000001',
  'Smart Fitness Watch Ultra',
  'នាឡិកាសុខភាពឆ្លាតវៃ',
  'smart-fitness-watch-ultra',
  'Heart rate monitor, GPS tracking, water resistant up to 50m with AMOLED display.',
  'វាស់ចង្វាក់បេះដូង ទីតាំង GPS ការពារទឹក ៥០ម៉ែត្រ អេក្រង់ច្បាស់ AMOLED។',
  89.00,
  10.00,
  4.8,
  40,
  85,
  false,
  true,
  true,
  '["#000000", "#ef4444", "#10b981"]'::jsonb,
  '["40mm", "44mm"]'::jsonb,
  '1-2 days',
  '១-២ ថ្ងៃ'
),
(
  'p3000000-0000-0000-0000-000000000003',
  'tovmuk-demo',
  'c2000000-0000-0000-0000-000000000002',
  'Minimalist Leather Backpack',
  'កាបូបស្ពាយខ្នងស្បែក',
  'minimalist-leather-backpack',
  'Premium water-resistant synthetic leather backpack with dedicated 15-inch laptop compartment.',
  'ស្បែកគុណភាពខ្ពស់ មិនជ្រាបទឹក មានប្រឡោះដាក់ Laptop ១៥ អ៊ីញ។',
  59.00,
  0.00,
  4.7,
  18,
  45,
  true,
  false,
  true,
  '["#78350f", "#000000"]'::jsonb,
  '["Standard"]'::jsonb,
  '2-3 days',
  '២-៣ ថ្ងៃ'
),
(
  'p4000000-0000-0000-0000-000000000004',
  'tovmuk-demo',
  'c4000000-0000-0000-0000-000000000004',
  'Insulated Thermal Coffee Mug 500ml',
  'កែវកាហ្វេរក្សាកម្តៅ 500ml',
  'insulated-thermal-coffee-mug-500ml',
  'Double-wall stainless steel thermal mug keeping drinks hot for 12 hours or cold for 24 hours.',
  'រក្សាកម្តៅបាន ១២ ម៉ោង និងត្រជាក់បាន ២៤ ម៉ោង ធ្វើពីដែកអ៊ីណុកគុណភាពខ្ពស់។',
  19.50,
  5.00,
  4.9,
  60,
  210,
  false,
  true,
  true,
  '["#000000", "#10b981", "#f59e0b"]'::jsonb,
  '["500ml"]'::jsonb,
  '1-2 days',
  '១-២ ថ្ងៃ'
)
ON CONFLICT (store_id, slug) DO NOTHING;

-- Insert Product Images
INSERT INTO public.product_images (store_id, product_id, url, sort_order) VALUES
  ('tovmuk-demo', 'p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 1),
  ('tovmuk-demo', 'p2000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 1),
  ('tovmuk-demo', 'p3000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 1),
  ('tovmuk-demo', 'p4000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800', 1)
ON CONFLICT DO NOTHING;
