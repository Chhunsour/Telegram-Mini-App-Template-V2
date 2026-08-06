import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { CartLine, Order } from '@/types'
import { storeConfig } from '@/config/store.config'
import { submitOrder, ACTIVE_STORE_SLUG } from '@/core/api/storeApi'
import { getTelegramUser } from '@/core/auth/telegramAuth'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>(loadOrders())

  async function create(
    items: CartLine[],
    total: number,
    paymentMethod: string,
    customerDetails?: {
      name?: string
      phone?: string
      address?: string
      province?: string
      deliveryFee?: number
      subtotal?: number
      discount?: number
      notes?: string
    },
    customId?: string
  ) {
    const telegramUser = getTelegramUser()
    const prefix = storeConfig.orderIdPrefix || 'ORD'
    const id = customId || `${prefix}-${Date.now().toString().slice(-6)}`

    const order: Order = {
      id,
      storeId: ACTIVE_STORE_SLUG,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      total,
      subtotal: customerDetails?.subtotal || total,
      discount: customerDetails?.discount || 0,
      deliveryFee: customerDetails?.deliveryFee || 0,
      items: items.map(({ productId, product, quantity, color, variant, size }) => ({
        productId,
        product,
        quantity,
        color,
        variant,
        size
      })),
      customerName: customerDetails?.name || 'Customer',
      customerPhone: customerDetails?.phone || 'N/A',
      customerAddress: customerDetails?.address || 'N/A',
      deliveryProvince: customerDetails?.province || 'ភ្នំពេញ',
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' || paymentMethod === ' Cash on delivery' ? 'Unpaid' : 'Paid',
      deliveryStatus: 'Waiting for confirmation',
      notes: customerDetails?.notes,
      telegramUserId: telegramUser?.id,
    }

    // Unshift into local state immediately for fast response
    orders.value.unshift(order)

    // Asynchronously persist to Supabase backend & send Telegram order notification
    try {
      await submitOrder(order)
    } catch {
      /* fallback to local storage if offline */
    }

    return order
  }

  watch(orders, (value) => localStorage.setItem(`${storeConfig.id}-orders-v1`, JSON.stringify(value)), { deep: true })

  return { orders, create }
})

function loadOrders(): Order[] {
  try {
    const saved = localStorage.getItem(`${storeConfig.id}-orders-v1`)
    return saved ? (JSON.parse(saved) as Order[]) : []
  } catch {
    return []
  }
}
