# Accessibility Checklist — WCAG 2.2 Level AA

_Audit date: 2026-08-15 · Scope: public pages of services.magnoliaskincenter.com
(home, treatment detail, pre-treatment & after-care guides, bookings, privacy)._

This backs the claims in the site's **Accessibility Statement** (`/privacy#accessibility`).
Findings were checked with an automated contrast + structure audit run against the
built site, plus code review. The internal, unlisted `/admin` and `/spin` tools are
**out of scope** (staff-only, excluded from robots/sitemap).

Status key: ✅ Pass · 🔧 Fixed this pass · 👁 Manual check recommended · ➖ N/A

| WCAG | Criterion | Status | Notes |
|---|---|---|---|
| 1.1.1 | Non-text content (alt text) | ✅ | Logo/wordmark images have `alt`; decorative SVG icons are unlabeled (ignored by AT). |
| 1.2.2 | Captions (video) | 👁 | Embedded YouTube supports CC; enable captions on each uploaded video for full conformance. |
| 1.3.1 | Info & relationships | 🔧 | Added `<main>` landmark to all public pages; fixed heading-level skips (see 2.4.6). |
| 1.4.3 | Contrast (minimum) 4.5:1 | 🔧 | **0 failures after fixes.** Category label `#79a191`→`brand-600` (2.6→4.9:1); body `gray-500`→`gray-600`; `gray-400` labels→`gray-600`; CTA address `white/40`→`white/60`; video-placeholder text darkened. |
| 1.4.10 | Reflow (no horizontal scroll) | ✅ | Verified at 375px on all page types; no horizontal overflow. |
| 1.4.11 | Non-text contrast (UI/icons) | ✅ | Search icons `gray-400`→`gray-500` (≥3:1); primary controls use brand-600/plum. |
| 1.4.12 | Text spacing | ✅ | Relative units, generous line-height; no fixed-height text containers. |
| 2.1.1 | Keyboard | ✅ / 👁 | Native `button`/`a`/`input`; video is a real `<button>` facade. Full keyboard walkthrough recommended. |
| 2.3.3 | Animation from interactions | 🔧 | `prefers-reduced-motion` now neutralizes the concern-finder arrow bounce + transitions. |
| 2.4.1 | Bypass blocks | 🔧 / 👁 | `<main>` landmark added. A visible "skip to content" link is an optional future enhancement. |
| 2.4.2 | Page titled | ✅ | Every route sets a unique `<title>` via metadata. |
| 2.4.4 | Link purpose (in context) | ✅ | "Learn more" links carry descriptive `aria-label`s; nav/footer links are self-describing. |
| 2.4.6 | Headings & labels | 🔧 | One `h1` per page; no skipped levels — homepage categories `h2`, cards `h3`, sr-only results heading; guide markdown `h2/h3` corrected. |
| 2.4.7 | Focus visible | ✅ / 👁 | Default focus rings retained; search field has a focus ring. Spot-check keyboard focus visibility. |
| 2.5.8 | Target size (min 24×24) | ✅ | Buttons/pills ≥ ~40px tall; concern chips ~28px. |
| 3.1.1 | Language of page | ✅ | `<html lang="en">`. |
| 3.3.2 | Labels or instructions | 🔧 | Search input given `aria-label` (placeholder alone is not an accessible name). |
| 4.1.2 | Name, role, value | ✅ | Native semantics throughout; all buttons/links have accessible names. |

## Fixed in this pass (commit 99a01c8)
- Color contrast across all public pages (0 remaining failures).
- `<main>` landmark on home, service, guide, and bookings pages.
- Heading hierarchy (no skipped levels), incl. guide markdown content.
- `aria-label` on the treatment search input.
- `prefers-reduced-motion` support in `globals.css`.

## Recommended follow-ups (not blocking)
- **Enable closed captions** on the YouTube videos (per-video setting on YouTube).
- **Manual assistive-tech pass**: a keyboard-only walkthrough + a screen-reader
  spot-check (NVDA or VoiceOver) of the search/concern flow and booking flow.
- Optional **"skip to content"** link for keyboard users.
- Re-run this audit after any significant UI change.

## How to re-audit
Contrast/structure were checked by script against the built site (`next start`),
computing WCAG relative-luminance ratios for every rendered text node and flagging
`< 4.5:1` (normal) / `< 3:1` (large), plus heading-order and landmark checks. Re-run
the same checks in the browser console after major changes.
