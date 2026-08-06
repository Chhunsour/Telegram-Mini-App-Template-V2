<script setup lang="ts">
import { computed } from 'vue'
import { useShowcaseStore } from '@/stores/showcase'

const showcase = useShowcaseStore()
const ui = computed(() => showcase.copy.ui)
</script>

<template>
  <footer class="footer">
    <div class="brand footer-brand">
      <img class="brand-logo-image brand-logo-large" :src="showcase.storeInfo.logo" :alt="showcase.storeInfo.storeName" />
    </div>
    <p>{{ showcase.storeInfo.contact.address }} · {{ showcase.storeInfo.contact.phone }}</p>
    <nav class="footer-links" aria-label="ព័ត៌មានហាង">
      <RouterLink to="/categories">{{ ui.nav.products }}</RouterLink>
      <RouterLink to="/orders">{{ ui.nav.orders }}</RouterLink>
      <RouterLink to="/contact">{{ ui.nav.contact }}</RouterLink>
      <a :href="`https://t.me/${showcase.storeInfo.telegram.botUsername.replace('@', '')}`" target="_blank">Telegram</a>
      <a v-if="showcase.storeInfo.social.facebook" :href="showcase.storeInfo.social.facebook" target="_blank">Facebook</a>
      <a v-if="showcase.storeInfo.social.instagram" :href="showcase.storeInfo.social.instagram" target="_blank">Instagram</a>
      <a v-if="showcase.storeInfo.social.tiktok" :href="showcase.storeInfo.social.tiktok" target="_blank">TikTok</a>
    </nav>
    <small>© {{ new Date().getFullYear() }} {{ showcase.storeInfo.storeName }} · TovMuk Solution</small>
  </footer>
</template>
