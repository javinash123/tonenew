# TalkOne

Imported React, Vite, and TypeScript frontend. Keep the existing single-package structure and design.

## Run

- Install dependencies: `npm ci`.
- Use Replit's **Run** button (workflow: **Start application**), or `npm run dev`.
- Vite listens on `0.0.0.0:5000` and allows Replit's preview hosts.
- Type check: `npm run typecheck`.
- Production build: `npm run build` (output: `dist/public`).
- Preview a built site: `npm run serve`.

## Configuration and external service

- `PORT` defaults to `5000`.
- `BASE_PATH` defaults to `/`.
- The imported `.env` is preserved and ignored by Git. Do not print its contents.
- `VITE_API_URL` configures the external TalkOne API. This is a browser-visible API base URL, not a place for credentials.
- Routes: `/` and `/listener-registration`.
- Registration uses real external API calls and stores login response data in browser local storage. The older README's demo-only claims do not match the imported code.
- No backend is included. Running the frontend does not verify external API availability, CORS permissions, or successful registration. Do not submit real personal, banking, or identity information during setup verification.
