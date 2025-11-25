# NovaDex — Pokémon Intelligence Console

NovaDex is a two-tier Pokédex experience built with an animated React + Tailwind interface and an Express API proxy with intelligent caching. Search any Pokémon name to pull curated battle stats, lore, and vitals with near-instant response times thanks to the service-side cache.

## Stack

- **Web service**: Node.js 20, Express 4, Axios, LRU cache, Zod validation, Helmet/CORS hardening
- **UI layer**: React 18 + Vite + TypeScript, Tailwind CSS, Framer Motion, Lucide icons, Ky HTTP client

## Getting started

Clone the repo, then in two terminals run the API and the UI.

### 1. API service

```bash
cd server
npm install
npm run dev
```

The API boots on `http://localhost:4000` with the main endpoint `GET /api/pokemon/:name` (or `/api/pokemon?name=`). Responses are cached for 10 minutes with an LRU cap of 120 entries. Errors bubble up as JSON with HTTP status codes.

### 2. Client app

```bash
cd client
npm install
npm run dev
```

The Vite dev server starts on `http://localhost:5173` and proxies `/api` requests to the Node layer. Build assets via `npm run build` when you are ready to deploy.

## Features

- Ultra-fast Pokémon lookups with cache-aware REST API wrapper over [PokeAPI](https://pokeapi.co/)
- Graceful error handling (validation, upstream failures, cache misses)
- Cinematic UI with animated hero, holographic cards, live stat meters, and spotlight shortcuts
- Responsive layout, custom typography, and polished micro-interactions via Tailwind + Framer Motion
- Strong typing across the React layer for maintainability

## Testing & linting

Run `npm run lint` inside both `server` and `client` to keep the code tidy. (No automated tests were requested, but the structure makes it easy to add Vitest or Jest later.)

## Deployment notes

- The UI assumes the API is reachable at `/api`. Configure a reverse proxy (or Vite proxy already set in dev) in production.
- Tune cache TTL/size through `src/cache.js` if you expect higher load or want longer retention.
- Add environment variables (e.g., different base URLs) via `.env` as needed—remember to keep secrets out of version control.
