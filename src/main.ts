import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initTelegram } from './services/telegram'
import { storeConfig } from './config/store.config'
import './assets/styles/main.css'

document.title = storeConfig.storeName
document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href', storeConfig.favicon)
document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', storeConfig.description)
document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', storeConfig.storeName)

createApp(App).use(createPinia()).use(router).mount('#app')
initTelegram(router)
