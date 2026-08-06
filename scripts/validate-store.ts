import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jowlrfaxkpyhzajcbdah.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvd2xyZmF4a3B5aHphamNiZGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjY4MzUsImV4cCI6MjEwMDc0MjgzNX0.CoUnIeM50ecsNTOAkjJk_vfAKyZGhBpjEx2l1y0bPkg'
const storeSlug = process.env.VITE_STORE_SLUG || 'tovmuk-demo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function validate() {
  console.log('\n🔍 ===============================================')
  console.log('   TovMuk Solution — Store Validation Script')
  console.log('=============================================== \n')

  let hasErrors = false
  let hasWarnings = false

  console.log(`1. Checking Environment Variables...`)
  if (!process.env.VITE_SUPABASE_URL) {
    console.error('  ❌ VITE_SUPABASE_URL is missing')
    hasErrors = true
  } else {
    console.log('  ✅ VITE_SUPABASE_URL configured')
  }

  if (!process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('  ❌ VITE_SUPABASE_ANON_KEY is missing')
    hasErrors = true
  } else {
    console.log('  ✅ VITE_SUPABASE_ANON_KEY configured')
  }

  console.log(`  ℹ️ Active Store Slug: "${storeSlug}"`)

  console.log(`\n2. Connecting to Supabase Project...`)
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .single()

    if (error || !store) {
      console.warn(`  ⚠️ Notice: Active store slug "${storeSlug}" is not yet seeded in Supabase PostgreSQL database.`)
      console.warn(`  👉 Execute "supabase/migrations/20260806000000_multi_tenant_schema.sql" and "supabase/seed/seed.sql" in Supabase SQL Editor.`)
      hasWarnings = true
    } else {
      console.log(`  ✅ Store "${store.name}" verified in Supabase! (ID: ${store.id})`)

      if (!store.phone || store.phone.includes('000 000')) {
        console.warn('  ⚠️ Warning: Contact phone is using demo value.')
        hasWarnings = true
      }

      if (!store.telegram_bot_username || store.telegram_bot_username.includes('YourStoreBot')) {
        console.warn('  ⚠️ Warning: Telegram bot username is using demo value.')
        hasWarnings = true
      }

      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('store_id', storeSlug)

      console.log(`\n3. Checking Categories & Products...`)
      if (!categories || categories.length === 0) {
        console.warn('  ⚠️ Warning: No custom categories configured in Supabase.')
        hasWarnings = true
      } else {
        console.log(`  ✅ Found ${categories.length} categories for store "${storeSlug}".`)
      }

      const { data: products } = await supabase
        .from('products')
        .select('id, name_km')
        .eq('store_id', storeSlug)

      if (!products || products.length === 0) {
        console.warn('  ⚠️ Warning: No products created in database for this store.')
        hasWarnings = true
      } else {
        console.log(`  ✅ Found ${products.length} products in store database.`)
      }
    }
  } catch (err: any) {
    console.warn(`  ⚠️ Notice: Database connection fallback active: ${err.message}`)
    hasWarnings = true
  }

  console.log(`\n4. Checking Telegram Bot Tokens & Config...`)
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('  ⚠️ Warning: TELEGRAM_BOT_TOKEN is not set in local environment.')
    hasWarnings = true
  } else {
    console.log('  ✅ TELEGRAM_BOT_TOKEN configured.')
  }

  if (!process.env.TELEGRAM_ORDER_GROUP_ID) {
    console.warn('  ⚠️ Warning: TELEGRAM_ORDER_GROUP_ID is not set in local environment.')
    hasWarnings = true
  } else {
    console.log('  ✅ TELEGRAM_ORDER_GROUP_ID configured.')
  }

  console.log('\n===============================================')
  if (hasErrors) {
    console.error('❌ Validation Completed with ERRORS. Fix issues before deployment.')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️ Validation Passed with Notices/Warnings.')
    process.exit(0)
  } else {
    console.log('🎉 Store Validation Passed Cleanly! Ready for Production.')
    process.exit(0)
  }
}

validate().catch((err) => {
  console.error('Fatal Validation Error:', err)
  process.exit(1)
})
