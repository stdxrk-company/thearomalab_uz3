import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { formatSum } from '../lib/catalog'
import { DICTS, type Dict } from './dicts'
import { DEFAULT_LANG, isLang, type Lang, type Localized } from './lang'
import { noteName } from './notes'

export { LANGS, type Lang, type Localized } from './lang'

export { DICTS }

const STORAGE_KEY = 'aromalab.lang'

/** ?lang= in the URL first, then the saved choice; Uzbek otherwise. */
function initialLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (isLang(fromUrl)) return fromUrl
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_LANG
}

interface I18n {
  lang: Lang
  setLang: (l: Lang) => void
  t: Dict
  /** Price in the current language: «120 000 сум» / «120 000 soʻm» / «120 000 UZS». */
  sum: (uzs: number) => string
  note: (ruName: string) => string
  /** Picks the current language from a { ru, uz, en } text. */
  loc: (text: Localized) => string
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* the choice still holds for this visit */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t: DICTS[lang],
      sum: (uzs) => formatSum(uzs, lang),
      note: (n) => noteName(n, lang),
      loc: (text) => text[lang],
    }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
