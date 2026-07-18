<script setup lang="ts">
defineProps<{ title: string; eyebrow?: string }>()
</script>

<template>
  <header class="page-heading container">
    <span v-if="eyebrow">{{ eyebrow }}</span>
    <h1>{{ title }}</h1>
    <slot />
  </header>
</template>

