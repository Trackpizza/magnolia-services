# Magnolia Skin Center — Services Site

Public marketing / services site for Magnolia Skin Center (Burbank, CA): browse
treatments, search by concern, per-treatment videos, pre-treatment & after-care
guides, and a complimentary video-consultation booking flow.

Next.js 14 (App Router) · TypeScript · Tailwind · Firebase Firestore · Firebase App Hosting.

## 📋 Project status & docs

**See [`docs/PROJECT-STATUS.md`](docs/PROJECT-STATUS.md)** for the full picture — routes,
content management (`/admin` + Firestore), the deploy process, architecture gotchas
(build-time secrets, ISR revalidation), key files, and what's pending.

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Editable content (videos, guides, booking URL, hours) comes from the Firestore
`serviceLinks/config` doc via `/admin`; static treatment copy lives in `config/services.ts`.

## Deploy

App Hosting builds from `main` HEAD:

```bash
git push origin main
firebase login:use trackpizzamusic@gmail.com
firebase apphosting:rollouts:create magnolia-services --git-branch main --force --project magnolia-services
```

Then verify on https://services.magnoliaskincenter.com. See PROJECT-STATUS for details.
