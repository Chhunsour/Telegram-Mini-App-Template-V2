import type { StorePreset } from '@/types'
import { productCategories } from '@/config/products'
import { storeConfig } from '@/config/store.config'
import { themeConfig } from '@/config/theme.config'
import { translations } from '@/config/translations'

const copy = translations[storeConfig.defaultLocale]

export const presets: StorePreset[] = [{
  id: storeConfig.id,
  storeName: storeConfig.storeName,
  logo: storeConfig.logo,
  primaryColor: themeConfig.primaryColor,
  secondaryColor: themeConfig.secondaryColor,
  currency: storeConfig.currency,
  telegramUsername: storeConfig.telegram.botUsername,
  phone: storeConfig.contact.phone,
  email: storeConfig.contact.email,
  address: storeConfig.contact.address,
  heroBanners: [...copy.heroBanners],
  categories: [...productCategories],
  products: [],
}]
