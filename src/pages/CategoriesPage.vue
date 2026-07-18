<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import ProductGrid from '@/components/ProductGrid.vue'
import { useShowcaseStore } from '@/stores/showcase'
import { filterProducts, type CatalogFilters } from '@/services/catalog'

const route = useRoute()
const showcase = useShowcaseStore()
const ui = showcase.copy.ui
const highestPrice = computed(() => Math.ceil(Math.max(...showcase.products.map((product) => product.price), 1)))
const filters = reactive<CatalogFilters>({ category: '', maxPrice: highestPrice.value, inStock: false, newOnly: false, bestOnly: false, discountedOnly: false, sort: 'recommended' })
const visibleProducts = computed(() => filterProducts(showcase.products, filters))

watch(highestPrice, (price, previous) => { if (filters.maxPrice === previous) filters.maxPrice = price })

watch(() => route.query, (query) => {
  filters.category = typeof query.category === 'string' && showcase.categories.includes(query.category) ? query.category : ''
  filters.newOnly = query.new === '1'
  filters.bestOnly = query.best === '1'
  filters.discountedOnly = query.sale === '1'
  filters.maxPrice = highestPrice.value
}, { immediate: true, deep: true })

function resetFilters() {
  Object.assign(filters, { category: '', maxPrice: highestPrice.value, inStock: false, newOnly: false, bestOnly: false, discountedOnly: false, sort: 'recommended' })
}
</script>

<template>
  <PageHeader :title="ui.catalog.title" :eyebrow="ui.catalog.eyebrow"><p>{{ ui.catalog.intro }}</p></PageHeader>
  <section class="container catalog-layout section section-tight">
    <aside class="catalog-filters">
      <div class="filter-heading"><h2>{{ ui.catalog.filters }}</h2><button type="button" @click="resetFilters">{{ ui.catalog.reset }}</button></div>
      <label>{{ ui.catalog.category }}<select v-model="filters.category"><option value="">{{ ui.catalog.all }}</option><option v-for="category in showcase.categories" :key="category">{{ category }}</option></select></label>
      <label>{{ ui.catalog.maxPrice }} <strong>{{ showcase.formatMoney(filters.maxPrice) }}</strong><input v-model.number="filters.maxPrice" type="range" min="1" :max="highestPrice" /></label>
      <div class="filter-checks">
        <label><input v-model="filters.inStock" type="checkbox" /> {{ ui.catalog.inStock }}</label><label><input v-model="filters.newOnly" type="checkbox" /> {{ ui.catalog.new }}</label><label><input v-model="filters.bestOnly" type="checkbox" /> {{ ui.catalog.best }}</label><label><input v-model="filters.discountedOnly" type="checkbox" /> {{ ui.catalog.discounted }}</label>
      </div>
    </aside>
    <div class="catalog-results">
      <div class="catalog-sort"><span>{{ visibleProducts.length }} {{ ui.nav.products }}</span><label>{{ ui.catalog.sort }}<select v-model="filters.sort"><option value="recommended">{{ ui.catalog.recommended }}</option><option value="newest">{{ ui.catalog.newest }}</option><option value="low">{{ ui.catalog.low }}</option><option value="high">{{ ui.catalog.high }}</option><option value="popular">{{ ui.catalog.popular }}</option></select></label></div>
      <ProductGrid v-if="visibleProducts.length" :products="visibleProducts" />
      <div v-else class="empty-state"><h2>{{ ui.catalog.none }}</h2><button class="button" type="button" @click="resetFilters">{{ ui.catalog.reset }}</button></div>
    </div>
  </section>
</template>
