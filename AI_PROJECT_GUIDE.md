# AI Project Guide — TovMuk Solution Telegram Mini App Template

This guide provides instructions for future AI coding agents working on client storefronts built with this template.

---

## 1. Business Purpose & Core Concept

This repository is a production-ready, white-label, multi-tenant Telegram Mini App storefront template designed by **TovMuk Solution**.
It allows creating and hosting online stores for multiple client businesses using a single codebase and a shared Supabase PostgreSQL database.

---

## 2. Multi-Tenant Architectural Rules

1. **Shared Database**: All client stores share the same Supabase PostgreSQL project (`https://jowlrfaxkpyhzajcbdah.supabase.co`).
2. **Tenant Isolation**: Every database table record (`categories`, `products`, `orders`, `customers`, etc.) **MUST** have a `store_id` matching the store's slug or unique ID.
3. **No Hardcoded Secrets**: Never commit bot tokens, service-role keys, or private group IDs to Git.
4. **Environment Store Resolution**: Each deployed app instance resolves its active store via:
   ```env
   VITE_STORE_SLUG=client-store-slug
   ```
5. **No Tenant Leakage**: Row Level Security (RLS) policies prevent one store from accessing or modifying another store's records or assets.

---

## 3. Core Logic vs. Client-Specific Configuration

| Component | File / Location | Description | Reusable or Client-Specific? |
|---|---|---|---|
| Supabase Client | `src/core/supabase/client.ts` | Base API connection | Reusable Core |
| Store API Service | `src/core/api/storeApi.ts` | Multi-tenant fetchers & orders | Reusable Core |
| Auth & Telegram Init | `src/core/auth/telegramAuth.ts` | HMAC check & user extraction | Reusable Core |
| Store Branding Defaults | `src/config/store.config.ts` | Local fallback configuration | Client Config / Fallback |
| Theme Styles | `src/assets/styles/main.css` | Dynamic CSS token variables | Reusable Core |
| Telegram Bot Service | `server/bot.mjs` | Webhook & Polling staff manager | Reusable Core |
| Database Schema | `supabase/migrations/*.sql` | PostgreSQL Multi-tenant tables | Reusable Core |
| Store Creation CLI | `scripts/create-store.ts` | `npm run store:create` | Reusable Tool |
| Store Validation CLI | `scripts/validate-store.ts` | `npm run store:validate` | Reusable Tool |

---

## 4. Safety Guardrails for AI Agents

- 🛑 **DO NOT** delete `store_id` columns or disable Row Level Security (RLS) policies.
- 🛑 **DO NOT** expose Supabase service-role keys in frontend code.
- 🛑 **DO NOT** replace responsive layouts with mobile-only wrapped frames on desktop.
- 🛑 **DO NOT** hardcode client product catalogs or names inside core components like `ProductGrid.vue` or `AppHeader.vue`.
- 🛑 **DO** verify build and type-checking before finalizing work:
  ```bash
  npm run type-check
  npm run bot:check
  npm run store:validate
  npm run build
  ```
