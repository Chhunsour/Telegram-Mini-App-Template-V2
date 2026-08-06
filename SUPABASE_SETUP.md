# Supabase Configuration & Migration Guide

## Shared Supabase Project

```env
VITE_SUPABASE_URL=https://jowlrfaxkpyhzajcbdah.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvd2xyZmF4a3B5aHphamNiZGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjY4MzUsImV4cCI6MjEwMDc0MjgzNX0.CoUnIeM50ecsNTOAkjJk_vfAKyZGhBpjEx2l1y0bPkg
```

---

## SQL Migrations & Schema Setup

The repository contains SQL migrations located in:

- Migration SQL: `supabase/migrations/20260806000000_multi_tenant_schema.sql`
- Seed SQL: `supabase/seed/seed.sql`

To apply schema changes to Supabase:
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/jowlrfaxkpyhzajcbdah/sql).
2. Copy and run `20260806000000_multi_tenant_schema.sql`.
3. Optionally run `seed.sql` to populate initial demo store data.

---

## Storage Buckets & Policies

1. Storage Bucket: `store-assets` (Public).
2. Folder Structure:
   ```text
   stores/{store_id}/branding/
   stores/{store_id}/products/
   stores/{store_id}/categories/
   ```
3. Storage RLS Policies:
   - Public read access on `store-assets`.
   - Insert access restricted to service-role / authenticated staff.
