import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DELIVERY, SHOP } from '../config'
import { useI18n } from '../i18n'
import { telegramLink } from '../lib/order'
import { useCart } from '../store/cart'
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from './Icons'
import { LangSwitch } from './LangSwitch'
import s from './Header.module.css'

/** Black announcement line, then a white bar: menu and sections left, logo centred, search and cart right. */
export function Header() {
  const { bottles, open, lastAdded } = useCart()
  const { t } = useI18n()
  const loc = useLocation()
  const [bump, setBump] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const NAV = [
    { to: '/#new', label: t.nav.new },
    { to: '/catalog?g=men', label: t.genderFilter.men },
    { to: '/catalog?g=women', label: t.genderFilter.women },
    { to: '/catalog?g=unisex', label: t.genderFilter.unisex },
    { to: '/catalog', label: t.nav.catalog },
  ]

  useEffect(() => {
    if (!lastAdded) return
    setBump(true)
    const timer = setTimeout(() => setBump(false), 450)
    return () => clearTimeout(timer)
  }, [lastAdded])

  // close the menu on navigation; Esc closes it too
  useEffect(() => setMenuOpen(false), [loc.pathname, loc.search, loc.hash])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [menuOpen])

  const isActive = (to: string) => {
    const [path, query] = to.split('?')
    if (path.includes('#') || path !== loc.pathname) return false
    const g = new URLSearchParams(loc.search).get('g')
    return query ? query === `g=${g}` : !g
  }

  return (
    <>
      <div className={s.ann}>
        <span className={s.annLong}>{t.nav.announce(DELIVERY.freeFromBottles)}</span>
        <span className={s.annShort}>{t.nav.announceShort(DELIVERY.freeFromBottles)}</span>
      </div>

      <header className={s.header}>
        <div className={s.bar}>
          <div className={s.left}>
            <button type="button" className={s.menuBtn} onClick={() => setMenuOpen(true)} aria-label={t.nav.menu} aria-expanded={menuOpen}>
              <MenuIcon />
              <span className={s.menuLabel}>{t.nav.menu}</span>
            </button>
            <nav className={s.nav} aria-label={t.nav.mainMenu}>
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className={`link-line ${s.link} ${isActive(n.to) ? 'is-on' : ''}`}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link to="/" className={s.brand} aria-label={t.nav.toHome(SHOP.name)}>
            <img src="/logo-black.png" alt="" width={46} height={46} className={s.logo} />
            <span className={s.wordmark}>{SHOP.name}</span>
          </Link>

          <div className={s.right}>
            <Link to="/catalog?focus=search" className={`link-line ${s.action}`} aria-label={t.nav.searchLabel}>
              <SearchIcon width={18} height={18} />
              <span className={s.actionLabel}>{t.nav.search}</span>
            </Link>
            <span className={s.lang}>
              <LangSwitch />
            </span>
            <button type="button" className={`link-line ${s.action} ${bump ? s.bump : ''}`} onClick={open} aria-label={t.nav.cartAria(bottles)}>
              <span className={s.bag}>
                <BagIcon width={18} height={18} />
                {bottles > 0 && <span className={s.badge}>{bottles}</span>}
              </span>
              <span className={s.actionLabel}>
                {t.nav.cart} ({bottles})
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* full menu: phones always, desktop through the «Меню» button */}
      <div className={`${s.menuRoot} ${menuOpen ? s.menuOn : ''}`} aria-hidden={!menuOpen} inert={!menuOpen}>
        <div className={s.backdrop} onClick={() => setMenuOpen(false)} />
        <div className={s.panel} role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <div className={s.panelHead}>
            <span className="cap">{t.nav.menu}</span>
            <button type="button" className="icon-btn" onClick={() => setMenuOpen(false)} aria-label={t.nav.closeMenu}>
              <CloseIcon />
            </button>
          </div>
          <nav className={s.panelNav} aria-label={t.nav.sections}>
            <Link to="/">{t.nav.home}</Link>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to}>
                {n.label}
              </Link>
            ))}
            <Link to="/#delivery">{t.nav.delivery}</Link>
          </nav>
          <div className={s.panelFoot}>
            <div className={s.panelLang}>
              <span className="cap">{t.nav.language}</span>
              <LangSwitch up />
            </div>
            <a href={telegramLink()} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block">
              Telegram · @{SHOP.telegramUsername}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
