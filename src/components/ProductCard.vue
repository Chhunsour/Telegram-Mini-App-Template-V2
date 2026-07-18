<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cart'
import { useFavoritesStore } from '@/stores/favorites'
import { useShowcaseStore } from '@/stores/showcase'

const props = defineProps<{ product: Product }>()
const cart = useCartStore()
const favorites = useFavoritesStore()
const showcase = useShowcaseStore()
const ui = showcase.copy.ui
const discount = computed(() => props.product.oldPrice ? Math.round((1 - props.product.price / props.product.oldPrice) * 100) : 0)
</script>

<template>
  <article class="product-card">
    <RouterLink class="product-image" :to="`/products/${product.slug}`">
      <span v-if="discount" class="product-badge">−{{ discount }}%</span>
      <img :src="product.image" :alt="product.name" loading="lazy" width="900" height="900" />
    </RouterLink>
    <button class="favorite-button" type="button" :class="{ active: favorites.has(product.id) }" :aria-label="`${favorites.has(product.id) ? 'ដកចេញពី' : 'បន្ថែមចូល'}បញ្ជីពេញចិត្ត`" @click="favorites.toggle(product.id)">♡</button>
    <div class="product-info">
      <span>{{ product.category }} · {{ product.stock ? `${ui.common.inStock} ${product.stock}` : ui.common.outOfStock }}</span>
      <RouterLink :to="`/products/${product.slug}`"><h3>{{ product.name }}</h3></RouterLink>
      <div class="product-social"><span>★ {{ product.rating }}</span><span>{{ ui.common.sold }} {{ product.soldCount }}</span></div>
      <div class="product-meta">
        <p><strong>{{ showcase.formatMoney(product.price) }}</strong><del v-if="product.oldPrice">{{ showcase.formatMoney(product.oldPrice) }}</del></p>
      </div>
      <button class="add-cart" type="button" :disabled="!product.stock" @click="cart.add(product.id)">{{ product.stock ? ui.common.addCart : ui.common.outOfStock }}</button>
    </div>
  </article>
</template>
