/**
 * Portal backgrounds the client chooses (10-17, Eric). Stored on their chart
 * by the records app (lib/portalBackground.ts — same value format, checked
 * there too):
 *   ""  ·  "solid:#rrggbb"  ·  "grad:#rrggbb,#rrggbb"  ·  "photo:<id>"
 *
 * Only the page BEHIND the cards changes. Each choice also has an ACCENT
 * colour for five small touches on the cards (top stripe, corner glow,
 * heading underline, count badge, chevron — app/globals.css). Accents sit on
 * the dark cards, so they are kept bright; a photo's accent is hand-picked.
 */

export type BgOption = { value: string; name: string }

export const SOLIDS: BgOption[] = [
  { value: 'solid:#f4b6c2', name: 'Blush' },
  { value: 'solid:#c9b6f2', name: 'Lavender' },
  { value: 'solid:#9fd3f5', name: 'Sky' },
  { value: 'solid:#b5d6b2', name: 'Sage' },
  { value: 'solid:#f1dfc0', name: 'Champagne' },
]

export const GRADIENTS: BgOption[] = [
  { value: 'grad:#ff9a8b,#ff6a88', name: 'Sunset' },
  { value: 'grad:#ffd3a5,#fd6585', name: 'Peach' },
  { value: 'grad:#5b247a,#1bcedf', name: 'Twilight' },
  { value: 'grad:#43cea2,#185a9d', name: 'Lagoon' },
]

/**
 * Photos (10-17, Eric): 19 free photos from Unsplash, checked one by one as
 * "Free to use under the Unsplash License" (commercial use, no credit needed —
 * kept here anyway). Each in public/portal-bg/ as <id>-tall.webp (phones,
 * 900×1600), <id>-wide.webp (computers, 1600 wide) and <id>-thumb.webp (the
 * picker). Only the chosen one loads. Accents hand-picked to match.
 */
export const PHOTOS: (BgOption & { accent: string; credit: string; link: string })[] = [
  { value: 'photo:ocean-calm', name: 'Calm ocean', accent: '#86d0e3', credit: 'Matt Hardy', link: 'https://unsplash.com/photos/body-of-water-under-sky-6ArTTluciuA' },
  { value: 'photo:ocean-aerial', name: 'Turquoise shore', accent: '#3fd6d9', credit: 'Shifaaz Shamoon', link: 'https://unsplash.com/photos/aerial-photo-of-seashore-sLAk1guBG90' },
  { value: 'photo:beach-golden', name: 'Golden beach', accent: '#ffc27a', credit: 'Sean Oulashin', link: 'https://unsplash.com/photos/KMn4VEeEPR8' },
  { value: 'photo:beach-tropical', name: 'Tropical beach', accent: '#4fd8e0', credit: 'Simon Spring', link: 'https://unsplash.com/photos/BJ-FvNGCfEY' },
  { value: 'photo:palms-sunset', name: 'Palms at sunset', accent: '#ff9ec7', credit: 'Jordan McQueen', link: 'https://unsplash.com/photos/u9tAl8WR3DI' },
  { value: 'photo:forest-sunrays', name: 'Sunlit forest', accent: '#b4dd8c', credit: 'Sebastian Unrau', link: 'https://unsplash.com/photos/sp-p7uuT0tw' },
  { value: 'photo:forest-mist', name: 'Misty pines', accent: '#9fd0b4', credit: 'Dan Otis', link: 'https://unsplash.com/photos/OYFHT4X5isg' },
  { value: 'photo:lake-turquoise', name: 'Mountain lake', accent: '#5fe0d0', credit: 'Adam Vradenburg', link: 'https://unsplash.com/photos/GA09PKfRIQY' },
  { value: 'photo:lake-pines', name: 'Lake in the pines', accent: '#8fd3a0', credit: 'Luca Bravo', link: 'https://unsplash.com/photos/ESkw2ayO2As' },
  { value: 'photo:desert-blue', name: 'Desert sky', accent: '#f2b880', credit: 'Matteo Di Iorio', link: 'https://unsplash.com/photos/wkMd_DylG8I' },
  { value: 'photo:desert-orange', name: 'Desert sunset', accent: '#ffa45c', credit: 'Tijs van Leur', link: 'https://unsplash.com/photos/9bd6LStI8ug' },
  { value: 'photo:blossom-pink', name: 'Cherry blossom', accent: '#ff9ec2', credit: 'AJ', link: 'https://unsplash.com/photos/pink-flowers-McsNra2VRQQ' },
  { value: 'photo:blossom-water', name: 'Blossoms by the water', accent: '#f7a8c8', credit: 'Mark Tegethoff', link: 'https://unsplash.com/photos/body-of-water-beside-cherry-blossom-trees-NMLv5HQZnK4' },
  { value: 'photo:lavender-pink', name: 'Lavender at dusk', accent: '#d0a8ff', credit: 'Antony Bec', link: 'https://unsplash.com/photos/lavender-fields-in-valensole-france-nD9tEn63suc' },
  { value: 'photo:lavender-field', name: 'Lavender field', accent: '#b98cff', credit: 'Léonard Cotte', link: 'https://unsplash.com/photos/lavender-field-c1Jp-fo53U8' },
  { value: 'photo:stars', name: 'Starry night', accent: '#a8c0ff', credit: 'Olena Bohovyk', link: 'https://unsplash.com/photos/Cq5NaI0yKBE' },
  { value: 'photo:milky-way', name: 'Milky Way', accent: '#8fb0ff', credit: 'Nathan Anderson', link: 'https://unsplash.com/photos/L95xDkSSuWw' },
  { value: 'photo:la-skyline', name: 'LA at night', accent: '#ffc46b', credit: 'Henning Witzel', link: 'https://unsplash.com/photos/los-angeles-skyline-at-night-ukvgqriuOgo' },
  { value: 'photo:city-lights', name: 'City lights', accent: '#7fb2ff', credit: 'Van Mendoza', link: 'https://unsplash.com/photos/building-lights-photography-r7YZXv5f5cc' },
]

export const photoUrl = (id: string, size: 'tall' | 'wide' | 'thumb') => `/portal-bg/${id}-${size}.webp`

const HEX = /^#[0-9a-f]{6}$/

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

/** A colour bright and saturated enough to read as an accent on a dark card. */
export function accentFrom(hex: string): string {
  const [h, s, l] = hexToHsl(hex)
  const sat = s < 0.08 ? 0 : Math.max(s, 0.6)
  const light = Math.min(Math.max(l, 0.62), 0.74)
  return `hsl(${Math.round(h)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%)`
}

/**
 * The page background for a stored value, or null for the standard page:
 * `css` for a phone (and the picker), `wide` for a computer — the same for a
 * colour; a photo has a tall and a wide crop.
 */
export function backgroundFor(value: string): { css: string; wide: string; accent: string; thumb?: string } | null {
  const v = (value || '').toLowerCase()
  if (v.startsWith('solid:')) {
    const c = v.slice(6)
    return HEX.test(c) ? { css: c, wide: c, accent: accentFrom(c) } : null
  }
  if (v.startsWith('grad:')) {
    const [a, b] = v.slice(5).split(',')
    if (!HEX.test(a ?? '') || !HEX.test(b ?? '')) return null
    const g = `linear-gradient(160deg, ${a} 0%, ${b} 100%)`
    return { css: g, wide: g, accent: accentFrom(b) }
  }
  const photo = PHOTOS.find((p) => p.value === v)
  if (!photo) return null
  const id = v.slice(6)
  return {
    css: `url("${photoUrl(id, 'tall')}")`,
    wide: `url("${photoUrl(id, 'wide')}")`,
    accent: photo.accent,
    thumb: `url("${photoUrl(id, 'thumb')}")`,
  }
}
