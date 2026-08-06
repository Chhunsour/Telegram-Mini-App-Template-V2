import type { TelegramUser } from '@/types'
import type { TelegramWebApp } from '@/types/telegram'

export function getTelegramWebApp(): TelegramWebApp | undefined {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp as TelegramWebApp
  }
  return undefined
}

export function getTelegramUser(): TelegramUser | undefined {
  const webApp = getTelegramWebApp()
  return webApp?.initDataUnsafe?.user
}

export function initTelegramEnvironment() {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.ready?.()
    webApp.expand?.()
  }
}
