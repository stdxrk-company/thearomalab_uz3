import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckIcon, ChevronIcon, TelegramIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { QtyStepper } from '../components/QtyStepper'
import { DELIVERY } from '../config'
import { useI18n } from '../i18n'
import {
  formatNum,
  fullName,
  getProduct,
  isNew,
  minPrice,
  NOTE_TIERS,
  productDescription,
  products,
  similarByNotes,
  volumePrice,
} from '../lib/catalog'
import { productQuestionMessage, productUrl, telegramLink } from '../lib/order'
import { useTitle } from '../lib/useTitle'
import { useCart } from '../store/cart'
import { NotFoundPage } from './NotFound'
import s from './Product.module.css'

export function ProductPage() {
  const { id = '' } = useParams()
  const product = getProduct(id)
  const cart = useCart()
  const navigate = useNavigate()
  const [ml, setMl] = useState(product?.volumes[0]?.ml ?? 10)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { t, lang, sum, note } = useI18n()

  useTitle(product ? t.product.pageTitle(fullName(product)) : t.product.notFound)

  // reset selection when navigating between products
  useEffect(() => {
    setMl(product?.volumes[0]?.ml ?? 10)
    setQty(1)
    setAdded(false)
  }, [product])

  if (!product) return <NotFoundPage />

  const volume = product.volumes.find((v) => v.ml === ml) ?? product.volumes[0]
  const unit = volumePrice(volume)
  const inCart = cart.lines.find((l) => l.productId === product.id && l.ml === volume.ml)

  const sameBrand = products.filter((p) => p.brand === product.brand && p.id !== product.id)
  const byNotes = similarByNotes(product, 8, 3)
  const related =
    byNotes.length >= 4
      ? { title: t.product.similar, items: byNotes }
      : {
          title: sameBrand.length >= 4 ? t.product.moreFrom(product.brand) : t.product.mayLike,
          items: (sameBrand.length >= 4
            ? sameBrand
            : [
                ...sameBrand,
                ...products.filter(
                  (p) => p.brand !== product.brand && p.gender === product.gender && minPrice(p) === minPrice(product),
                ),
              ]
          ).slice(0, 8),
        }
  const tiers = NOTE_TIERS.filter((k) => product.notes?.[k]?.length)
  const description = productDescription(product, lang)

  const onAdd = () => {
    cart.add(product.id, volume.ml, qty)
    setAdded(true)
    setQty(1)
  }

  // after adding, the bottle count already includes this product
  const left = cart.bottlesToFreeDelivery

  return (
    <div className={`shell ${s.page}`}>
      <nav className={s.crumbs} aria-label={t.product.crumbs}>
        <Link to="/catalog" className={`glass ${s.crumb}`}>
          {t.product.back}
        </Link>
        <Link to={`/catalog?b=${encodeURIComponent(product.brand)}`} className={`glass ${s.crumb} ${s.crumbSoft}`}>
          {product.brand}
        </Link>
      </nav>

      <div className={s.grid}>
        <div className={s.media}>
          <img src={product.image} alt={t.product.imgAlt(fullName(product))} width={900} height={1200} />
        </div>

        <div className={`glass ${s.panel}`}>
          <div>
            <p className={`brand-label ${s.brand}`}>
              <Link to={`/catalog?b=${encodeURIComponent(product.brand)}`}>{product.brand}</Link>{' '}
              <span className={s.gender}>· {t.gender[product.gender].toLowerCase()}</span>
            </p>
            <h1 className={`serif-name ${s.name}`}>{product.name}</h1>
            <div className={s.badges}>
              {isNew(product) && <span className={`glass ${s.badge} ${s.badgeNew}`}>{t.card.newTag}</span>}
              {product.inStock ? (
                <span className={`glass ${s.badge}`}>
                  <span className={s.dot} /> {t.product.inStock}
                </span>
              ) : (
                <span className={`glass ${s.badge} ${s.out}`}>{t.product.outOfStock}</span>
              )}
            </div>
          </div>

          {description && <p className={s.desc}>{description}</p>}

          {tiers.length > 0 && (
            <section className={s.notes} aria-labelledby="notes-title">
              <h2 id="notes-title" className="visually-hidden">
                {tiers.length > 1 ? t.product.pyramid : t.product.notesTitle}
              </h2>
              <dl className={s.pyramid}>
                {tiers.map((k) => (
                  <div key={k} className={s.tier}>
                    <dt>{t.product.tiers[k]}</dt>
                    <dd>
                      {product.notes![k]!.map(note).map((n) => (
                        <Link key={n} to={`/catalog?q=${encodeURIComponent(n)}`} className={s.note} title={t.product.withNote(n)}>
                          {n}
                        </Link>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div>
            <p className={s.label}>{t.product.volume}</p>
            <div className={s.volumes} role="radiogroup" aria-label={t.product.volume}>
              {product.volumes.map((v) => (
                <button
                  key={v.ml}
                  type="button"
                  role="radio"
                  aria-checked={v.ml === volume.ml}
                  className={`${s.vol} ${v.ml === volume.ml ? s.volOn : ''}`}
                  onClick={() => {
                    setMl(v.ml)
                    setAdded(false)
                  }}
                >
                  <span className={s.volMl}>
                    {v.ml} {t.ml}
                  </span>
                  <span className="price">{sum(volumePrice(v))}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s.buy}>
            <QtyStepper value={qty} onChange={setQty} />
            <button type="button" className={`btn btn-primary ${s.addBtn}`} onClick={onAdd} disabled={!product.inStock}>
              {added ? (
                <>
                  <CheckIcon /> {t.product.added}
                </>
              ) : (
                <>
                  {t.product.toCart} · <span className="price">{sum(unit * qty)}</span>
                </>
              )}
            </button>
          </div>

          {(added || inCart) && (
            <div className={`glass ${s.addedBox}`} role="status">
              <p className={s.addedTitle}>
                {inCart ? t.product.inCart(inCart.qty) : t.product.addedToCart}
              </p>
              <p className={s.addedText}>{left > 0 ? t.product.left(left) : t.product.freeWill}</p>
              <div className={s.addedActions}>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/checkout')}>
                  {t.product.checkout}
                </button>
                <button type="button" className="btn btn-secondary" onClick={cart.open}>
                  {t.product.cart}
                </button>
              </div>
            </div>
          )}

          <ul className={s.facts}>
            <li>
              <span>{t.product.decant(volume.ml)}</span>
              <span>{t.product.decantSub}</span>
            </li>
            <li>
              <span>{t.product.deliveryTashkent}</span>
              <span>{t.product.deliverySub(DELIVERY.freeFromBottles)}</span>
            </li>
            <li>
              <span>{t.product.otherCities}</span>
              <span>BTS</span>
            </li>
          </ul>

          <a
            className={s.ask}
            href={telegramLink(productQuestionMessage(fullName(product), productUrl(product.id), lang))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <TelegramIcon width={18} height={18} /> {t.product.ask} <ChevronIcon width={16} height={16} />
          </a>
        </div>
      </div>

      {related.items.length > 0 && (
        <section className={s.related}>
          <h2 className={s.h2}>{related.title}</h2>
          <div className={s.rail}>
            {related.items.map((p) => (
              <div key={p.id} className={s.railItem}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* phones: floating glass buy bar */}
      <div className={`glass ${s.mobileBar}`}>
        <QtyStepper value={qty} onChange={setQty} />
        <button type="button" className={`btn btn-primary ${s.mobileAdd}`} onClick={onAdd} disabled={!product.inStock}>
          {added ? (
            <>
              <CheckIcon /> {t.product.added}
            </>
          ) : (
            <>
              {t.product.toCart} · <span className="price">{formatNum(unit * qty)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
