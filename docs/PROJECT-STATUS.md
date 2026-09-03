# Magnolia Skin Center — Services Site: Project Status

_Last updated: 2026-09-02_

Public marketing / services site for Magnolia Skin Center (Burbank, CA). Browse all
treatments, search by concern, watch per-treatment videos, read pre-treatment &
after-care guides, and book a complimentary video consultation.

**Related docs:** [`README.md`](../README.md) (dev/deploy quickstart) ·
[`docs/ACCESSIBILITY-CHECKLIST.md`](ACCESSIBILITY-CHECKLIST.md) (WCAG 2.2 AA audit).

---

## 1. At a glance

| | |
|---|---|
| **Live URL** | https://services.magnoliaskincenter.com |
| **App Hosting URL** | https://magnolia-services--magnolia-services.us-central1.hosted.app |
| **Repo** | `Trackpizza/magnolia-services` (branch `main`) |
| **Local path** | `C:/ERIC/APPS/med_spa_services_app` |
| **Firebase project** | `magnolia-services` (standalone; owner **trackpizzamusic@gmail.com**) |
| **Stack** | Next.js 14 (App Router) · TypeScript · Tailwind · Firebase Firestore (Admin SDK) · Firebase App Hosting |
| **Booking** | Google Calendar appointment link (in Firestore, editable in `/admin`) |
| **Business phone** | (747) 305-8973 |

---

## 2. Pages / routes

| Route | Purpose |
|---|---|
| `/` | Home — concern finder + full treatment directory |
| `/services/[slug]` | Treatment detail (video, highlights, "how it works", guides) |
| `/services/[slug]/pre-treatment` | Pre-Treatment & Planning guide (video + checklist) |
| `/services/[slug]/after-care` | After-Care guide (video + checklist) |
| `/bookings` | Booking landing page (used as the Google Business Profile "Book" link) |
| `/privacy` | Privacy Policy + Accessibility Statement (one page; `#accessibility` anchor) |
| `/admin` | Content editor (Firestore-backed) — **unlisted, token-gated** |
| `/spin` | Internal content tool — **unlisted** (excluded from robots/sitemap) |
| `/api/admin/links` | GET/PUT the `serviceLinks/config` doc (auth: `x-admin-token`) |
| `/api/revalidate` | On-demand ISR revalidation webhook |

**Campaign pages — all `noindex` + disallowed in `robots.ts`.** These are handed out by
email or QR code rather than crawled, so they stay out of search (which also keeps the
salon promo codes off coupon-scraper sites):

| Route | Purpose |
|---|---|
| `/rejuvenation-journeys` | Both practitioners' own before/after videos — the one emailed to patients |
| `/dr-davids-rejuvenation` | Dr. David's solo page (`VIDEO_URL` still empty) |
| `/nurse-eileens-rejuvenation` | Nurse Eileen's solo page (`VIDEO_URL` still empty) |
| `/stylists/[slug]` | Partner-salon stylist VIP pass, reached by QR from a business card |

**Content:** 39 services in `config/services.ts` (source of truth for names/slugs/copy).
36 have guide videos + guide text loaded; 3 do not yet (weight-loss-consultation,
weight-loss-program, cherry-payment-plans).

---

## 3. How content is managed

All editable content lives in **one Firestore document: `serviceLinks/config`** and is
edited via **`/admin`** (or `PUT /api/admin/links`). The API does `set(..., { merge: true })`,
so partial updates are safe. Key fields:

- `mainFooter` — address, phone, email, **bookingUrl**, websiteUrl, customLinks
- `serviceFooter` — phone + custom links for service-page footers
- `videos` / `videoDates` — main treatment video per service id
- `prepVideos` / `prepContent` (+ dates) — Pre-Treatment guide per id
- `afterCareVideos` / `afterCareContent` (+ dates) — After-Care guide per id
- `hours` — business hours (drives the openingHoursSpecification schema + the bookings page)

Static per-treatment copy (highlights, "how it works", taglines, keywords, disclaimer)
is **code**, in `config/services.ts` — not admin-editable. So are the campaign pages: the
stylist pages read `config/stylists.ts`, and the rejuvenation pages hold their video URLs
in constants at the top of each file. Changing any of those needs a rollout, not an admin save.

**Bulk content loads.** `scripts/load-service-content.mjs` parses the client's numbered
notes file (`C:/KeepitLocal PRO/magnolia-skin-center/MY NOTES/PWA services.txt`) and pushes
`videos` + `videoDates` + `content` for many services in one PUT. Dry-runs by default,
writing the payload to `scripts/.out/payload.json` for review; `--apply` backs the live
config up to `scripts/.out/backup-<ts>.json` first. That directory is gitignored — it holds
production backups.

```bash
# from the repo root, token never printed
$env:ADMIN_TOKEN=((Select-String -Path .env.local -Pattern '^ADMIN_PASSWORD=' | Select-Object -First 1).Line -replace '^ADMIN_PASSWORD=',''); node scripts/load-service-content.mjs --apply
```

**Auth:** the admin/revalidate endpoints check `x-admin-token` / `x-revalidate-token`
against the **`ADMIN_PASSWORD`** secret (Secret Manager). The value is not stored in this
repo — ask the project owner or read it from Secret Manager.

---

## 4. Deploying

```bash
# 1. commit + push to main
git push origin main

# 2. make sure the Firebase CLI is on the right account
firebase login:use trackpizzamusic@gmail.com   # "Failed to get project" / 403 = wrong account

# 3. roll out (App Hosting builds from main HEAD and swaps in)
firebase apphosting:rollouts:create magnolia-services --git-branch main --force --project magnolia-services

# 4. verify on the live URL (poll until the change appears)
```

Docs-only changes (like this file) don't need a rollout.

---

## 5. Architecture notes / gotchas

- **ISR + build-time data.** Pages are prerendered (`revalidate = 60`). The three
  `FIREBASE_*` secrets in `apphosting.yaml` carry `availability: [BUILD, RUNTIME]` so
  `getLinks()` reads real Firestore data **at build time** and bakes it into the static
  HTML. Without `[BUILD]`, pages build with `DEFAULT_LINKS` (no videos, default booking
  URL) and only self-heal later via per-edge ISR — which shows as "content only appears
  after a refresh, and differs between devices." If you add another Firestore-driven
  secret, remember the BUILD availability + `firebase apphosting:secrets:grantaccess`.
- **Revalidation.** `POST /api/revalidate` revalidates `/`, `/bookings`, and every
  concrete `/services/<slug>` + `/pre-treatment` + `/after-care` path (not just the
  layout), so an admin save reliably evicts the dynamic guide pages from the CDN. The
  admin `PUT` calls this automatically.
- **YouTube** players are click-to-load facades (`YouTubeEmbed.tsx`, youtube-nocookie)
  for performance; posters come from the YouTube thumbnail CDN.
- **SEO:** `lib/schema.ts` (MedicalBusiness + Service + VideoObject), `app/sitemap.ts`,
  `app/robots.ts` (admin + spin disallowed). Canonical host is hardcoded there.
- **Deploys need the GitHub App on "All repositories".** A rollout failing with
  `fetchReadToken ... repository not found under installation ID` is **not** a build
  problem — `git push` uses your own credentials while the rollout uses a separate
  Firebase App Hosting GitHub App authorization. It was set to "Only select repositories"
  and the selection proved unstable (adding one repo silently dropped another; this bit
  `magnolia-services` and `trumpet-studio` on consecutive days). Fixed permanently on
  2026-08-22 by switching the install to **All repositories** at
  github.com/settings/installations. If it ever returns, check that setting first.
- **Occasional rollout build-ID errors.** `build "build-YYYY-MM-DD-NNN" was not found and
  is invalid`, or `409 unable to queue`, means the CLI's daily build counter is wedged —
  not a code problem. It clears on its own within a few hours; the Firebase Console
  rollout assigns its own ID and usually works immediately.
- **The native share sheet can't be filtered.** `navigator.share()` hands the OS a URL and
  the OS lists every installed app that accepts one — Amazon, Instagram, Facebook, 30+
  entries, most unable to deliver a message. No API can filter, reorder or restrict that,
  so `ShareVipPass.tsx` deliberately does **not** use it and renders its own fixed sheet
  instead (Text / WhatsApp / Email / Copy link). No separate Gmail entry: `mailto:` already
  lets the phone offer Gmail, whereas a `mail.google.com` compose link forces mobile web
  Gmail and nags to install the app.
- **Boulevard booking can't be deep-linked past its location picker.** Dylan Keith has two
  locations; selecting one advances to `#/visit-type` with **no location in the URL**, so
  the choice lives in session state. The picker therefore appears on a guest's first visit
  and is skipped on every one after. That's why `salon.bookingNote` states *where the
  stylist works* rather than describing "the next screen" — an instruction about a screen
  that isn't always there reads as more confusing than no note at all.
- **Accessibility (WCAG 2.2 AA).** Audited & remediated (commit `99a01c8`): `<main>`
  landmarks on all public pages, no heading-level skips, AA color contrast (the concern
  category labels use `brand-600`, **not** the old sage `#79a191`, which failed contrast),
  `aria-label` on the search input, and a `prefers-reduced-motion` rule in `globals.css`.
  The published Accessibility Statement lives at `/privacy#accessibility`; the audit +
  per-criterion status is in [`docs/ACCESSIBILITY-CHECKLIST.md`](ACCESSIBILITY-CHECKLIST.md).
  Re-run that audit after significant UI changes. `/admin` and `/spin` were out of scope.

---

## 5b. Stylist VIP pass pages

Co-marketing with Dylan Keith Salon, who share the building. Each stylist gets a page whose
URL is printed as a QR code on ~1,000 business cards, so **a slug in `config/stylists.ts` is
permanent once cards go to print.**

Data is layered deliberately. Anything shared by a location lives on the `Salon` object —
phone, booking URL, Google review link, `bookingNote`, and the promo code and discount.
`BURBANK20` is a **location** code, not a personal one: the salon attributes the booking to
whichever stylist the client picked at checkout, so a per-stylist code would be extra setup
for them and one more thing to typo. Only `slug`, `name`, `role` and `videoUrl` are
per-stylist. Adding one is a single entry:

```ts
{ slug: 'dylan-keith-maria', name: 'Maria', role: 'Stylist', salon: DYLAN_KEITH, videoUrl: '' }
```

Then regenerate the codes — give the printer the **SVG**, and tell them not to crop the
white quiet-zone margin or scanning gets unreliable:

```bash
node scripts/generate-qr.mjs   # → scripts/.out/qr/<slug>.svg + .png
```

Empty `bookingUrl` / `reviewUrl` / `videoUrl` hide their button or show the video
placeholder, so a page ships before the salon supplies them. `qrcode` is a devDependency —
it never reaches the app bundle.

---

## 6. Key files

```
app/page.tsx                         Home (hero + ServicesSearch)
app/services/[slug]/page.tsx         Treatment detail
app/services/[slug]/{pre-treatment,after-care}/page.tsx  → GuidePage
app/bookings/page.tsx                Booking landing page
app/privacy/page.tsx                 Privacy Policy + Accessibility Statement
app/admin/page.tsx                   Content editor
app/rejuvenation-journeys/page.tsx   Both practitioners' videos (emailed campaign page)
app/{dr-davids,nurse-eileens}-rejuvenation/page.tsx  Solo practitioner pages
app/stylists/[slug]/page.tsx         Stylist VIP pass template (QR target)
config/services.ts                   39 services (names, slugs, copy) — source of truth
config/stylists.ts                   Salon + stylist data; slugs are PRINTED ON CARDS
scripts/load-service-content.mjs     Bulk video + "How it works" loader (admin API)
scripts/generate-qr.mjs              Print-ready QR codes per stylist (SVG + PNG)
lib/links.ts                         getLinks(): Firestore serviceLinks/config (+ defaults)
lib/types.ts                         ServiceLinks shape + DEFAULT_LINKS
lib/schema.ts                        Structured data builders
components/Contact.tsx               TextUsButton + CallTextPills (tel:/sms:)
components/LegalLinks.tsx            Privacy + Accessibility footer links (all footers)
components/ServicesSearch.tsx        Concern finder + search + directory (client)
components/InlineConsultCTA.tsx      Slim "book a consult" prompt
components/ServiceCTA.tsx            Bottom booking CTA
components/GuidePage.tsx             Shared pre-treatment / after-care layout
components/YouTubeEmbed.tsx          Click-to-load video facade (9:16, service pages)
components/RejuvenationVideo.tsx     9:16 facade + "coming soon" placeholder (campaign pages)
components/ShareVipPass.tsx          Fixed share sheet — deliberately NOT navigator.share
apphosting.yaml                      App Hosting config (env/secrets, incl. BUILD availability)
```

---

## 7. Current state (Sep 2026)

**Added since Aug 15:**
- **10 treatment pages got their main video + "How it works" copy** (bullets and a Q&A
  transcript) via `scripts/load-service-content.mjs`: the four Agnes RF pages plus
  AquaFirme XS, B-Complex, DE|RIVE, NAD, Revanesse Lip and Revanesse Versa. The four Agnes
  pages had their older videos replaced; the acne page's Q&A had been the *microneedling*
  questions and is now correct.
- **`/rejuvenation-journeys`** — Dr. David's and Nurse Eileen's own before/after videos side
  by side, with the business phone. Both clips were re-uploaded once (bad processing, wrong
  captions); the page carries the current IDs.
- **`/stylists/dylan-keith-lucy`** — the first partner-salon VIP pass: 20% off hair with
  code `BURBANK20` on top, 25% off clinical treatments at MSC below, joined by a "located
  right down the hall" divider. Booking, Google review, call, and a share sheet all live.
- **QR codes** generated for the printed business cards (`scripts/generate-qr.mjs`).
- 39 treatments, each with detail + pre-treatment + after-care pages.
- 72 guide videos loaded (36 pre-treatment + 36 after-care) via the admin API.
- Membership messaging removed — the **video consultation is the sole primary CTA**.
- `/bookings` landing page (for Google Business Profile).
- New **MSC logo** on the homepage hero (`logo-msc.webp`); white wordmark on plum headers.
- **Call Us / Text Us** links beside every booking CTA (`tel:+1…` / `sms:+1…`), with the
  actual phone number shown as text (so it's usable on desktop) — plus a Text Us pill in
  headers.
- **Concern finder** opens to the Face & Aging category by default; a green
  "Find more concerns" pill reveals the rest.
- Build-time Firestore baking + full-path revalidation (fixes the stale-content issue).
- **`/privacy`** page (Privacy Policy + Accessibility Statement) with Privacy +
  Accessibility links in every footer.
- **Accessibility remediation** to WCAG 2.2 AA (see §5 and the checklist doc).
- `README.md` rewritten (points to these docs).

**Pending / needs the client:**
- **Lucy's intro video** and the shared **Dr. David & Nurse Eileen salon-guest welcome
  video** — both stylist-page slots show the "coming soon" placeholder until supplied.
- **Sign-off from Dylan Keith** on the 20% / 25% offer wording before cards go to print.
  1,000 cards per stylist is not a cheap reprint, and the slug is unfixable afterwards.
- `VIDEO_URL` on `/dr-davids-rejuvenation` and `/nurse-eileens-rejuvenation` is still
  empty — the combined page has both clips, the solo pages don't.
- Guide **videos for the 3 remaining services** (weight-loss-consultation,
  weight-loss-program, cherry-payment-plans) — none provided yet.
- Real long-form content for those same 3 where placeholders remain.
- **Confirm the YouTube Terms link** on `/privacy` (points to `youtube.com/t/terms`),
  and optionally **enable closed captions** on the uploaded videos.
- Recommended accessibility follow-ups (non-blocking): manual keyboard + screen-reader
  spot-check; optional "skip to content" link — see the checklist doc.

**Future / at final handoff:**
- Move the `magnolia-services` Firebase project into the med spa's own Google account and
  re-point the custom domain.
- The admin endpoints use a single shared token (`ADMIN_PASSWORD`); consider stronger auth
  before handing admin access to non-technical staff.
