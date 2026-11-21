import { Link } from 'react-router-dom'
import { SHOP } from '../config'
import { useI18n } from '../i18n'
import { telegramLink } from '../lib/order'
import { TelegramIcon } from './Icons'
import s from './Footer.module.css'

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className={s.footer}>
      <div className={`shell ${s.grid}`}>
        <div className={s.about}>
          <div className={s.brand}>
            <img src="/logo-white.png" alt="" width={52} height={52} />
            <span>{SHOP.name}</span>
          </div>
          <p>{t.footer.about}</p>
          <a href={telegramLink()} target="_blank" rel="noopener noreferrer" className={`btn btn-ghost ${s.tg}`}>
            <TelegramIcon width={16} height={16} /> @{SHOP.telegramUsername}
          </a>
        </div>

        <nav className={s.col} aria-label={t.footer.catalog}>
          <p className={s.h}>{t.footer.catalog}</p>
          <Link to="/catalog">{t.footer.all}</Link>
          <Link to="/catalog?g=men">{t.genderFilter.men}</Link>
          <Link to="/catalog?g=women">{t.genderFilter.women}</Link>
          <Link to="/catalog?g=unisex">{t.genderFilter.unisex}</Link>
        </nav>

        <nav className={s.col} aria-label={t.footer.buyers}>
          <p className={s.h}>{t.footer.buyers}</p>
          <Link to="/#how">{t.footer.how}</Link>
          <Link to="/#delivery">{t.footer.deliveryPay}</Link>
          <Link to="/#faq">{t.footer.faq}</Link>
        </nav>
      </div>
      <div className={`shell ${s.bottom}`}>
        <span>© {new Date().getFullYear()} {SHOP.name}</span>
        <span>Tashkent</span>
      </div>
    </footer>
  )
}
