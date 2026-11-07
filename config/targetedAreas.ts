/**
 * Agnes RF Targeted — "Build your journey" (11-07, Eric, from Eileen's two
 * Agnes price sheets). The areas a client can tap on the face / body map,
 * the packages, and their default prices and blurbs. Prices and blurbs are
 * editable in /admin ("targetedPricing" in serviceLinks/config); these are
 * the defaults when nothing is saved.
 *
 * Shapes are drawn in the 92×160 (9:16) frame the records app's camera
 * silhouette uses (head oval centre 46,62 · rx 18 · ry 24), so a selfie
 * taken with that guide lines up under the same dotted lines.
 *
 * Names match the records app's "Which one?" list (medspa_records
 * lib/scheduler.ts DEFAULT_DETAIL_OPTIONS), so what a client texts is what
 * staff pick when booking.
 */

export type TargetedView = 'face' | 'body' | 'other'

export interface TargetedArea {
  id: string
  name: string
  view: TargetedView
  /** Default price for ONE session; null = priced at consultation. */
  price: number | null
  blurb: string
  /** SVG shapes in the view's frame — one per side for paired areas. */
  shapes?: string[]
  /** Where the label sits and where its leader line points. */
  label?: { side: 'left' | 'right'; y: number; to: [number, number] }
}

export interface TargetedPackage {
  id: string
  name: string
  includes: string[] // area ids
  price: number | null
  blurb: string
}

export interface TargetedPricing {
  prices?: Record<string, number | null>
  blurbs?: Record<string, string>
  /** Off a 2- or 3-session package, in percent. */
  packageDiscountPct?: number
}

export const DEFAULT_PACKAGE_DISCOUNT_PCT = 15

// Paired shapes: the right side is the left mirrored about x = 46.
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0 Z`
const pair = (cx: number, cy: number, rx: number, ry: number) => [ell(cx, cy, rx, ry), ell(92 - cx, cy, rx, ry)]

export const TARGETED_AREAS: TargetedArea[] = [
  // ── Face ────────────────────────────────────────────────────────────────
  {
    id: 'forehead', name: 'Forehead Wrinkles (11’s included)', view: 'face', price: 1200,
    blurb: 'Softens horizontal forehead lines and the “11’s” between the brows by building new collagen in the skin of the forehead.',
    shapes: ['M34,50 C34,44 39,41 46,41 C53,41 58,44 58,50 Z'],
    label: { side: 'left', y: 42.5, to: [37, 45.5] },
  },
  {
    id: 'brow', name: 'Brow Lift', view: 'face', price: 1200,
    blurb: 'Tightens the skin above and around the brow for a gently lifted, more open look — no surgery, no incisions.',
    shapes: ['M35,51.4 Q39.5,49.8 44,51.4 L44,53.1 Q39.5,51.9 35,53.1 Z', 'M57,51.4 Q52.5,49.8 48,51.4 L48,53.1 Q52.5,51.9 57,53.1 Z'],
    label: { side: 'left', y: 48.6, to: [35.6, 52] },
  },
  {
    id: 'upper-eyes', name: 'Upper Eyes', view: 'face', price: 1200,
    blurb: 'Treats hooded or crepey upper eyelids, tightening the delicate skin so the eyes look brighter and less heavy.',
    shapes: pair(39.5, 55, 4.2, 1.5),
    label: { side: 'left', y: 53.6, to: [35.4, 55] },
  },
  {
    id: 'lower-eyes', name: 'Lower Eyes', view: 'face', price: 1200,
    blurb: 'Targets under-eye bags and puffiness — the RF energy works on the small fat pockets and tightens the skin over them.',
    shapes: pair(39.5, 58.2, 4.2, 1.25),
    label: { side: 'left', y: 58, to: [35.4, 58.3] },
  },
  {
    id: 'fat-pads', name: 'Fat Pads', view: 'face', price: 800,
    blurb: 'Reduces the fullness just below the under-eye area at the top of the cheek, smoothing the eye-to-cheek transition.',
    shapes: pair(38.6, 61.6, 3.6, 1.7),
    label: { side: 'left', y: 62.6, to: [35.1, 61.8] },
  },
  {
    id: 'nose', name: 'Nose Lift', view: 'face', price: null,
    blurb: 'Refines and tightens the skin of the nose and nasal tip. Priced at your consultation.',
    shapes: ['M44.6,54 L47.4,54 L49.4,66 Q46,67.8 42.6,66 Z'],
    label: { side: 'right', y: 57.5, to: [48.6, 60.5] },
  },
  {
    id: 'ear-lobe', name: 'Ear Lobe', view: 'face', price: 1500,
    blurb: 'Firms stretched or creased ear lobes for a smoother, more youthful lobe.',
    shapes: pair(27.7, 66.2, 1.3, 1.9),
    label: { side: 'right', y: 64.6, to: [65.7, 66.2] },
  },
  {
    id: 'lip', name: 'Lip Lift', view: 'face', price: 1200,
    blurb: 'Tightens the skin between the nose and upper lip, gently lifting the lip and showing a little more of it.',
    shapes: [ell(46, 70.2, 4, 1.3)],
    label: { side: 'right', y: 70, to: [50, 70.2] },
  },
  {
    id: 'perioral', name: 'Perioral Wrinkles (Smoker’s Lines)', view: 'face', price: 1200,
    blurb: 'Smooths the fine vertical lines around the mouth (“smoker’s” or lipstick lines).',
    // A ring around the mouth (even-odd: the inner oval is the hole).
    shapes: [`${ell(46, 72.6, 7.6, 4.9)} ${ell(46, 72.8, 4.6, 2.6)}`],
    label: { side: 'right', y: 75.6, to: [53.4, 74.2] },
  },
  {
    id: 'buccal', name: 'Buccal Fat', view: 'face', price: 1200,
    blurb: 'Slims fullness in the lower cheeks for a more contoured, sculpted face.',
    shapes: pair(35, 70, 2.9, 3.9),
    label: { side: 'left', y: 69, to: [32.1, 70] },
  },
  {
    id: 'jawline', name: 'Jawline, Jowls', view: 'face', price: 1200,
    blurb: 'Tightens loose skin and softens jowls along the jaw for a cleaner, more defined jawline.',
    shapes: ['M30.2,72 Q33,82 42,86 L43,83.4 Q35.4,80 32.6,71 Z', 'M61.8,72 Q59,82 50,86 L49,83.4 Q56.6,80 59.4,71 Z'],
    label: { side: 'left', y: 78, to: [31.8, 76.5] },
  },
  {
    id: 'submental', name: 'Submental (Double Chin)', view: 'face', price: 1200,
    blurb: 'Reduces the fullness under the chin and tightens the skin there — a non-surgical option for a double chin.',
    shapes: ['M39.5,86.4 Q46,89.6 52.5,86.4 L52,90.8 Q46,92.8 40,90.8 Z'],
    label: { side: 'right', y: 88.5, to: [52.3, 88.6] },
  },
  {
    id: 'neck', name: 'Neck', view: 'face', price: 1200,
    blurb: 'Tightens crepey or loose skin on the neck and softens neck lines.',
    shapes: ['M38.6,92 L53.4,92 L54.4,101 L37.6,101 Z'],
    label: { side: 'left', y: 96.5, to: [38.6, 96.5] },
  },
  // ── Body ────────────────────────────────────────────────────────────────
  {
    id: 'hyperhidrosis', name: 'Hyperhidrosis', view: 'body', price: 1600,
    blurb: 'Treats excessive underarm sweating by targeting the sweat glands under the skin.',
    shapes: [ell(36.4, 37, 2.4, 3.2), ell(63.6, 37, 2.4, 3.2)],
    label: { side: 'left', y: 34, to: [34, 37] },
  },
  {
    id: 'bra-roll', name: 'Bra Roll Fat', view: 'body', price: 1600,
    blurb: 'Reduces the stubborn fat roll at the sides and back where a bra strap sits, and tightens the skin over it.',
    shapes: [ell(37.8, 49, 2.4, 4.6), ell(62.2, 49, 2.4, 4.6)],
    label: { side: 'left', y: 49, to: [35.4, 49] },
  },
  {
    id: 'stretch-marks', name: 'Stretch Marks', view: 'body', price: 1600,
    blurb: 'Improves the color and texture of stretch marks — on the stomach, hips, thighs or arms.',
    shapes: [ell(50, 70, 10, 8)],
    label: { side: 'left', y: 70, to: [40, 70] },
  },
  {
    id: 'knee', name: 'Knee Fat', view: 'body', price: 1600,
    blurb: 'Slims the soft fullness above and around the knees and firms the skin.',
    shapes: [ell(43, 121, 3.6, 4), ell(57, 121, 3.6, 4)],
    label: { side: 'left', y: 121, to: [39.4, 121] },
  },
  {
    id: 'ankle', name: 'Ankle Fat', view: 'body', price: 1600,
    blurb: 'Refines thick or puffy ankles for a slimmer line from calf to ankle.',
    shapes: [ell(43.6, 155, 2.8, 2.6), ell(56.4, 155, 2.8, 2.6)],
    label: { side: 'right', y: 155, to: [59.2, 155] },
  },
  // ── Anywhere ────────────────────────────────────────────────────────────
  {
    id: 'pores', name: 'Pores', view: 'other', price: 1500,
    blurb: 'Refines enlarged pores and smooths skin texture — usually on the nose and cheeks.',
  },
  {
    id: 'scar', name: 'Scar', view: 'other', price: 1600,
    blurb: 'Softens the texture and visibility of a scar (acne, surgical or injury) by remodeling the skin around it.',
  },
]

export const TARGETED_PACKAGES: TargetedPackage[] = [
  {
    id: 'full-upper', name: 'Full Upper Face (brow lift, upper eyes, lower eyes, fat pads)',
    includes: ['brow', 'upper-eyes', 'lower-eyes', 'fat-pads'], price: 3500,
    blurb: 'Brow, upper eyes, lower eyes and fat pads in one treatment.',
  },
  {
    id: 'full-lower', name: 'Full Lower Face (neck, submental, lower face)',
    includes: ['neck', 'submental', 'jawline', 'buccal'], price: 5500,
    blurb: 'Neck, under the chin, jawline / jowls and buccal fat in one treatment.',
  },
  {
    id: 'neck-jaw-sub', name: 'Neck Lift, Jawline, Submental',
    includes: ['neck', 'jawline', 'submental'], price: 4500,
    blurb: 'Neck, jawline and under the chin together.',
  },
  {
    id: 'neck-jaw', name: 'Neck Lift, Jawline',
    includes: ['neck', 'jawline'], price: 3500,
    blurb: 'Neck and jawline together.',
  },
  {
    id: 'eyes', name: 'Eyes (upper + lower)',
    includes: ['upper-eyes', 'lower-eyes'], price: 2500,
    blurb: 'Upper and lower eyelids together.',
  },
  {
    id: 'perioral-lip', name: 'Perioral Wrinkles and Lip Lift',
    includes: ['perioral', 'lip'], price: 1700,
    blurb: 'The lines around the mouth plus a lip lift.',
  },
  {
    id: 'lower-face', name: 'Lower Face (Jowls, Buccal Fat)',
    includes: ['jawline', 'buccal'], price: 1200,
    blurb: 'Jowls and buccal fat together.',
  },
]

/** Defaults with what /admin saved laid over them. */
export function resolveTargeted(p: TargetedPricing | undefined) {
  const price = (id: string, d: number | null): number | null => {
    const v = p?.prices?.[id]
    return v === undefined ? d : v === null || Number.isFinite(v) ? v : d
  }
  const blurb = (id: string, d: string) => (p?.blurbs?.[id]?.trim() ? p.blurbs[id].trim() : d)
  return {
    areas: TARGETED_AREAS.map((a) => ({ ...a, price: price(a.id, a.price), blurb: blurb(a.id, a.blurb) })),
    packages: TARGETED_PACKAGES.map((k) => ({ ...k, price: price(k.id, k.price), blurb: blurb(k.id, k.blurb) })),
    discountPct: Number.isFinite(p?.packageDiscountPct) ? Math.max(0, Math.min(50, p!.packageDiscountPct!)) : DEFAULT_PACKAGE_DISCOUNT_PCT,
  }
}
