<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { useOrdersStore } from '@/stores/orders'
import { useShowcaseStore } from '@/stores/showcase'

const ordersStore = useOrdersStore()
const showcase = useShowcaseStore()
const ui = computed(() => showcase.copy.ui)
const expanded = ref<string>()

const itemName = (productId: number | string) =>
  showcase.products.find((product) => String(product.id) === String(productId))?.name || 'ទំនិញ'

const labels = computed<Record<string, string>>(() => ui.value.orders.status)
</script>

<template>
  <PageHeader :title="ui.orders.title" :eyebrow="ui.orders.history" />

  <section v-if="ordersStore.orders.length" class="container section section-tight order-list">
    <article v-for="order in ordersStore.orders" :key="order.id" class="order-card">
      <div class="order-card-head">
        <div>
          <span>{{ showcase.currentLocale === 'km' ? 'ការបញ្ជាទិញ' : 'Order' }}</span>
          <h2>{{ order.id }}</h2>
        </div>
        <strong :class="`status status-${order.status.toLowerCase()}`">
          {{ labels[order.status] || order.status }}
        </strong>
      </div>

      <p class="order-date">
        {{ new Intl.DateTimeFormat(showcase.currentLocale === 'km' ? 'km-KH' : 'en-US', { dateStyle: 'medium' }).format(new Date(order.createdAt)) }}
      </p>

      <p class="order-summary">
        {{ order.items.map((item) => `${itemName(item.productId)} × ${item.quantity}`).join(', ') }}
      </p>

      <div class="order-total">
        <span>{{ ui.common.total }}</span>
        <strong>{{ showcase.formatMoney(order.total) }}</strong>
      </div>

      <button class="order-detail-toggle" type="button" @click="expanded = expanded === order.id ? undefined : order.id">
        {{ expanded === order.id ? ui.orders.hide : ui.orders.details }}
      </button>

      <div v-if="expanded === order.id" class="order-details">
        <p><span>{{ ui.orders.payment }}</span><strong>{{ order.paymentMethod }}</strong></p>
        <p><span>{{ ui.orders.paymentStatus }}</span><strong>{{ labels[order.paymentStatus] || order.paymentStatus }}</strong></p>
        <p><span>{{ ui.orders.deliveryStatus }}</span><strong>{{ labels[order.status] || order.status }}</strong></p>
        <RouterLink to="/contact">{{ ui.common.contactStore }}</RouterLink>
      </div>
    </article>
  </section>

  <section v-else class="empty-state container section">
    <h2>{{ ui.orders.empty }}</h2>
    <RouterLink class="button primary-btn" to="/categories">{{ ui.common.browse }}</RouterLink>
  </section>
</template>
