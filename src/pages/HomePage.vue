<script setup lang="ts">
import { computed, ref } from 'vue'
import HeroSlider from '@/components/HeroSlider.vue'
import ProductGrid from '@/components/ProductGrid.vue'
import { useShowcaseStore } from '@/stores/showcase'

const showcase = useShowcaseStore()
const ui = showcase.copy.ui
const search = ref('')
const featuredCategories = computed(() => showcase.categories.map((name) => ({ name, image: showcase.products.find((product) => product.category === name)?.image || showcase.heroBanners[0].image })))
const searchResults = computed(() => search.value.trim().length > 1 ? showcase.products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(search.value.toLowerCase())) : [])
const bestSellers = computed(() => showcase.products.filter((product) => product.isBestSeller).slice(0, 4))
const discounts = computed(() => showcase.products.filter((product) => product.oldPrice).slice(0, 4))
</script>

<template>
  <section class="store-intro container">
    <form class="store-search" role="search" @submit.prevent>
      <label for="store-search">{{ ui.home.search }}</label><div><span aria-hidden="true">⌕</span><input id="store-search" v-model="search" type="search" :placeholder="ui.home.searchPlaceholder" autocomplete="off" /><button v-if="search" type="button" :aria-label="ui.home.search" @click="search = ''">×</button></div>
    </form>
  </section>

  <section v-if="search.length > 1" class="container search-results">
    <div class="section-heading"><div><span>{{ ui.home.results }}</span><h2>{{ searchResults.length ? `${ui.home.results}: “${search}”` : ui.home.noResults }}</h2></div></div>
    <ProductGrid v-if="searchResults.length" :products="searchResults" />
    <p v-else class="empty-search">សាកល្បងសរសេរប្រភេទ ឬឈ្មោះទំនិញខ្លីជាងនេះ។</p>
  </section>

  <template v-else>
    <HeroSlider />

    <section class="container section home-section">
      <div class="section-heading"><div><span>{{ ui.home.fastFind }}</span><h2>{{ ui.home.categories }}</h2></div><RouterLink to="/categories">{{ ui.common.viewAll }}</RouterLink></div>
      <div class="category-rail">
        <RouterLink v-for="category in featuredCategories" :key="category.name" :to="{ name: 'categories', query: { category: category.name } }" class="category-card">
          <img :src="category.image" :alt="category.name" loading="lazy" width="360" height="420" /><span>{{ category.name }}</span>
        </RouterLink>
      </div>
    </section>

    <section v-if="bestSellers.length" class="container section home-section">
      <div class="section-heading"><div><span>{{ ui.home.popular }}</span><h2>{{ ui.home.bestSellers }}</h2></div><RouterLink :to="{ name: 'categories', query: { best: '1' } }">{{ ui.common.viewAll }}</RouterLink></div>
      <ProductGrid :products="bestSellers" />
    </section>

    <section class="delivery-strip">
      <div class="container">
        <article><b>១–២ ថ្ងៃ</b><span>ដឹកជញ្ជូននៅភ្នំពេញ</span></article>
        <article><b>ទូទាំងប្រទេស</b><span>មានដឹកជញ្ជូនទៅខេត្ត</span></article>
        <article><b>ជំនួយពីហាង</b><span>{{ showcase.current.phone }}</span></article>
      </div>
    </section>

    <section v-if="discounts.length" class="sale-feature container">
      <div class="sale-feature-copy"><span>{{ ui.home.offers }}</span><h2>{{ ui.home.saleTitle }}</h2><p>{{ ui.home.saleCopy }}</p><RouterLink class="button" :to="{ name: 'categories', query: { sale: '1' } }">{{ ui.home.offers }}</RouterLink></div>
      <img :src="discounts[0].image" :alt="discounts[0].name" loading="lazy" />
    </section>

    <section class="trust-section container">
      <div><span>ហេតុអ្វីអតិថិជនបន្តគាំទ្រ</span><h2>តម្លៃច្បាស់។ ដឹកជញ្ជូនឆាប់រហ័ស។ ងាយទំនាក់ទំនង។</h2></div>
      <div class="trust-list"><p><b>01</b><span><strong>បញ្ជាទិញដោយទុកចិត្ត</strong>ទំនិញនីមួយៗបង្ហាញស្តុក តម្លៃ និងពេលដឹកជញ្ជូន។</span></p><p><b>02</b><span><strong>ទូទាត់ងាយស្រួល</strong>ជ្រើសរើសការដឹកជញ្ជូន និងវិធីទូទាត់នៅកន្លែងតែមួយ។</span></p><p><b>03</b><span><strong>ជំនួយតាម Telegram</strong>មើលទំនិញ បញ្ជាទិញ និងទំនាក់ទំនងហាងដោយមិនចាកចេញពី Telegram។</span></p></div>
    </section>

    <section class="support-shortcuts container section">
      <RouterLink to="/contact"><span>☎</span><div><strong>{{ ui.common.contactStore }}</strong><small>{{ showcase.current.phone }}</small></div><b>›</b></RouterLink>
      <RouterLink to="/contact#help"><span>?</span><div><strong>ជំនួយ</strong><small>ដឹកជញ្ជូន ទូទាត់ និងប្តូរទំនិញ</small></div><b>›</b></RouterLink>
      <a :href="`https://t.me/${showcase.current.telegramUsername.replace('@', '')}`"><span>➤</span><div><strong>{{ ui.home.openTelegram }}</strong><small>{{ showcase.current.telegramUsername }}</small></div><b>›</b></a>
    </section>
  </template>
</template>
