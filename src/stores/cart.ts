import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { CartLine } from '@/types'
import { useShowcaseStore } from './showcase'
import { storeConfig } from '@/config/store.config'

const loadCart = (): CartLine[] => {
  try {
    const saved = localStorage.getItem(`${storeConfig.id}-cart-v1`)
    return saved ? JSON.parse(saved) as CartLine[] : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const showcase = useShowcaseStore()
  const lines = ref<CartLine[]>(loadCart())
  const voucherCode = ref('')
  const items = computed(() => lines.value.flatMap((line) => {
    const product = showcase.products.find((candidate) => candidate.id === line.productId)
    return product ? [{ ...line, product, lineTotal: product.price * line.quantity }] : []
  }))
  const count = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.lineTotal, 0))
  const discount = computed(() => voucherCode.value === storeConfig.promotion.code ? subtotal.value * storeConfig.promotion.discountPercent / 100 : 0)
  const deliveryFee = computed(() => subtotal.value >= storeConfig.delivery.freeFrom || !subtotal.value ? 0 : storeConfig.delivery.fee)
  const total = computed(() => subtotal.value - discount.value + deliveryFee.value)

  function add(productId: number, quantity = 1, options: Pick<CartLine, 'color' | 'variant'> = {}) {
    // ponytail: one line per product; split variant lines when multi-variant carts become a real requirement.
    const line = lines.value.find((item) => item.productId === productId)
    if (line) Object.assign(line, options, { quantity: line.quantity + quantity })
    else lines.value.push({ productId, quantity, ...options })
  }

  function update(productId: number, quantity: number) {
    if (quantity < 1) return remove(productId)
    const line = lines.value.find((item) => item.productId === productId)
    if (line) line.quantity = quantity
  }

  function remove(productId: number) {
    lines.value = lines.value.filter((item) => item.productId !== productId)
  }

  function clear() {
    lines.value = []
    voucherCode.value = ''
  }

  function applyVoucher(code: string) {
    voucherCode.value = code.trim().toUpperCase() === storeConfig.promotion.code ? storeConfig.promotion.code : ''
    return Boolean(voucherCode.value)
  }

  watch(lines, (value) => localStorage.setItem(`${storeConfig.id}-cart-v1`, JSON.stringify(value)), { deep: true })

  return { lines, items, count, subtotal, discount, deliveryFee, total, voucherCode, add, update, remove, clear, applyVoucher }
})
