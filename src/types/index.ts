export type Locale = 'km' | 'en'

export interface StoreConfig {
  id: string
  slug: string
  orderIdPrefix: string
  storeName: string
  shortName: string
  description: string
  logo: string
  favicon: string
  heroBanner: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedColor: string
  fontFamily: string
  borderRadius: string
  defaultLocale: Locale
  currency: 'USD' | 'KHR'
  contact: {
    phone: string
    email: string
    address: string
  }
  delivery: {
    fee: number
    freeFrom: number
    estimateKm: string
    estimateEn: string
    provinces: string[]
  }
  checkoutDefaults: {
    customerName: string
    phone: string
    address: string
  }
  promotion: {
    code: string
    discountPercent: number
  }
  telegram: {
    botUsername: string
    orderGroupId?: string
  }
  social: {
    facebook: string
    instagram: string
    tiktok: string
  }
  policies: Array<{
    titleKm: string
    titleEn: string
    textKm: string
    textEn: string
  }>
  paymentMethods: string[]
}

export interface CategoryItem {
  id: string
  slug: string
  nameKm: string
  nameEn: string
  icon?: string
  sortOrder?: number
}

export type Category = string

export interface Product {
  id: number | string
  legacyId?: number
  slug: string
  name: string
  nameKm?: string
  nameEn?: string
  category: Category
  categoryId?: string
  price: number
  basePrice?: number
  discount?: number
  discountPercent?: number
  oldPrice?: number
  rating: number
  stock: number
  soldCount: number
  isNew?: boolean
  isBestSeller?: boolean
  image: string
  images: string[]
  description: string
  descriptionKm?: string
  descriptionEn?: string
  badge?: string
  colors: string[]
  sizes?: string[]
  variants?: string[]
  deliveryEstimate: string
  deliveryEstimateKm?: string
  deliveryEstimateEn?: string
  createdAt: string
}

export interface CartLine {
  productId: number | string
  product?: Product
  quantity: number
  color?: string
  variant?: string
  size?: string
}

export interface Order {
  id: string
  storeId?: string
  createdAt: string
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Shipping' | 'Delivered' | 'Cancelled'
  total: number
  subtotal?: number
  discount?: number
  deliveryFee?: number
  currency?: string
  items: CartLine[]
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  deliveryProvince?: string
  paymentMethod: string
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded'
  deliveryStatus: string
  notes?: string
  telegramUserId?: number
}

export interface HeroBanner {
  image: string
  title: string
  copy: string
  category?: string
}

export interface StorePreset {
  id: string
  storeName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  currency: 'USD' | 'KHR'
  telegramUsername: string
  phone: string
  email: string
  address: string
  heroBanners: HeroBanner[]
  categories: string[]
  products: Product[]
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export interface AuditLog {
  id: string
  storeId: string
  telegramUserId?: number
  action: string
  recordChanged: string
  previousValue?: unknown
  newValue?: unknown
  createdAt: string
}
