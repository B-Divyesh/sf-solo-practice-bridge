# Solo Practice Bridge

Solo Practice Bridge helps self-taught musicians connect a short drill to a piece they want to play. It is a private, local-first practice workbook.

Try the populated sandbox at <https://solo-practice-bridge.sociobot.in/demo/>. Demo records use separate storage and never change real records.

## What it does

- Maps one observed piece obstacle through a timed drill, piece return, and transfer note.
- Adds four spaced revisit dates to every bridge.
- Keeps plans and session notes in local browser storage after reload.
- Prints practice plans and transfer history.
- Exports JSON backups and CSV history.
- Provides a standalone web-app manifest and service worker.
- Works offline after the first visit.
- Shows a notice when a new worker version is ready.
- Keeps normal practice traffic on the product origin.
- Includes one active bridge, unlimited sessions, printing, and exports for free.
- Does not request microphone input during normal practice use.

Studio is a one-time unlimited-bridges license. Checkout is currently unavailable while its billing registration is completed. An eligible license can still be restored with Sociobot verification.

The workbook does not listen, grade audio, generate lessons, or replace a teacher. Musicians enter every musical instruction.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open the printed local URL. Use `/demo/` for sample data. No environment variables are needed for the free workbook.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
npm run check
```

Playwright is pinned to 1.58.2. Chromium must be installed or available through `PLAYWRIGHT_BROWSERS_PATH`.

Every public claim is listed in [`.factory/claims.json`](.factory/claims.json). From a clean setup, run `npm ci`, `npm run build`, then every listed claim command.

## Deploy

Deploy `dist/` as a static site. Keep directory routes for `/demo/`, `/privacy/`, and `/terms/`. Serve `staticwebapp.config.json` with the output for security headers, manifest MIME, and the designed HTTP 404 page.

Do not configure billing, DNS, or secrets in this repository. The separate billing operator must complete Studio registration before checkout is enabled.

The researched scope is in [`.factory/brief.json`](.factory/brief.json). The visual system and asset provenance are in [`.factory/design.md`](.factory/design.md). Demo isolation is documented in [`.factory/demo.md`](.factory/demo.md).
