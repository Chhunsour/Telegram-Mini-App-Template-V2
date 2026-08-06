<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useShowcaseStore } from '@/stores/showcase'

const { count } = storeToRefs(useCartStore())
const ui = useShowcaseStore().copy.ui
</script>

<template>
  <nav class="bottom-nav" :aria-label="ui.nav.openMenu">
    <RouterLink to="/">
      <svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>{{ ui.nav.home }}</span>
    </RouterLink>

    <RouterLink to="/categories">
      <svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1.5"/>
        <rect width="7" height="7" x="14" y="3" rx="1.5"/>
        <rect width="7" height="7" x="14" y="14" rx="1.5"/>
        <rect width="7" height="7" x="3" y="14" rx="1.5"/>
      </svg>
      <span>{{ ui.nav.products }}</span>
    </RouterLink>

    <RouterLink to="/cart">
      <div class="cart-icon-wrapper">
        <svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
        <b v-if="count" class="bottom-nav-count">{{ count }}</b>
      </div>
      <span>{{ ui.nav.cart }}</span>
    </RouterLink>

    <RouterLink to="/orders">
      <svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect width="8" height="4" x="8" y="2" rx="1.5"/>
        <path d="M9 12h6"/>
        <path d="M9 16h6"/>
      </svg>
      <span>{{ ui.nav.orders }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.nav-icon {
  transition: transform 0.2s ease, stroke 0.2s ease;
}
.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
