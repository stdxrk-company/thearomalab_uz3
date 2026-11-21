import type { Localized } from './i18n/lang'

/**
 * Business settings in one place. Change values here, not in components.
 */
export const SHOP = {
  name: 'The Aroma Lab',
  /** Telegram username that receives orders (t.me/<username>). */
  telegramUsername: 'stdxrk',
}

export const PRICING = {
  /** UZS per 1 USD — Central Bank of Uzbekistan rate on 19.11.2026. */
  usdRate: 11980.36,
  /** Converted prices are rounded up to this step, in UZS. */
  roundTo: 1000,
}

export const DELIVERY = {
  /** Free delivery inside Tashkent from this many bottles of 10 ml or more. */
  freeFromBottles: 4,
  freeMinBottleMl: 10,
}

/**
 * What the homepage shows. Product ids are the file names in src/data/products.json.
 * Change these lists to rotate the hero, new arrivals and best sellers.
 */
export const MERCH = {
  /** First screen: label, big title and one line under it, in every interface language. */
  heroLabel: {
    ru: 'Новый сезон · ноябрь 2026',
    uz: 'Yangi mavsum · noyabr 2026',
    en: 'New season · November 2026',
  } satisfies Localized,
  heroTitle: {
    ru: 'Искусство аромата',
    uz: 'Atir sanʼati',
    en: 'The art of scent',
  } satisfies Localized,
  heroText: {
    ru: 'Оригинальная парфюмерия мировых домов во флаконах по 10 мл',
    uz: 'Dunyo parfyumeriya uylarining original atirlari 10 ml flakonlarda',
    en: 'Original perfume from the great houses, in 10 ml bottles',
  } satisfies Localized,
  /** Full-width photo behind the title on phones and tablets (desktop shows the three panels). */
  heroId: 'maison-francis-kurkdjian-baccarat-rouge-540',
  /** The big black feature block on the homepage. */
  featureId: 'louis-vuitton-ombre-nomade',
  featureText: {
    ru: 'Чёрный перец, уд и ваниль. Попробуйте его во флаконе 10 мл, прежде чем решиться на большой.',
    uz: 'Qora murch, ud va vanil. Katta flakonga qaror qilishdan oldin uni 10 ml flakonda sinab koʻring.',
    en: 'Black pepper, oud and vanilla. Try it in a 10 ml bottle before you commit to a full size.',
  } satisfies Localized,
  /** Marked «Новинка» on cards and shown in the «Новинки» row. */
  newIds: [
    'louis-vuitton-ombre-nomade',
    'parfums-de-marly-delina-exclusif',
    'kilian-good-girl-gone-bad',
    'tom-ford-lost-cherry',
    'louis-vuitton-symphony',
    'xerjoff-naxos',
  ],
  /** «Чаще всего заказывают». */
  hitIds: [
    'maison-francis-kurkdjian-baccarat-rouge-540',
    'creed-aventus',
    'le-labo-santal-33',
    'tom-ford-tobacco-vanille',
    'dior-sauvage-elixir',
    'yves-saint-laurent-libre',
  ],
  /** Photo behind each «Для кого» tile. */
  genderImages: {
    unisex: 'byredo-gypsy-water',
    men: 'chanel-bleu-de-chanel-parfum',
    women: 'dior-miss-dior-rose-n-roses',
  },
}

/** Checkout form options. Payment methods are shown as radio buttons; `id` is stored, the text is shown. */
export const CHECKOUT = {
  payment: [
    { id: 'cash', ru: 'Наличными курьеру', uz: 'Kuryerga naqd pul', en: 'Cash to the courier' },
    { id: 'card', ru: 'Переводом на карту (Click / Payme)', uz: 'Kartaga oʻtkazma (Click / Payme)', en: 'Card transfer (Click / Payme)' },
  ] satisfies (Localized & { id: string })[],
  /** How soon the shop replies, shown after the order is placed. */
  replyTime: {
    ru: 'в течение 15 минут, с 10:00 до 22:00',
    uz: '10:00 dan 22:00 gacha 15 daqiqa ichida',
    en: 'within 15 minutes, between 10:00 and 22:00',
  } satisfies Localized,
  /** Tashkent districts; `ru` doubles as the stored value. */
  districts: [
    { ru: 'Алмазарский', uz: 'Olmazor', en: 'Almazar' },
    { ru: 'Бектемирский', uz: 'Bektemir', en: 'Bektemir' },
    { ru: 'Мирабадский', uz: 'Mirobod', en: 'Mirabad' },
    { ru: 'Мирзо-Улугбекский', uz: 'Mirzo Ulugʻbek', en: 'Mirzo Ulugbek' },
    { ru: 'Сергелийский', uz: 'Sergeli', en: 'Sergeli' },
    { ru: 'Учтепинский', uz: 'Uchtepa', en: 'Uchtepa' },
    { ru: 'Чиланзарский', uz: 'Chilonzor', en: 'Chilanzar' },
    { ru: 'Шайхантахурский', uz: 'Shayxontohur', en: 'Shaykhantakhur' },
    { ru: 'Юнусабадский', uz: 'Yunusobod', en: 'Yunusabad' },
    { ru: 'Яккасарайский', uz: 'Yakkasaroy', en: 'Yakkasaray' },
    { ru: 'Яшнабадский', uz: 'Yashnobod', en: 'Yashnabad' },
    { ru: 'Янгихаётский', uz: 'Yangihayot', en: 'Yangihayot' },
  ] satisfies Localized[],
}

export type PaymentId = (typeof CHECKOUT.payment)[number]['id']

/**
 * Base URL used in product links inside the Telegram message.
 * Set VITE_SITE_URL in .env for production (e.g. https://thearomalab.uz).
 */
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ??
  window.location.origin
