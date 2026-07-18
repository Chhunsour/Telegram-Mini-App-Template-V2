<script setup lang="ts">
import ProductCard from './ProductCard.vue'
import type { Product } from '@/types'

defineProps<{ products: Product[] }>()
</script>

<template>
  <div class="product-grid">
    <ProductCard v-for="product in products" :key="product.id" :product="product" />
  </div>
</template>

