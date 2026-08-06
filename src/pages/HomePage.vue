<script setup lang="ts">
import { computed, ref } from 'vue'
import HeroSlider from '@/components/HeroSlider.vue'
import ProductGrid from '@/components/ProductGrid.vue'
import { useShowcaseStore } from '@/stores/showcase'

const showcase = useShowcaseStore()
const ui = computed(() => showcase.copy.ui)
const search = ref('')

const featuredCategories = computed(() =>
  showcase.categoryItems.map((cat) => ({
    name: showcase.currentLocale === 'km' ? cat.nameKm : cat.nameEn,
    slug: cat.slug,
    icon: cat.icon || '📦',
    image: showcase.products.find((product) => product.category === cat.slug)?.image || showcase.storeInfo.heroBanner
  }))
)

const searchResults = computed(() =>
  search.value.trim().length > 1
    ? showcase.products.filter((product) =>
        `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(search.value.toLowerCase())
      )
    : []
)

const bestSellers = computed(() => showcase.products.filter((product) => product.isBestSeller).slice(0, 4))
const discounts = computed(() => showcase.products.filter((product) => product.oldPrice || (product.discountPercent && product.discountPercent > 0)).slice(0, 4))
const allProducts = computed(() => showcase.products.slice(0, 8))
</script>

<template>
  <div class="homepage">
    <section class="store-intro container">
      <form class="store-search" role="search" @submit.prevent>
        <label for="store-search">{{ ui.home.search }}</label>
        <div class="search-input-wrapper">
          <span class="search-icon" aria-hidden="true">⌕</span>
          <input
            id="store-search"
            v-model="search"
            type="search"
            :placeholder="ui.home.searchPlaceholder"
            autocomplete="off"
          />
          <button v-if="search" type="button" class="clear-search" :aria-label="ui.home.search" @click="search = ''">×</button>
        </div>
      </form>
    </section>

    <!-- Search Results View -->
    <section v-if="search.length > 1" class="container search-results">
      <div class="section-heading">
        <div>
          <span>{{ ui.home.results }}</span>
          <h2>{{ searchResults.length ? `${ui.home.results}: “${search}”` : ui.home.noResults }}</h2>
        </div>
      </div>
      <ProductGrid v-if="searchResults.length" :products="searchResults" />
      <p v-else class="empty-search">
        {{ showcase.currentLocale === 'km' ? 'សាកល្បងសរសេរប្រភេទ ឬឈ្មោះទំនិញខ្លីជាងនេះ។' : 'Try searching for shorter terms or product categories.' }}
      </p>
    </section>

    <template v-else>
      <!-- Hero Banner -->
      <HeroSlider />

      <!-- Categories Section -->
      <section class="container section home-section">
        <div class="section-heading">
          <div>
            <span>{{ ui.home.fastFind }}</span>
            <h2>{{ ui.home.categories }}</h2>
          </div>
          <RouterLink to="/categories" class="view-all-link">{{ ui.common.viewAll }} →</RouterLink>
        </div>

        <div class="category-rail">
          <RouterLink
            v-for="category in featuredCategories"
            :key="category.slug"
            :to="{ name: 'categories', query: { category: category.slug } }"
            class="category-card"
          >
            <div class="category-card-media">
              <img :src="category.image" :alt="category.name" loading="lazy" width="360" height="420" />
              <span class="category-card-icon">{{ category.icon }}</span>
            </div>
            <span class="category-card-title">{{ category.name }}</span>
          </RouterLink>
        </div>
      </section>

      <!-- Best Sellers -->
      <section v-if="bestSellers.length" class="container section home-section">
        <div class="section-heading">
          <div>
            <span>{{ ui.home.popular }}</span>
            <h2>{{ ui.home.bestSellers }}</h2>
          </div>
          <RouterLink :to="{ name: 'categories', query: { best: '1' } }" class="view-all-link">{{ ui.common.viewAll }} →</RouterLink>
        </div>
        <ProductGrid :products="bestSellers" />
      </section>

      <!-- All Catalog Products -->
      <section class="container section home-section">
        <div class="section-heading">
          <div>
            <span>{{ showcase.currentLocale === 'km' ? 'ទំនិញទាំងអស់' : 'All Products' }}</span>
            <h2>{{ showcase.currentLocale === 'km' ? 'ទំនិញប្រចាំហាង' : 'Store Catalog' }}</h2>
          </div>
          <RouterLink to="/categories" class="view-all-link">{{ ui.common.viewAll }} →</RouterLink>
        </div>
        <ProductGrid :products="allProducts" />
      </section>

      <!-- Delivery & Guarantee Feature Strip -->
      <section class="delivery-strip">
        <div class="container delivery-strip-grid">
          <article class="delivery-item">
            <span class="delivery-icon">🚚</span>
            <div>
              <b>{{ showcase.storeInfo.delivery.estimateKm }}</b>
              <span>{{ showcase.currentLocale === 'km' ? 'ដឹកជញ្ជូននៅភ្នំពេញ' : 'Phnom Penh Delivery' }}</span>
            </div>
          </article>
          <article class="delivery-item">
            <span class="delivery-icon">🗺️</span>
            <div>
              <b>{{ showcase.currentLocale === 'km' ? 'ទូទាំង 25 ខេត្ត/ក្រុង' : 'All 25 Provinces' }}</b>
              <span>{{ showcase.currentLocale === 'km' ? 'មានដឹកជញ្ជូនទៅខេត្ត' : 'Cambodia Wide Shipping' }}</span>
            </div>
          </article>
          <article class="delivery-item">
            <span class="delivery-icon">📞</span>
            <div>
              <b>{{ showcase.currentLocale === 'km' ? 'ជំនួយពីហាង' : 'Store Support' }}</b>
              <span>{{ showcase.storeInfo.contact.phone }}</span>
            </div>
          </article>
        </div>
      </section>

      <!-- Sale Feature -->
      <section v-if="discounts.length" class="sale-feature container">
        <div class="sale-feature-copy">
          <span>{{ ui.home.offers }}</span>
          <h2>{{ ui.home.saleTitle }}</h2>
          <p>{{ ui.home.saleCopy }}</p>
          <RouterLink class="button primary-btn" :to="{ name: 'categories', query: { sale: '1' } }">
            {{ ui.home.offers }}
          </RouterLink>
        </div>
        <div class="sale-feature-media">
          <img :src="discounts[0].image" :alt="discounts[0].name" loading="lazy" />
        </div>
      </section>

      <!-- Support & Help Shortcuts -->
      <section class="support-shortcuts container section">
        <RouterLink to="/contact" class="shortcut-card">
          <span class="shortcut-icon">☎</span>
          <div class="shortcut-text">
            <strong>{{ ui.common.contactStore }}</strong>
            <small>{{ showcase.storeInfo.contact.phone }}</small>
          </div>
          <b class="shortcut-arrow">›</b>
        </RouterLink>
        <RouterLink to="/contact#help" class="shortcut-card">
          <span class="shortcut-icon">❓</span>
          <div class="shortcut-text">
            <strong>{{ showcase.currentLocale === 'km' ? 'ជំនួយ និងលក្ខខណ្ឌ' : 'Help & Policies' }}</strong>
            <small>{{ showcase.currentLocale === 'km' ? 'ដឹកជញ្ជូន ទូទាត់ និងប្តូរទំនិញ' : 'Delivery, Payment & Returns' }}</small>
          </div>
          <b class="shortcut-arrow">›</b>
        </RouterLink>
        <a :href="`https://t.me/${showcase.storeInfo.telegram.botUsername.replace('@', '')}`" target="_blank" class="shortcut-card">
          <span class="shortcut-icon">✈</span>
          <div class="shortcut-text">
            <strong>{{ ui.home.openTelegram }}</strong>
            <small>{{ showcase.storeInfo.telegram.botUsername }}</small>
          </div>
          <b class="shortcut-arrow">›</b>
        </a>
      </section>
    </template>
  </div>
</template>
