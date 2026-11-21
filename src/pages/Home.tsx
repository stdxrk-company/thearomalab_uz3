import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { CHECKOUT, DELIVERY, MERCH } from '../config'
import { useI18n } from '../i18n'
import { brands, countBy, getProduct, minPrice, pickProducts, type Gender } from '../lib/catalog'
import { useTitle } from '../lib/useTitle'
import { useCart } from '../store/cart'
import s from './Home.module.css'

const GENDERS: Gender[] = ['men', 'women', 'unisex']

export function HomePage() {
  useTitle()
  const cart = useCart()
  const { t, sum, loc } = useI18n()
  const reply = loc(CHECKOUT.replyTime)
  const feature = getProduct(MERCH.featureId)
  const fresh = pickProducts(MERCH.newIds).slice(0, 4)
  const hits = pickProducts(MERCH.hitIds).slice(0, 4)
  const topBrands = [...brands].sort((a, b) => b.count - a.count).slice(0, 12)

  const goal = DELIVERY.freeFromBottles
  const have = Math.min(goal, cart.freeDeliveryBottles)

  return (
    <>
      {/* ---------- HERO: three panels, one per section ---------- */}
      <section className={s.hero}>
        <div className={s.heroText}>
          <p className="eyebrow">{loc(MERCH.heroLabel)}</p>
          <h1 className={s.h1}>{loc(MERCH.heroTitle)}</h1>
          <p className={s.lead}>{loc(MERCH.heroText)}</p>
        </div>
        <div className={s.panels}>
          {GENDERS.map((g) => {
            const img = getProduct(MERCH.genderImages[g])
            return (
              <Link key={g} to={`/catalog?g=${g}`} className={s.panel}>
                {img && <img src={img.image} alt="" loading="eager" width={800} height={1200} />}
                <span className={s.panelShade} />
                <span className={s.panelLabel}>
                  <span className={s.panelBtn}>{t.genderFilter[g]}</span>
                  <span className={s.panelCount}>{t.aromas(countBy(g))}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ---------- NEW ---------- */}
      {fresh.length > 0 && (
        <section id="new" className={`shell ${s.section}`}>
          <div className={s.head}>
            <h2 className={s.h2}>{t.home.newMain}</h2>
            <Link to="/catalog?sort=new" className={`link-line ${s.headLink}`}>
              {t.home.seeAll}
            </Link>
          </div>
          <div className={s.grid}>
            {fresh.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- FEATURE: black split block ---------- */}
      {feature && (
        <section className={s.feature}>
          <Link to={`/perfume/${feature.id}`} className={s.featurePhoto} tabIndex={-1} aria-hidden>
            <img src={feature.image} alt="" loading="lazy" width={800} height={1200} />
          </Link>
          <div className={s.featureText}>
            <p className={`eyebrow ${s.featureEyebrow}`}>{t.home.hitsTitle}</p>
            <p className="eyebrow">{feature.brand}</p>
            <h2 className={s.featureName}>{feature.name}</h2>
            <p className={s.featureLead}>{loc(MERCH.featureText)}</p>
            <p className={s.featurePrice}>
              <span className="price">{sum(minPrice(feature))}</span> · {feature.volumes[0].ml} {t.ml}
            </p>
            <div className={s.featureCtas}>
              <button type="button" className="btn btn-light" onClick={() => cart.add(feature.id, feature.volumes[0].ml)}>
                {t.product.toCart}
              </button>
              <Link to={`/perfume/${feature.id}`} className="btn btn-ghost">
                {t.home.details}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- BEST SELLERS ---------- */}
      {hits.length > 0 && (
        <section className={`shell ${s.section}`}>
          <div className={s.head}>
            <h2 className={s.h2}>{t.home.bestTitle}</h2>
            <Link to="/catalog" className={`link-line ${s.headLink}`}>
              {t.home.allCatalog}
            </Link>
          </div>
          <div className={s.grid}>
            {hits.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- SET OF FOUR ---------- */}
      <section className={s.promo}>
        <div className={`shell ${s.promoInner}`}>
          <div>
            <p className={`eyebrow ${s.muted}`}>{t.home.promoEyebrow}</p>
            <h2 className={s.promoTitle}>{t.home.promoTitle(goal)}</h2>
          </div>
          <div className={s.promoProgress}>
            <p className="eyebrow">
              {have >= goal ? t.home.promoFull(goal) : have > 0 ? t.home.promoSome(have, goal) : t.home.promoNone}
            </p>
            <div className={s.track} aria-hidden>
              {Array.from({ length: goal }, (_, i) => (
                <span key={i} className={i < have ? s.on : ''} />
              ))}
            </div>
          </div>
          {have >= goal ? (
            <Link to="/checkout" className="btn btn-primary">
              {t.home.checkout}
            </Link>
          ) : (
            <Link to="/catalog" className="btn btn-primary">
              {have > 0 ? t.home.addMore : t.home.buildSet}
            </Link>
          )}
        </div>
      </section>

      {/* ---------- HOUSES ---------- */}
      <section className={`shell ${s.houses}`}>
        <p className={`eyebrow ${s.muted}`}>{t.home.brandsTitle(brands.length)}</p>
        <p className={s.houseList}>
          {topBrands.map((b, i) => (
            <span key={b.name}>
              {i > 0 && <span className={s.slash}> / </span>}
              <Link to={`/catalog?b=${encodeURIComponent(b.name)}`} className="link-line">
                {b.name}
              </Link>
            </span>
          ))}
        </p>
        <Link to="/catalog" className="btn btn-secondary">
          {t.home.allBrands}
        </Link>
      </section>

      {/* ---------- HOW / DELIVERY ---------- */}
      <section id="how" className={`shell ${s.info}`}>
        <h2 id="delivery" className={s.h2}>
          {t.home.howTitle}
        </h2>
        <div className={s.infoGrid}>
          <div>
            <h3>{t.home.siteH}</h3>
            <p>{t.home.siteP}</p>
          </div>
          <div>
            <h3>{t.home.confirmH}</h3>
            <p>{t.home.confirmP(reply)}</p>
          </div>
          <div>
            <h3>{t.home.deliveryH}</h3>
            <p>{t.home.deliveryP(DELIVERY.freeFromBottles)}</p>
          </div>
          <div>
            <h3>{t.home.payH}</h3>
            <p>{t.home.payP(CHECKOUT.payment.map(loc))}</p>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className={`shell ${s.faqWrap}`}>
        <h2 className={s.h2}>{t.home.faqTitle}</h2>
        <div className={s.faq}>
          {t.home.faq(DELIVERY.freeFromBottles).map((f) => (
            <details key={f.q} className={s.faqItem}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
