<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useShowcaseStore } from '@/stores/showcase'

defineEmits<{ menu: []; cart: [] }>()
const { count } = storeToRefs(useCartStore())
const showcase = useShowcaseStore()

function toggleLanguage() {
  const nextLang = showcase.currentLocale === 'km' ? 'en' : 'km'
  showcase.setLocale(nextLang)
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-container">
      <div class="topbar-left">
        <button class="icon-button mobile-only" type="button" :aria-label="showcase.copy.ui.nav.openMenu" @click="$emit('menu')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
        <RouterLink class="brand brand-lockup" to="/" :aria-label="`ទំព័រដើម ${showcase.storeInfo.storeName}`">
          <img class="brand-logo-image" :src="showcase.storeInfo.logo" :alt="showcase.storeInfo.storeName" />
          <span class="brand-name-desktop">{{ showcase.storeInfo.storeName }}</span>
        </RouterLink>
      </div>

      <!-- Desktop Navigation Menu -->
      <nav class="desktop-nav" aria-label="Main Navigation">
        <RouterLink to="/" class="desktop-nav-link" active-class="active">
          {{ showcase.currentLocale === 'km' ? 'ទំព័រដើម' : 'Home' }}
        </RouterLink>
        <RouterLink to="/categories" class="desktop-nav-link" active-class="active">
          {{ showcase.currentLocale === 'km' ? 'ប្រភេទទំនិញ' : 'Categories' }}
        </RouterLink>
        <RouterLink to="/orders" class="desktop-nav-link" active-class="active">
          {{ showcase.currentLocale === 'km' ? 'ការបញ្ជាទិញ' : 'Orders' }}
        </RouterLink>
        <RouterLink to="/contact" class="desktop-nav-link" active-class="active">
          {{ showcase.currentLocale === 'km' ? 'ទំនាក់ទំនង' : 'Contact' }}
        </RouterLink>
      </nav>

      <div class="topbar-right">
        <!-- Language Switcher -->
        <button class="lang-switch-btn" type="button" @click="toggleLanguage" :title="showcase.currentLocale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'">
          <span :class="{ active: showcase.currentLocale === 'km' }">KM</span>
          <span class="divider">/</span>
          <span :class="{ active: showcase.currentLocale === 'en' }">EN</span>
        </button>

        <!-- Cart Button -->
        <button class="icon-button cart-button" type="button" :aria-label="showcase.copy.ui.nav.openCart" @click="$emit('cart')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 7H6M10 20h.01M17 20h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </svg>
          <span v-if="count" class="count-badge">{{ count }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
