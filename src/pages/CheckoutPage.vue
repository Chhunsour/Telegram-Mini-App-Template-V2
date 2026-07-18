<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { storeConfig } from '@/config/store.config'
import { translations } from '@/config/translations'
import { getTelegramInitData, hideMainButton, showMainButton } from '@/services/telegram'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useShowcaseStore } from '@/stores/showcase'

const t = translations[storeConfig.defaultLocale].checkout
const paymentMethods = ['Cash on delivery', 'ABA', 'Bakong', 'Bank transfer']
const paymentIcons: Record<string, string> = { 'Cash on delivery': '៛', ABA: 'ABA', Bakong: 'KHQR', 'Bank transfer': '⇄' }
const router = useRouter()
const cart = useCartStore()
const orders = useOrdersStore()
const showcase = useShowcaseStore()
const { items, subtotal, discount, deliveryFee, total } = storeToRefs(cart)
const form = ref<HTMLFormElement>()
const paymentMethod = ref(paymentMethods[0])
const submitError = ref('')
const submitting = ref(false)
const orderId = ref('')
const review = ref<Record<string, string>>()

function showCheckoutButton() {
  if (items.value.length && !review.value) showMainButton(`${t.reviewOrder.toUpperCase()} · ${showcase.formatMoney(total.value)}`, () => form.value?.requestSubmit())
  else hideMainButton()
}

function reviewOrder() {
  if (!items.value.length) return router.push('/categories')
  if (!getTelegramInitData()) {
    submitError.value = t.telegramOnly
    return
  }
  review.value = Object.fromEntries(new FormData(form.value!)) as Record<string, string>
  orderId.value ||= `${storeConfig.orderIdPrefix}-${Date.now().toString().slice(-6)}`
  submitError.value = ''
  hideMainButton()
}

function editOrder() {
  if (submitting.value) return
  review.value = undefined
  showCheckoutButton()
}

function cancelOrder() {
  if (submitting.value) return
  review.value = undefined
  orderId.value = ''
  router.push('/cart')
}

async function confirmOrder() {
  if (!review.value || submitting.value) return
  submitting.value = true
  submitError.value = ''
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        initData: getTelegramInitData(),
        order: { id: orderId.value, total: total.value, paymentMethod: paymentMethod.value, items: items.value.map((item) => ({ name: item.product.name, quantity: item.quantity, size: item.variant || '', color: item.color || '' })) },
        customer: review.value,
      }),
    })
    if (!response.ok) throw new Error()
    orders.create(cart.lines, total.value, paymentMethod.value, orderId.value)
    cart.clear()
    router.push(`/order-confirmation/${orderId.value}`)
  } catch {
    submitError.value = t.sendError
  } finally {
    submitting.value = false
  }
}

onMounted(showCheckoutButton)
onBeforeUnmount(hideMainButton)
</script>

<template>
  <PageHeader :title="t.title" :eyebrow="t.eyebrow"><p>{{ t.intro }}</p></PageHeader>
  <section class="container section section-tight">
    <div class="demo-payment-banner"><b>{{ t.demoTitle }}</b><span>{{ t.demoCopy }}</span></div>
    <div v-if="review" class="final-order-review">
      <header><span>{{ t.finalReview }} / FINAL REVIEW</span><h2>{{ t.confirmHeading }}</h2><p>{{ t.unsent }}</p></header>
      <div class="review-customer"><p><span>{{ t.fullName }}</span><strong>{{ review.name }}</strong></p><p><span>{{ t.phone }}</span><strong>{{ review.phone }}</strong></p><p><span>{{ t.address }}</span><strong>{{ review.address }}, {{ review.province }}</strong></p></div>
      <div class="review-products"><article v-for="item in items" :key="item.productId"><img :src="item.product.image" :alt="item.product.name" /><div><strong>{{ item.product.name }}</strong><span>{{ [item.color, item.variant, `${t.quantity} ${item.quantity}`].filter(Boolean).join(' · ') }}</span></div><b>{{ showcase.formatMoney(item.lineTotal) }}</b></article></div>
      <p class="review-total"><span>{{ t.total }}</span><strong>{{ showcase.formatMoney(total) }}</strong></p>
      <p class="review-payment">💵 {{ t.cod }}</p>
      <p v-if="submitError" class="form-error" role="alert">{{ submitError }}</p>
      <div class="review-actions"><button class="button" type="button" :disabled="submitting" @click="confirmOrder">{{ submitting ? t.sending : `✅ ${t.confirm}` }}</button><button class="button button-secondary" type="button" :disabled="submitting" @click="editOrder">✏️ {{ t.edit }}</button><button class="text-button danger" type="button" :disabled="submitting" @click="cancelOrder">❌ {{ t.cancel }}</button></div>
    </div>
    <div v-else-if="items.length" class="checkout-layout">
      <form ref="form" class="checkout-form" @submit.prevent="reviewOrder">
        <fieldset><legend>{{ t.customer }}</legend><label>{{ t.fullName }}<input name="name" autocomplete="name" :value="storeConfig.checkoutDefaults.customerName" required /></label><label>{{ t.phone }}<input name="phone" type="tel" autocomplete="tel" :value="storeConfig.checkoutDefaults.phone" pattern="[0-9 +()-]{8,20}" required /></label></fieldset>
        <fieldset><legend>{{ t.deliveryAddress }}</legend><label>{{ t.province }}<select name="province" required><option v-for="province in storeConfig.delivery.provinces" :key="province">{{ province }}</option></select></label><label class="field-wide">{{ t.address }}<input name="address" autocomplete="street-address" :value="storeConfig.checkoutDefaults.address" required /></label></fieldset>
        <fieldset><legend>{{ t.deliveryMethod }}</legend><label class="radio-card"><input type="radio" name="delivery" value="standard" checked /><span><strong>{{ t.standardDelivery }}</strong><small>{{ deliveryFee ? showcase.formatMoney(deliveryFee) : t.free }} · {{ storeConfig.defaultLocale === 'km' ? storeConfig.delivery.estimateKm : storeConfig.delivery.estimateEn }}</small></span></label><label class="radio-card"><input type="radio" name="delivery" value="pickup" /><span><strong>{{ t.pickup }}</strong><small>{{ showcase.current.address }}</small></span></label></fieldset>
        <fieldset><legend>{{ t.paymentMethod }}</legend><label v-for="method in paymentMethods" :key="method" class="radio-card payment-card" :class="{ 'payment-disabled': method !== 'Cash on delivery' }"><input v-model="paymentMethod" type="radio" name="payment" :value="method" :disabled="method !== 'Cash on delivery'" /><i class="payment-icon" :class="`payment-${method.toLowerCase().replaceAll(' ', '-')}`">{{ paymentIcons[method] }}</i><span><strong>{{ method === 'Cash on delivery' ? t.cod : method }}</strong><small>{{ method === 'Cash on delivery' ? t.codHelp : t.unavailable }}</small></span></label></fieldset>
        <fieldset><legend>{{ t.note }}</legend><label class="field-wide">{{ t.optional }}<textarea name="note" rows="4" :placeholder="t.notePlaceholder" /></label></fieldset>
        <button class="button button-block browser-checkout" type="submit">{{ t.reviewOrder }}</button>
        <p v-if="submitError" class="form-error" role="alert">{{ submitError }}</p>
      </form>
      <aside class="summary-card checkout-summary"><h2>{{ t.cartSummary }}</h2><div v-for="item in items" :key="item.productId" class="summary-item"><img :src="item.product.image" :alt="item.product.name" /><p>{{ item.product.name }}<span>{{ [item.color, item.variant, `${t.quantity} ${item.quantity}`].filter(Boolean).join(' · ') }}</span></p><strong>{{ showcase.formatMoney(item.lineTotal) }}</strong></div><p><span>{{ t.subtotal }}</span><strong>{{ showcase.formatMoney(subtotal) }}</strong></p><p><span>{{ t.discount }}</span><strong>−{{ showcase.formatMoney(discount) }}</strong></p><p><span>{{ t.delivery }}</span><strong>{{ deliveryFee ? showcase.formatMoney(deliveryFee) : t.free }}</strong></p><p class="summary-total"><span>{{ t.total }}</span><strong>{{ showcase.formatMoney(total) }}</strong></p></aside>
    </div>
    <div v-else class="empty-state"><h2>{{ t.empty }}</h2><RouterLink class="button" to="/categories">{{ t.browse }}</RouterLink></div>
  </section>
</template>
