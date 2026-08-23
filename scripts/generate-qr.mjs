#!/usr/bin/env node
/**
 * Print-ready QR codes for the stylist VIP pass pages.
 *
 * Generates one vector SVG (what the printer should actually use) and one
 * high-resolution PNG (for proofs and digital use) per stylist in
 * config/stylists.ts, into scripts/.out/qr/.
 *
 *   node scripts/generate-qr.mjs
 *
 * Error correction is set to H (~30% recoverable) so the code still scans if a
 * logo is placed over the centre or the card picks up wear in a purse. The SVG
 * has a quiet-zone margin of 4 modules, which is the spec minimum — do not let
 * the card design crop it, or scanning gets unreliable.
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '.out', 'qr')

const BASE_URL = 'https://services.magnoliaskincenter.com'

const OPTIONS = {
  errorCorrectionLevel: 'H',
  margin: 4,
  color: { dark: '#1e1428', light: '#ffffff' }, // plum-900 on white
}

/**
 * Read the slugs straight out of config/stylists.ts so this can never drift
 * from the routes that actually exist. Importing the .ts file would need a
 * loader, so match the slug lines instead — the shape is fixed and simple.
 */
function stylistSlugs() {
  const src = readFileSync(join(__dirname, '..', 'config', 'stylists.ts'), 'utf8')
  const start = src.indexOf('export const STYLISTS')
  if (start === -1) throw new Error('STYLISTS array not found in config/stylists.ts')
  return [...src.slice(start).matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1])
}

async function main() {
  const slugs = stylistSlugs()
  if (!slugs.length) {
    console.error('No stylists found in config/stylists.ts')
    process.exitCode = 1
    return
  }

  mkdirSync(OUT_DIR, { recursive: true })

  for (const slug of slugs) {
    const url = `${BASE_URL}/stylists/${slug}`

    const svg = await QRCode.toString(url, { ...OPTIONS, type: 'svg' })
    writeFileSync(join(OUT_DIR, `${slug}.svg`), svg, 'utf8')

    // 2048px keeps a 1in card code far above 300dpi with room to scale.
    await QRCode.toFile(join(OUT_DIR, `${slug}.png`), url, { ...OPTIONS, width: 2048 })

    console.log(`${slug}\n  ${url}\n  ${slug}.svg + ${slug}.png`)
  }

  console.log(`\n${slugs.length} QR code${slugs.length === 1 ? '' : 's'} written to ${OUT_DIR}`)
  console.log('Give the printer the SVG (vector, scales cleanly). Keep the white quiet-zone margin intact.')
}

main()
