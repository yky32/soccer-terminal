# Soccer Terminal

**Live football on a global map** — scores, standings, match detail, and league dashboards in one fast, scannable app.

[![Live site](https://img.shields.io/badge/Live-soccer--terminal.app-16a34a?style=flat)](https://www.soccer-terminal.app/)
[![GitHub](https://img.shields.io/badge/GitHub-yky32%2Fsoccer--terminal-181717?style=flat&logo=github)](https://github.com/yky32/soccer-terminal)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

&nbsp;

**Live:** [soccer-terminal.app](https://www.soccer-terminal.app/) · [Product vision](./product-summary.md) · [Quick start](#quick-start)

---

## What It Does

Soccer Terminal is a global football dashboard inspired by situational-awareness tools like [World Monitor](https://github.com/koala73/worldmonitor) — adapted entirely for the sport. It is **not a copy** of that project; it has its own identity, UX, and football-specific data model.

| Area | What you get |
|------|----------------|
| **Global map** | Live and upcoming fixtures worldwide (MapLibre), country drill-down, league filters |
| **Leagues** | Standings, fixtures, knockout brackets, stat leaders, team and player profiles |
| **Matches** | Live score, lineups (with player deep links), stats, timeline, head-to-head |
| **News** | Headlines and story pages *(feature-flagged; off by default)* |
| **AI Assistant** | Daily briefings and chat *(feature-flagged; off by default)* |

For the full product vision and differentiation strategy, see **[product-summary.md](./product-summary.md)**.

---

## Project Status

**Production beta** — core map, league, match, team, and player flows are live at [soccer-terminal.app](https://www.soccer-terminal.app/). News and AI ship behind feature flags until ready for general release.

| Module | Route | Status |
|--------|-------|--------|
| Global map | `/` | ✅ Live (API-Football or mock) |
| Leagues | `/leagues`, `/leagues/[id]` | ✅ Standings, fixtures, leaders |
| Teams | `/leagues/[id]/teams/[slug]` | ✅ Squad, form, club info |
| Players | `/leagues/[id]/players/[slug]` | ✅ Stats and profile |
| Matches | `/matches/[fixtureId]` | ✅ Lineups, stats, timeline |
| News | `/news` | 🚧 Built; enable with `NEXT_PUBLIC_ENABLE_NEWS=true` |
| AI Assistant | `/assistant` | 🚧 Built; enable with `NEXT_PUBLIC_ENABLE_AI=true` |

Also shipped: SEO metadata and crawlable page intros, sitemap/robots, brand favicon, Vercel Analytics + Speed Insights, edge-cached API routes.

---

## Quick Start

```bash
git clone https://github.com/yky32/soccer-terminal.git
cd soccer-terminal
npm install
cp .env.example .env.local
npm run dev
```

Open [localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
|----------|-------------|
| `API_FOOTBALL_KEY` | Key from [API-Football](https://www.api-football.com/) — required for live data and match pages |
| `FOOTBALL_DATA_PROVIDER` | `api-football` (default) or `mock` for offline map/league dev |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, Open Graph, and sitemap (e.g. `https://www.soccer-terminal.app`) |
| `NEXT_PUBLIC_ENABLE_NEWS` | Set `true` to expose News nav, routes, and API |
| `NEXT_PUBLIC_ENABLE_AI` | Set `true` to expose AI Assistant nav and routes |
| `OPENAI_API_KEY` | Optional — enables LLM briefings/chat; demo mode when unset |
| `API_HTTP_LOG` | Set `false` to silence request/response DTO logging (default: on) |

The global map loads fixtures via `GET /api/map/live-countries` (cached ~60s). Match detail pages (`/matches/*`) always require a real API key — no mock fallback.

Cache tiers live in `src/lib/football/refresh-policy.ts` (live 60s, standings 10m, players 24h).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, RSC) |
| **UI** | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), shadcn/ui |
| **Maps** | [MapLibre GL](https://maplibre.org/) |
| **Data** | [API-Football](https://www.api-football.com/) with pluggable mock provider |
| **Analytics** | [Vercel Analytics](https://vercel.com/docs/analytics) + Speed Insights |
| **Language** | [TypeScript](https://www.typescriptlang.org) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## Project Structure

```
src/
├── app/                    # App Router pages and API routes
│   ├── page.tsx            # Global live map
│   ├── matches/            # Match detail
│   ├── leagues/            # League, team, player pages
│   ├── news/               # News feed (feature-flagged)
│   ├── assistant/          # AI briefing + chat (feature-flagged)
│   └── api/                # Cached football + assistant endpoints
├── components/             # UI (map, leagues, matches, seo, …)
└── lib/
    ├── football/           # Data providers, cache, normalization
    ├── seo/                # Metadata, JSON-LD, sitemap, page intros
    ├── assistant/          # Briefing + LLM integration
    └── http/               # Shared API client and route helpers
```

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected.
3. Add **Environment Variables** for Production:
   - `API_FOOTBALL_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://www.soccer-terminal.app`
   - Optional: `NEXT_PUBLIC_ENABLE_NEWS`, `NEXT_PUBLIC_ENABLE_AI`, `OPENAI_API_KEY`
4. Add your custom domain under **Project → Settings → Domains** (`soccer-terminal.app` + `www`).
5. Enable **Web Analytics** under the project **Analytics** tab to view traffic in the Vercel dashboard.

Or use the CLI:

```bash
npx vercel
```

**Never commit** `.env.local` or API keys.

---

## Roadmap

1. **News** — enable headline feed and team news tabs in production
2. **AI** — enable assistant with LLM-backed briefings
3. **Dark mode** — finish theme polish across all surfaces
4. **Monetization** — waitlist, affiliates, optional Pro tier

---

## Contributing

Issues and pull requests are welcome. Open an [issue](https://github.com/yky32/soccer-terminal/issues) to discuss features or report bugs.

---

## Inspiration

Soccer Terminal takes inspiration from global monitoring and situational awareness concepts — particularly projects like [World Monitor](https://github.com/koala73/worldmonitor) — and applies them to football with a distinct product vision, design system, and feature set.

---

&nbsp;

[github.com/yky32/soccer-terminal](https://github.com/yky32/soccer-terminal)
