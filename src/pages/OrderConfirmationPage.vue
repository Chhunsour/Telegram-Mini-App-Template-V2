<script setup lang="ts">
import { useRoute } from 'vue-router'
import { storeConfig } from '@/config/store.config'
import { translations } from '@/config/translations'

const route = useRoute()
const orderId = String(route.params.id || '')
const ui = translations[storeConfig.defaultLocale].ui
</script>

<template>
  <section class="confirmation-page container">
    <div class="confirmation-mark">✓</div>
    <span>{{ ui.confirmation.submitted }}</span><h1>{{ ui.confirmation.title }}</h1><p>{{ ui.confirmation.message }} {{ storeConfig.storeName }}</p>
    <div class="confirmation-receipt">
      <p><span>លេខការបញ្ជាទិញ / Order ID</span><strong>{{ orderId }}</strong></p>
      <p><span>ស្ថានភាព / Status</span><strong>ការទិញថ្មី / New order</strong></p>
      <p><span>ការទូទាត់ / Payment</span><strong>Cash on Delivery</strong></p>
    </div>
    <div class="confirmation-actions">
      <a class="button" :href="`https://t.me/${storeConfig.telegram.botUsername.replace('@', '')}`">{{ ui.confirmation.openTelegram }}</a><RouterLink class="text-link" to="/">{{ ui.confirmation.continue }}</RouterLink>
    </div>
  </section>
</template>
