import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useShowcaseStore } from './showcase'
import { storeConfig } from '@/config/store.config'

const loadFavorites = (): (number | string)[] => {
  try {
    return JSON.parse(localStorage.getItem(`${storeConfig.id}-favorites-v1`) || '[]') as (number | string)[]
  } catch {
    return []
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<(number | string)[]>(loadFavorites())
  const showcase = useShowcaseStore()

  const products = computed(() =>
    showcase.products.filter((product) => ids.value.some((id) => String(id) === String(product.id)))
  )

  const has = (id: number | string) => ids.value.some((favId) => String(favId) === String(id))

  const toggle = (id: number | string) => {
    ids.value = has(id)
      ? ids.value.filter((value) => String(value) !== String(id))
      : [...ids.value, id]
  }

  watch(ids, (value) => localStorage.setItem(`${storeConfig.id}-favorites-v1`, JSON.stringify(value)), { deep: true })

  return { ids, products, has, toggle }
})
