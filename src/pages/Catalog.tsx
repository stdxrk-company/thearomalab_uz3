import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CloseIcon, SearchIcon, SlidersIcon } from '../components/Icons'
import { ProductCard } from '../components/ProductCard'
import { useI18n } from '../i18n'
import {
  allNotes,
  brands,
  fullName,
  isNew,
  matchesQuery,
  minPrice,
  priceTiers,
  products,
  type Gender,
} from '../lib/catalog'
import { useTitle } from '../lib/useTitle'
import s from './Catalog.module.css'

type Sort = 'default' | 'new' | 'price-asc' | 'price-desc' | 'name'

const SORTS: Sort[] = ['default', 'new', 'price-asc', 'price-desc', 'name']

const GENDERS: Gender[] = ['men', 'women', 'unisex']

/** The notes that appear in the most perfumes — quick search chips. */
const TOP_NOTES = (() => {
  const m = new Map<string, number>()
  for (const p of products) for (const n of allNotes(p)) m.set(n, (m.get(n) ?? 0) + 1)
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([n]) => n)
})()

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { t, sum, note } = useI18n()

  const g = params.get('g') as Gender | null
  const gender = g && GENDERS.includes(g) ? g : null
  const brand = params.get('b') ?? ''
  const price = Number(params.get('p')) || 0
  const sort = (params.get('sort') as Sort) || 'default'

  // the search box is local state so typing stays snappy; it syncs to the URL with a short delay
  const [query, setQuery] = useState(params.get('q') ?? '')

  const title = gender ? t.catalog.genderTitle[gender] : t.catalog.title
  useTitle(title)

  useEffect(() => {
    if (params.get('focus') === 'search') {
      searchRef.current?.focus()
      update({ focus: null })
    }
  }, [params])

  // follow the URL when it changes from outside (back/forward, a note link, header search)
  const urlQuery = params.get('q') ?? ''
  useEffect(() => {
    setQuery((current) => (current === urlQuery ? current : urlQuery))
  }, [urlQuery])

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('q') ?? '') !== query) update({ q: query || null })
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  function update(next: Record<string, string | null>) {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(next)) {
          if (v === null || v === '') p.delete(k)
          else p.set(k, v)
        }
        return p
      },
      { replace: true },
    )
  }

  // everything except the filter being counted, so counts show what a click would give
  const base = useMemo(() => products.filter((p) => matchesQuery(p, query) && (!brand || p.brand === brand)), [query, brand])
  const genderCount = (x: Gender | null) => base.filter((p) => (!x || p.gender === x) && (!price || minPrice(p) === price)).length
  const priceCount = (tier: number) => base.filter((p) => (!gender || p.gender === gender) && (!tier || minPrice(p) === tier)).length

  const filtered = useMemo(() => {
    const list = base.filter((p) => (!gender || p.gender === gender) && (!price || minPrice(p) === price))
    switch (sort) {
      case 'new':
        return list.sort((a, b) => Number(isNew(b)) - Number(isNew(a)) || a.order - b.order)
      case 'price-asc':
        return list.sort((a, b) => minPrice(a) - minPrice(b) || a.order - b.order)
      case 'price-desc':
        return list.sort((a, b) => minPrice(b) - minPrice(a) || a.order - b.order)
      case 'name':
        return list.sort((a, b) => fullName(a).localeCompare(fullName(b)))
      default:
        return list
    }
  }, [base, gender, price, sort])

  const chips: { label: string; clear: () => void }[] = []
  if (gender) chips.push({ label: t.genderFilter[gender], clear: () => update({ g: null }) })
  if (brand) chips.push({ label: brand, clear: () => update({ b: null }) })
  if (price) chips.push({ label: sum(price), clear: () => update({ p: null }) })
  if (query) chips.push({ label: t.quote(query), clear: () => setQuery('') })

  const resetAll = () => {
    setQuery('')
    setParams({}, { replace: true })
  }

  const extraFilters = [brand, price].filter(Boolean).length

  return (
    <div className={`shell ${s.page}`}>
      <header className={s.head}>
        <h1 className={s.h1}>{title}</h1>
        <div className={s.tabs} role="group" aria-label={t.catalog.forWhom}>
          <button type="button" className={`${s.tab} ${!gender ? s.tabOn : ''}`} onClick={() => update({ g: null })} aria-pressed={!gender}>
            {t.catalog.all} <span className={s.n}>{genderCount(null)}</span>
          </button>
          {GENDERS.map((x) => (
            <button
              key={x}
              type="button"
              className={`${s.tab} ${gender === x ? s.tabOn : ''}`}
              onClick={() => update({ g: gender === x ? null : x })}
              aria-pressed={gender === x}
            >
              {t.genderFilter[x]} <span className={s.n}>{genderCount(x)}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ---------- toolbar: search, filters, sort ---------- */}
      <div className={s.toolbar}>
        <button
          type="button"
          className={s.filtersBtn}
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
        >
          <SlidersIcon width={16} height={16} />
          {t.catalog.filters}
          {extraFilters > 0 && <span className={s.dot}>{extraFilters}</span>}
        </button>

        <label className={s.search}>
          <SearchIcon width={18} height={18} />
          <span className="visually-hidden">{t.catalog.searchLabel}</span>
          <input
            ref={searchRef}
            type="search"
            inputMode="search"
            placeholder={t.catalog.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label={t.catalog.clearSearch} className={s.clear}>
              <CloseIcon width={15} height={15} />
            </button>
          )}
        </label>

        <label className={s.sort}>
          <span>{t.catalog.sort}</span>
          <select value={sort} onChange={(e) => update({ sort: e.target.value === 'default' ? null : e.target.value })}>
            {SORTS.map((o) => (
              <option key={o} value={o}>
                {t.catalog.sorts[o]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ---------- filters: a band on desktop, a drop-down panel on phones ---------- */}
      <aside className={`${s.filters} ${filtersOpen ? s.filtersOpen : ''}`} aria-label={t.catalog.filters} id="catalog-filters">
        <fieldset className={s.group}>
          <legend>{t.catalog.price}</legend>
          <div className={s.chipRow}>
            <button type="button" className={`${s.opt} ${!price ? s.optOn : ''}`} onClick={() => update({ p: null })} aria-pressed={!price}>
              {t.catalog.anyPrice} <span className={s.n}>{priceCount(0)}</span>
            </button>
            {priceTiers.map((tier) => (
              <button
                key={tier}
                type="button"
                className={`${s.opt} ${price === tier ? s.optOn : ''}`}
                onClick={() => update({ p: price === tier ? null : String(tier) })}
                aria-pressed={price === tier}
              >
                <span className="price">{sum(tier)}</span> <span className={s.n}>{priceCount(tier)}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {TOP_NOTES.length > 0 && (
          <fieldset className={s.group}>
            <legend>{t.catalog.notes}</legend>
            <div className={s.chipRow}>
              {TOP_NOTES.map(note).map((n) => (
                <button key={n} type="button" className={`${s.opt} ${query === n ? s.optOn : ''}`} onClick={() => setQuery(query === n ? '' : n)}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <label className={`${s.group} ${s.brandGroup}`}>
          <span className={s.legend}>{t.catalog.brand}</span>
          <select className="input" value={brand} onChange={(e) => update({ b: e.target.value || null })}>
            <option value="">{t.catalog.allBrands(brands.length)}</option>
            {brands.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name} ({b.count})
              </option>
            ))}
          </select>
        </label>

        <label className={`${s.group} ${s.sortInPanel}`}>
          <span className={s.legend}>{t.catalog.sort}</span>
          <select className="input" value={sort} onChange={(e) => update({ sort: e.target.value === 'default' ? null : e.target.value })}>
            {SORTS.map((o) => (
              <option key={o} value={o}>
                {t.catalog.sorts[o]}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className={`btn btn-primary btn-block ${s.showBtn}`} onClick={() => setFiltersOpen(false)}>
          {t.catalog.show(filtered.length)}
        </button>
      </aside>

      <section className={s.results} aria-label={t.catalog.results}>
        {chips.length > 0 && (
          <div className={s.chips}>
            {chips.map((c) => (
              <button key={c.label} type="button" className={s.chip} onClick={c.clear} aria-label={t.catalog.removeFilter(c.label)}>
                {c.label} <CloseIcon width={13} height={13} />
              </button>
            ))}
            <button type="button" className={`link-line ${s.resetChip}`} onClick={resetAll}>
              {t.catalog.resetAll}
            </button>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className={s.grid}>
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className={s.empty}>
            <p className={s.emptyTitle}>{t.catalog.emptyTitle}</p>
            <p>{t.catalog.emptyText}</p>
            <button type="button" className="btn btn-primary" onClick={resetAll}>
              {t.catalog.resetFilters}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
