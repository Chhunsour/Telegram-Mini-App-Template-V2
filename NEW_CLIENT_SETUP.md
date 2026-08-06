# New Client Setup Guide — TovMuk Solution

Follow this step-by-step guide to onboard a new client store using automated tooling, Telegram bot group binding, and Supabase multi-tenancy.

---

## Step 1: Run Interactive Store Creation CLI

Run the automated store creation command:

```bash
npm run store:create
```

The CLI will prompt you for:
1. Store Name (e.g. `Angkor Coffee Shop`)
2. Store Slug (e.g. `angkor-coffee`)
3. Currency (`USD` or `KHR`)
4. Contact Phone, Email, and Address
5. Telegram Bot Username (e.g. `@AngkorCoffeeBot`)
6. Brand Colors & Theme Settings
7. Store Owner Telegram User ID

The script seeds the tenant record in Supabase PostgreSQL automatically.

---

## Step 2: Configure Environment Variables

For the client's frontend instance:

```env
VITE_SUPABASE_URL=https://jowlrfaxkpyhzajcbdah.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
VITE_STORE_SLUG=angkor-coffee
```

For the server and bot process:

```env
TELEGRAM_BOT_TOKEN=8422414802:AAHtXUqbXFJ0f_FQyT1yC77n1GDEiF-sTQo
AUTHORIZED_STAFF_IDS=123456789,987654321
MINI_APP_URL=https://angkor-coffee.tovmuk.com
```

---

## Step 3: Connect Telegram Bot to Order Group

1. Create a private Telegram Order Group for client staff.
2. Add your Bot to the group and make it an **Administrator**.
3. Inside the group, run:
   ```text
   /connectstore angkor-coffee
   ```
4. Confirm connection prompt. The bot automatically updates `stores.order_group_id` in Supabase PostgreSQL and logs an audit entry.

---

## Step 4: Validate Store Setup

Run the automated validation check to verify database connection, environment settings, categories, and bot authorization:

```bash
npm run store:validate
```

Ensure all checks pass cleanly before handing off to client.
