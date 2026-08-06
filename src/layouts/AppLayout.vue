<script setup lang="ts">
import { ref, watch, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppDrawer from '@/components/AppDrawer.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import BottomNav from '@/components/BottomNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useShowcaseStore } from '@/stores/showcase'
import { initTelegramEnvironment } from '@/core/auth/telegramAuth'

const route = useRoute()
const showcaseStore = useShowcaseStore()
const menuOpen = ref(false)
const cartOpen = ref(false)

onMounted(() => {
  initTelegramEnvironment()
})

watchEffect(() => {
  const root = document.documentElement
  const info = showcaseStore.storeInfo
  if (info) {
    root.style.setProperty('--brand', info.primaryColor || '#2563eb')
    root.style.setProperty('--brand-dark', info.secondaryColor || '#1d4ed8')
    root.style.setProperty('--template-bg', info.backgroundColor || '#f8fafc')
    root.style.setProperty('--template-surface', info.surfaceColor || '#ffffff')
    root.style.setProperty('--template-text', info.textColor || '#0f172a')
    root.style.setProperty('--template-muted', info.mutedColor || '#64748b')
    root.style.setProperty('--font-family', info.fontFamily || 'Kantumruy Pro, sans-serif')
    root.style.setProperty('--border-radius', info.borderRadius || '12px')
  }
})

watch(() => route.fullPath, () => {
  menuOpen.value = false
  cartOpen.value = false
})
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">រំលងទៅមាតិកា</a>
    <AppHeader @menu="menuOpen = true" @cart="cartOpen = true" />
    <AppDrawer :open="menuOpen" @close="menuOpen = false" />
    <CartDrawer :open="cartOpen" @close="cartOpen = false" />
    <main id="main-content" class="app-main">
      <RouterView />
    </main>
    <AppFooter />
    <BottomNav />
  </div>
</template>
