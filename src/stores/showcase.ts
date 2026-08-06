import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, CategoryItem, StoreConfig, HeroBanner } from '@/types'
import { fetchStoreBySlug, fetchProducts, fetchCategories, ACTIVE_STORE_SLUG } from '@/core/api/storeApi'
import { storeConfig as defaultStoreConfig } from '@/config/store.config'
import { translations } from '@/config/translations'

export const useShowcaseStore = defineStore('showcase', () => {
  const storeInfo = ref<StoreConfig>(defaultStoreConfig as unknown as StoreConfig)
  const products = ref<Product[]>([])
  const categoryItems = ref<CategoryItem[]>([])
  const currentLocale = ref<'km' | 'en'>(defaultStoreConfig.defaultLocale)
  const isLoading = ref<boolean>(false)

  const copy = computed(() => translations[currentLocale.value] || translations.km)
  const categories = computed(() => categoryItems.value.map(c => c.nameKm || c.nameEn))

  // Backward compatibility alias
  const current = computed(() => storeInfo.value)
  const heroBanners = computed<HeroBanner[]>(() => [
    {
      image: storeInfo.value.heroBanner || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
      title: storeInfo.value.storeName,
      copy: storeInfo.value.description,
    }
  ])

  function formatMoney(value: number) {
    const currency = storeInfo.value.currency
    const locale = currentLocale.value === 'km' ? 'km-KH' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'KHR' ? 0 : 2
    }).format(value)
  }

  function setLocale(lang: 'km' | 'en') {
    currentLocale.value = lang
  }

  async function loadStoreData() {
    isLoading.value = true
    try {
      const [fetchedStore, fetchedCategories, fetchedProducts] = await Promise.all([
        fetchStoreBySlug(ACTIVE_STORE_SLUG),
        fetchCategories(ACTIVE_STORE_SLUG),
        fetchProducts(ACTIVE_STORE_SLUG),
      ])

      storeInfo.value = fetchedStore
      categoryItems.value = fetchedCategories
      products.value = fetchedProducts
      currentLocale.value = fetchedStore.defaultLocale || 'km'
    } catch {
      /* fallback to defaults */
    } finally {
      isLoading.value = false
    }
  }

  void loadStoreData()

  return {
    storeInfo,
    current,
    products,
    categoryItems,
    categories,
    heroBanners,
    currentLocale,
    copy,
    isLoading,
    formatMoney,
    setLocale,
    loadStoreData
  }
})
