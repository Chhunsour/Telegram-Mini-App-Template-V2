# Production Deployment Guide — TovMuk Solution

This guide outlines deployment of the Vue 3 Telegram Mini App frontend and Node.js Bot Service.

---

## 1. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

1. Push your repository to GitHub/GitLab.
2. Import project into Vercel or Netlify.
3. Configure Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables:
   ```env
   VITE_SUPABASE_URL=https://jowlrfaxkpyhzajcbdah.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
   VITE_STORE_SLUG=client-store-slug
   ```

---

## 2. Telegram Bot Service Deployment

### Option A: Background Node.js Process (Render / Railway / VPS)
- **Start Command**: `npm run bot`
- **Environment Variables**:
  ```env
  TELEGRAM_BOT_TOKEN=8422414802:AAHtXUqbXFJ0f_FQyT1yC77n1GDEiF-sTQo
  AUTHORIZED_STAFF_IDS=123456789
  VITE_STORE_SLUG=client-store-slug
  MINI_APP_URL=https://client-app.vercel.app
  ```

### Option B: Serverless Webhook Deployment (Vercel API / Serverless)
1. Deploy `server/bot.mjs` endpoint to `/api/bot-webhook`.
2. Configure Telegram Webhook URL:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<your-domain>/api/bot-webhook"
   ```

---

## 3. Post-Deployment Verification Checklist

1. Run TypeScript check: `npm run type-check`
2. Run Bot self-test check: `npm run bot:check`
3. Run Store validation check: `npm run store:validate`
4. Connect private order group via `/connectstore` in Telegram group.
5. Place test order via Mini App and confirm order notification in Telegram group.
