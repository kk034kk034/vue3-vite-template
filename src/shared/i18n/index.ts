import { computed } from 'vue'
import { createI18n } from 'vue-i18n'
import { messages } from './messages'

export type AppLocale = 'zh-TW' | 'zh-CN'

const localeKey = 'ln-heo-locale'
const savedLocale = window.localStorage.getItem(localeKey)
const defaultLocale: AppLocale = savedLocale === 'zh-CN' ? 'zh-CN' : 'zh-TW'
document.documentElement.lang = defaultLocale

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'zh-TW',
  messages,
})

export const localeOptions = [
  { label: '繁體中文', value: 'zh-TW' },
  { label: '简体中文', value: 'zh-CN' },
]

export function t(key: string) {
  return i18n.global.t(key)
}

export function setLocale(value: AppLocale) {
  i18n.global.locale.value = value
  window.localStorage.setItem(localeKey, value)
  document.documentElement.lang = value
}

export function useAppI18n() {
  return {
    locale: computed({
      get: () => i18n.global.locale.value as AppLocale,
      set: setLocale,
    }),
    localeOptions,
    t,
  }
}
