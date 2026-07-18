<script setup lang="ts">
import { useShowcaseStore } from '@/stores/showcase'
import { storeConfig } from '@/config/store.config'
const showcase = useShowcaseStore()
const ui = showcase.copy.ui
</script>

<template>
  <footer class="footer">
    <div class="brand footer-brand"><img class="brand-logo-image brand-logo-large" :src="showcase.current.logo" :alt="showcase.current.storeName" /></div>
    <p>{{ showcase.current.address }} · {{ showcase.current.phone }}</p>
    <nav class="footer-links" aria-label="ព័ត៌មានហាង">
      <RouterLink to="/categories">{{ ui.nav.products }}</RouterLink><RouterLink to="/orders">{{ ui.nav.orders }}</RouterLink><RouterLink to="/contact">{{ ui.nav.contact }}</RouterLink>
      <a :href="`https://t.me/${showcase.current.telegramUsername.replace('@', '')}`">Telegram</a>
      <a :href="storeConfig.social.facebook">Facebook</a><a :href="storeConfig.social.instagram">Instagram</a><a :href="storeConfig.social.tiktok">TikTok</a>
    </nav>
    <small>© {{ new Date().getFullYear() }} {{ showcase.current.storeName }}</small>
  </footer>
</template>
