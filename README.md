<div align="center">

# 🧭 Prospect

### Discover opportunities tailored to your future.

Prospect is an opportunity discovery platform that helps students, professionals,
researchers, founders, creators, and career changers find life-changing
opportunities — scholarships, internships, research programs, fellowships, grants,
competitions, hackathons, accelerators, and more — matched to their goals.

[![CI](https://github.com/TaxCollector23/prospect/actions/workflows/ci.yml/badge.svg)](https://github.com/TaxCollector23/prospect/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## ✨ Features

- **Premium onboarding** — a 5-step animated flow with autosave that learns your
  interests, goals, and location.
- **Personalized dashboard** — every opportunity ranked with a **0–100 % match**
  produced by a multi-signal recommendation engine.
- **Powerful search & filters** — typo-tolerant search (Algolia-ready) with filters
  for type, country, remote, deadline, verification, and relevance.
- **Quality scoring** — opportunities are scored for completeness, verification,
  freshness, and validity, and that score feeds ranking.
- **Save & track** — save opportunities, manage them, and get deadline reminders.
- **Discord-aware** — opportunities can surface their community Discord server.
- **Admin dashboard** — create, edit, verify, feature, and moderate opportunities.
- **Ingestion pipeline** — manual entry, CSV import, and an authenticated API
  endpoint, architected for future crawler integration.
- **Email** — welcome, password reset, weekly digest, opportunity alerts, and
  deadline reminders via Resend.
- **Production-grade** — SEO (sitemap, robots, OG, structured data), accessibility
  (WCAG), analytics (PostHog), monitoring (Sentry), and strict TypeScript.

---

## 🧱 Tech Stack

| Layer        | Technology |
| ------------ | ---------- |
| Framework    | Next.js 15 (App Router), React 19, TypeScript (strict) |
| Styling      | Tailwind CSS v4, shadcn/ui-style components, Lucide icons |
| Animation    | Framer Motion |
| Auth         | Firebase Authentication (Google + Email) |
| Database     | Cloud Firestore |
| Storage      | Firebase Storage |
| Functions    | Firebase Cloud Functions (architecture) |
| Search       | Algolia |
| State        | Zustand |
| Validation   | Zod + React Hook Form |
| Analytics    | PostHog |
| Email        | Resend |
| Monitoring   | Sentry |
| Hosting      | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm (`npm i -g pnpm`)

### Install & run

```bash
pnpm install
cp .env.example .env.local   # optional — app runs in DEMO MODE without keys
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Demo mode:** With no Firebase keys set, Prospect runs against a rich set of
> realistic seed opportunities and a mock auth session, so the entire UI is
> usable immediately. Fill in `.env.local` to switch to live Firebase/Algolia.

### Useful scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `pnpm dev`        | Start the dev server                 |
| `pnpm build`      | Production build                     |
| `pnpm start`      | Run the production build             |
| `pnpm lint`       | ESLint                               |
| `pnpm typecheck`  | `tsc --noEmit`                       |
| `pnpm format`     | Prettier                            |

---

## 🔐 Environment Variables

See [`.env.example`](./.env.example) for the full, documented list. Groups:

- **Firebase** (client + admin) — auth, Firestore, storage
- **Algolia** — search
- **PostHog** — analytics
- **Resend** — transactional + digest email
- **Sentry** — error monitoring
- **Admin** — `NEXT_PUBLIC_ADMIN_EMAILS` controls `/admin` access
- **Cron / API** — `CRON_SECRET`, `INGESTION_API_KEY`

---

## 🗂 Project Structure

```
src/
├── app/                  # App Router routes
│   ├── (marketing)/      # about, privacy, terms
│   ├── (app)/            # dashboard, saved, settings, profile (protected)
│   ├── onboarding/       # 5-step onboarding
│   ├── login/ signup/    # auth
│   ├── opportunity/[id]/ # opportunity detail
│   ├── admin/            # admin dashboard (protected)
│   └── api/              # route handlers (ingestion, activity, cron, email)
├── components/           # UI primitives + feature components
├── lib/                  # firebase, recommendation, quality, search, data
├── hooks/                # React hooks
├── stores/               # Zustand stores
└── types/                # shared types + Zod schemas
```

---

## 🧮 Recommendation Engine

Each opportunity is scored 0–100 against the signed-in user using weighted signals:

| Signal            | What it measures |
| ----------------- | ---------------- |
| Interest match    | overlap of opportunity tags/type with user interests |
| Career-goal match | semantic keyword overlap with stated career goals |
| Location match    | same country / region / remote eligibility |
| Behavior match    | similarity to what the user has viewed/saved |
| Freshness         | how recently the opportunity was added/updated |
| Quality           | the quality score (see below) |
| Popularity        | aggregate engagement |

See [`src/lib/recommendation.ts`](./src/lib/recommendation.ts).

## 🏅 Quality Scoring

Opportunities receive a 0–100 quality score from: verified organization, valid
website, information completeness, recency, and presence of a deadline. See
[`src/lib/quality.ts`](./src/lib/quality.ts).

---

## ☁️ Deployment (Vercel)

```bash
vercel           # preview
vercel --prod    # production
```

Add all `.env.example` variables in **Vercel → Project → Settings → Environment
Variables**. The `vercel.json` registers cron jobs for the weekly digest and
deadline reminders.

### Firebase rules

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## 🛡 Security

- Firestore & Storage security rules (owner-scoped, admin-gated writes)
- Zod validation on all inputs; server-side authorization checks
- Authenticated ingestion API + cron secret
- Security headers via `next.config.ts`
- Secrets kept server-side; only `NEXT_PUBLIC_*` reach the client

---

## 🧭 Roadmap

Organization accounts · submission portal · application tracker · resume builder ·
essay feedback · mentorship matching · browser extension · mobile app.

---

## 📄 License

MIT © Prospect
