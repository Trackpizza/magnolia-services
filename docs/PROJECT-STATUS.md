# Magnolia Skin Center — Services Site: Project Status

_Last updated: 2026-08-15_

Public marketing / services site for Magnolia Skin Center (Burbank, CA). Browse all
treatments, search by concern, watch per-treatment videos, read pre-treatment &
after-care guides, and book a complimentary video consultation.

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
| `/admin` | Content editor (Firestore-backed) — **unlisted, token-gated** |
| `/spin` | Internal content tool — **unlisted** (excluded from robots/sitemap) |
| `/api/admin/links` | GET/PUT the `serviceLinks/config` doc (auth: `x-admin-token`) |
| `/api/revalidate` | On-demand ISR revalidation webhook |

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
is **code**, in `config/services.ts` — not admin-editable.

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

---

## 6. Key files

```
app/page.tsx                         Home (hero + ServicesSearch)
app/services/[slug]/page.tsx         Treatment detail
app/services/[slug]/{pre-treatment,after-care}/page.tsx  → GuidePage
app/bookings/page.tsx                Booking landing page
app/admin/page.tsx                   Content editor
config/services.ts                   39 services (names, slugs, copy) — source of truth
lib/links.ts                         getLinks(): Firestore serviceLinks/config (+ defaults)
lib/types.ts                         ServiceLinks shape + DEFAULT_LINKS
lib/schema.ts                        Structured data builders
components/Contact.tsx               TextUsButton + CallTextPills (tel:/sms:)
components/ServicesSearch.tsx        Concern finder + search + directory (client)
components/InlineConsultCTA.tsx      Slim "book a consult" prompt
components/ServiceCTA.tsx            Bottom booking CTA
components/GuidePage.tsx             Shared pre-treatment / after-care layout
components/YouTubeEmbed.tsx          Click-to-load video facade
apphosting.yaml                      App Hosting config (env/secrets, incl. BUILD availability)
```

---

## 7. Current state (Aug 2026)

**Done & live:**
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

**Pending / needs the client:**
- Guide **videos for the 3 remaining services** (weight-loss-consultation,
  weight-loss-program, cherry-payment-plans) — none provided yet.
- Real long-form content for those same 3 where placeholders remain.

**Future / at final handoff:**
- Move the `magnolia-services` Firebase project into the med spa's own Google account and
  re-point the custom domain.
- The admin endpoints use a single shared token (`ADMIN_PASSWORD`); consider stronger auth
  before handing admin access to non-technical staff.
