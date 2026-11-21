/**
 * Post-build step for static hosting (Render static site, any CDN).
 *
 * The app is a single-page app, so a direct visit to /catalog or /perfume/<id>
 * would 404 on a plain static host. This script writes a copy of dist/index.html
 * for every route, each with its own <title>, description and preview image,
 * so links shared in Telegram show the right perfume.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const products = JSON.parse(readFileSync(join(root, 'src', 'data', 'products.json'), 'utf8'))
const descriptions = JSON.parse(readFileSync(join(root, 'src', 'data', 'descriptions.json'), 'utf8'))

const USD_RATE = 11980.36 // keep in sync with src/config.ts
const toUzs = (usd) => Math.ceil((usd * USD_RATE) / 1000) * 1000
const fmt = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function page({ title, description, image }) {
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(description)}$2`)
  const og = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    image ? `<meta property="og:image" content="${esc(image)}" />` : '',
  ]
    .filter(Boolean)
    .join('\n    ')
  return html.replace('</head>', `    ${og}\n  </head>`)
}

function write(route, html) {
  const file = join(dist, route, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

const home = {
  title: 'The Aroma Lab — оригинальная парфюмерия в распив | Ташкент',
  description: 'Оригинальные ароматы мировых парфюмерных домов в распив по 10 мл. Доставка по Ташкенту и всему Узбекистану.',
  image: '/logo.webp',
}

writeFileSync(join(dist, 'index.html'), page(home))
writeFileSync(join(dist, '404.html'), page(home))
write('catalog', page({ ...home, title: 'Каталог ароматов | The Aroma Lab' }))
write('checkout', page({ ...home, title: 'Оформление заказа | The Aroma Lab' }))
write('order', page({ ...home, title: 'Заказ оформлен | The Aroma Lab' }))

for (const p of products) {
  const price = fmt(toUzs(Math.min(...p.volumes.map((v) => v.priceUsd))))
  write(
    join('perfume', p.id),
    page({
      title: `${p.brand} ${p.name} — распив 10 мл | The Aroma Lab`,
      description: `${descriptions[p.id]?.ru ? descriptions[p.id].ru + ' ' : ''}Распив 10 мл — ${price} сум. Доставка по Ташкенту и Узбекистану.`,
      image: p.image,
    }),
  )
}

console.log(`prerender: ${products.length + 5} pages written`)
