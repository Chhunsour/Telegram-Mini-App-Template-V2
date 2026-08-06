<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { getTelegramUser } from '@/core/auth/telegramAuth'
import { hideMainButton, showMainButton } from '@/services/telegram'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useShowcaseStore } from '@/stores/showcase'

const router = useRouter()
const cart = useCartStore()
const ordersStore = useOrdersStore()
const showcase = useShowcaseStore()
const { items, subtotal, discount, deliveryFee, total } = storeToRefs(cart)

const t = computed(() => showcase.copy.checkout)
const paymentMethods = computed(() => showcase.storeInfo.paymentMethods || ['Cash on Delivery', 'ABA Pay', 'KHQR'])
const paymentIcons: Record<string, string> = { 'Cash on delivery': '💵', 'Cash on Delivery': '💵', 'ABA Pay': 'ABA', ABA: 'ABA', KHQR: 'KHQR', Bakong: 'KHQR', 'Bank transfer': '⇄' }

const form = ref<HTMLFormElement>()
const paymentMethod = ref(paymentMethods.value[0] || 'Cash on Delivery')
const submitError = ref('')
const submitting = ref(false)
const orderId = ref('')
const review = ref<Record<string, string>>()

function showCheckoutButton() {
  if (items.value.length && !review.value) {
    showMainButton(`${t.value.reviewOrder.toUpperCase()} · ${showcase.formatMoney(total.value)}`, () => form.value?.requestSubmit())
  } else {
    hideMainButton()
  }
}

function reviewOrder() {
  if (!items.value.length) return router.push('/categories')
  if (!form.value) return

  const formData = new FormData(form.value)
  review.value = Object.fromEntries(formData.entries()) as Record<string, string>
  orderId.value ||= `${showcase.storeInfo.orderIdPrefix || 'ORD'}-${Date.now().toString().slice(-6)}`
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
    const createdOrder = await ordersStore.create(
      cart.lines,
      total.value,
      paymentMethod.value,
      {
        name: review.value.name,
        phone: review.value.phone,
        address: review.value.address,
        province: review.value.province,
        deliveryFee: deliveryFee.value,
        subtotal: subtotal.value,
        discount: discount.value,
        notes: review.value.note,
      },
      orderId.value
    )

    cart.clear()
    router.push(`/order-confirmation/${createdOrder.id}`)
  } catch (err) {
    console.error(err)
    submitError.value = t.value.sendError || 'Failed to submit order'
  } finally {
    submitting.value = false
  }
}

onMounted(showCheckoutButton)
onBeforeUnmount(hideMainButton)
</script>

<template>
  <PageHeader :title="t.title" :eyebrow="t.eyebrow">
    <p>{{ t.intro }}</p>
  </PageHeader>

  <section class="container section section-tight">
    <!-- Final Order Review Step -->
    <div v-if="review" class="final-order-review">
      <header>
        <span>{{ t.finalReview }} / FINAL REVIEW</span>
        <h2>{{ t.confirmHeading }}</h2>
        <p>{{ t.unsent }}</p>
      </header>

      <div class="review-customer">
        <p><span>{{ t.fullName }}</span><strong>{{ review.name }}</strong></p>
        <p><span>{{ t.phone }}</span><strong>{{ review.phone }}</strong></p>
        <p><span>{{ t.address }}</span><strong>{{ review.address }}, {{ review.province }}</strong></p>
      </div>

      <div class="review-products">
        <article v-for="item in items" :key="item.productId">
          <img :src="item.product.image" :alt="item.product.name" />
          <div>
            <strong>{{ item.product.name }}</strong>
            <span>{{ [item.color, item.variant, `${t.quantity} ${item.quantity}`].filter(Boolean).join(' · ') }}</span>
          </div>
          <b>{{ showcase.formatMoney(item.lineTotal) }}</b>
        </article>
      </div>

      <p class="review-total">
        <span>{{ t.total }}</span>
        <strong>{{ showcase.formatMoney(total) }}</strong>
      </p>

      <p class="review-payment">💳 {{ paymentMethod }}</p>

      <p v-if="submitError" class="form-error" role="alert">{{ submitError }}</p>

      <div class="review-actions">
        <button class="button primary-btn" type="button" :disabled="submitting" @click="confirmOrder">
          {{ submitting ? t.sending : `✅ ${t.confirm}` }}
        </button>
        <button class="button button-secondary" type="button" :disabled="submitting" @click="editOrder">
          ✏️ {{ t.edit }}
        </button>
        <button class="text-button danger" type="button" :disabled="submitting" @click="cancelOrder">
          ❌ {{ t.cancel }}
        </button>
      </div>
    </div>

    <!-- Active Checkout Form -->
    <div v-else-if="items.length" class="checkout-layout">
      <form ref="form" class="checkout-form" @submit.prevent="reviewOrder">
        <fieldset>
          <legend>{{ t.customer }}</legend>
          <label>
            {{ t.fullName }}
            <input name="name" autocomplete="name" :value="showcase.storeInfo.checkoutDefaults.customerName" required />
          </label>
          <label>
            {{ t.phone }}
            <input name="phone" type="tel" autocomplete="tel" :value="showcase.storeInfo.checkoutDefaults.phone" pattern="[0-9 +()-]{8,20}" required />
          </label>
        </fieldset>

        <fieldset>
          <legend>{{ t.deliveryAddress }}</legend>
          <label>
            {{ t.province }}
            <select name="province" required>
              <option v-for="province in showcase.storeInfo.delivery.provinces" :key="province" :value="province">
                {{ province }}
              </option>
            </select>
          </label>
          <label class="field-wide">
            {{ t.address }}
            <input name="address" autocomplete="street-address" :value="showcase.storeInfo.checkoutDefaults.address" required />
          </label>
        </fieldset>

        <fieldset>
          <legend>{{ t.deliveryMethod }}</legend>
          <label class="radio-card">
            <input type="radio" name="delivery" value="standard" checked />
            <span>
              <strong>{{ t.standardDelivery }}</strong>
              <small>{{ deliveryFee ? showcase.formatMoney(deliveryFee) : t.free }} · {{ showcase.currentLocale === 'km' ? showcase.storeInfo.delivery.estimateKm : showcase.storeInfo.delivery.estimateEn }}</small>
            </span>
          </label>
        </fieldset>

        <fieldset>
          <legend>{{ t.paymentMethod }}</legend>
          <label v-for="method in paymentMethods" :key="method" class="radio-card payment-card">
            <input v-model="paymentMethod" type="radio" name="payment" :value="method" />
            <i class="payment-icon">{{ paymentIcons[method] || '💳' }}</i>
            <span>
              <strong>{{ method }}</strong>
              <small>{{ method === 'Cash on Delivery' || method === 'Cash on delivery' ? t.codHelp : 'ABA / KHQR Code Scan' }}</small>
            </span>
          </label>
        </fieldset>

        <fieldset>
          <legend>{{ t.note }}</legend>
          <label class="field-wide">
            {{ t.optional }}
            <textarea name="note" rows="3" :placeholder="t.notePlaceholder" />
          </label>
        </fieldset>

        <button class="button button-block primary-btn browser-checkout" type="submit">
          {{ t.reviewOrder }}
        </button>
        <p v-if="submitError" class="form-error" role="alert">{{ submitError }}</p>
      </form>

      <!-- Desktop Order Summary Panel -->
      <aside class="summary-card checkout-summary">
        <h2>{{ t.cartSummary }}</h2>
        <div v-for="item in items" :key="item.productId" class="summary-item">
          <img :src="item.product.image" :alt="item.product.name" />
          <div>
            <p>{{ item.product.name }}</p>
            <span>{{ [item.color, item.variant, `${t.quantity} ${item.quantity}`].filter(Boolean).join(' · ') }}</span>
          </div>
          <strong>{{ showcase.formatMoney(item.lineTotal) }}</strong>
        </div>
        <div class="summary-divider"></div>
        <p><span>{{ t.subtotal }}</span><strong>{{ showcase.formatMoney(subtotal) }}</strong></p>
        <p><span>{{ t.discount }}</span><strong>−{{ showcase.formatMoney(discount) }}</strong></p>
        <p><span>{{ t.delivery }}</span><strong>{{ deliveryFee ? showcase.formatMoney(deliveryFee) : t.free }}</strong></p>
        <p class="summary-total"><span>{{ t.total }}</span><strong>{{ showcase.formatMoney(total) }}</strong></p>
      </aside>
    </div>

    <div v-else class="empty-state">
      <h2>{{ t.empty }}</h2>
      <RouterLink class="button primary-btn" to="/categories">{{ t.browse }}</RouterLink>
    </div>
  </section>
</template>
