import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../i18n'
import { getProduct } from '../lib/catalog'
import { useCart } from '../store/cart'
import { CheckIcon } from './Icons'
import s from './CartBar.module.css'

/**
 * A short black "added" toast after something goes into the cart.
 * Product and checkout pages have their own bottom bar on phones, so the toast sits higher there.
 */
export function CartBar() {
  const { open, isOpen, lastAdded } = useCart()
  const { pathname } = useLocation()
  const { t } = useI18n()
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!lastAdded) return
    const p = getProduct(lastAdded.productId)
    setToast(p ? `${p.brand} ${p.name}` : null)
    const timer = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(timer)
  }, [lastAdded])

  const ownBar = pathname.startsWith('/perfume/') || pathname === '/checkout'

  return (
    <div className={`${s.toast} ${toast && !isOpen ? s.toastOn : ''} ${ownBar ? s.toastHigh : ''}`} role="status" aria-live="polite">
      {toast && (
        <>
          <CheckIcon width={16} height={16} />
          <span className={s.toastText}>
            <strong>{t.toast.added}</strong> {toast}
          </span>
          <button type="button" onClick={open} className={s.toastBtn}>
            {t.nav.cart}
          </button>
        </>
      )}
    </div>
  )
}
