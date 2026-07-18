<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useShowcaseStore } from '@/stores/showcase'

defineEmits<{ menu: []; cart: [] }>()
const { count } = storeToRefs(useCartStore())
const showcase = useShowcaseStore()
const ui = showcase.copy.ui
</script>

<template>
  <header class="topbar">
    <button class="icon-button" type="button" :aria-label="ui.nav.openMenu" @click="$emit('menu')">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
    </button>
    <RouterLink class="brand brand-lockup" to="/" :aria-label="`ទំព័រដើម ${showcase.current.storeName}`">
      <img class="brand-logo-image" :src="showcase.current.logo" :alt="showcase.current.storeName" />
    </RouterLink>
    <button class="icon-button cart-button" type="button" :aria-label="ui.nav.openCart" @click="$emit('cart')">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 7H6M10 20h.01M17 20h.01" /></svg>
      <span v-if="count" class="count-badge">{{ count }}</span>
    </button>
  </header>
</template>
