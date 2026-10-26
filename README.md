# TalkOne frontend

> **Imported version:** The current source uses real external registration APIs and browser local storage; the demo-only descriptions below are historical and are not accurate for this version. Do not enter real personal, banking, or KYC information during setup testing. See `replit.md` for current run commands and configuration.

Warm, responsive TalkOne marketing site and complete listener registration journey demo built in React, Vite, and TypeScript. The visual system references TalkOne’s deep navy, soft cream, and teal palette while adapting the mobile-flow content to a responsive website.

## Run locally

From the workspace root:

```sh
npm run dev
```

Install dependencies with `npm ci`. Build with `npm run build`; check types with `npm run typecheck`.

## Structure

- `src/App.tsx` — routes, marketing sections, responsive navigation, and FAQ interactions.
- `src/pages/ListenerRegistration.tsx` — contact choice, numbered listener registration steps 1–9, field validation, in-memory file previews, and final demo confirmation.
- `src/types/listenerRegistration.ts` — single typed registration data object.
- `src/services/listenerService.ts` — mock `registerListener(data)` integration point; returns a demo result without transmitting, storing, or logging data.
- `src/data/siteContent.tsx` — shared site copy and navigation/FAQ content.
- `src/index.css` — palette, layout, responsive styles, and motion.
- `index.html` — default SEO and social metadata.

## Future listener API integration

The service integration seam is `src/services/listenerService.ts`, exported as `registerListener(data)`. It returns a demo result only. Its clearly marked TODO is the future location for an authorized service integration. Do not treat the current confirmation screen as a real submission, review status, or application receipt.

## Privacy and demo behavior

The contact choice is first (mobile or email; no OTP), followed by exactly nine labeled steps and a final confirmation stage. The complete form values, bank details, selected files, profile photo, and audio clip stay only in component/browser memory. No API, backend, authentication, database, persistent storage, or network request is used. Reloading or leaving the page discards the demo data. Do not enter real personal, banking, or KYC information. The final screen is explicit that nothing was submitted or saved; its disabled status CTA is not a status tracker.

## Editing content and visuals

Edit major marketing copy in `src/data/siteContent.tsx`. The hero artwork is composed in CSS in `src/index.css`; the TalkOne mark is an inline SVG icon composition in `Logo` within `src/App.tsx`. App-store, social, company, contact, privacy, and terms details are explicit placeholders and should only be replaced with official information.

No backend, APIs, account creation, OTP, payment, external fonts, or network integrations are included.