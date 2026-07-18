import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product } from '@/types'
import { presets } from '@/data/presets'
import { storeConfig } from '@/config/store.config'
import { translations } from '@/config/translations'

export const useShowcaseStore = defineStore('showcase', () => {
  const current = presets[0]
  const products = ref<Product[]>([])
  const categories = current.categories
  const heroBanners = current.heroBanners
  const copy = translations[storeConfig.defaultLocale]

  function formatMoney(value: number) {
    return new Intl.NumberFormat('km-KH', { style: 'currency', currency: current.currency, maximumFractionDigits: current.currency === 'KHR' ? 0 : 2 }).format(value)
  }

  async function loadProducts() {
    try {
      const response = await fetch('/api/products', { cache: 'no-store' })
      if (response.ok) products.value = await response.json() as Product[]
    } catch { /* keep the last successful catalog while offline */ }
  }

  void loadProducts()
  // ponytail: 2-second polling keeps the catalog fresh; replace with push updates only if traffic makes polling costly.
  setInterval(loadProducts, 2000)

  return { current, products, categories, heroBanners, copy, formatMoney, loadProducts }
})
