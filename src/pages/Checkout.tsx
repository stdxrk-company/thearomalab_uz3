import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QtyStepper } from '../components/QtyStepper'
import { CHECKOUT, DELIVERY } from '../config'
import { useI18n } from '../i18n'
import type { Dict } from '../i18n/dicts'
import { buildCheckoutMessage, copyText, newOrderNo, saveOrder, telegramLink, type Customer, type OrderSnapshot } from '../lib/order'
import { editUzPhone, isValidUzPhone, UZ_PREFIX } from '../lib/phone'
import { useTitle } from '../lib/useTitle'
import { useCart } from '../store/cart'
import s from './Checkout.module.css'

type ErrorKey = keyof Dict['checkout']['errors']
type Errors = Partial<Record<ErrorKey, boolean>>

const EMPTY: Customer = {
  name: '',
  phone: UZ_PREFIX,
  contact: 'telegram',
  delivery: 'tashkent',
  district: '',
  city: '',
  address: '',
  landmark: '',
  payment: CHECKOUT.payment[0].id,
  comment: '',
}

/** Error keys, not texts, so a message follows the language if it is switched mid-form. */
function validate(c: Customer): Errors {
  const e: Errors = {}
  if (c.name.trim().length < 2) e.name = true
  if (!isValidUzPhone(c.phone)) e.phone = true
  if (c.delivery === 'tashkent' && !c.district) e.district = true
  if (c.delivery === 'region' && c.city.trim().length < 2) e.city = true
  if (c.address.trim().length < 4) e.address = true
  return e
}

export function CheckoutPage() {
  const { t, lang, sum, loc } = useI18n()
  useTitle(t.checkout.title)
  const cart = useCart()
  const navigate = useNavigate()
  const [c, setC] = useState<Customer>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)

  const free = cart.bottlesToFreeDelivery === 0
  const set = <K extends keyof Customer>(k: K, v: Customer[K]) => {
    setC((prev) => ({ ...prev, [k]: v }))
    if (errors[k as keyof Errors]) setErrors((prev) => ({ ...prev, [k]: undefined }))
  }

  const deliveryFree = c.delivery === 'tashkent' && free
  const deliveryLabel = c.delivery === 'region' ? t.checkout.btsRate : free ? t.checkout.freeLower : t.checkout.yandexRate

  if (cart.lines.length === 0) {
    return (
      <div className={`shell ${s.page}`}>
        <div className={`glass ${s.emptyCard}`}>
          <h1 className={s.h1}>{t.checkout.emptyTitle}</h1>
          <p>{t.checkout.emptyText}</p>
          <Link to="/catalog" className="btn btn-primary">
            {t.checkout.toCatalog}
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(c)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]')
      first?.focus()
      return
    }
    if (busy) return
    setBusy(true)

    const orderNo = newOrderNo()
    // the Telegram text is written in the language the customer is using right now
    const message = buildCheckoutMessage(cart.lines, c, orderNo, free, lang)
    const snapshot: OrderSnapshot = {
      orderNo,
      name: c.name.trim(),
      contact: c.contact,
      delivery: c.delivery,
      district: c.district,
      city: c.city.trim(),
      payment: c.payment,
      bottles: cart.bottles,
      total: cart.total,
      freeDelivery: deliveryFree,
      thumbs: cart.lines.map((l) => l.product.thumb).slice(0, 6),
      message,
    }
    saveOrder(snapshot)
    void copyText(message) // fallback if the Telegram client ignores the pre-filled text
    window.open(telegramLink(message), '_blank', 'noopener,noreferrer')
    cart.clear()
    navigate('/order', { state: snapshot })
  }

  const err = (k: ErrorKey) =>
    errors[k] ? (
      <span className="field-error" id={`err-${k}`}>
        {t.checkout.errors[k]}
      </span>
    ) : null

  return (
    <div className={`shell ${s.page}`}>
      <h1 className={s.h1}>{t.checkout.title}</h1>

      <div className={s.layout}>
        <form className={s.form} onSubmit={onSubmit} noValidate id="checkout-form">
          <fieldset className={`glass ${s.panel}`}>
            <legend className={s.legend}>
              <span className={s.step}>1</span>
              {t.checkout.contacts}
            </legend>
            <div className={s.row}>
              <label className="field">
                {t.checkout.name}
                <input
                  className="input"
                  autoComplete="name"
                  value={c.name}
                  onChange={(e) => set('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'err-name' : undefined}
                />
                {err('name')}
              </label>
              <label className="field">
                {t.checkout.phone}
                <input
                  className="input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+998 90 123 45 67"
                  value={c.phone}
                  onChange={(e) => {
                    const el = e.target
                    const next = editUzPhone(el.value, el.selectionStart ?? el.value.length)
                    set('phone', next.value)
                    requestAnimationFrame(() => el.setSelectionRange(next.caret, next.caret))
                  }}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'err-phone' : undefined}
                />
                {err('phone')}
              </label>
            </div>
            <div className={s.radios} role="radiogroup" aria-label={t.checkout.confirmHow}>
              <p className={s.radiosLabel}>{t.checkout.confirmHow}</p>
              <div className={s.tiles}>
                {(['telegram', 'call'] as const).map((v) => (
                  <label key={v} className={`glass ${s.tile} ${c.contact === v ? s.tileOn : ''}`}>
                    <input type="radio" name="contact" checked={c.contact === v} onChange={() => set('contact', v)} />
                    <span className={s.tileTitle}>{t.checkout.contact[v]}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className={`glass ${s.panel}`}>
            <legend className={s.legend}>
              <span className={s.step}>2</span>
              {t.checkout.delivery}
            </legend>
            <div className={s.tilesCol}>
              <label className={`glass ${s.tile} ${c.delivery === 'tashkent' ? s.tileOn : ''}`}>
                <input type="radio" name="delivery" checked={c.delivery === 'tashkent'} onChange={() => set('delivery', 'tashkent')} />
                <span className={s.tileBody}>
                  <span className={s.tileTop}>
                    <span className={s.tileTitle}>{t.checkout.tashkentTitle}</span>
                    <span className={free ? s.free : s.tileSide}>{free ? t.checkout.free : t.checkout.byRate}</span>
                  </span>
                  <span className={s.tileText}>
                    {free
                      ? t.checkout.freeHave(cart.freeDeliveryBottles)
                      : t.checkout.freeFrom(DELIVERY.freeFromBottles, cart.bottlesToFreeDelivery)}
                  </span>
                </span>
              </label>
              <label className={`glass ${s.tile} ${c.delivery === 'region' ? s.tileOn : ''}`}>
                <input type="radio" name="delivery" checked={c.delivery === 'region'} onChange={() => set('delivery', 'region')} />
                <span className={s.tileBody}>
                  <span className={s.tileTop}>
                    <span className={s.tileTitle}>{t.checkout.regionTitle}</span>
                    <span className={s.tileSide}>{t.checkout.btsRate}</span>
                  </span>
                  <span className={s.tileText}>{t.checkout.regionText}</span>
                </span>
              </label>
            </div>

            <div className={s.row}>
              {c.delivery === 'tashkent' ? (
                <label className="field">
                  {t.checkout.district}
                  <select
                    className="input"
                    value={c.district}
                    onChange={(e) => set('district', e.target.value)}
                    aria-invalid={!!errors.district}
                    aria-describedby={errors.district ? 'err-district' : undefined}
                  >
                    <option value="">{t.checkout.chooseDistrict}</option>
                    {CHECKOUT.districts.map((d) => (
                      <option key={d.ru} value={d.ru}>
                        {loc(d)}
                      </option>
                    ))}
                  </select>
                  {err('district')}
                </label>
              ) : (
                <label className="field">
                  {t.checkout.city}
                  <input
                    className="input"
                    autoComplete="address-level2"
                    value={c.city}
                    onChange={(e) => set('city', e.target.value)}
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? 'err-city' : undefined}
                  />
                  {err('city')}
                </label>
              )}
              <label className={`field ${s.wide}`}>
                {t.checkout.street}
                <input
                  className="input"
                  autoComplete="street-address"
                  placeholder={t.checkout.streetPh}
                  value={c.address}
                  onChange={(e) => set('address', e.target.value)}
                  aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? 'err-address' : undefined}
                />
                {err('address')}
              </label>
              <label className={`field ${s.full}`}>
                <span>
                  {t.checkout.landmark} <span className="field-hint">{t.checkout.optional}</span>
                </span>
                <input className="input" placeholder={t.checkout.landmarkPh} value={c.landmark} onChange={(e) => set('landmark', e.target.value)} />
              </label>
            </div>
          </fieldset>

          <fieldset className={`glass ${s.panel}`}>
            <legend className={s.legend}>
              <span className={s.step}>3</span>
              {t.checkout.payment}
            </legend>
            <div className={s.tiles}>
              {CHECKOUT.payment.map((p) => (
                <label key={p.id} className={`glass ${s.tile} ${c.payment === p.id ? s.tileOn : ''}`}>
                  <input type="radio" name="payment" checked={c.payment === p.id} onChange={() => set('payment', p.id)} />
                  <span className={s.tileTitle}>{loc(p)}</span>
                </label>
              ))}
            </div>
            <label className="field">
              <span>
                {t.checkout.comment} <span className="field-hint">{t.checkout.optional}</span>
              </span>
              <textarea
                className="input"
                rows={3}
                placeholder={t.checkout.commentPh}
                value={c.comment}
                onChange={(e) => set('comment', e.target.value)}
              />
            </label>
          </fieldset>
        </form>

        <aside className={`glass ${s.summary}`} aria-label={t.checkout.yourOrder}>
          <h2 className={s.h2}>{t.checkout.yourOrder}</h2>
          <ul className={s.lines}>
            {cart.lines.map((l) => (
              <li key={l.key} className={s.line}>
                <img src={l.product.thumb} alt="" width={46} height={58} />
                <span className={s.lineName}>
                  {l.product.brand} {l.product.name}
                  <span className={s.lineMeta}>
                    {l.ml} {t.ml}
                  </span>
                </span>
                <span className={s.lineRight}>
                  <QtyStepper size="sm" value={l.qty} onChange={(n) => cart.setQty(l.productId, l.ml, n)} />
                  <span className="price">{sum(l.total)}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className={s.sums}>
            <div>
              <span>{t.checkout.aromasLine(cart.bottles)}</span>
              <span className="price">{sum(cart.total)}</span>
            </div>
            <div>
              <span>{t.checkout.deliveryRow}</span>
              <span className={deliveryFree ? s.free : ''}>{deliveryLabel}</span>
            </div>
          </div>
          <div className={s.total}>
            <span>{t.checkout.total}</span>
            <span className="price">{sum(cart.total)}</span>
          </div>
          <button type="submit" form="checkout-form" className={`btn btn-primary btn-block ${s.submit}`} disabled={busy}>
            {t.checkout.submit}
          </button>
          <p className={s.note}>{t.checkout.note(loc(CHECKOUT.replyTime))}</p>
        </aside>
      </div>

      {/* phones: floating glass confirm bar */}
      <div className={`glass ${s.mobileBar}`}>
        <button type="submit" form="checkout-form" className={`btn btn-primary btn-block ${s.mobileSubmit}`} disabled={busy}>
          {t.checkout.submitShort} · <span className="price">{sum(cart.total)}</span>
        </button>
      </div>
    </div>
  )
}
