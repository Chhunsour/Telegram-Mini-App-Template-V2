<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { useShowcaseStore } from '@/stores/showcase'

const showcase = useShowcaseStore()
const ui = computed(() => showcase.copy.ui)
</script>

<template>
  <PageHeader :title="ui.contact.title" :eyebrow="ui.contact.eyebrow">
    <p>{{ ui.contact.intro }}</p>
  </PageHeader>

  <section class="container contact-layout contact-layout-simple section section-tight">
    <aside class="contact-details">
      <h2>{{ ui.contact.information }}</h2>
      <p>
        <span>{{ ui.contact.phone }}</span>
        <strong>{{ showcase.storeInfo.contact.phone }}</strong>
      </p>
      <p>
        <span>Email</span>
        <strong>{{ showcase.storeInfo.contact.email }}</strong>
      </p>
      <p>
        <span>Telegram</span>
        <strong>{{ showcase.storeInfo.telegram.botUsername }}</strong>
      </p>
      <p>
        <span>{{ ui.contact.address }}</span>
        <strong>{{ showcase.storeInfo.contact.address }}</strong>
      </p>
      <div class="contact-actions">
        <a
          class="button primary-btn"
          :href="`https://t.me/${showcase.storeInfo.telegram.botUsername.replace('@', '')}`"
          target="_blank"
        >
          {{ ui.contact.message }}
        </a>
        <a class="text-link" :href="`tel:${showcase.storeInfo.contact.phone.replace(/\s/g, '')}`">
          {{ ui.contact.call }}
        </a>
      </div>
    </aside>
  </section>

  <section id="help" class="container help-section section">
    <span>{{ ui.contact.policies }}</span>
    <h2>{{ ui.contact.information }}</h2>
    <div>
      <article v-for="policy in showcase.storeInfo.policies" :key="policy.titleEn">
        <h3>{{ showcase.currentLocale === 'km' ? policy.titleKm : policy.titleEn }}</h3>
        <p>{{ showcase.currentLocale === 'km' ? policy.textKm : policy.textEn }}</p>
      </article>
    </div>
  </section>
</template>
