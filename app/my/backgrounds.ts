/**
 * Portal backgrounds the client chooses (10-17, Eric). Stored on their chart
 * by the records app (lib/portalBackground.ts — same value format, checked
 * there too):
 *   ""  ·  "solid:#rrggbb"  ·  "grad:#rrggbb,#rrggbb"  ·  "scene:<id>"
 *
 * Only the page BEHIND the cards changes. Each choice also has an ACCENT
 * colour for five small touches on the cards (top stripe, corner glow,
 * heading underline, count badge, chevron — app/globals.css). Accents sit on
 * the dark cards, so they are kept bright; a scene's accent is hand-picked to
 * match its art. The scenes are drawn (SVG / CSS), not photos: sharp at any
 * size, instant to load, nothing to license.
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

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`

const WAVES = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='64'><path d='M0 32 Q30 12 60 32 T120 32 T180 32 T240 32' fill='none' stroke='white' stroke-opacity='.14' stroke-width='2'/></svg>",
)
const PINES = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='150'><g fill='#06190e' fill-opacity='.5'><path d='M18 150 L42 72 L66 150Z'/><path d='M72 150 L102 46 L132 150Z'/><path d='M128 150 L152 88 L176 150Z'/></g></svg>",
)
const STARS = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><g fill='white'>" +
    "<circle cx='14' cy='22' r='1.2' fill-opacity='.9'/><circle cx='70' cy='60' r='.8' fill-opacity='.6'/><circle cx='130' cy='18' r='1' fill-opacity='.8'/>" +
    "<circle cx='190' cy='74' r='1.4' fill-opacity='.9'/><circle cx='40' cy='140' r='.9' fill-opacity='.7'/><circle cx='104' cy='118' r='1.3' fill-opacity='.85'/>" +
    "<circle cx='168' cy='170' r='.8' fill-opacity='.6'/><circle cx='22' cy='200' r='1' fill-opacity='.75'/><circle cx='120' cy='196' r='.7' fill-opacity='.5'/>" +
    "<circle cx='204' cy='126' r='.9' fill-opacity='.7'/><circle cx='86' cy='170' r='.6' fill-opacity='.5'/></g></svg>",
)
const DUNES = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='120'><path d='M0 90 Q80 40 160 80 T320 70 V120 H0Z' fill='#3a1640' fill-opacity='.35'/></svg>",
)
const BLOSSOMS = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>" +
    "<g transform='translate(40 44)' fill='#ffffff' fill-opacity='.7'><circle cx='0' cy='-7' r='6'/><circle cx='7' cy='-2' r='6'/><circle cx='4' cy='6' r='6'/><circle cx='-4' cy='6' r='6'/><circle cx='-7' cy='-2' r='6'/><circle r='3' fill='#f06292' fill-opacity='.9'/></g>" +
    "<g transform='translate(132 120) scale(.7)' fill='#f8bbd0' fill-opacity='.8'><circle cx='0' cy='-7' r='6'/><circle cx='7' cy='-2' r='6'/><circle cx='4' cy='6' r='6'/><circle cx='-4' cy='6' r='6'/><circle cx='-7' cy='-2' r='6'/><circle r='3' fill='#ad1457' fill-opacity='.8'/></g>" +
    "<ellipse cx='110' cy='40' rx='5' ry='3' fill='#ffffff' fill-opacity='.5' transform='rotate(30 110 40)'/></svg>",
)

export const SCENES: (BgOption & { css: string; accent: string })[] = [
  { value: 'scene:ocean', name: 'Ocean', accent: '#5fe3ee', css: `${WAVES}, linear-gradient(180deg, #0b3d5c 0%, #1279a8 55%, #4fc3d9 100%)` },
  { value: 'scene:forest', name: 'Forest', accent: '#9be08f', css: `${PINES}, linear-gradient(180deg, #13321f 0%, #1f5135 50%, #3c7a4f 100%)` },
  {
    value: 'scene:stars',
    name: 'Starry night',
    accent: '#ffd76a',
    css: `radial-gradient(circle at 82% 10%, rgba(255, 244, 214, .95) 0 26px, rgba(255, 244, 214, .18) 27px 60px, transparent 61px), ${STARS}, linear-gradient(180deg, #070b1f 0%, #121c4a 60%, #24306b 100%)`,
  },
  { value: 'scene:desert', name: 'Desert dusk', accent: '#ffb26b', css: `${DUNES}, linear-gradient(180deg, #2d1b4e 0%, #8e3a6e 45%, #e0784f 80%, #f6a35b 100%)` },
  { value: 'scene:blossom', name: 'Cherry blossom', accent: '#ff86b0', css: `${BLOSSOMS}, linear-gradient(180deg, #fde2ea 0%, #f7b9cb 100%)` },
  {
    value: 'scene:aurora',
    name: 'Northern lights',
    accent: '#6dffc4',
    css:
      'radial-gradient(ellipse 70% 40% at 20% 12%, rgba(64, 255, 170, .45), transparent 70%), ' +
      'radial-gradient(ellipse 60% 45% at 80% 22%, rgba(150, 90, 255, .42), transparent 70%), ' +
      'radial-gradient(ellipse 80% 35% at 50% 40%, rgba(0, 200, 255, .25), transparent 75%), ' +
      'linear-gradient(180deg, #050d1a 0%, #0b1f33 60%, #10283f 100%)',
  },
]

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

/** The page background and the card accent for a stored value, or null for the standard page. */
export function backgroundFor(value: string): { css: string; accent: string } | null {
  const v = (value || '').toLowerCase()
  if (v.startsWith('solid:')) {
    const c = v.slice(6)
    return HEX.test(c) ? { css: c, accent: accentFrom(c) } : null
  }
  if (v.startsWith('grad:')) {
    const [a, b] = v.slice(5).split(',')
    return HEX.test(a ?? '') && HEX.test(b ?? '') ? { css: `linear-gradient(160deg, ${a} 0%, ${b} 100%)`, accent: accentFrom(b) } : null
  }
  const scene = SCENES.find((s) => s.value === v)
  return scene ? { css: scene.css, accent: scene.accent } : null
}
