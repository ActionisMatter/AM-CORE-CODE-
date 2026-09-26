# Action = Matter prototype

This is the current working prototype, copied as-is. It is the baseline. It is not the production architecture in the rest of this repository.

The app is a TanStack Start client. Product state lives in Zustand and `localStorage` (`action-matter-2`). There is no product database yet.

## Run

Requires Node 22.

```bash
cd apps/web
npm ci
npm run dev
```

Open http://localhost:8080

`npm run build` builds the client. Without `DATABASE_URL` the database step skips. `npm run typecheck` runs `tsc --noEmit`.

## What is in here

- `src/routes` — Home, Explore, Projects, profile, organization, opportunities, action, AI
- `src/components/am` — screens, shell, UI
- `src/lib/am` — types, seed data, matching logic, Zustand store
- `public/am` — portraits and covers

Do not treat `apps/platform`, `packages/*`, or `database/` as part of this prototype. Those folders are the empty production skeleton and were left untouched.
