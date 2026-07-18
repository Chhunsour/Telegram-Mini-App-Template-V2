# New Customer Setup

This folder is independent from the original shop. Customize the files below, create a new `.env`, then start the frontend and bot.

## Files to edit

### `src/config/store.config.ts`

Edit:

- Store name, short name, description
- Order ID prefix and demo voucher settings
- Logo and favicon paths
- Default language (`km` or `en`)
- Currency (`USD` or `KHR`)
- Phone, email, and address
- Delivery fee, free-delivery threshold, estimates, and provinces
- Demo checkout customer values
- Telegram bot username
- Facebook, Instagram, and TikTok links
- Delivery, return, and payment policies

The numeric Telegram order-group ID stays in `.env`, because it is a server deployment setting.

### `src/config/theme.config.ts`

Replace primary, secondary, background, surface, text, and muted colors.

### `src/config/products.ts`

Replace the demo categories and products. Each product includes its ID, slug, name, base price, discount percentage, images, category, stock, colors, sizes, description, and delivery estimate.

Product configuration seeds SQLite only on the first run. Telegram `/editproduct` changes the database afterward. For a completely new customer, start without `.data/store.sqlite` so the new seed is imported.

### `src/config/translations.ts`

Edit the Khmer and English hero text, checkout text, customer messages, and bot copy. Set the active language in `store.config.ts`.

### `src/assets/branding/` and `public/branding/`

Replace the source branding files and the public logo used by the Mini App and Telegram bot. Keep the public path in `store.config.ts` synchronized with the replacement file.

### `.env`

Copy `.env.example` to `.env`, then set:

- `TELEGRAM_BOT_TOKEN` — token from BotFather
- `TELEGRAM_ORDER_GROUP_ID` — numeric private-group ID, not an invite link
- `AUTHORIZED_STAFF_IDS` — comma-separated Telegram user IDs allowed to edit products
- `MINI_APP_URL` — public HTTPS Mini App URL
- `BOT_PORT` — local bot/API port, normally `8787`

The frontend never reads the bot token or group ID.

## Telegram setup

1. Create or select the customer's bot in BotFather.
2. Add the bot to the private order group and make it an admin.
3. Run the bot and send `/groupid` inside the group if you need the numeric group ID.
4. Put the ID in `.env`.
5. Put authorized staff user IDs in `AUTHORIZED_STAFF_IDS`.
6. Use `/products`, `/editproduct`, and `/cancel` from the private group.

## Customization checklist

- [ ] Replace store name and description
- [ ] Replace logo and favicon
- [ ] Replace primary and secondary colors
- [ ] Replace phone, email, and address
- [ ] Select currency
- [ ] Set delivery fee, threshold, and estimates
- [ ] Replace categories
- [ ] Replace every demo product
- [ ] Check product prices and discounts
- [ ] Replace every product image
- [ ] Review Khmer translations
- [ ] Review English translations
- [ ] Customize checkout text
- [ ] Replace Telegram bot username
- [ ] Set Telegram bot token in `.env`
- [ ] Set numeric order-group ID in `.env`
- [ ] Set authorized staff IDs in `.env`
- [ ] Replace social media links
- [ ] Replace store policies
- [ ] Set the public HTTPS Mini App URL

## Install and verify

```bash
npm install
cp .env.example .env
npm run type-check
npm run bot:check
npm run build
```

Development uses two processes:

```bash
npm run dev
npm run bot
```

For a catalog-only preview before Telegram is configured, run `npm run api` instead of `npm run bot`.

The Vite server proxies `/api/products` and `/api/orders` to the bot/API server on port `8787`.
