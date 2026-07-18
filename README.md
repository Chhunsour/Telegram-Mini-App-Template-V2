# Telegram Mini App Store Template

Reusable Vue 3 + Telegram Bot storefront with a SQLite product catalog, cart, Cash on Delivery checkout, private-group order management, and staff product editing.

Start with [TEMPLATE_SETUP.md](./TEMPLATE_SETUP.md).

```bash
npm install
cp .env.example .env
npm run api
npm run dev
```

Checks:

```bash
npm run type-check
npm run bot:check
npm run build
```

Use `npm run api` for a secret-free catalog preview. After configuring Telegram in `.env`, replace it with `npm run bot` to enable checkout and group commands.
