import type { Router } from 'vue-router'
import type { TelegramUser } from '@/types'
import '@/types/telegram'

const webApp = () => window.Telegram?.WebApp
let mainButtonHandler: (() => void) | undefined

function syncTelegramCss() {
  const app = webApp()
  if (!app) return

  const root = document.documentElement
  root.dataset.theme = app.colorScheme
  root.style.setProperty('--app-height', `${app.viewportHeight}px`)
  Object.entries(app.themeParams).forEach(([name, value]) => {
    if (value) root.style.setProperty(`--tg-theme-${name.replaceAll('_', '-')}`, value)
  })
}

export function initTelegram(router: Router) {
  const app = webApp()
  if (!app?.initData) return

  app.ready()
  app.expand()
  app.setHeaderColor('secondary_bg_color')
  app.setBackgroundColor('bg_color')
  syncTelegramCss()

  const syncBackButton = () => router.currentRoute.value.path === '/' ? app.BackButton.hide() : app.BackButton.show()
  const goBack = () => router.back()
  app.BackButton.onClick(goBack)
  router.afterEach(syncBackButton)
  syncBackButton()

  ;['themeChanged', 'viewportChanged', 'safeAreaChanged', 'contentSafeAreaChanged'].forEach((event) => {
    app.onEvent(event, syncTelegramCss)
  })
}

export function getTelegramUser(): TelegramUser | undefined {
  return webApp()?.initDataUnsafe.user
}

export const isTelegramMiniApp = () => Boolean(webApp()?.initData)
export const getTelegramInitData = () => webApp()?.initData || ''

export function closeMiniApp() {
  const app = webApp()
  if (!app?.initData) return false
  app.close()
  return true
}

export function showMainButton(text: string, handler: () => void) {
  const app = webApp()
  if (!app?.initData) return
  const button = app.MainButton
  if (mainButtonHandler) button.offClick(mainButtonHandler)
  mainButtonHandler = handler
  button.setParams({ text, is_active: true, is_visible: true }).onClick(handler).show()
}

export function hideMainButton() {
  const app = webApp()
  if (!app?.initData) return
  const button = app.MainButton
  if (mainButtonHandler) button.offClick(mainButtonHandler)
  mainButtonHandler = undefined
  button.hide()
}
