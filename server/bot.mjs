import { createHmac, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { productSeeds as seedProducts } from '../src/config/products.ts'
import { storeConfig } from '../src/config/store.config.ts'
import { translations } from '../src/config/translations.ts'

const token = process.env.TELEGRAM_BOT_TOKEN
const configuredUrl = process.env.MINI_APP_URL
let orderGroupId = process.env.TELEGRAM_ORDER_GROUP_ID
const authorizedStaffIds = new Set((process.env.AUTHORIZED_STAFF_IDS || '').split(/[\s,]+/).filter((id) => /^\d+$/.test(id)).map(Number))
const orders = new Map()
const productEdits = new Map()
const ordersFile = new URL('../.data/orders.json', import.meta.url)
const databaseFile = new URL('../.data/store.sqlite', import.meta.url)
const copy = translations[storeConfig.defaultLocale]
let database
let offset = 0
let running = true

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function miniAppUrl(value = configuredUrl) {
  if (!value) return undefined
  const url = new URL(value)
  if (url.protocol !== 'https:') throw new Error('MINI_APP_URL must use HTTPS')
  return url.href
}

function menu(url = miniAppUrl()) {
  const openStore = url
    ? { text: '🛒 បើកហាង / Open Store', web_app: { url } }
    : { text: '🛒 បើកហាង / Open Store', callback_data: 'store' }
  return { inline_keyboard: [
    [openStore],
    [{ text: '📦 ការបញ្ជាទិញ / Orders', callback_data: 'orders' }],
    [{ text: '☎️ ទំនាក់ទំនង / Contact', callback_data: 'contact' }, { text: '❓ របៀបទិញ / Help', callback_data: 'help' }],
  ] }
}

function replyFor(action) {
  if (action === 'contact') return `${copy.bot.contact} ${storeConfig.storeName}\n📞 ${storeConfig.contact.phone}\n📍 ${storeConfig.contact.address}`
  if (action === 'orders') return 'សូមចុច “បើកហាង” ដើម្បីមើលការបញ្ជាទិញរបស់អ្នក។'
  if (action === 'store') return 'មិនទាន់បានកំណត់លីងហាងទេ។'
  if (action === 'help') return '១. ចុច “បើកហាង”\n២. ដាក់ទំនិញចូលកន្រ្តក\n៣. បំពេញព័ត៌មានដឹកជញ្ជូន\n៤. ពិនិត្យសរុប និងបញ្ជាក់ការទិញ។'
  return `👋 ${copy.bot.welcome.replace('{store}', storeConfig.storeName)}\nWelcome to ${storeConfig.storeName}\n\n🛒 ទិញទំនិញងាយៗនៅក្នុង Telegram\n💰 តម្លៃច្បាស់ និងបង់ពេលទទួលទំនិញ\n🚚 ដឹកជញ្ជូនទូទាំងកម្ពុជា\n\n👇 ចុច “បើកហាង / Open Store”`
}

function logoUrl() {
  const base = miniAppUrl()
  return base ? new URL(storeConfig.logo, base).href : undefined
}

function validateInitData(initData, botToken = token) {
  const params = new URLSearchParams(initData)
  const receivedHash = params.get('hash') || ''
  params.delete('hash')
  const data = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const expectedHash = createHmac('sha256', secret).update(data).digest('hex')
  if (receivedHash.length !== expectedHash.length || !timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expectedHash))) throw new Error('Invalid Telegram session')
  const authDate = Number(params.get('auth_date'))
  const age = Date.now() / 1000 - authDate
  if (!authDate || age > 3600 || age < -60) throw new Error('Expired Telegram session')
  const user = JSON.parse(params.get('user') || '{}')
  if (!Number.isInteger(user.id)) throw new Error('Invalid Telegram user')
  return user
}

function clean(value, max = 160) {
  return String(value || '').trim().slice(0, max)
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeConfig.currency, maximumFractionDigits: storeConfig.currency === 'KHR' ? 0 : 2 }).format(value)
}

function createProductSchema(target) {
  target.exec('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL CHECK(price > 0), discount REAL NOT NULL DEFAULT 0 CHECK(discount BETWEEN 0 AND 100), data TEXT NOT NULL)')
}

function seedProductDatabase(target) {
  if (target.prepare('SELECT COUNT(*) AS count FROM products').get().count) return
  const insert = target.prepare('INSERT INTO products (id, name, price, discount, data) VALUES (?, ?, ?, ?, ?)')
  for (const product of seedProducts) {
    insert.run(product.id, product.name, product.price, product.discount || 0, JSON.stringify(product))
  }
}

async function initDatabase() {
  await mkdir(new URL('../.data/', import.meta.url), { recursive: true })
  database = new DatabaseSync(databaseFile)
  createProductSchema(database)
  seedProductDatabase(database)
}

function productFromRow(row) {
  const product = { ...JSON.parse(row.data), id: row.id, name: row.name }
  product.price = Math.round(row.price * (1 - row.discount / 100) * 100) / 100
  if (row.discount) product.oldPrice = row.price
  else delete product.oldPrice
  product.discount = row.discount
  return product
}

function allProducts(target = database) {
  return target.prepare('SELECT * FROM products ORDER BY id').all().map(productFromRow)
}

function productRow(id, target = database) {
  return target.prepare('SELECT * FROM products WHERE id = ?').get(id)
}

function validateProductValue(field, input) {
  const value = clean(input, 80)
  if (field === 'name') {
    if (!value) throw new Error('Name cannot be empty.')
    return value
  }
  const number = Number(value.replace('%', '').trim())
  if (!Number.isFinite(number)) throw new Error('Enter a valid number.')
  if (field === 'price' && (number <= 0 || number > 1_000_000)) throw new Error('Price must be greater than $0.')
  if (field === 'discount' && (number < 0 || number > 100)) throw new Error('Discount must be between 0% and 100%.')
  return Math.round(number * 100) / 100
}

function staffAllowed(userId, chatId) {
  return authorizedStaffIds.has(Number(userId)) && String(chatId) === String(orderGroupId)
}

function productListText() {
  return [`📦 ${storeConfig.storeName} Products`, '', ...database.prepare('SELECT id, name, price, discount FROM products ORDER BY id').all().map((product) => `#${product.id} · ${product.name}\n   💵 ${formatMoney(product.price)} · 🏷️ ${product.discount}%`)].join('\n')
}

async function saveOrderGroupId(chatId) {
  const envPath = new URL('../.env', import.meta.url)
  const source = await readFile(envPath, 'utf8')
  const line = `TELEGRAM_ORDER_GROUP_ID=${chatId}`
  const updated = /^TELEGRAM_ORDER_GROUP_ID=.*$/m.test(source)
    ? source.replace(/^TELEGRAM_ORDER_GROUP_ID=.*$/m, line)
    : `${source.trimEnd()}\n${line}\n`
  await writeFile(envPath, updated)
  orderGroupId = String(chatId)
}

async function loadOrders() {
  try {
    const saved = JSON.parse(await readFile(ordersFile, 'utf8'))
    for (const state of saved) orders.set(state.order.id, state)
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(`Could not load saved orders: ${error.message}`)
  }
}

async function persistOrders() {
  await mkdir(new URL('../.data/', import.meta.url), { recursive: true })
  const saved = [...orders.values()].map(({ submission, ...state }) => state)
  await writeFile(ordersFile, JSON.stringify(saved, null, 2))
}

const statusLabels = {
  new: '🆕 ការទិញថ្មី / New order',
  accepted: '✅ បានទទួល / Accepted',
  preparing: '📦 កំពុងរៀបចំ / Preparing',
  delivering: '🚚 កំពុងដឹកជញ្ជូន / Delivering',
  completed: '✅ បានបញ្ចប់ / Completed',
  cancelled: '❌ បានបោះបង់ / Cancelled',
}

const customerStatusNotes = {
  new: `${copy.bot.received}\n${storeConfig.storeName} received your order and will review it shortly.`,
  accepted: 'ហាងបានទទួលការទិញរបស់អ្នករួចហើយ។\nYour order has been accepted.',
  preparing: 'យើងកំពុងរៀបចំ និងវេចខ្ចប់ទំនិញរបស់អ្នក។\nWe are packing your order now.',
  delivering: 'អ្នកដឹកជញ្ជូនកំពុងនាំទំនិញទៅកាន់អ្នក។ សូមរក្សាទូរស័ព្ទឱ្យនៅជិត។\nYour order is on the way. Please keep your phone nearby.',
  completed: `${copy.bot.completed.replace('{store}', storeConfig.storeName)} 🧡\nDelivered successfully. Thank you for shopping with us!`,
  cancelled: `ការទិញនេះត្រូវបានបោះបង់។\nThis order was cancelled. Contact ${storeConfig.storeName} if you need help.`,
}

function customerStatusText(state) {
  return [
    `សួស្តី ${state.customer.name} 👋`,
    '',
    statusLabels[state.status],
    `🧾 លេខការទិញ / Order ID: ${state.order.id}`,
    `📞 ទូរស័ព្ទ / Phone: ${state.customer.phone}`,
    `📍 ទីតាំង / Delivery: ${state.customer.address}, ${state.customer.province}`,
    `💰 សរុប / Total: ${formatMoney(state.order.total)}`,
    '💵 ទូទាត់ / Payment: Cash on Delivery',
    '',
    customerStatusNotes[state.status],
  ].join('\n')
}

async function sendWelcome(chatId) {
  const photo = logoUrl()
  if (photo) {
    try {
      await api('sendPhoto', { chat_id: chatId, photo, caption: replyFor('start'), reply_markup: menu() })
      return
    } catch (error) {
      console.error(`Welcome image failed: ${error.message}`)
    }
  }
  await api('sendMessage', { chat_id: chatId, text: replyFor('start'), reply_markup: menu() })
}

function statusKeyboard(state) {
  const id = state.order.id
  const cancel = { text: '❌ បោះបង់ / Cancel', callback_data: `status:cancelled:${id}` }
  if (state.status === 'new') return { inline_keyboard: [[{ text: '✅ ទទួល / Accept', callback_data: `status:accepted:${id}` }, cancel]] }
  if (state.status === 'accepted') return { inline_keyboard: [[{ text: '📦 រៀបចំ / Preparing', callback_data: `status:preparing:${id}` }, cancel]] }
  if (state.status === 'preparing') return { inline_keyboard: [[{ text: '🚚 ដឹកជញ្ជូន / Delivering', callback_data: `status:delivering:${id}` }, cancel]] }
  if (state.status === 'delivering') return { inline_keyboard: [[{ text: '✅ បញ្ចប់ / Completed', callback_data: `status:completed:${id}` }, cancel]] }
  return { inline_keyboard: [] }
}

function orderText(state) {
  const productLines = state.order.items.flatMap((item, index) => [
    `${index + 1}. ${clean(item.name, 70)}`,
    `   បរិមាណ / Qty: ${item.quantity} · ទំហំ / Size: ${clean(item.size, 30) || '—'} · ពណ៌ / Color: ${clean(item.color, 30) || '—'}`,
  ])
  return [
    `🛒 ${storeConfig.storeName} — ការបញ្ជាទិញ / ORDER`,
    `📊 ស្ថានភាព / Status: ${statusLabels[state.status]}`,
    `🆔 Order ID: ${state.order.id}`,
    `🗓 កាលបរិច្ឆេទ / Date: ${state.createdAt}`,
    '',
    `👤 ឈ្មោះ / Name: ${state.customer.name}`,
    `📞 ទូរស័ព្ទ / Phone: ${state.customer.phone}`,
    `📍 អាសយដ្ឋាន / Address: ${state.customer.address}, ${state.customer.province}`,
    state.customer.note ? `📝 កំណត់ចំណាំ / Note: ${state.customer.note}` : '',
    '',
    '📦 ទំនិញ / Products',
    ...productLines,
    '',
    `💰 សរុប / Total: ${formatMoney(state.order.total)}`,
    '💵 ការទូទាត់ / Payment: Cash on Delivery (COD)',
  ].filter(Boolean).join('\n')
}

function normalizeOrder(payload, user) {
  const order = payload.order
  const validOrderId = String(order?.id || '').startsWith(`${storeConfig.orderIdPrefix}-`) && /^[A-Za-z0-9-]{4,35}$/.test(order.id)
  if (!validOrderId || !Number.isFinite(order.total) || !Array.isArray(order.items) || !order.items.length || order.items.length > 30) throw new Error('Invalid order')
  if (order.paymentMethod !== 'Cash on delivery') throw new Error('Only Cash on Delivery is available')
  const customer = payload.customer || {}
  if (!clean(customer.name, 60) || !clean(customer.phone, 30) || !clean(customer.address) || !clean(customer.province, 60)) throw new Error('Missing customer details')
  return {
    user,
    status: 'new',
    createdAt: new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Phnom_Penh' }).format(new Date()),
    order: {
      id: order.id,
      total: Math.max(0, Number(order.total)),
      items: order.items.map((item) => ({ name: clean(item.name, 70), quantity: Math.max(1, Number(item.quantity) || 1), size: clean(item.size, 30), color: clean(item.color, 30) })),
    },
    customer: {
      name: clean(customer.name, 60),
      phone: clean(customer.phone, 30),
      province: clean(customer.province, 60),
      address: clean(customer.address),
      note: clean(customer.note),
    },
    groupMessageId: undefined,
    submission: undefined,
  }
}

async function receiveOrder(request, response) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 32_000) throw new Error('Order is too large')
  }
  if (!orderGroupId) throw new Error('TELEGRAM_ORDER_GROUP_ID is not configured')
  const payload = JSON.parse(body)
  const user = validateInitData(payload.initData)
  const existing = orders.get(payload.order?.id)
  if (existing) {
    if (existing.user.id !== user.id) throw new Error('Duplicate order ID')
    await existing.submission
    response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: true, id: existing.order.id, duplicate: true }))
    return
  }

  const state = normalizeOrder(payload, user)
  state.submission = (async () => {
    const groupMessage = await api('sendMessage', { chat_id: orderGroupId, text: orderText(state), reply_markup: statusKeyboard(state) })
    state.groupMessageId = groupMessage.message_id
    await api('sendMessage', { chat_id: user.id, text: customerStatusText(state) })
  })()
  orders.set(state.order.id, state)
  try {
    await state.submission
    state.submission = undefined
    await persistOrders()
  } catch (error) {
    orders.delete(state.order.id)
    throw error
  }
  response.writeHead(201, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: true, id: state.order.id }))
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/health') return response.end('ok')
    if (request.method === 'GET' && request.url === '/api/products') {
      response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(allProducts()))
      return
    }
    if (request.method === 'POST' && request.url === '/api/orders') return await receiveOrder(request, response)
    response.writeHead(404).end()
  } catch (error) {
    console.error(error.message)
    response.writeHead(error.message.includes('not configured') ? 503 : 400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: error.message }))
  }
})

async function api(method, body = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!data.ok) throw new Error(`${method}: ${data.description || response.status}`)
  return data.result
}

async function answerCallback(query, text, showAlert = false) {
  await api('answerCallbackQuery', { callback_query_id: query.id, text, show_alert: showAlert })
}

async function handleStatusCallback(query) {
  const [prefix, nextStatus, id] = query.data.split(':', 3)
  if (prefix !== 'status') return false
  if (!orderGroupId || String(query.message?.chat.id) !== String(orderGroupId)) {
    await answerCallback(query, 'Wrong order group.', true)
    return true
  }
  const member = await api('getChatMember', { chat_id: orderGroupId, user_id: query.from.id })
  if (!['administrator', 'creator'].includes(member.status)) {
    await answerCallback(query, 'សម្រាប់ Admin ប៉ុណ្ណោះ / Admin only.', true)
    return true
  }
  const state = orders.get(id)
  if (!state) {
    await answerCallback(query, 'Order state is unavailable. Restarted bot?', true)
    return true
  }
  const allowed = {
    new: ['accepted', 'preparing', 'cancelled'],
    accepted: ['preparing', 'cancelled'],
    preparing: ['delivering', 'cancelled'],
    delivering: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  }
  if (!allowed[state.status].includes(nextStatus)) {
    await answerCallback(query, 'មិនអាចប្តូរស្ថានភាពបែបនេះបានទេ។ / Invalid status change.', true)
    return true
  }
  state.status = nextStatus
  await api('editMessageText', { chat_id: orderGroupId, message_id: state.groupMessageId, text: orderText(state), reply_markup: statusKeyboard(state) })
  await persistOrders()
  await api('sendMessage', { chat_id: state.user.id, text: customerStatusText(state) })
  await answerCallback(query, statusLabels[state.status])
  return true
}

const productFieldLabels = { name: '✏️ Name', price: '💵 Price', discount: '🏷️ Discount' }

function productButtons() {
  return { inline_keyboard: database.prepare('SELECT id, name FROM products ORDER BY id').all().map((product) => [{ text: `#${product.id} · ${product.name}`, callback_data: `product:select:${product.id}` }]).concat([[{ text: '❌ Cancel', callback_data: 'product:cancel' }]]) }
}

function productFieldButtons(id) {
  return { inline_keyboard: [
    [{ text: '✏️ Change name', callback_data: `product:field:name:${id}` }],
    [{ text: '💵 Change price', callback_data: `product:field:price:${id}` }],
    [{ text: '🏷️ Change discount', callback_data: `product:field:discount:${id}` }],
    [{ text: '❌ Cancel', callback_data: 'product:cancel' }],
  ] }
}

function formatProductValue(field, value) {
  if (field === 'price') return formatMoney(Number(value))
  if (field === 'discount') return `${value}%`
  return String(value)
}

async function rejectStaffMessage(message) {
  await api('sendMessage', { chat_id: message.chat.id, text: `⛔ Unauthorized staff account.\nYour Telegram user ID: ${message.from.id}\nAdd it to AUTHORIZED_STAFF_IDS and restart the bot.` })
}

async function handleProductCommand(message, command) {
  if (!staffAllowed(message.from.id, message.chat.id)) {
    await rejectStaffMessage(message)
    return
  }
  if (command === '/cancel') {
    const cancelled = productEdits.delete(message.from.id)
    await api('sendMessage', { chat_id: message.chat.id, text: cancelled ? '❌ Product editing cancelled. Original data was kept.' : 'No product edit is active.' })
    return
  }
  if (command === '/products') {
    await api('sendMessage', { chat_id: message.chat.id, text: productListText() })
    return
  }
  productEdits.delete(message.from.id)
  await api('sendMessage', { chat_id: message.chat.id, text: '✏️ Select a product to edit:', reply_markup: productButtons() })
}

async function handleProductCallback(query) {
  if (!query.data.startsWith('product:')) return false
  if (!staffAllowed(query.from.id, query.message?.chat.id)) {
    await answerCallback(query, 'Unauthorized staff account.', true)
    return true
  }
  const [, action, detail, rawId] = query.data.split(':', 4)
  if (action === 'cancel') {
    productEdits.delete(query.from.id)
    await answerCallback(query, 'Editing cancelled.')
    await api('sendMessage', { chat_id: query.message.chat.id, text: '❌ Product editing cancelled. Original data was kept.' })
    return true
  }
  const id = Number(action === 'field' ? rawId : detail)
  const product = productRow(id)
  if (!product) {
    await answerCallback(query, 'Product not found.', true)
    return true
  }
  if (action === 'select') {
    productEdits.set(query.from.id, { chatId: query.message.chat.id, productId: id, stage: 'field' })
    await answerCallback(query, product.name)
    await api('sendMessage', { chat_id: query.message.chat.id, text: `📦 #${id} · ${product.name}\n💵 Price: ${formatMoney(product.price)}\n🏷️ Discount: ${product.discount}%\n\nWhat do you want to change?`, reply_markup: productFieldButtons(id) })
    return true
  }
  if (action === 'field' && productFieldLabels[detail]) {
    productEdits.set(query.from.id, { chatId: query.message.chat.id, productId: id, field: detail, oldValue: product[detail], stage: 'value' })
    await answerCallback(query, productFieldLabels[detail])
    const hint = detail === 'price' ? 'Enter the new base price, for example: 29.99' : detail === 'discount' ? 'Enter 0–100, for example: 20' : 'Enter the new product name.'
    await api('sendMessage', { chat_id: query.message.chat.id, text: `${productFieldLabels[detail]}\n${hint}\n\nSend /cancel to stop.` })
    return true
  }
  if (action === 'save') {
    const edit = productEdits.get(query.from.id)
    if (!edit || edit.stage !== 'confirm' || edit.productId !== id) {
      await answerCallback(query, 'This edit has expired.', true)
      return true
    }
    database.prepare(`UPDATE products SET ${edit.field} = ? WHERE id = ?`).run(edit.newValue, id)
    productEdits.delete(query.from.id)
    await answerCallback(query, 'Product updated.')
    await api('sendMessage', { chat_id: query.message.chat.id, text: `✅ Product updated successfully\n\n📦 #${id} · ${product.name}\n${productFieldLabels[edit.field]}\nOld: ${formatProductValue(edit.field, edit.oldValue)}\nNew: ${formatProductValue(edit.field, edit.newValue)}\n\nThe Mini App catalog is now updated.` })
    return true
  }
  await answerCallback(query, 'Invalid product action.', true)
  return true
}

async function handleProductInput(message) {
  const edit = productEdits.get(message.from.id)
  if (!edit || edit.stage !== 'value') return false
  if (!staffAllowed(message.from.id, message.chat.id) || String(edit.chatId) !== String(message.chat.id)) {
    productEdits.delete(message.from.id)
    await rejectStaffMessage(message)
    return true
  }
  try {
    edit.newValue = validateProductValue(edit.field, message.text)
    edit.stage = 'confirm'
    await api('sendMessage', { chat_id: message.chat.id, text: `❓ Confirm product change\n\n${productFieldLabels[edit.field]}\nOld: ${formatProductValue(edit.field, edit.oldValue)}\nNew: ${formatProductValue(edit.field, edit.newValue)}`, reply_markup: { inline_keyboard: [[{ text: '✅ Save', callback_data: `product:save:${edit.productId}` }, { text: '❌ Cancel', callback_data: 'product:cancel' }]] } })
  } catch (error) {
    await api('sendMessage', { chat_id: message.chat.id, text: `⚠️ ${error.message}\nNothing was changed. Try again or send /cancel.` })
  }
  return true
}

async function handle(update) {
  if (update.callback_query) {
    const query = update.callback_query
    if (await handleStatusCallback(query)) return
    if (await handleProductCallback(query)) return
    await api('answerCallbackQuery', { callback_query_id: query.id })
    if (query.message?.chat.type === 'private') await api('sendMessage', { chat_id: query.message.chat.id, text: replyFor(query.data), reply_markup: menu() })
    return
  }

  const message = update.message
  if (!message?.text) return
  const command = message.text.split(/\s/, 1)[0].toLowerCase().split('@')[0]
  if (command === '/groupid') {
    if (message.chat.type === 'private') {
      await api('sendMessage', { chat_id: message.chat.id, text: 'សូមបន្ថែម bot ចូលក្រុម private រួចផ្ញើ /groupid នៅក្នុងក្រុម។\nAdd the bot to the private group, make it admin, then send /groupid inside that group.' })
      return
    }
    const [sender, bot] = await Promise.all([
      api('getChatMember', { chat_id: message.chat.id, user_id: message.from.id }),
      api('getMe'),
    ])
    const botMember = await api('getChatMember', { chat_id: message.chat.id, user_id: bot.id })
    if (!['administrator', 'creator'].includes(sender.status) || !['administrator', 'creator'].includes(botMember.status)) {
      await api('sendMessage', { chat_id: message.chat.id, text: '⚠️ សូមធ្វើឱ្យ bot ជា Admin រួចអ្នកគ្រប់គ្រងផ្យើ /groupid ម្តងទៀត។\nMake the bot an admin, then have a group admin send /groupid again.' })
      return
    }
    await saveOrderGroupId(message.chat.id)
    await api('sendMessage', { chat_id: message.chat.id, text: `✅ បានរក្សា Order Group ID\nTELEGRAM_ORDER_GROUP_ID=${message.chat.id}\n\nConfirmed orders will be sent here.` })
    return
  }
  if (['/products', '/editproduct', '/cancel'].includes(command)) {
    await handleProductCommand(message, command)
    return
  }
  if (await handleProductInput(message)) return
  if (message.chat.type !== 'private') return
  const action = ({ '/orders': 'orders', '/contact': 'contact', '/help': 'help' })[command]
  if (!action) await sendWelcome(message.chat.id)
  else await api('sendMessage', { chat_id: message.chat.id, text: replyFor(action), reply_markup: menu() })
}

async function main() {
  if (!token || token.includes('replace_with_')) throw new Error('Set TELEGRAM_BOT_TOKEN in .env')
  miniAppUrl()
  await initDatabase()
  await loadOrders()
  await api('deleteWebhook', { drop_pending_updates: true })
  await api('setMyCommands', { commands: [
    { command: 'start', description: 'បើកហាង / Open store' },
    { command: 'orders', description: 'ការបញ្ជាទិញ / Orders' },
    { command: 'contact', description: 'ទំនាក់ទំនង / Contact' },
    { command: 'help', description: 'របៀបទិញ / Help' },
    { command: 'products', description: 'Product list (staff)' },
    { command: 'editproduct', description: 'Edit a product (staff)' },
    { command: 'cancel', description: 'Cancel product editing' },
    { command: 'groupid', description: 'មើល Group ID / Show group ID' },
  ] })
  server.listen(Number(process.env.BOT_PORT) || 8787, '127.0.0.1')
  console.log(`${storeConfig.storeName} bot is listening; order group ${orderGroupId ? 'configured' : 'not configured'}`)
  while (running) {
    try {
      const updates = await api('getUpdates', { offset, timeout: 30, allowed_updates: ['message', 'callback_query'] })
      for (const update of updates) {
        offset = update.update_id + 1
        await handle(update)
      }
    } catch (error) {
      console.error(error.message)
      await sleep(2000)
    }
  }
}

async function apiOnly() {
  await initDatabase()
  await loadOrders()
  server.listen(Number(process.env.BOT_PORT) || 8787, '127.0.0.1')
  console.log(`${storeConfig.storeName} catalog API is listening (preview mode)`)
}

function selfTest() {
  const check = (condition) => { if (!condition) throw new Error('Bot self-test failed') }
  check(menu('https://example.com/').inline_keyboard[0][0].web_app.url === 'https://example.com/')
  const testOrderId = `${storeConfig.orderIdPrefix}-123456`
  const state = { status: 'new', order: { id: testOrderId, total: 12, items: [{ name: 'Shirt', quantity: 2, size: 'M', color: 'Black' }] }, customer: { name: 'Sokha', phone: '012', address: 'Street', province: 'Phnom Penh' }, createdAt: '18 Jul 2026' }
  check(statusKeyboard(state).inline_keyboard[0][0].callback_data === `status:accepted:${testOrderId}`)
  check(orderText(state).includes('Cash on Delivery'))
  check(customerStatusText(state).includes(formatMoney(12)))
  check(customerStatusText(state).includes('Street, Phnom Penh'))
  check(validateProductValue('price', '29.99') === 29.99)
  check(validateProductValue('discount', '25%') === 25)
  check(validateProductValue('name', 'New name') === 'New name')
  check(['-1', '101'].every((value) => { try { validateProductValue('discount', value); return false } catch { return true } }))
  check(['0', '-1', 'not-a-price'].every((value) => { try { validateProductValue('price', value); return false } catch { return true } }))
  const previousGroupId = orderGroupId
  const hadTestStaff = authorizedStaffIds.has(42)
  orderGroupId = '-100123'
  authorizedStaffIds.add(42)
  check(staffAllowed(42, '-100123') && !staffAllowed(43, '-100123') && !staffAllowed(42, '-100999'))
  if (!hadTestStaff) authorizedStaffIds.delete(42)
  orderGroupId = previousGroupId
  const testDatabase = new DatabaseSync(':memory:')
  createProductSchema(testDatabase)
  seedProductDatabase(testDatabase)
  const originalName = productRow(1, testDatabase).name
  testDatabase.prepare('UPDATE products SET name = ? WHERE id = ?').run('Updated name', 1)
  check(productRow(1, testDatabase).name === 'Updated name')
  testDatabase.prepare('UPDATE products SET name = ? WHERE id = ?').run(originalName, 1)
  check(allProducts(testDatabase).length === seedProducts.length)
  testDatabase.close()
  const testToken = '1:test'
  const params = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: '{"id":1,"first_name":"Test"}' })
  const data = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(testToken).digest()
  params.set('hash', createHmac('sha256', secret).update(data).digest('hex'))
  check(validateInitData(params.toString(), testToken).id === 1)
  console.log('Bot checks passed')
}

if (process.argv.includes('--self-test')) selfTest()
else {
  process.once('SIGINT', () => { running = false; server.close() })
  process.once('SIGTERM', () => { running = false; server.close() })
  ;(process.argv.includes('--api-only') ? apiOnly() : main()).catch((error) => { console.error(error.message); process.exitCode = 1 })
}
