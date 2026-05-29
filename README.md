# Soccer World Monitor

**Professional soccer intelligence platform** — live match monitoring, deep analytics, and talent scouting in a unified command center for serious football professionals.

[![GitHub](https://img.shields.io/badge/GitHub-yky32%2Fsoccer--terminal-181717?style=flat&logo=github)](https://github.com/yky32/soccer-terminal)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

&nbsp;

[Product Vision](./product-summary.md) · [Quick Start](#quick-start) · [Roadmap](#roadmap)

---

## What It Does

Soccer World Monitor is a global football intelligence dashboard inspired by the *concept* of situational awareness tools like [World Monitor](https://github.com/koala73/worldmonitor) — adapted entirely for the sport. It is **not a copy** of that project; it has its own identity, UX, and football-specific data model.

The platform is designed to combine:

- **Global interactive map** — live and upcoming matches on a world map, color-coded by importance and league tier, with filter layers for Youth, Women's, Top Leagues, and high-xG fixtures
- **Analytics dashboard** — customizable multi-panel views for live matches, tactical pitch maps, player radars, team form, xG trends, and league tables
- **Youth academies monitor** — track promising talents with performance curves, minutes played, physical data, and potential ratings *(primary focus)*
- **Women's football hub** — dedicated coverage and insights for women's leagues worldwide
- **Scouting intelligence** — advanced player search, side-by-side comparison, and similarity discovery
- **AI assistant** — daily briefings, tactical trend analysis, and a conversational interface for plain-language questions

For the full product vision, UX philosophy, and differentiation strategy, see **[product-summary.md](./product-summary.md)**.

---

## Who It's For

| Audience | Use case |
|----------|----------|
| Scouts & talent analysts | Discover, compare, and track players globally |
| Youth academy coaches & directors | Monitor development curves and minutes progression |
| Women's football professionals | Dedicated league and player intelligence |
| Tactical & data analysts | Live match context, xG, form, and tactical views |
| Serious football enthusiasts | Deeper insight than consumer apps, cleaner than raw data platforms |

---

## Project Status

The project is in **early alpha**. The app shell, navigation, and route structure are in place; core data integrations and feature UIs are under active development.

| Module | Route | Status |
|--------|-------|--------|
| Overview | `/` | ✅ Shell live |
| Global Map | `/map` | 🚧 Planned |
| Analytics Dashboard | `/dashboard` | 🚧 Planned |
| Youth Academies | `/youth` | 🚧 Planned |
| Women's Football | `/women` | 🚧 Planned |
| Scouting | `/scouting` | 🚧 Planned |
| AI Assistant | `/assistant` | 🚧 Planned |

---

## Design Philosophy

Built with an **Uber-inspired** interface — simple, fast, and scannable — paired with **Bloomberg-level analytical depth** when you need it.

- Dark mode by default (light mode planned)
- Mobile-first, responsive layout
- Card-based dashboards with generous whitespace
- Clear hierarchy so users understand the app within seconds

---

## Quick Start

```bash
git clone https://github.com/yky32/soccer-terminal.git
cd soccer-terminal
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and set your API-Football key:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `API_FOOTBALL_KEY` | Key from [API-Football](https://www.api-football.com/) |
| `FOOTBALL_DATA_PROVIDER` | Data source (`api-football`; more providers can be added) |

The homepage map loads live fixtures via `GET /api/map/live-countries` (cached ~60s on the server).

All HTTP calls go through `src/lib/http/api-client.ts`, which prints **Request DTO** and **Response DTO** to the server/browser console in development (`API_HTTP_LOG=true` forces it on in production too).

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
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI** | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com) |
| **Language** | [TypeScript](https://www.typescriptlang.org) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## Project Structure

```
src/
├── app/              # Routes and layouts (App Router)
│   ├── map/          # Global map
│   ├── dashboard/    # Analytics panels
│   ├── youth/        # Youth academies
│   ├── women/        # Women's football
│   ├── scouting/     # Scouting tools
│   └── assistant/    # AI assistant
├── components/       # Shared UI components
├── lib/              # Utilities and config
└── types/            # Shared TypeScript types
```

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js — no extra config needed.
4. Deploy.

Or use the CLI:

```bash
npx vercel
```

### Environment variables

When data sources and AI features are wired up, secrets will go in the Vercel dashboard under **Project → Settings → Environment Variables**, or in a local `.env.local` file. **Never commit credentials.**

---

## Roadmap

1. **Global Map** — interactive world map with live match pins and layer filters
2. **Dashboard** — card-based multi-panel layout with saved preferences
3. **Youth & Women's modules** — first real data integrations and watchlists
4. **Scouting** — search, compare, and similarity engine
5. **AI Assistant** — daily briefings and chat interface

---

## Differentiation

| vs. consumer apps (e.g. FotMob) | vs. data-heavy platforms |
|--------------------------------|--------------------------|
| Deeper analytical depth | Cleaner, simpler UI |
| Youth & women's football focus | Faster to scan and act on |
| Professional scouting workflows | Uber-level simplicity |

---

## Contributing

This is an early-stage project. Issues and pull requests are welcome once contribution guidelines are added. For now, open an [issue](https://github.com/yky32/soccer-terminal/issues) to discuss features or report bugs.

---

## Inspiration

Soccer World Monitor takes inspiration from global monitoring and situational awareness concepts — particularly projects like [World Monitor](https://github.com/koala73/worldmonitor) — and applies them to football intelligence with a distinct product vision, design system, and feature set.

---

&nbsp;

[github.com/yky32/soccer-terminal](https://github.com/yky32/soccer-terminal)
