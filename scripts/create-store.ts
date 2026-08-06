import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import * as readline from 'readline'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jowlrfaxkpyhzajcbdah.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvd2xyZmF4a3B5aHphamNiZGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjY4MzUsImV4cCI6MjEwMDc0MjgzNX0.CoUnIeM50ecsNTOAkjJk_vfAKyZGhBpjEx2l1y0bPkg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question: string, defaultValue: string = ''): Promise<string> {
  return new Promise((resolve) => {
    const promptText = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `
    rl.question(promptText, (answer) => {
      resolve(answer.trim() || defaultValue)
    })
  })
}

async function main() {
  console.log('\n🏬 ===============================================')
  console.log('   TovMuk Solution — New Tenant Store Setup CLI')
  console.log('=============================================== \n')

  const name = await ask('Store Name', 'Angkor Coffee Shop')
  const slugDefault = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'client-store'
  const slug = await ask('Store Slug (identifier)', slugDefault)
  const shortName = await ask('Short Name', name.split(' ')[0])
  const currency = await ask('Currency (USD or KHR)', 'USD')
  const phone = await ask('Contact Phone Number', '+855 12 000 000')
  const email = await ask('Contact Email', 'hello@clientstore.com')
  const address = await ask('Store Address', 'Phnom Penh, Cambodia')
  const botUsername = await ask('Telegram Bot Username', '@ClientStoreBot')
  const primaryColor = await ask('Primary Color Hex', '#2563eb')
  const adminStaffId = await ask('Admin Telegram User ID (numeric)', '123456789')

  console.log('\n⏳ Creating store in Supabase...')

  const { data: newStore, error } = await supabase
    .from('stores')
    .insert({
      id: slug,
      slug,
      name,
      short_name: shortName,
      currency,
      phone,
      email,
      address,
      telegram_bot_username: botUsername,
      primary_color: primaryColor,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('\n❌ Failed to insert store into Supabase:', error.message)
    rl.close()
    process.exit(1)
  }

  // Insert initial admin staff
  if (adminStaffId && /^\d+$/.test(adminStaffId)) {
    await supabase.from('store_staff').insert({
      store_id: slug,
      telegram_user_id: parseInt(adminStaffId, 10),
      role: 'admin',
      staff_name: 'Store Owner',
    })
  }

  // Insert default categories
  await supabase.from('categories').insert([
    { store_id: slug, name_en: 'Featured', name_km: 'ទំនិញពិសេស', slug: 'featured', icon: '⭐', sort_order: 1 },
    { store_id: slug, name_en: 'New Arrivals', name_km: 'ទំនិញទើបមកដល់', slug: 'new-arrivals', icon: '🔥', sort_order: 2 },
  ])

  console.log('\n🎉 Store Tenant Successfully Created!')
  console.log('-----------------------------------------------')
  console.log(`Store ID / Slug: ${newStore.slug}`)
  console.log(`Store Name:      ${newStore.name}`)
  console.log(`Bot Username:    ${newStore.telegram_bot_username}`)
  console.log('-----------------------------------------------\n')

  console.log('📌 Next step: Set your deployment environment variable:')
  console.log(`\n  VITE_STORE_SLUG=${newStore.slug}\n`)

  rl.close()
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err)
  rl.close()
  process.exit(1)
})
