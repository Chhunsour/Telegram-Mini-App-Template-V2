<script setup lang="ts">
import { useShowcaseStore } from '@/stores/showcase'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()
const showcase = useShowcaseStore()
const ui = showcase.copy.ui

const links = [
  [ui.nav.home, '/', '⌂'], [ui.nav.products, '/categories', '▦'], [ui.nav.cart, '/cart', '◫'], [ui.nav.orders, '/orders', '▤'], [ui.nav.contact, '/contact', '☎'],
]
</script>

<template>
  <Transition name="fade">
    <button v-if="open" class="drawer-backdrop" :aria-label="ui.nav.closeMenu" @click="$emit('close')" />
  </Transition>
  <Transition name="drawer-left">
    <aside v-if="open" class="drawer drawer-left" aria-label="មឺនុយចម្បង">
      <div class="drawer-brand"><img class="brand-logo-image brand-logo-large" :src="showcase.current.logo" :alt="showcase.current.storeName" /></div>
      <nav>
        <RouterLink v-for="[label, to, icon] in links" :key="to" :to="to">
          <span class="nav-icon">{{ icon }}</span>{{ label }}
        </RouterLink>
      </nav>
      <p class="drawer-note">{{ ui.nav.shopInTelegram }}</p>
    </aside>
  </Transition>
</template>
