import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useShowcaseStore } from './showcase'
import { storeConfig } from '@/config/store.config'

const loadFavorites = () => {
  try { return JSON.parse(localStorage.getItem(`${storeConfig.id}-favorites-v1`) || '[]') as number[] }
  catch { return [] }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<number[]>(loadFavorites())
  const showcase = useShowcaseStore()
  const products = computed(() => showcase.products.filter((product) => ids.value.includes(product.id)))
  const has = (id: number) => ids.value.includes(id)
  const toggle = (id: number) => ids.value = has(id) ? ids.value.filter((value) => value !== id) : [...ids.value, id]
  watch(ids, (value) => localStorage.setItem(`${storeConfig.id}-favorites-v1`, JSON.stringify(value)), { deep: true })
  return { ids, products, has, toggle }
})
