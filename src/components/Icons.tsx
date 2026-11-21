import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const BagIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
)

export const SearchIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4-4" />
  </svg>
)

export const CloseIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const PlusIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const MinusIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
)

export const CheckIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const ArrowIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const TrashIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
)

export const FilterIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
)

export const TelegramIcon = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M21.4 4.6a1.2 1.2 0 0 0-1.3-.2L3.3 11a1 1 0 0 0 .1 1.9l4.2 1.3 1.6 5a1 1 0 0 0 1.7.4l2.4-2.3 4.3 3.2a1.2 1.2 0 0 0 1.9-.7l2.9-13.9a1.2 1.2 0 0 0-1-1.3ZM9.9 14.3l-.6 3.2-1.2-3.8 9-5.8-7.2 6.4Z" />
  </svg>
)

export const TruckIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
)

export const DropIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3.5c3 3.6 5.5 6.8 5.5 10a5.5 5.5 0 0 1-11 0c0-3.2 2.5-6.4 5.5-10Z" />
  </svg>
)

export const ChatIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 18.5V6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8.5L5 18.5Z" />
    <path d="M9 9.5h6M9 12.5h4" />
  </svg>
)

export const ChevronIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const HomeIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 10.5 12 4l8 6.5V20H4z" />
    <path d="M10 20v-5h4v5" />
  </svg>
)

export const GridIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
)

export const SlidersIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </svg>
)

export const MenuIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
)
