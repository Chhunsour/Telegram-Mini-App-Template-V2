<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { useCartStore } from '@/stores/cart'
import { useShowcaseStore } from '@/stores/showcase'
import { hideMainButton, showMainButton } from '@/services/telegram'

const router = useRouter()
const cart = useCartStore()
const showcase = useShowcaseStore()
const ui = showcase.copy.ui
const { items, subtotal, discount, deliveryFee, total } = storeToRefs(cart)
const voucher = ref('')
const voucherMessage = ref('')

function applyVoucher() {
  voucherMessage.value = cart.applyVoucher(voucher.value) ? ui.cart.voucherApplied : ui.cart.voucherInvalid
}

watchEffect(() => items.value.length ? showMainButton(`ទូទាត់ · ${showcase.formatMoney(total.value)}`, () => router.push('/checkout')) : hideMainButton())
onBeforeUnmount(hideMainButton)
</script>

<template>
  <PageHeader :title="ui.cart.title" :eyebrow="ui.cart.eyebrow"><p>{{ ui.cart.intro }}</p></PageHeader>
  <section class="container section section-tight">
    <div v-if="items.length" class="cart-layout">
      <div>
        <div class="cart-list">
          <article v-for="item in items" :key="item.productId" class="cart-item">
            <img :src="item.product.image" :alt="item.product.name" width="900" height="900" />
            <div class="cart-item-copy"><span>{{ item.product.category }}</span><RouterLink :to="`/products/${item.product.slug}`"><h2>{{ item.product.name }}</h2></RouterLink><p v-if="item.color || item.variant">{{ [item.color, item.variant].filter(Boolean).join(' · ') }}</p><strong>{{ showcase.formatMoney(item.product.price) }}</strong><div class="stepper compact"><button type="button" aria-label="បន្ថយចំនួន" @click="cart.update(item.productId, item.quantity - 1)">−</button><input :value="item.quantity" type="number" min="1" :max="item.product.stock" :aria-label="`ចំនួន ${item.product.name}`" @change="cart.update(item.productId, Number(($event.target as HTMLInputElement).value))" /><button type="button" aria-label="បន្ថែមចំនួន" @click="cart.update(item.productId, Math.min(item.product.stock, item.quantity + 1))">+</button></div></div>
            <button class="remove-button" type="button" :aria-label="`ដក ${item.product.name} ចេញ`" @click="cart.remove(item.productId)">×</button>
          </article>
        </div>
        <form class="voucher-form" @submit.prevent="applyVoucher"><label for="voucher">{{ ui.cart.voucher }}</label><div><input id="voucher" v-model="voucher" :placeholder="ui.cart.voucher" /><button type="submit">{{ ui.cart.apply }}</button></div><p aria-live="polite">{{ voucherMessage }}</p></form>
      </div>
      <aside class="summary-card"><h2>{{ ui.cart.title }}</h2><p><span>{{ ui.common.subtotal }}</span><strong>{{ showcase.formatMoney(subtotal) }}</strong></p><p><span>{{ ui.common.discount }}</span><strong>−{{ showcase.formatMoney(discount) }}</strong></p><p><span>{{ ui.common.delivery }}</span><strong>{{ deliveryFee ? showcase.formatMoney(deliveryFee) : ui.common.free }}</strong></p><p class="summary-total"><span>{{ ui.common.total }}</span><strong>{{ showcase.formatMoney(total) }}</strong></p><RouterLink class="button button-block" to="/checkout">{{ ui.common.checkout }}</RouterLink></aside>
    </div>
    <div v-else class="empty-state"><span class="empty-icon">◫</span><h2>{{ ui.cart.empty }}</h2><RouterLink class="button" to="/categories">{{ ui.cart.startShopping }}</RouterLink></div>
  </section>
</template>
