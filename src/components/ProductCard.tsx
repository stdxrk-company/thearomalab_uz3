import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { isNew, keyNotes, minPrice, type Product } from '../lib/catalog'
import { MAX_QTY, useCart } from '../store/cart'
import { MinusIcon, PlusIcon } from './Icons'
import s from './ProductCard.module.css'

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add, setQty, remove, lines } = useCart()
  const { t, sum, note } = useI18n()
  const single = product.volumes.length === 1
  const href = `/perfume/${product.id}`
  const notes = keyNotes(product).map(note)
  const ml = product.volumes[0].ml
  const qty = lines.find((l) => l.productId === product.id && l.ml === ml)?.qty ?? 0

  const dec = () => (qty <= 1 ? remove(product.id, ml) : setQty(product.id, ml, qty - 1))
  const inc = () => setQty(product.id, ml, qty + 1)

  return (
    <article className={s.card}>
      <Link to={href} className={s.photo} aria-label={`${product.brand} ${product.name}`}>
        <img
          src={product.thumb}
          alt={t.card.photoAlt(`${product.brand} ${product.name}`)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width={560}
          height={746}
        />
        {isNew(product) && <span className={s.tag}>{t.card.newTag}</span>}
      </Link>

      <div className={s.body}>
        <p className={`brand-label ${s.brand}`}>{product.brand}</p>
        <h3 className={s.name}>
          <Link to={href}>{product.name}</Link>
        </h3>
        <p className={s.meta}>
          {t.gender[product.gender]}
          {notes.length > 0 && ` · ${notes.join(', ')}`}
        </p>
        <p className={s.price}>
          {!single && t.card.from}
          <span className="price">{sum(minPrice(product))}</span>
        </p>
      </div>

      {single && qty > 0 ? (
        <div className={s.stepper} role="group" aria-label={t.qty.label}>
          <button type="button" onClick={dec} aria-label={t.qty.dec}>
            <MinusIcon width={16} height={16} />
          </button>
          <output aria-live="polite">{qty}</output>
          <button type="button" onClick={inc} disabled={qty >= MAX_QTY} aria-label={t.qty.inc}>
            <PlusIcon width={16} height={16} />
          </button>
        </div>
      ) : single ? (
        <button
          type="button"
          className={s.add}
          onClick={() => add(product.id, ml)}
          aria-label={t.card.add(product.name)}
        >
          {t.card.toCart}
        </button>
      ) : (
        <Link to={href} className={s.add}>
          {t.card.chooseVolume}
        </Link>
      )}
    </article>
  )
}
