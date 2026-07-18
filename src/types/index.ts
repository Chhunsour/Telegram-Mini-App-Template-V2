export type Category = string

export interface Product {
  id: number
  slug: string
  name: string
  category: Category
  price: number
  discount?: number
  oldPrice?: number
  rating: number
  stock: number
  soldCount: number
  isNew?: boolean
  isBestSeller?: boolean
  image: string
  images: string[]
  description: string
  badge?: string
  colors: string[]
  variants: string[]
  deliveryEstimate: string
  createdAt: string
}

export interface CartLine {
  productId: number
  quantity: number
  color?: string
  variant?: string
}

export interface Order {
  id: string
  createdAt: string
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Shipping' | 'Delivered' | 'Cancelled'
  total: number
  items: CartLine[]
  paymentMethod: string
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded'
  deliveryStatus: string
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
