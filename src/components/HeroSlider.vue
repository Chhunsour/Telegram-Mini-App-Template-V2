<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useShowcaseStore } from '@/stores/showcase'

const showcase = useShowcaseStore()
const ui = showcase.copy.ui
const slides = showcase.heroBanners
const active = ref(0)
let timer: number

onMounted(() => timer = window.setInterval(() => active.value = (active.value + 1) % slides.length, 5600))
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <section class="hero" aria-roledescription="carousel" :aria-label="`ប្រូម៉ូសិន ${showcase.current.storeName}`">
    <TransitionGroup name="hero-fade">
      <article v-for="(slide, index) in slides" v-show="active === index" :key="slide.image" class="hero-slide">
        <img :src="slide.image" :alt="slide.title" fetchpriority="high" />
        <div class="hero-overlay">
          <div class="hero-store"><img class="brand-logo-image brand-logo-hero" :src="showcase.current.logo" :alt="showcase.current.storeName" /></div>
          <p>{{ slide.copy }}</p>
          <h1>{{ slide.title }}</h1>
          <RouterLink class="button" :to="{ name: 'categories', query: { category: slide.category } }">{{ ui.common.browse }}</RouterLink>
        </div>
      </article>
    </TransitionGroup>
    <div class="hero-dots">
      <button v-for="(_, index) in slides" :key="index" type="button" :class="{ active: index === active }" :aria-label="`បង្ហាញប្រូម៉ូសិន ${index + 1}`" @click="active = index" />
    </div>
  </section>
</template>
