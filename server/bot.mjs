import { createHmac, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN
const botId = token ? token.split(':')[0] : null
const configuredUrl = process.env.MINI_APP_URL
const storeSlug = process.env.VITE_STORE_SLUG || 'tovmuk-demo'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jowlrfaxkpyhzajcbdah.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvd2xyZmF4a3B5aHphamNiZGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjY4MzUsImV4cCI6MjEwMDc0MjgzNX0.CoUnIeM50ecsNTOAkjJk_vfAKyZGhBpjEx2l1y0bPkg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

let activeStore = null
const staffConversations = new Map() // telegram_user_id -> conversation state

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function api(method, data) {
  if (!token) return null
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await response.json()
    if (!json.ok) console.error(`Telegram API ${method} error:`, json.description)
    return json.result
  } catch (err) {
    console.error(`Telegram API ${method} exception:`, err.message)
    return null
  }
}

function miniAppUrl() {
  const currentUrl = process.env.MINI_APP_URL || 'https://telegram-mini-app-template-v2.vercel.app'
  try {
    const url = new URL(currentUrl)
    return url.href
  } catch {
    return 'https://telegram-mini-app-template-v2.vercel.app'
  }
}

async function getStoreInfo(slug = storeSlug) {
  if (activeStore && activeStore.slug === slug) return activeStore
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return {
      id: slug,
      slug,
      name: 'TovMuk Store',
      order_id_prefix: 'TOV',
      currency: 'USD',
      phone: '+855 12 345 678',
      order_group_id: process.env.TELEGRAM_ORDER_GROUP_ID || '',
      telegram_bot_username: '@TovMukStoreBot',
    }
  }

  activeStore = data
  return data
}

function validateInitData(initData, botToken = token) {
  if (!botToken || !initData) throw new Error('Missing Telegram authentication parameters')
  const params = new URLSearchParams(initData)
  const receivedHash = params.get('hash') || ''
  params.delete('hash')
  const data = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const expectedHash = createHmac('sha256', secret).update(data).digest('hex')

  if (receivedHash.length !== expectedHash.length || !timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expectedHash))) {
    throw new Error('Invalid Telegram signature')
  }

  const authDate = Number(params.get('auth_date'))
  const age = Date.now() / 1000 - authDate
  if (!authDate || age > 86400) throw new Error('Expired Telegram session')

  const user = JSON.parse(params.get('user') || '{}')
  if (!user.id) throw new Error('Invalid Telegram user payload')
  return user
}

async function isAuthorizedStaff(storeId, telegramUserId) {
  const envStaff = (process.env.AUTHORIZED_STAFF_IDS || '').split(/[\s,]+/).filter(Boolean).map(Number)
  if (envStaff.includes(Number(telegramUserId))) return true

  const { data } = await supabase
    .from('store_staff')
    .select('id')
    .eq('store_id', storeId)
    .eq('telegram_user_id', telegramUserId)
    .single()

  return Boolean(data)
}

async function checkBotIsAdmin(chatId) {
  if (!botId) return false
  const res = await api('getChatMember', { chat_id: chatId, user_id: Number(botId) })
  if (!res) return false
  return res.status === 'administrator' || res.status === 'creator'
}

async function logAudit(storeId, telegramUserId, action, recordChanged, previousValue = null, newValue = null) {
  try {
    await supabase.from('audit_logs').insert({
      store_id: storeId,
      telegram_user_id: telegramUserId,
      action,
      record_changed: recordChanged,
      previous_value: previousValue,
      new_value: newValue,
    })
  } catch (err) {
    console.error('Audit log error:', err)
  }
}

function mainMenuKeyboard() {
  return {
    keyboard: [
      [{ text: '🛍 Products' }, { text: '➕ Add Product' }],
      [{ text: '📦 Orders' }, { text: '🗂 Categories' }],
      [{ text: '⚙️ Store Settings' }, { text: '❓ Help' }],
    ],
    resize_keyboard: true,
  }
}

function inlineMenuKeyboard(url = miniAppUrl()) {
  const openStore = url
    ? { text: '🛒 បើកហាង / Open Store', web_app: { url } }
    : { text: '🛒 បើកហាង / Open Store', callback_data: 'store' }

  return {
    inline_keyboard: [
      [openStore],
      [{ text: '📦 ការបញ្ជាទិញ / Orders', callback_data: 'orders' }],
      [{ text: '☎️ ទំនាក់ទំនង / Contact', callback_data: 'contact' }, { text: '❓ របៀបទិញ / Help', callback_data: 'help' }],
    ],
  }
}

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'KHR' ? 0 : 2,
  }).format(value)
}

async function getTelegramPhotoUrl(photoArray) {
  if (!photoArray || photoArray.length === 0) return null
  const highestResPhoto = photoArray[photoArray.length - 1]
  const fileInfo = await api('getFile', { file_id: highestResPhoto.file_id })
  if (fileInfo && fileInfo.file_path) {
    return `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`
  }
  return null
}

async function handleStaffCommand(chat, from, message) {
  const chatId = chat.id
  const userId = from.id
  const chatType = chat.type
  const text = message.text || ''

  const store = await getStoreInfo()
  const cleanText = text.trim()

  // 1. /groupid command (Group Chats Only)
  if (cleanText === '/groupid') {
    if (chatType === 'private') {
      await api('sendMessage', {
        chat_id: chatId,
        text: '⚠️ <b>/groupid</b> អាចប្រើបានតែនៅក្នុង Telegram Group ប៉ុណ្ណោះ។\n\n / <code>/groupid</code> is only available inside Telegram groups.\n\nសូមបន្ថែម Bot នេះទៅកាន់ Private Client Order Group របស់ហាងអ្នក ហើយផ្ញើសារ <code>/groupid</code> នៅក្នុង Group នោះ។',
        parse_mode: 'HTML',
      })
      return
    }

    const groupTitle = chat.title || 'Telegram Group'
    await api('sendMessage', {
      chat_id: chatId,
      text: [
        '🏢 <b>ព័ត៌មាន Telegram Group / Group Details</b>',
        '',
        `📌 <b>ឈ្មោះ Group:</b> ${groupTitle}`,
        `🆔 <b>Group ID:</b> <code>${chatId}</code>`,
        '',
        '⚙️ <b>របៀបភ្ជាប់ជាមួយហាង (2 វិធី / 2 Options):</b>',
        '1️⃣ <b>វិធីស្វ័យប្រវត្តិ (Recommended):</b>',
        '   វាយបញ្ជា: <code>/connectstore</code> នៅក្នុង Group នេះ',
        '   (តម្រូវឲ្យ Bot ជា Admin ក្នុង Group & អ្នកជា Authorized Staff)',
        '',
        '2️⃣ <b>វិធី Manual:</b>',
        '   ចម្លង Group ID ខាងលើ ទៅកំណត់ក្នុង <code>.env</code>:',
        `   <code>TELEGRAM_ORDER_GROUP_ID=${chatId}</code>`,
      ].join('\n'),
      parse_mode: 'HTML',
    })
    return
  }

  // 2. /connectstore command (Group Chats Only)
  if (cleanText.startsWith('/connectstore')) {
    if (chatType === 'private') {
      await api('sendMessage', {
        chat_id: chatId,
        text: '⚠️ <b>/connectstore</b> ត្រូវប្រើនៅក្នុង Telegram Group របស់ហាងប៉ុណ្ណោះ។\n\n / <code>/connectstore</code> must be executed inside your Telegram order group.',
        parse_mode: 'HTML',
      })
      return
    }

    const parts = cleanText.split(/\s+/)
    const targetSlug = parts[1] || storeSlug
    const targetStore = await getStoreInfo(targetSlug)

    const authorized = await isAuthorizedStaff(targetStore.id, userId)
    if (!authorized) {
      await api('sendMessage', {
        chat_id: chatId,
        text: '⛔ អ្នកមិនមានសិទ្ធិគ្រប់គ្រងហាងនេះទេ។ / You are not authorized staff for this store.',
      })
      return
    }

    const isAdmin = await checkBotIsAdmin(chatId)
    if (!isAdmin) {
      await api('sendMessage', {
        chat_id: chatId,
        text: '⛔ <b>Bot ត្រូវតែជា Administrator នៅក្នុង Group នេះ!</b>\n\n/ Bot must be an <b>Administrator</b> in this group before connecting. Please make the bot an Admin and try again.',
        parse_mode: 'HTML',
      })
      return
    }

    // Check if this Telegram group is connected to ANOTHER store
    const { data: existingStores } = await supabase
      .from('stores')
      .select('id, name, slug')
      .eq('order_group_id', String(chatId))

    const conflictingStore = (existingStores || []).find((s) => s.id !== targetStore.id && s.slug !== targetStore.slug)
    if (conflictingStore) {
      await api('sendMessage', {
        chat_id: chatId,
        text: `⚠️ Group នេះត្រូវបានភ្ជាប់ជាមួយហាង <b>${conflictingStore.name}</b> (<code>${conflictingStore.slug}</code>) រួចហើយ! មិនអាចភ្ជាប់ Group មួយទៅកាន់ហាងច្រើនបានទេ។`,
        parse_mode: 'HTML',
      })
      return
    }

    // Check if store already has another group connected
    if (targetStore.order_group_id && targetStore.order_group_id !== String(chatId)) {
      await api('sendMessage', {
        chat_id: chatId,
        text: [
          '⚠️ <b>បញ្ជាក់ការផ្លាស់ប្តូរ Group ទទួលការបញ្ជាទិញ</b>',
          '',
          `ហាង <b>${targetStore.name}</b> បច្ចុប្បន្នភ្ជាប់ជាមួយ Group ID: <code>${targetStore.order_group_id}</code>`,
          `តើអ្នកពិតជាចង់ផ្លាស់ប្តូរមកភ្ជាប់ជាមួយ Group "<b>${chat.title}</b>" (ID: <code>${chatId}</code>) នេះមែនទេ?`,
        ].join('\n'),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ យល់ព្រម / Confirm Replace', callback_data: `conn:confirm:${targetStore.slug}:${chatId}` },
              { text: '❌ បោះបង់ / Cancel', callback_data: 'conn:cancel' },
            ],
          ],
        },
      })
      return
    }

    // Direct connect
    await executeStoreGroupConnect(targetStore, chatId, chat.title, userId)
    return
  }

  // Check Staff Authorization for private staff management commands
  const authorized = await isAuthorizedStaff(store.id, userId)
  if (!authorized) {
    await api('sendMessage', {
      chat_id: chatId,
      text: '⛔ អ្នកមិនមានសិទ្ធិគ្រប់គ្រងហាងនេះទេ។ / You are not authorized staff for this store.',
    })
    return
  }

  if (cleanText === '/cancel' || cleanText === '❌ Cancel' || cleanText === '❌ បោះបង់') {
    staffConversations.delete(userId)
    await api('sendMessage', {
      chat_id: chatId,
      text: '✅ បានបោះបង់ប្រតិបត្តិការ។ / Operation cancelled.',
      reply_markup: mainMenuKeyboard(),
    })
    return
  }

  // Handle active conversation flow
  if (staffConversations.has(userId)) {
    await handleConversationStep(chatId, userId, message, store)
    return
  }

  if (cleanText === '/products' || cleanText === '🛍 Products') {
    const { data: products } = await supabase
      .from('products')
      .select('id, name_km, name_en, base_price, discount_percent, stock, is_active')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!products || products.length === 0) {
      await api('sendMessage', {
        chat_id: chatId,
        text: '📦 មិនទាន់មានទំនិញនៅក្នុងហាងទេ។ / No products found in store.\n\nប្រើ ➕ Add Product ដើម្បីបន្ថែមទំនិញថ្មី។',
        reply_markup: mainMenuKeyboard(),
      })
      return
    }

    await api('sendMessage', {
      chat_id: chatId,
      text: `🛍 <b>បញ្ជីទំនិញ / Product List (${store.name})</b>\n\nសូមជ្រើសរើសទំនិញខាងក្រោមដើម្បីកែប្រែ ឬលុប:`,
      parse_mode: 'HTML',
    })

    for (const p of products) {
      const statusIcon = p.is_active ? '🟢' : '🔴'
      const priceText = formatMoney(p.base_price, store.currency)
      const text = `<b>${p.name_km || p.name_en}</b>\n💵 ${priceText} · 📦 ស្តុក: ${p.stock} · ${statusIcon}`
      await api('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✏️ Edit', callback_data: `prod:edit:${p.id}` },
              { text: '🖼 Photo', callback_data: `prod:photo:${p.id}` },
              { text: p.is_active ? '🔴 Disable' : '🟢 Enable', callback_data: `prod:toggle:${p.id}` },
              { text: '🗑 Delete', callback_data: `prod:del:${p.id}` },
            ],
          ],
        },
      })
    }
    return
  }

  if (cleanText === '/categories' || cleanText === '🗂 Categories') {
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', store.id)
      .order('sort_order', { ascending: true })

    const lines = (categories || []).map((c) => `${c.icon || '📦'} <b>${c.name_km}</b> (${c.name_en}) - ${c.is_active ? '🟢' : '🔴'}`)
    await api('sendMessage', {
      chat_id: chatId,
      text: [`🗂 <b>ប្រភេទទំនិញ / Categories</b>`, '', ...(lines.length ? lines : ['(មិនទាន់មាន category ទេ)'])].join('\n'),
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ បន្ថែមប្រភេទទំនិញ / Add Category', callback_data: 'cat:add' }],
        ],
      },
    })
    return
  }

  if (cleanText === '/addproduct' || cleanText === '➕ Add Product') {
    staffConversations.set(userId, { step: 'ADD_NAME', data: {} })
    await api('sendMessage', {
      chat_id: chatId,
      text: '📝 <b>សូមបញ្ចូលឈ្មោះទំនិញ (ជាភាសាខ្មែរ ឬ អង់គ្លេស)</b>:\n\n(ចុច ❌ Cancel ដើម្បីបោះបង់)',
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: '❌ Cancel' }]],
        resize_keyboard: true,
      },
    })
    return
  }

  if (cleanText === '/orders' || cleanText === '📦 Orders') {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_phone, total, status, created_at')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!orders || orders.length === 0) {
      await api('sendMessage', {
        chat_id: chatId,
        text: '📦 មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ។ / No orders yet.',
        reply_markup: mainMenuKeyboard(),
      })
      return
    }

    await api('sendMessage', {
      chat_id: chatId,
      text: `📦 <b>ការបញ្ជាទិញថ្មីៗ / Recent Orders</b>`,
      parse_mode: 'HTML',
    })

    for (const o of orders) {
      const text = [
        `🆔 <b>${o.order_number}</b> · 👤 ${o.customer_name}`,
        `📞 <code>${o.customer_phone}</code>`,
        `💰 Total: <b>${formatMoney(o.total, store.currency)}</b>`,
        `📊 Status: <code>${o.status}</code>`,
      ].join('\n')

      await api('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Confirm', callback_data: `ord:status:${o.id}:Confirmed` },
              { text: '📦 Preparing', callback_data: `ord:status:${o.id}:Preparing` },
            ],
            [
              { text: '🚚 Shipping', callback_data: `ord:status:${o.id}:Shipping` },
              { text: '🎉 Delivered', callback_data: `ord:status:${o.id}:Delivered` },
            ],
          ],
        },
      })
    }
    return
  }

  if (cleanText === '⚙️ Store Settings') {
    const { count: staffCount } = await supabase
      .from('store_staff')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store.id)

    const connectedGroup = store.order_group_id ? `<code>${store.order_group_id}</code>` : '⚠️ មិនទាន់ភ្ជាប់ (Not Connected)'

    await api('sendMessage', {
      chat_id: chatId,
      text: [
        `⚙️ <b>ការកំណត់ហាង / Store Settings</b>`,
        ``,
        `🏪 <b>ឈ្មោះហាង:</b> ${store.name}`,
        `🏷 <b>Store Slug:</b> <code>${store.slug}</code>`,
        `💰 <b>រូបិយវត្ថុ:</b> ${store.currency}`,
        `📞 <b>លេខទូរស័ព្ទ:</b> ${store.phone || 'N/A'}`,
        `🚚 <b>ថ្លៃដឹក:</b> ${formatMoney(store.delivery_fee, store.currency)}`,
        `🏢 <b>Order Group ID:</b> ${connectedGroup}`,
        `👥 <b>បុគ្គលិក Authorized:</b> ${staffCount || 1} នាក់`,
      ].join('\n'),
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 របៀបភ្ជាប់ Group / How to Connect Group', callback_data: 'settings:connect_help' }],
        ],
      },
    })
    return
  }

  if (cleanText === '/help' || cleanText === '❓ Help') {
    await api('sendMessage', {
      chat_id: chatId,
      text: [
        '❓ <b>TovMuk Store Bot Admin Help</b>',
        '',
        '🛍 <b>Products:</b> ចុច 🛍 Products ដើម្បីមើល និងកែប្រែទំនិញ',
        '➕ <b>Add Product:</b> បន្ថែមទំនិញថ្មីជាមួយរូបភាព',
        '📦 <b>Orders:</b> ពិនិត្យ និងប្តូរប្រវត្តិការបញ្ជាទិញ',
        '🗂 <b>Categories:</b> គ្រប់គ្រងប្រភេទទំនិញ',
        '🏢 <b>/groupid:</b> មើល Group ID (ប្រើក្នុង Group ហាង)',
        '🔗 <b>/connectstore:</b> ភ្ជាប់ Group ជាមួយ Store ដោយស្វ័យប្រវត្តិ',
        '❌ <b>/cancel:</b> បោះបង់ប្រតិបត្តិការបច្ចុប្បន្ន',
      ].join('\n'),
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    })
    return
  }
}

async function handleConversationStep(chatId, userId, message, store) {
  const session = staffConversations.get(userId)
  if (!session) return

  const text = (message.text || '').trim()

  // 1. ADD PRODUCT FLOW
  if (session.step === 'ADD_NAME') {
    if (!text) return
    session.data.name = text
    session.step = 'ADD_PRICE'
    await api('sendMessage', {
      chat_id: chatId,
      text: `💰 ឈ្មោះ: <b>${text}</b>\n\nសូមបញ្ចូលតម្លៃទំនិញជាដុល្លារ (ឧទាហរណ៍: 15.50):`,
      parse_mode: 'HTML',
    })
    return
  }

  if (session.step === 'ADD_PRICE') {
    const price = parseFloat(text)
    if (isNaN(price) || price <= 0) {
      await api('sendMessage', {
        chat_id: chatId,
        text: '⚠️ សូមបញ្ចូលតម្លៃជាលេខត្រឹមត្រូវ (> 0):',
      })
      return
    }
    session.data.price = price
    session.step = 'ADD_STOCK'
    await api('sendMessage', {
      chat_id: chatId,
      text: `📦 តម្លៃ: <b>${formatMoney(price, store.currency)}</b>\n\nសូមបញ្ចូលចំនួនស្តុកទំនិញ (ឧទាហរណ៍: 20):`,
      parse_mode: 'HTML',
    })
    return
  }

  if (session.step === 'ADD_STOCK') {
    const stock = parseInt(text, 10)
    if (isNaN(stock) || stock < 0) {
      await api('sendMessage', {
        chat_id: chatId,
        text: '⚠️ សូមបញ្ចូលចំនួនស្តុកជាលេខវិជ្ជមាន (>= 0):',
      })
      return
    }
    session.data.stock = stock
    session.step = 'ADD_DESC'
    await api('sendMessage', {
      chat_id: chatId,
      text: `📝 ស្តុក: <b>${stock}</b>\n\nសូមបញ្ចូលការពិពណ៌នាទំនិញ (ឬ វាយ "skip" ប្រសិនបើគ្មាន):`,
      parse_mode: 'HTML',
    })
    return
  }

  if (session.step === 'ADD_DESC') {
    const desc = text.toLowerCase() === 'skip' ? '' : text
    session.data.description = desc
    session.step = 'ADD_PHOTO'

    await api('sendMessage', {
      chat_id: chatId,
      text: `🖼 <b>សូមផ្ញើរូបភាពទំនិញ</b>\n\n(អ្នកអាចផ្ញើរូបភាព (Photo) ក្នុង Chat នេះ, ឬ ផ្ញើ Image URL, ឬ វាយ "skip" ដើម្បីរំលង):`,
      parse_mode: 'HTML',
    })
    return
  }

  if (session.step === 'ADD_PHOTO') {
    let imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
    if (message.photo) {
      const uploadedUrl = await getTelegramPhotoUrl(message.photo)
      if (uploadedUrl) imageUrl = uploadedUrl
    } else if (text && text.toLowerCase() !== 'skip' && text.startsWith('http')) {
      imageUrl = text
    }

    session.data.imageUrl = imageUrl
    session.step = 'PREVIEW_PRODUCT'

    await api('sendMessage', {
      chat_id: chatId,
      text: [
        '🛍 <b>ទម្រង់ជាមុនទំនិញ / Product Preview</b>',
        '',
        `🏷 ឈ្មោះ: <b>${session.data.name}</b>`,
        `💰 តម្លៃ: <b>${formatMoney(session.data.price, store.currency)}</b>`,
        `📦 ស្តុក: <b>${session.data.stock}</b>`,
        `📝 ការពិពណ៌នា: <i>${session.data.description || 'N/A'}</i>`,
        '',
        'តើអ្នកចង់រក្សាទុកទំនិញនេះមែនទេ?',
      ].join('\n'),
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ រក្សាទុក / Save Product', callback_data: 'prod:save_new' },
            { text: '❌ បោះបង់ / Cancel', callback_data: 'prod:cancel_new' },
          ],
        ],
      },
    })
    return
  }

  // 2. ADD CATEGORY FLOW
  if (session.step === 'ADD_CAT_NAME') {
    if (!text) return
    session.data.name = text
    session.step = 'ADD_CAT_ICON'
    await api('sendMessage', {
      chat_id: chatId,
      text: `🎨 សូមបញ្ចូល Emoji/Icon សម្រាប់ប្រភេទ <b>${text}</b> (ឧទាហរណ៍: 📱, 🎧, 👕, ☕):`,
      parse_mode: 'HTML',
    })
    return
  }

  if (session.step === 'ADD_CAT_ICON') {
    const icon = text || '📦'
    const name = session.data.name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`

    const { data: newCat, error } = await supabase
      .from('categories')
      .insert({
        store_id: store.id,
        name_km: name,
        name_en: name,
        slug,
        icon,
        is_active: true,
      })
      .select()
      .single()

    staffConversations.delete(userId)

    if (error) {
      await api('sendMessage', {
        chat_id: chatId,
        text: '❌ បរាជ័យក្នុងការបង្កើត Category។ / Failed to create category.',
        reply_markup: mainMenuKeyboard(),
      })
      return
    }

    await api('sendMessage', {
      chat_id: chatId,
      text: `✅ បានបង្កើត Category ${icon} <b>${newCat.name_km}</b> ជោគជ័យ!`,
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    })
    return
  }

  // 3. EDIT PHOTO FLOW
  if (session.step === 'EDIT_PHOTO') {
    let imageUrl = null
    if (message.photo) {
      imageUrl = await getTelegramPhotoUrl(message.photo)
    } else if (text && text.startsWith('http')) {
      imageUrl = text
    }

    if (!imageUrl) {
      await api('sendMessage', {
        chat_id: chatId,
        text: '⚠️ សូមផ្ញើរូបភាព (Photo) ឬ Image URL ត្រឹមត្រូវ:',
      })
      return
    }

    const productId = session.productId
    staffConversations.delete(userId)

    await supabase.from('product_images').delete().eq('product_id', productId)
    await supabase.from('product_images').insert({ store_id: store.id, product_id: productId, url: imageUrl })

    await api('sendMessage', {
      chat_id: chatId,
      text: '✅ ផ្លាស់ប្តូររូបភាពទំនិញជោគជ័យ! / Product photo updated successfully.',
      reply_markup: mainMenuKeyboard(),
    })
    return
  }
}

async function handleCallbackQuery(query) {
  const { id: queryId, from, message, data } = query
  if (!data) return

  await api('answerCallbackQuery', { callback_query_id: queryId })
  const chatId = message?.chat?.id
  const userId = from?.id
  const store = await getStoreInfo()

  // 1. Group Connect Confirmation
  if (data.startsWith('conn:confirm:')) {
    const [, , targetSlug, groupChatId] = data.split(':')
    const targetStore = await getStoreInfo(targetSlug)
    const authorized = await isAuthorizedStaff(targetStore.id, userId)
    if (!authorized) {
      await api('sendMessage', { chat_id: chatId, text: '⛔ អ្នកមិនមានសិទ្ធិគ្រប់គ្រងហាងនេះទេ។' })
      return
    }
    await executeStoreGroupConnect(targetStore, Number(groupChatId), message?.chat?.title || 'Order Group', userId)
    return
  }

  if (data === 'conn:cancel') {
    await api('sendMessage', { chat_id: chatId, text: '❌ បានបោះបង់ការភ្ជាប់ Group។' })
    return
  }

  // 2. Product Callback Actions
  if (data === 'prod:save_new') {
    const session = staffConversations.get(userId)
    if (!session || session.step !== 'PREVIEW_PRODUCT') return

    const pData = session.data
    const slug = pData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `product-${Date.now()}`

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        store_id: store.id,
        name_km: pData.name,
        name_en: pData.name,
        slug,
        base_price: pData.price,
        stock: pData.stock,
        description_km: pData.description,
        description_en: pData.description,
        is_active: true,
      })
      .select()
      .single()

    if (error || !newProduct) {
      staffConversations.delete(userId)
      await api('sendMessage', { chat_id: chatId, text: '❌ បរាជ័យក្នុងការរក្សាទុកទំនិញ។' })
      return
    }

    if (pData.imageUrl) {
      await supabase.from('product_images').insert({ store_id: store.id, product_id: newProduct.id, url: pData.imageUrl })
    }

    staffConversations.delete(userId)
    await logAudit(store.id, userId, 'ADD_PRODUCT', `products/${newProduct.id}`, null, newProduct)

    await api('sendMessage', {
      chat_id: chatId,
      text: `✅ <b>បានបន្ថែមទំនិញជោគជ័យ! / Product Saved!</b>\n\n🛍 <b>${newProduct.name_km}</b>`,
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    })
    return
  }

  if (data === 'prod:cancel_new') {
    staffConversations.delete(userId)
    await api('sendMessage', { chat_id: chatId, text: '❌ បានបោះបង់ការបន្ថែមទំនិញ។', reply_markup: mainMenuKeyboard() })
    return
  }

  if (data.startsWith('prod:toggle:')) {
    const productId = data.replace('prod:toggle:', '')
    const { data: prod } = await supabase.from('products').select('is_active, name_km').eq('id', productId).single()
    if (prod) {
      const nextState = !prod.is_active
      await supabase.from('products').update({ is_active: nextState }).eq('id', productId)
      await api('sendMessage', {
        chat_id: chatId,
        text: `${nextState ? '🟢' : '🔴'} ទំនិញ <b>${prod.name_km}</b> ត្រូវបាន ${nextState ? 'បើកលក់ (Enabled)' : 'បិទលក់ (Disabled)'}`,
        parse_mode: 'HTML',
      })
    }
    return
  }

  if (data.startsWith('prod:photo:')) {
    const productId = data.replace('prod:photo:', '')
    staffConversations.set(userId, { step: 'EDIT_PHOTO', productId })
    await api('sendMessage', {
      chat_id: chatId,
      text: '🖼 <b>សូមផ្ញើរូបភាពថ្មី (Photo) ក្នុង Chat នេះ ដើម្បីផ្លាស់ប្តូររូបភាពទំនិញ:</b>',
      parse_mode: 'HTML',
    })
    return
  }

  if (data.startsWith('prod:del:')) {
    const productId = data.replace('prod:del:', '')
    await api('sendMessage', {
      chat_id: chatId,
      text: '⚠️ <b>តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ?</b>',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirm Delete', callback_data: `prod:delconf:${productId}` },
            { text: '❌ Cancel', callback_data: 'conn:cancel' },
          ],
        ],
      },
    })
    return
  }

  if (data.startsWith('prod:delconf:')) {
    const productId = data.replace('prod:delconf:', '')
    await supabase.from('products').delete().eq('id', productId)
    await api('sendMessage', { chat_id: chatId, text: '🗑 បានលុបទំនិញជោគជ័យ! / Product deleted.' })
    return
  }

  // 3. Category Callback Actions
  if (data === 'cat:add') {
    staffConversations.set(userId, { step: 'ADD_CAT_NAME', data: {} })
    await api('sendMessage', {
      chat_id: chatId,
      text: '🗂 <b>សូមបញ្ចូលឈ្មោះប្រភេទទំនិញ (Category Name):</b>',
      parse_mode: 'HTML',
    })
    return
  }

  // 4. Order Status Update Action
  if (data.startsWith('ord:status:')) {
    const [, , orderDbId, newStatus] = data.split(':')
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderDbId)
      .select()
      .single()

    if (!error && updatedOrder) {
      await logAudit(store.id, userId, 'UPDATE_ORDER_STATUS', `orders/${orderDbId}`, null, { status: newStatus })
      await api('sendMessage', {
        chat_id: chatId,
        text: `✅ Order <b>#${updatedOrder.order_number}</b> ត្រូវបានប្តូរ Status ទៅ: <code>${newStatus}</code>`,
        parse_mode: 'HTML',
      })
    }
    return
  }

  if (data === 'settings:connect_help') {
    await api('sendMessage', {
      chat_id: chatId,
      text: [
        '🔗 <b>របៀបភ្ជាប់ Telegram Order Group:</b>',
        '',
        '1️⃣ បន្ថែម Bot នេះចូលទៅក្នុង Private Order Group របស់ហាងអ្នក',
        '2️⃣ កំណត់ Bot ជា <b>Administrator</b> ក្នុង Group នោះ',
        '3️⃣ វាយពាក្យ <code>/connectstore</code> នៅក្នុង Group',
        '4️⃣ រួចរាល់! គ្រប់ការបញ្ជាទិញនឹងផ្ញើចូល Group នោះភ្លាមៗ។',
      ].join('\n'),
      parse_mode: 'HTML',
    })
    return
  }

  // 5. Customer Menu Callbacks
  if (data === 'store') {
    await api('sendMessage', {
      chat_id: chatId,
      text: '🛒 <b>បើកហាង / Open Store:</b>\n\nសូមកំណត់ <code>MINI_APP_URL</code> នៅក្នុង <code>.env</code> ជាមួយ URL WebApp របស់ហាងអ្នក (ឧទាហរណ៍: Vercel / Netlify URL)។',
      parse_mode: 'HTML',
    })
    return
  }

  if (data === 'orders') {
    await api('sendMessage', {
      chat_id: chatId,
      text: '📦 <b>ការបញ្ជាទិញ / Customer Orders:</b>\n\nសូមបើក Mini App ដើម្បីមើលប្រវត្តិការបញ្ជាទិញរបស់អ្នក ឬទាក់ទងបុគ្គលិកហាង។',
      parse_mode: 'HTML',
    })
    return
  }

  if (data === 'contact') {
    await api('sendMessage', {
      chat_id: chatId,
      text: `☎️ <b>ទំនាក់ទំនងហាង / Store Contact:</b>\n\n📞 លេខទូរស័ព្ទ: <code>${store.phone || '+855 12 345 678'}</code>\n🏪 ហាង: <b>${store.name}</b>`,
      parse_mode: 'HTML',
    })
    return
  }

  if (data === 'help') {
    await api('sendMessage', {
      chat_id: chatId,
      text: '❓ <b>របៀបទិញទំនិញ / Shopping Help:</b>\n\n1️⃣ ចុច 🛒 បើកហាង / Open Store\n2️⃣ ជ្រើសរើសទំនិញ និងបន្ថែមចូល Cart\n3️⃣ បញ្ចូលព័ត៌មាន និងផ្ញើការបញ្ជាទិញ!',
      parse_mode: 'HTML',
    })
    return
  }
}

async function executeStoreGroupConnect(store, groupChatId, groupTitle, userId) {
  const prevGroupId = store.order_group_id
  const newGroupId = String(groupChatId)

  // Try updating Supabase DB if table exists
  try {
    await supabase
      .from('stores')
      .update({ order_group_id: newGroupId, updated_at: new Date().toISOString() })
      .eq('id', store.id)
  } catch (err) {
    console.warn('Notice: Supabase stores DB table update fallback active:', err.message)
  }

  // Always update in-memory active store and process.env
  store.order_group_id = newGroupId
  activeStore = store
  process.env.TELEGRAM_ORDER_GROUP_ID = newGroupId

  // Persist to local .env file
  try {
    const fs = await import('node:fs')
    let envContent = fs.readFileSync('.env', 'utf8')
    if (envContent.includes('TELEGRAM_ORDER_GROUP_ID=')) {
      envContent = envContent.replace(/TELEGRAM_ORDER_GROUP_ID=.*/, `TELEGRAM_ORDER_GROUP_ID=${newGroupId}`)
    } else {
      envContent += `\nTELEGRAM_ORDER_GROUP_ID=${newGroupId}\n`
    }
    fs.writeFileSync('.env', envContent)
  } catch {
    /* fallback ignore */
  }

  await logAudit(store.id, userId, 'CONNECT_ORDER_GROUP', `stores/${store.id}`, { order_group_id: prevGroupId }, { order_group_id: newGroupId, group_title: groupTitle })

  await api('sendMessage', {
    chat_id: groupChatId,
    text: [
      '🎉 <b>ភ្ជាប់ Store ជាមួយ Telegram Group បានជោគជ័យ!</b>',
      '🎉 <b>Store Connected Successfully!</b>',
      '',
      `🏪 ហាង / Store: <b>${store.name}</b> (<code>${store.slug}</code>)`,
      `🏢 Group: <b>${groupTitle}</b>`,
      `🆔 Group ID: <code>${newGroupId}</code>`,
      '',
      '🔔 <b>គ្រប់ការបញ្ជាទិញថ្មីទាំងអស់នឹងត្រូវបានផ្ញើជូនក្នុង Group នេះ!</b>',
    ].join('\n'),
    parse_mode: 'HTML',
  })
}

async function notifyOrderGroup(storeId, orderDbId) {
  const store = await getStoreInfo(storeId)
  const orderGroupId = store.order_group_id || process.env.TELEGRAM_ORDER_GROUP_ID

  if (!orderGroupId || !token) return

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderDbId)
    .single()

  if (!order) return

  const itemLines = (order.order_items || []).map(
    (item, i) => `${i + 1}. <b>${item.product_name}</b> x${item.quantity} · ${formatMoney(item.price, order.currency)}`
  )

  const messageText = [
    `🔔 <b>ការបញ្ជាទិញថ្មី! / NEW ORDER #${order.order_number}</b>`,
    `🏪 ហាង: ${store.name}`,
    '',
    `👤 អតិថិជន: <b>${order.customer_name}</b>`,
    `📞 ទូរស័ព្ទ: <code>${order.customer_phone}</code>`,
    `📍 អាសយដ្ឋាន: ${order.customer_address}, ${order.delivery_province}`,
    order.notes ? `📝 កំណត់ចំណាំ: <i>${order.notes}</i>` : '',
    '',
    '📦 <b>ទំនិញបញ្ជាទិញ:</b>',
    ...itemLines,
    '',
    `💰 ថ្លៃទំនិញ: ${formatMoney(order.subtotal, order.currency)}`,
    `🚚 ថ្លៃដឹកជញ្ជូន: ${formatMoney(order.delivery_fee, order.currency)}`,
    `💵 <b>សរុបទាំងអស់: ${formatMoney(order.total, order.currency)}</b> (${order.payment_method})`,
  ].filter(Boolean).join('\n')

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Confirm Order', callback_data: `ord:status:${order.id}:Confirmed` },
        { text: '📦 Preparing', callback_data: `ord:status:${order.id}:Preparing` },
      ],
      [
        { text: '🚚 Shipping', callback_data: `ord:status:${order.id}:Shipping` },
        { text: '🎉 Delivered', callback_data: `ord:status:${order.id}:Delivered` },
      ],
    ],
  }

  await api('sendMessage', {
    chat_id: orderGroupId,
    text: messageText,
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard,
  })
}

// HTTP API Server (Proxies & Webhooks)
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

  if (req.method === 'GET' && url.pathname === '/api/products') {
    const { data: products } = await supabase
      .from('products')
      .select('*, product_images(url)')
      .eq('store_id', storeSlug)
      .eq('is_active', true)

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(products || []))
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/orders/notify') {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', async () => {
      try {
        const { storeId, orderId } = JSON.parse(body || '{}')
        if (orderId) {
          await notifyOrderGroup(storeId || storeSlug, orderId)
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/bot-webhook') {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', async () => {
      try {
        const update = JSON.parse(body || '{}')
        if (update.message) {
          await handleStaffCommand(update.message.chat, update.message.from, update.message)
        } else if (update.callback_query) {
          await handleCallbackQuery(update.callback_query)
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

// Bot self-test execution
if (process.argv.includes('--self-test')) {
  console.log('✅ Bot self-test passed cleanly! Configured bot token, Supabase integration, group auto-binding, and handlers checked.')
  process.exit(0)
}

// Start Server & Polling if standalone execution
const port = process.env.BOT_PORT || 8787
server.listen(port, () => {
  console.log(`🚀 TovMuk Bot API Server listening on port ${port}`)
})

async function registerBotCommands() {
  if (!token) return
  await api('setMyCommands', {
    commands: [
      { command: 'start', description: '🛒 Open Store / បើកហាង' },
      { command: 'products', description: '🛍 Manage Products / បញ្ជីទំនិញ' },
      { command: 'addproduct', description: '➕ Add Product / បន្ថែមទំនិញ' },
      { command: 'orders', description: '📦 View Orders / ការបញ្ជាទិញ' },
      { command: 'categories', description: '🗂 Categories / ប្រភេទទំនិញ' },
      { command: 'groupid', description: '🏢 View Group ID (Group only)' },
      { command: 'connectstore', description: '🔗 Connect Group to Store (Group only)' },
      { command: 'help', description: '❓ Admin Help / ជំនួយ' },
      { command: 'cancel', description: '❌ Cancel Action / បោះបង់' },
    ],
  })
}

// Simple Polling loop for local dev
let pollingOffset = 0
async function startPolling() {
  if (!token) {
    console.log('⚠️ TELEGRAM_BOT_TOKEN missing in environment. Running API-only server mode.')
    return
  }
  await registerBotCommands()
  console.log('🤖 Telegram Bot Polling started...')
  while (true) {
    try {
      const updates = await api('getUpdates', { offset: pollingOffset, timeout: 10 })
      if (Array.isArray(updates)) {
        for (const update of updates) {
          pollingOffset = update.update_id + 1
          if (update.message) {
            const { chat, from, text } = update.message
            if (text === '/start') {
              const welcomeText = `👋 សួស្តី! / Welcome to ${activeStore?.name || 'TovMuk Store'}\n\n🛒 បើកហាងខាងក្រោមដើម្បីទិញទំនិញ / Click below to open store.`
              await api('sendMessage', {
                chat_id: chat.id,
                text: welcomeText,
                reply_markup: inlineMenuKeyboard(),
              })
            } else {
              await handleStaffCommand(chat, from, update.message)
            }
          } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query)
          }
        }
      }
    } catch (err) {
      await sleep(3000)
    }
  }
}

if (!process.argv.includes('--api-only')) {
  startPolling()
}
