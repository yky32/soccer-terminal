# Soccer World Monitor

Professional soccer intelligence platform — live match monitoring, deep analytics, and talent scouting.

See [product-summary.md](./product-summary.md) for the full product vision.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- Hosted on [Vercel](https://vercel.com)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run start` | Run production server    |
| `npm run lint`  | Run ESLint               |

## Project structure

```
src/
├── app/          # Next.js App Router pages and layouts
├── components/   # Shared UI components
├── lib/          # Utilities and helpers
└── types/        # Shared TypeScript types
```

## Deploy to Vercel

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js — no extra config needed.
4. Deploy.

Alternatively, use the Vercel CLI:

```bash
npx vercel
```

## Environment variables

Add secrets in the Vercel dashboard under **Project → Settings → Environment Variables**, or in a local `.env.local` file (never commit secrets).
