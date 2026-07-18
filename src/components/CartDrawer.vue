<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useShowcaseStore } from '@/stores/showcase'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const cart = useCartStore()
const { items, total } = storeToRefs(cart)
const showcase = useShowcaseStore()
const ui = showcase.copy.ui
</script>

<template>
  <Transition name="fade">
    <button v-if="open" class="drawer-backdrop" :aria-label="ui.nav.closeCart" @click="$emit('close')" />
  </Transition>
  <Transition name="drawer-right">
    <aside v-if="open" class="drawer drawer-right" aria-label="កន្រ្តកទំនិញ">
      <div class="drawer-heading">
        <h2>{{ ui.cart.title }}</h2>
        <button type="button" :aria-label="ui.nav.closeCart" @click="$emit('close')">×</button>
      </div>
      <p v-if="!items.length" class="empty-copy">{{ ui.cart.empty }}</p>
      <article v-for="item in items" :key="item.productId" class="mini-cart-item">
        <img :src="item.product.image" :alt="item.product.name" />
        <div>
          <RouterLink :to="`/products/${item.product.slug}`">{{ item.product.name }}</RouterLink>
          <span>{{ item.quantity }} × {{ showcase.formatMoney(item.product.price) }}</span>
        </div>
        <button type="button" :aria-label="`${ui.common.remove} ${item.product.name}`" @click="cart.remove(item.productId)">×</button>
      </article>
      <div v-if="items.length" class="drawer-cart-footer">
        <strong>{{ ui.common.total }} <span>{{ showcase.formatMoney(total) }}</span></strong>
        <RouterLink class="button button-block" to="/checkout">{{ ui.common.checkout }}</RouterLink>
        <RouterLink class="text-link" to="/cart">{{ ui.cart.viewCart }}</RouterLink>
      </div>
    </aside>
  </Transition>
</template>
