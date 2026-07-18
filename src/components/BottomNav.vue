<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useShowcaseStore } from '@/stores/showcase'

const { count } = storeToRefs(useCartStore())
const ui = useShowcaseStore().copy.ui
</script>

<template>
  <nav class="bottom-nav" :aria-label="ui.nav.openMenu">
    <RouterLink to="/"><span>⌂</span>{{ ui.nav.home }}</RouterLink>
    <RouterLink to="/categories"><span>▦</span>{{ ui.nav.products }}</RouterLink>
    <RouterLink to="/cart"><span>◫</span><b v-if="count" class="bottom-nav-count">{{ count }}</b>{{ ui.nav.cart }}</RouterLink>
    <RouterLink to="/orders"><span>▤</span>{{ ui.nav.orders }}</RouterLink>
  </nav>
</template>
