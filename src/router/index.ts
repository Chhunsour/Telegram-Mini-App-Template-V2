import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CategoriesPage from '@/pages/CategoriesPage.vue'
import ProductPage from '@/pages/ProductPage.vue'
import CartPage from '@/pages/CartPage.vue'
import CheckoutPage from '@/pages/CheckoutPage.vue'
import OrdersPage from '@/pages/OrdersPage.vue'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage.vue'
import ContactPage from '@/pages/ContactPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/categories', name: 'categories', component: CategoriesPage },
    { path: '/products/:slug', name: 'product', component: ProductPage },
    { path: '/cart', name: 'cart', component: CartPage },
    { path: '/checkout', name: 'checkout', component: CheckoutPage },
    { path: '/orders', name: 'orders', component: OrdersPage },
    { path: '/order-confirmation/:id', name: 'order-confirmation', component: OrderConfirmationPage },
    { path: '/contact', name: 'contact', component: ContactPage },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
  ],
})
