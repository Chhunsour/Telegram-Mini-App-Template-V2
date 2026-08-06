import type { Router } from 'vue-router'
import type { TelegramUser } from '@/types'
import type { TelegramWebApp } from '@/types/telegram'

const webApp = (): TelegramWebApp | undefined => window.Telegram?.WebApp
let mainButtonHandler: (() => void) | undefined

function syncTelegramCss() {
  const app = webApp()
  if (!app) return

  const root = document.documentElement
  if (app.colorScheme) root.dataset.theme = app.colorScheme
  if (app.viewportHeight) root.style.setProperty('--app-height', `${app.viewportHeight}px`)
  if (app.themeParams) {
    Object.entries(app.themeParams).forEach(([name, value]) => {
      if (value) root.style.setProperty(`--tg-theme-${name.replaceAll('_', '-')}`, value)
    })
  }
}

export function initTelegram(router: Router) {
  const app = webApp()
  if (!app?.initData) return

  app.ready?.()
  app.expand?.()
  try {
    app.setHeaderColor?.('secondary_bg_color')
    app.setBackgroundColor?.('bg_color')
  } catch {
    /* ignore fallback header color unsupported platforms */
  }
  syncTelegramCss()

  const syncBackButton = () => {
    if (!app.BackButton) return
    if (router.currentRoute.value.path === '/') app.BackButton.hide()
    else app.BackButton.show()
  }

  const goBack = () => router.back()
  app.BackButton?.onClick(goBack)
  router.afterEach(syncBackButton)
  syncBackButton()

  ;['themeChanged', 'viewportChanged', 'safeAreaChanged', 'contentSafeAreaChanged'].forEach((event) => {
    app.onEvent?.(event, syncTelegramCss)
  })
}

export function getTelegramUser(): TelegramUser | undefined {
  return webApp()?.initDataUnsafe?.user
}

export const isTelegramMiniApp = () => Boolean(webApp()?.initData)
export const getTelegramInitData = () => webApp()?.initData || ''

export function closeMiniApp() {
  const app = webApp()
  if (!app?.initData) return false
  app.close?.()
  return true
}

export function showMainButton(text: string, handler: () => void) {
  const app = webApp()
  if (!app?.initData || !app.MainButton) return
  const button = app.MainButton
  if (mainButtonHandler) button.offClick(mainButtonHandler)
  mainButtonHandler = handler
  button.setParams({ text, is_visible: true, is_active: true })
  button.onClick(handler)
  button.show()
}

export function hideMainButton() {
  const app = webApp()
  if (!app?.initData || !app.MainButton) return
  const button = app.MainButton
  if (mainButtonHandler) button.offClick(mainButtonHandler)
  mainButtonHandler = undefined
  button.hide()
}
