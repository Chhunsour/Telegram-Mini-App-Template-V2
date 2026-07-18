<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppDrawer from '@/components/AppDrawer.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import BottomNav from '@/components/BottomNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import { themeConfig } from '@/config/theme.config'

const route = useRoute()
const menuOpen = ref(false)
const cartOpen = ref(false)
watchEffect(() => {
  const root = document.documentElement
  root.style.setProperty('--brand', themeConfig.primaryColor)
  root.style.setProperty('--brand-dark', themeConfig.secondaryColor)
  root.style.setProperty('--template-bg', themeConfig.backgroundColor)
  root.style.setProperty('--template-surface', themeConfig.surfaceColor)
  root.style.setProperty('--template-text', themeConfig.textColor)
  root.style.setProperty('--template-muted', themeConfig.mutedColor)
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
