import { useEffect, useRef, useState } from 'react'
import { LANGS, useI18n } from '../i18n'
import s from './LangSwitch.module.css'

/** RU / UZ / EN: a small square button that opens a list of languages. */
export function LangSwitch({ up = false }: { up?: boolean }) {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANGS.find((l) => l.code === lang)!

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={s.wrap}>
      <button
        type="button"
        className={s.btn}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t.nav.language}: ${current.name}`}
      >
        {current.short}
      </button>
      {open && (
        <ul className={`${s.menu} ${up ? s.up : ''}`} aria-label={t.nav.language}>
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                lang={l.code}
                className={`${s.item} ${l.code === lang ? s.on : ''}`}
                aria-current={l.code === lang ? 'true' : undefined}
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
              >
                <span className={s.code}>{l.short}</span>
                {l.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
