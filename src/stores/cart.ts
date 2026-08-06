import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { CartLine } from '@/types'
import { useShowcaseStore } from './showcase'
import { storeConfig } from '@/config/store.config'

const loadCart = (): CartLine[] => {
  try {
    const saved = localStorage.getItem(`${storeConfig.id}-cart-v1`)
    return saved ? (JSON.parse(saved) as CartLine[]) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const showcase = useShowcaseStore()
  const lines = ref<CartLine[]>(loadCart())
  const voucherCode = ref('')

  const items = computed(() =>
    lines.value.flatMap((line) => {
      const product = showcase.products.find((candidate) => String(candidate.id) === String(line.productId))
      return product ? [{ ...line, product, lineTotal: product.price * line.quantity }] : []
    })
  )

  const count = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.lineTotal, 0))
  const discount = computed(() =>
    voucherCode.value === showcase.storeInfo.promotion.code
      ? (subtotal.value * showcase.storeInfo.promotion.discountPercent) / 100
      : 0
  )
  const deliveryFee = computed(() =>
    subtotal.value >= showcase.storeInfo.delivery.freeFrom || !subtotal.value ? 0 : showcase.storeInfo.delivery.fee
  )
  const total = computed(() => subtotal.value - discount.value + deliveryFee.value)

  function add(productId: number | string, quantity = 1, options: Pick<CartLine, 'color' | 'variant'> = {}) {
    const line = lines.value.find((item) => String(item.productId) === String(productId))
    if (line) Object.assign(line, options, { quantity: line.quantity + quantity })
    else lines.value.push({ productId, quantity, ...options })
  }

  function update(productId: number | string, quantity: number) {
    if (quantity < 1) return remove(productId)
    const line = lines.value.find((item) => String(item.productId) === String(productId))
    if (line) line.quantity = quantity
  }

  function remove(productId: number | string) {
    lines.value = lines.value.filter((item) => String(item.productId) !== String(productId))
  }

  function clear() {
    lines.value = []
    voucherCode.value = ''
  }

  function applyVoucher(code: string) {
    voucherCode.value =
      code.trim().toUpperCase() === showcase.storeInfo.promotion.code ? showcase.storeInfo.promotion.code : ''
    return Boolean(voucherCode.value)
  }

  watch(lines, (value) => localStorage.setItem(`${storeConfig.id}-cart-v1`, JSON.stringify(value)), { deep: true })

  return { lines, items, count, subtotal, discount, deliveryFee, total, voucherCode, add, update, remove, clear, applyVoucher }
})
