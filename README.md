# Solo Practice Bridge

Solo Practice Bridge is a private, local-first practice workbook for intermediate self-taught musicians. It connects one observed problem in a piece to a short, user-authored drill, alternates the drill back into the piece, and records whether the change transferred. It does not listen, grade audio, generate lessons, or replace a teacher.

Live: <https://solo-practice-bridge.sociobot.in>

## What v1 includes

- One-piece / one-obstacle practice plans with timed drill-to-piece alternation
- User-defined success cues and automatically spaced revisit dates
- Persistent IndexedDB plans and session reflections
- Printable teacher-ready history plus JSON backup/import and CSV export
- Installable offline PWA with an explicit offline state and update prompt
- A complete free tier; optional $12 one-time Studio license adds unlimited simultaneously active bridges
- Directly addressable privacy and terms pages

All musical content is entered by the musician. Practice data never leaves the browser. Only optional license verification contacts the Sociobot billing API.

## Run locally

Requires Node.js 22+.

```sh
npm ci
npm run dev
```

Open the printed local URL. No environment variables are needed for the free product. Set `VITE_BILLING_API` only to point a staging build at the factory’s pilot billing API.

## Test and build

```sh
npm test          # unit tests
npm run build     # reproducible static output in ./dist
npm run test:e2e  # Chromium desktop/mobile, accessibility, and offline checks
npm run check     # all of the above
```

Playwright is pinned to 1.58.2. Its Chromium browser must be installed or available via `PLAYWRIGHT_BROWSERS_PATH`.

## Deploy

Deploy the contents of `dist/` as a static site with clean-directory routes enabled. `dist/index.html` is the entry point, while `dist/privacy/index.html` and `dist/terms/index.html` are standalone legal pages. Do not configure billing, DNS, or secrets in this repository.

The researched scope is in [`.factory/brief.json`](.factory/brief.json), the product-specific visual and asset record is in [`.factory/design.md`](.factory/design.md), and build verification is recorded in [`.factory/handoff.md`](.factory/handoff.md).
