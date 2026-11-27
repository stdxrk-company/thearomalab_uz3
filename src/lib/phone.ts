/** Uzbek mobile numbers: +998 and 9 digits, shown as +998 90 123 45 67. */
export const UZ_PREFIX = '+998 '
const LOCAL_DIGITS = 9
const GROUPS = [2, 3, 2, 2]

/** The 9 local digits, from whatever was typed, pasted or autofilled ("+998 90…", "99890…", "90 123…"). */
function localDigits(raw: string): string {
  const digits = (s: string) => s.replace(/\D/g, '')
  let d: string
  if (raw.startsWith('+998')) {
    d = digits(raw.slice(4))
  } else {
    // a character was erased inside "+998 " — keep the number after it as it was
    const space = raw.indexOf(' ')
    if (space >= 0 && /^\+?9?9?8?$/.test(raw.slice(0, space))) d = digits(raw.slice(space))
    else {
      d = digits(raw)
      if (d.startsWith('998')) d = d.slice(3)
    }
  }
  return d.slice(0, LOCAL_DIGITS)
}

/** Keeps only digits and lays them out as +998 XX XXX XX XX; the +998 prefix can't be erased. */
export function formatUzPhone(raw: string): string {
  const d = localDigits(raw)
  const parts: string[] = []
  let i = 0
  for (const n of GROUPS) {
    if (i >= d.length) break
    parts.push(d.slice(i, i + n))
    i += n
  }
  return UZ_PREFIX + parts.join(' ')
}

export function isValidUzPhone(value: string): boolean {
  return /^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(value)
}

/** Reformats an edit of the field and says where the caret goes. */
export function editUzPhone(raw: string, caret: number): { value: string; caret: number } {
  const value = formatUzPhone(raw)
  // an edit inside "+998 " is undone; the caret stays put so the next Delete doesn't eat the number
  if (!raw.startsWith('+998')) {
    const space = raw.indexOf(' ')
    if (space >= 0 && /^\+?9?9?8?$/.test(raw.slice(0, space))) return { value, caret: Math.min(caret, UZ_PREFIX.length) }
  }
  return { value, caret: caretAfterFormat(raw, caret, value) }
}

/** Where the caret goes after reformatting: right after the same number of digits it followed before. */
function caretAfterFormat(raw: string, caret: number, formatted: string): number {
  let digits = raw.slice(0, caret).replace(/\D/g, '').length
  if (digits === 0) return UZ_PREFIX.length
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]) && --digits === 0) return Math.max(UZ_PREFIX.length, i + 1)
  }
  return formatted.length
}
