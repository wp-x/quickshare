# Repository Guidelines

## Project Structure & Module Organization
- Entry point: `app.js` (Express server). Configuration in `config.js` and `.env`.
- Server code: `routes/` (HTTP routes), `models/` (SQLite access), `middleware/` (auth), `utils/` (rendering, detection).
- Views & assets: `views/` (EJS templates), `public/` (css/js/icon), `public/js`, `public/css`.
- Data & runtime: `db/html-go.db`, `data/`, `sessions/` (file‑backed sessions).
- Scripts: `scripts/` (e.g., `migrate-db.js`, `update-titles.js`, `find-free-port.js`).

## Build, Test, and Development Commands
- Install deps: `npm install`
- Dev server (watch): `npm run dev`
- Start prod: `npm start` or `npm run prod`
- Test mode (no unit tests): `npm test` (boots server with `NODE_ENV=test`)
- DB migration: `node scripts/migrate-db.js`
- Docker compose: `docker-compose up -d` (exposes `:8888`)

## Coding Style & Naming Conventions
- Language: Node.js (ES2019+). Use 2‑space indent, semicolons, single quotes.
- Filenames: lower‑kebab for scripts/routes (e.g., `pages.js`, `migrate-db.js`); EJS views as `*.ejs`.
- Naming: camelCase for variables/functions; PascalCase for classes/constructors.
- Structure: keep route handlers thin; put persistence in `models/` and helpers in `utils/`.

## Testing Guidelines
- No formal test suite yet. Validate locally:
  - Auth: `/login`, `/logout`, role checks for `/admin`.
  - Create: `POST /api/pages/create` (expect `urlId`, `password`).
  - View: `GET /view/:id[?password=...]` (HTML/Markdown/SVG/Mermaid).
  - Admin APIs: list/delete/batch delete/statistics.
- If adding tests, prefer Jest + supertest. Place tests under `__tests__/` mirroring `routes/` and `models/`.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject; optional scope prefix (feat, fix, docs). English or Chinese is fine.
- PRs: clear description, steps to reproduce/verify, screenshots for UI, affected routes. Link issues.
- DB changes: include/update a migration in `scripts/` and describe data impact.

## Security & Configuration Tips
- Secrets: use `.env` (do not commit). Keys: `AUTH_ENABLED`, `ADMIN_PASSWORD`, `USER_PASSWORD`, `PORT`, `HOST`.
- Sessions: ensure `sessions/` is writable; prefer `0700` permissions in production.
- Data: persist `db/` and `data/` when using Docker volumes.
