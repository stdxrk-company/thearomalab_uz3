import raw from '../data/products.json'
import descriptions from '../data/descriptions.json'
import { MERCH, PRICING } from '../config'
import { DICTS } from '../i18n/dicts'
import type { Lang } from '../i18n/lang'
import { noteAliases } from '../i18n/notes'

export type Gender = 'men' | 'women' | 'unisex'

export interface Volume {
  ml: number
  priceUsd: number
}

/** Notes as printed on the supplier's photo: a pyramid, or a plain list in `main`. */
export interface Notes {
  top?: string[]
  heart?: string[]
  base?: string[]
  main?: string[]
}

export const NOTE_TIERS: (keyof Notes)[] = ['top', 'heart', 'base', 'main']

export interface Product {
  id: string
  brand: string
  name: string
  gender: Gender
  image: string
  thumb: string
  inStock: boolean
  volumes: Volume[]
  order: number
  notes?: Notes
}

export const products: Product[] = (raw as Product[]).slice().sort((a, b) => a.order - b.order)

const byId = new Map(products.map((p) => [p.id, p]))

export function getProduct(id: string): Product | undefined {
  return byId.get(id)
}

/** A short description of the scent in the given language (src/data/descriptions.json). */
export function productDescription(p: Product, lang: Lang): string | undefined {
  return (descriptions as Record<string, Record<Lang, string>>)[p.id]?.[lang]
}

export function toUzs(usd: number): number {
  const exact = usd * PRICING.usdRate
  return Math.ceil(exact / PRICING.roundTo) * PRICING.roundTo
}

const nf = new Intl.NumberFormat('ru-RU')

/** Digits only, grouped by thousands: «120 000». */
export function formatNum(uzs: number): string {
  // ru-RU uses a narrow no-break space as the thousands separator — the usual way to write sums in Uzbekistan
  return nf.format(uzs)
}

export function formatSum(uzs: number, lang: Lang = 'ru'): string {
  return `${formatNum(uzs)} ${DICTS[lang].sum}`
}

export function volumePrice(v: Volume): number {
  return toUzs(v.priceUsd)
}

export function minPrice(p: Product): number {
  return Math.min(...p.volumes.map(volumePrice))
}

export function fullName(p: Product): string {
  return `${p.brand} ${p.name}`
}

export const brands: { name: string; count: number }[] = (() => {
  const m = new Map<string, number>()
  for (const p of products) m.set(p.brand, (m.get(p.brand) ?? 0) + 1)
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
})()

/** Distinct 10 ml price points, ascending — used as price filter options. */
export const priceTiers: number[] = [...new Set(products.map(minPrice))].sort((a, b) => a - b)

export function countBy(gender: Gender): number {
  return products.filter((p) => p.gender === gender).length
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʻʼ'‘’`]/g, '') // Uzbek oʻ / gʻ: «yogʻoch» and «yog'och» both become «yogoch»
    .replace(/[^a-z0-9а-яё]+/g, ' ')
    .trim()
}

/** All notes of a product, without duplicates, in pyramid order. */
export function allNotes(p: Product): string[] {
  if (!p.notes) return []
  const { top = [], heart = [], base = [], main = [] } = p.notes
  return [...new Set([...top, ...heart, ...base, ...main])]
}

/** Short preview for cards: one note from each tier, or the first three of a plain list. */
export function keyNotes(p: Product, n = 3): string[] {
  if (!p.notes) return []
  const { top, heart, base, main } = p.notes
  const picked = main?.length ? main.slice(0, n) : [top?.[0], heart?.[0], base?.[0]].filter(Boolean)
  return (picked as string[]).slice(0, n)
}

/** Other products ranked by how many notes they share with `p` (at least `min`). */
export function similarByNotes(p: Product, limit = 8, min = 2): Product[] {
  const mine = new Set(allNotes(p).map((n) => n.toLowerCase()))
  if (mine.size === 0) return []
  return products
    .filter((o) => o.id !== p.id)
    .map((o) => ({ o, score: allNotes(o).filter((n) => mine.has(n.toLowerCase())).length }))
    .filter((x) => x.score >= min)
    .sort((a, b) => b.score - a.score || a.o.order - b.o.order)
    .slice(0, limit)
    .map((x) => x.o)
}

const searchIndex = new Map(
  // notes are indexed in all three languages, so the search works whatever the interface language
  products.map((p) => [p.id, norm(`${p.brand} ${p.name} ${allNotes(p).flatMap(noteAliases).join(' ')}`).split(' ')]),
)

/** Every query word must be the start of some word in the brand, name or notes ("уд" finds Уд, not Амбервуд; "oud" finds it too). */
export function matchesQuery(p: Product, query: string): boolean {
  const q = norm(query)
  if (!q) return true
  const words = searchIndex.get(p.id) ?? []
  return q.split(' ').every((w) => words.some((h) => h.startsWith(w)))
}

const NEW_IDS = new Set(MERCH.newIds)

/** Marked «Новинка» — the list lives in config.ts (MERCH.newIds). */
export function isNew(p: Product): boolean {
  return NEW_IDS.has(p.id)
}

/** Products by id in the given order, skipping ids that are not in the catalog. */
export function pickProducts(ids: string[]): Product[] {
  return ids.map(getProduct).filter((p): p is Product => Boolean(p))
}
