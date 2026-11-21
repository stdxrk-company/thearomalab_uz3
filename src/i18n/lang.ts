export type Lang = 'ru' | 'uz' | 'en'

/** A text in every interface language — used for shop content kept in config.ts. */
export type Localized = Record<Lang, string>

export const LANGS: { code: Lang; short: string; name: string }[] = [
  { code: 'ru', short: 'RU', name: 'Русский' },
  { code: 'uz', short: 'UZ', name: 'Oʻzbekcha' },
  { code: 'en', short: 'EN', name: 'English' },
]

export const DEFAULT_LANG: Lang = 'uz'

export function isLang(v: unknown): v is Lang {
  return v === 'ru' || v === 'uz' || v === 'en'
}
