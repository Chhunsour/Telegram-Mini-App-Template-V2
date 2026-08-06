# System Architecture — TovMuk Solution Storefront Template

## High-Level System Architecture

```
+-----------------------------------------------------------------------+
|                            USER CLIENT                                |
|  Telegram Mini App (Mobile) / Browser (Mobile & Desktop Web)          |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|                         FRONTEND (Vue 3 + Vite)                        |
|  - Pinia Stores (Showcase, Cart, Orders)                              |
|  - Dynamic Theme Token Injector (--brand, --brand-dark, fonts)        |
|  - Responsive Mobile BottomNav & Desktop Topbar                       |
+-----------------------------------+-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------+-----------------------+   +-------------------+-----------+
|    SUPABASE POSTGRESQL (Shared)   |   |   TELEGRAM BOT SERVICE (Node) |
|  - Multi-tenant Schema (store_id) |   |  - Webhook / Long-polling     |
|  - Row Level Security (RLS)       |   |  - HMAC initData Validation   |
|  - Storage: stores/{store_id}/... |   |  - Staff Bot Commands & Flow  |
+-----------------------------------+   +-------------------+-----------+
                                                            |
                                                            v
                                                +-----------+-----------+
                                                | TELEGRAM ORDER GROUP  |
                                                | Private Staff Group   |
                                                +-----------------------+
```

---

## Data Models & Schema Overview

- **`stores`**: Master table containing store slug, name, branding colors, fonts, policies, currency, contact info, and bot username.
- **`store_staff`**: Maps Telegram User IDs to authorized admin/staff roles for specific stores.
- **`categories`**: Localized category hierarchy (`name_km`, `name_en`, `icon`, `sort_order`).
- **`products`**: Multi-currency, localized product catalog with pricing, stock, discounts, colors, sizes, and active flags.
- **`product_images`**: Associated image URLs organized by store and product.
- **`orders` & `order_items`**: Customer checkout records containing items, prices, delivery details, and order status.
- **`audit_logs`**: Complete audit trial for all staff management actions.

---

## Responsive Layout Strategy

- **Mobile View (< 768px)**:
  - Mobile-first Telegram Mini App styling with bottom navigation bar.
  - Sticky cart and checkout CTA buttons.
  - Safe-area insets (`env(safe-area-inset-bottom)`).
  - Compact single/double column touch-friendly product grid.

- **Desktop View (>= 768px)**:
  - Desktop header with logo, search bar, language toggle (`KM` / `EN`), and cart summary button.
  - Category filter sidebar on catalog pages.
  - 3 to 4 column wide product grid.
  - Desktop split checkout layout with customer details on left and fixed summary panel on right.
