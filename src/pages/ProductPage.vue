<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductGrid from '@/components/ProductGrid.vue'
import { useCartStore } from '@/stores/cart'
import { useFavoritesStore } from '@/stores/favorites'
import { useShowcaseStore } from '@/stores/showcase'
import { hideMainButton, showMainButton } from '@/services/telegram'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const favorites = useFavoritesStore()
const showcase = useShowcaseStore()
const ui = showcase.copy.ui
const quantity = ref(1)
const selectedImage = ref('')
const selectedColor = ref('')
const selectedVariant = ref('')
const product = computed(() => showcase.products.find((item) => item.slug === String(route.params.slug)))
const related = computed(() => showcase.products.filter((item) => item.category === product.value?.category && item.id !== product.value?.id).slice(0, 4))
const discount = computed(() => product.value?.oldPrice ? Math.round((1 - product.value.price / product.value.oldPrice) * 100) : 0)

function addToCart() {
  if (product.value) cart.add(product.value.id, quantity.value, { color: selectedColor.value, variant: selectedVariant.value })
}
function buyNow() { addToCart(); router.push('/checkout') }

watch(product, (value) => {
  selectedImage.value = value?.image || ''
  selectedColor.value = value?.colors[0] || ''
  selectedVariant.value = value?.variants[0] || ''
  quantity.value = 1
  if (value?.stock) showMainButton(`${ui.common.addCart} · ${showcase.formatMoney(value.price)}`, addToCart)
  else hideMainButton()
}, { immediate: true })
onBeforeUnmount(hideMainButton)
</script>

<template>
  <section v-if="product" class="product-page container section">
    <div class="product-gallery">
      <div class="product-main-image"><img :src="selectedImage" :alt="product.name" width="900" height="900" /></div>
      <div v-if="product.images.length > 1" class="product-thumbnails">
        <button v-for="image in product.images" :key="image" type="button" :class="{ active: selectedImage === image }" @click="selectedImage = image"><img :src="image" :alt="`រូបភាពផ្សេងរបស់ ${product.name}`" loading="lazy" /></button>
      </div>
    </div>
    <div class="product-copy">
      <span class="eyebrow">{{ product.category }}</span>
      <h1>{{ product.name }}</h1>
      <p class="rating">★ {{ product.rating }} <span>{{ ui.common.sold }} {{ product.soldCount }}</span></p>
      <p class="detail-price">{{ showcase.formatMoney(product.price) }} <del v-if="product.oldPrice">{{ showcase.formatMoney(product.oldPrice) }}</del><b v-if="discount">ចំណេញ {{ discount }}%</b></p>
      <p class="stock-line" :class="{ unavailable: !product.stock }">{{ product.stock ? `${ui.common.inStock} ${product.stock}` : ui.common.outOfStock }}</p>
      <p class="description">{{ product.description }}</p>
      <fieldset class="variant-picker"><legend>{{ ui.product.color }}</legend><button v-for="color in product.colors" :key="color" type="button" :class="{ active: selectedColor === color }" @click="selectedColor = color">{{ color }}</button></fieldset>
      <fieldset class="variant-picker"><legend>{{ ui.product.size }}</legend><button v-for="variant in product.variants" :key="variant" type="button" :class="{ active: selectedVariant === variant }" @click="selectedVariant = variant">{{ variant }}</button></fieldset>
      <div class="quantity-row"><label for="quantity">{{ ui.common.quantity }}</label><div class="stepper"><button type="button" aria-label="−" @click="quantity = Math.max(1, quantity - 1)">−</button><input id="quantity" v-model.number="quantity" type="number" min="1" :max="Math.min(20, product.stock)" /><button type="button" aria-label="+" @click="quantity = Math.min(product.stock, quantity + 1)">+</button></div></div>
      <div class="product-actions"><button class="button" type="button" :disabled="!product.stock" @click="addToCart">{{ ui.common.addCart }}</button><button class="button secondary-button" type="button" :disabled="!product.stock" @click="buyNow">{{ ui.product.buyNow }}</button><button class="favorite-detail" type="button" :class="{ active: favorites.has(product.id) }" @click="favorites.toggle(product.id)">♡ <span>{{ favorites.has(product.id) ? ui.product.saved : ui.product.favorite }}</span></button></div>
      <div class="delivery-note"><span>{{ ui.product.deliveryTime }}</span><strong>{{ product.deliveryEstimate }}</strong><p>{{ ui.common.contactStore }}</p></div>
    </div>
  </section>
  <section v-else class="empty-state container section"><h1>{{ ui.product.notFound }}</h1><RouterLink class="button" to="/categories">{{ ui.common.browse }}</RouterLink></section>
  <section v-if="product && related.length" class="container section related-section"><div class="section-heading"><div><h2>{{ ui.product.related }}</h2></div></div><ProductGrid :products="related" /></section>
</template>
