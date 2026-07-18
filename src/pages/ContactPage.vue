<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import { useShowcaseStore } from '@/stores/showcase'
import { storeConfig } from '@/config/store.config'
const showcase = useShowcaseStore()
const ui = showcase.copy.ui
</script>

<template>
  <PageHeader :title="ui.contact.title" :eyebrow="ui.contact.eyebrow"><p>{{ ui.contact.intro }}</p></PageHeader>
  <section class="container contact-layout contact-layout-simple section section-tight">
    <aside class="contact-details"><h2>{{ ui.contact.information }}</h2><p><span>{{ ui.contact.phone }}</span><strong>{{ showcase.current.phone }}</strong></p><p><span>Email</span><strong>{{ showcase.current.email }}</strong></p><p><span>Telegram</span><strong>{{ showcase.current.telegramUsername }}</strong></p><p><span>{{ ui.contact.address }}</span><strong>{{ showcase.current.address }}</strong></p><div class="contact-actions"><a class="button" :href="`https://t.me/${showcase.current.telegramUsername.replace('@', '')}`">{{ ui.contact.message }}</a><a class="text-link" :href="`tel:${showcase.current.phone.replace(/\s/g, '')}`">{{ ui.contact.call }}</a></div></aside>
  </section>
  <section id="help" class="container help-section section"><span>{{ ui.contact.policies }}</span><h2>{{ ui.contact.information }}</h2><div><article v-for="policy in storeConfig.policies" :key="policy.titleEn"><h3>{{ storeConfig.defaultLocale === 'km' ? policy.titleKm : policy.titleEn }}</h3><p>{{ storeConfig.defaultLocale === 'km' ? policy.textKm : policy.textEn }}</p></article></div></section>
</template>
