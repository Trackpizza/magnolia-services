#!/usr/bin/env node
/**
 * Load main treatment videos + "How it works" copy into serviceLinks/config.
 *
 * The client's notes file is the source of truth: this parses numbered entries
 * (title, bullets, closing line, Q&A transcript) and renders each one into the
 * markdown house format already used by the live service pages, then PUTs the
 * result through /api/admin/links (which merges and triggers revalidation).
 *
 * Usage:
 *   node scripts/load-service-content.mjs                          # dry run
 *   ADMIN_TOKEN=xxx node scripts/load-service-content.mjs --apply  # write
 *
 * A dry run writes the full payload to scripts/.out/payload.json so the exact
 * copy can be eyeballed before anything touches production. --apply first saves
 * the current live config to scripts/.out/backup-<timestamp>.json.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '.out')

const NOTES = 'C:/KeepitLocal PRO/magnolia-skin-center/MY NOTES/PWA services.txt'
const API = 'https://services.magnoliaskincenter.com/api/admin/links'

// Upload date stamped into the VideoObject structured data for every video in
// this batch. These go live today, so today's date is the honest value.
const UPLOAD_DATE = '2026-08-22'

const CHECK = '\u2705'          // the bullet marker used in the notes + live copy
const DIVIDER = '\u2501'.repeat(22)

// Notes-file entry number -> service id in config/services.ts.
const ENTRY_TO_SERVICE = {
  275: 'agnes-rf-acne-scar-treatment',
  276: 'agnes-rf-eye-bag-treatment',
  277: 'agnes-rf-microneedling',
  278: 'agnes-rf-non-surgical-facelift',
  279: 'aquafirme-xs-hair-restoration',
  280: 'b-complex-injection',
  281: 'derive-scalp-serum',
  282: 'nad-therapy',
  283: 'revanesse-lip',
  284: 'revanesse-versa',
}

const ENTRY_TO_VIDEO = {
  275: 'vx4sAdJts4s',
  276: 'syNxkzCMavI',
  277: '1cdKK4bAxMA',
  278: '7qeEgj3kiRE',
  279: 'JQmlu6mgnng',
  280: 'n3kLNrRBkKI',
  281: '537aFm9Q6GQ',
  282: 'txq1ulSb52s',
  283: 'euNzq8VRemY',
  284: 'RwlqUdowJyE',
}

/** Split the notes file into { number, lines[] } entries. */
function parseEntries(text) {
  const lines = text.split(/\r?\n/)
  const entries = []
  let current = null
  for (const line of lines) {
    const m = /^(\d+)\.\s*$/.exec(line)
    if (m) {
      if (current) entries.push(current)
      current = { number: Number(m[1]), lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) entries.push(current)
  return entries
}

/** Pull the structured pieces out of one entry's raw lines. */
function structure(entry) {
  const lines = entry.lines
  const title = lines.find(l => l.trim() !== '')?.trim() ?? ''
  const bullets = lines.filter(l => l.trim().startsWith(CHECK)).map(l => l.trim())

  const dividerAt = lines.findIndex(l => l.includes(DIVIDER))
  const beforeDivider = lines.slice(0, dividerAt === -1 ? lines.length : dividerAt)

  // The closing call-to-action is the last non-empty line before the divider
  // that is neither the title nor a bullet.
  const closing = [...beforeDivider].reverse().find(l => {
    const t = l.trim()
    return t !== '' && t !== title && !t.startsWith(CHECK)
  })?.trim() ?? ''

  // Q&A pairs: a "Q: ..." line followed by its "Dr. David: ..." answer.
  const qa = []
  const tail = dividerAt === -1 ? [] : lines.slice(dividerAt)
  const ANSWER = 'Dr. David: '
  for (let i = 0; i < tail.length; i++) {
    const q = tail[i].trim()
    if (!q.startsWith('Q: ')) continue
    const answerLine = tail.slice(i + 1).find(l => l.trim().startsWith(ANSWER))
    if (answerLine) {
      qa.push({ q: q.slice(3).trim(), a: answerLine.trim().slice(ANSWER.length).trim() })
    }
  }

  return { title, bullets, closing, qa }
}

/**
 * Render one entry as markdown in the format the live pages already use: lead
 * line, bullets each on their own line, closing line, divider, then bolded
 * Q / Dr. David pairs. remark-breaks turns the single newlines inside a block
 * into <br/>, which is what produces the existing stacked look.
 */
function toMarkdown({ title, bullets, closing, qa }) {
  // The ": Q&A With Dr. David" suffix is a video title, not page copy — the
  // transcript section below already says whose answers these are.
  const lead = title.replace(/:\s*Q&A With Dr\. David\s*$/i, '').trim()

  const blocks = []
  if (lead) blocks.push(lead)
  if (bullets.length) blocks.push(bullets.join('\n'))
  if (closing) blocks.push(closing)
  blocks.push(DIVIDER + '\nVIDEO TRANSCRIPTION (CONDENSED):')
  for (const { q, a } of qa) {
    blocks.push('**Q: ' + q + '**\n**Dr. David:** ' + a)
  }
  return blocks.join('\n\n')
}

function build() {
  const text = readFileSync(NOTES, 'utf8')
  const videos = {}
  const videoDates = {}
  const content = {}
  const report = []

  for (const entry of parseEntries(text)) {
    const serviceId = ENTRY_TO_SERVICE[entry.number]
    const videoId = ENTRY_TO_VIDEO[entry.number]
    if (!serviceId || !videoId) continue

    const parts = structure(entry)
    const markdown = toMarkdown(parts)

    videos[serviceId] = 'https://www.youtube.com/watch?v=' + videoId
    videoDates[serviceId] = UPLOAD_DATE
    content[serviceId] = markdown

    report.push({
      entry: entry.number,
      serviceId,
      videoId,
      bullets: parts.bullets.length,
      qa: parts.qa.length,
      chars: markdown.length,
    })
  }

  return { payload: { videos, videoDates, content }, report }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const token = process.env.ADMIN_TOKEN
  const { payload, report } = build()

  console.log('entry  service                          video          bullets  Q&A   chars')
  for (const r of report) {
    console.log(
      r.entry + '    ' + r.serviceId.padEnd(32) + ' ' + r.videoId.padEnd(14) +
      String(r.bullets).padStart(7) + String(r.qa).padStart(5) + String(r.chars).padStart(8)
    )
  }

  const missing = Object.keys(ENTRY_TO_SERVICE).filter(n => !report.some(r => String(r.entry) === n))
  if (missing.length) {
    console.error('\nNOT FOUND in notes file: entries ' + missing.join(', '))
    process.exitCode = 1
    return
  }
  console.log('\n' + report.length + ' services prepared.')

  mkdirSync(OUT_DIR, { recursive: true })
  const payloadPath = join(OUT_DIR, 'payload.json')
  writeFileSync(payloadPath, JSON.stringify(payload, null, 2), 'utf8')
  console.log('Payload written to ' + payloadPath)

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to write to production.')
    return
  }
  if (!token) {
    console.error('\nADMIN_TOKEN env var is required with --apply.')
    process.exitCode = 1
    return
  }

  // Back up the live config before overwriting anything.
  const before = await fetch(API, { headers: { 'x-admin-token': token } })
  if (!before.ok) {
    console.error('\nGET failed: ' + before.status + ' ' + before.statusText)
    process.exitCode = 1
    return
  }
  const backupPath = join(OUT_DIR, 'backup-' + Date.now() + '.json')
  writeFileSync(backupPath, JSON.stringify(await before.json(), null, 2), 'utf8')
  console.log('\nLive config backed up to ' + backupPath)

  const res = await fetch(API, {
    method: 'PUT',
    headers: { 'x-admin-token': token, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    console.error('PUT failed: ' + res.status + ' ' + res.statusText)
    process.exitCode = 1
    return
  }
  console.log('Applied. Revalidation triggered by the API.')
}

main()
