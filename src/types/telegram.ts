import type { TelegramUser } from './index'

interface TelegramButton {
  show(): TelegramButton
  hide(): TelegramButton
  onClick(callback: () => void): TelegramButton
  offClick(callback: () => void): TelegramButton
  setParams(params: {
    text?: string
    color?: string
    text_color?: string
    is_active?: boolean
    is_visible?: boolean
  }): TelegramButton
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: { user?: TelegramUser }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  viewportHeight: number
  viewportStableHeight: number
  themeParams: Record<string, string | undefined>
  BackButton: TelegramButton
  MainButton: TelegramButton
  ready(): void
  expand(): void
  close(): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
  onEvent(event: string, callback: () => void): void
  offEvent(event: string, callback: () => void): void
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp }
  }
}

export type { TelegramWebApp }
