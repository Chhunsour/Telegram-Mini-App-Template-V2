import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { CartLine, Order } from '@/types'
import { storeConfig } from '@/config/store.config'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>(loadOrders())

  function create(items: CartLine[], total: number, paymentMethod: string, id = `${storeConfig.orderIdPrefix}-${Date.now().toString().slice(-6)}`) {
    const order: Order = {
      id,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      total,
      items: items.map(({ productId, quantity, color, variant }) => ({ productId, quantity, color, variant })),
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on delivery' ? 'Unpaid' : 'Paid',
      deliveryStatus: 'Waiting for confirmation',
    }
    orders.value.unshift(order)
    return order
  }

  watch(orders, (value) => localStorage.setItem(`${storeConfig.id}-orders-v1`, JSON.stringify(value)), { deep: true })

  return { orders, create }
})

function loadOrders() {
  try {
    const saved = localStorage.getItem(`${storeConfig.id}-orders-v1`)
    return saved ? JSON.parse(saved) as Order[] : []
  } catch {
    return []
  }
}
