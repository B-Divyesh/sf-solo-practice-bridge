# Repair handoff — solo-practice-bridge-repair-2

**Verifier report:** `c81cd34299a058e961b1166756ac160445849dc4` / `.factory/verification-2.md`

**Failed candidate:** `1a0eaf15a5aa69b6a9ae33267293876fa554e1ea`

**Date:** 2026-08-28 UTC

**Repair commit:** `c6b2118c43f4e5a7f085002b01ad946bcf2e17d4`

## Repaired release blocker

The populated practice bridge no longer puts `aria-label` on a roleless `div`. The connector keeps its visible decorative arrow (`aria-hidden="true"`) and now includes real visually-hidden text, “Then return to the piece.” The mobile rotation rule targets only the arrow, so the screen-reader text is unaffected.

The Axe regression now creates a complete bridge before scanning and explicitly checks that the connector has the transition text and no `aria-label`. Playwright runs that regression in both configured projects: Desktop Chrome and Chromium with the iPhone 13 / 390px profile. This closes the initial-empty-state coverage gap that allowed the serious WCAG 4.1.2 `aria-prohibited-attr` violation to ship.

`public/sw.js` was advanced from `bridge-v6` to `bridge-v7`, ensuring installed clients receive the repaired same-name JS/CSS bundles instead of retaining the old cache.

## Verification evidence

- Reproduction before the fix: independent Axe 4.10.2 scans of a populated workspace at 1280×720 and 390×844 each returned one serious `aria-prohibited-attr` violation on `.bridge-joint`.
- Clean install: `npm ci` installed 60 packages; audit reported 0 vulnerabilities.
- Unit/integration: `npm test` passed 4/4 Vitest tests.
- Type/build: `npm run build` passed `tsc --noEmit` and Vite 7.3.6; `dist/index.html` is at the required root.
- Complete gate: `npm run check` passed all unit/build checks and 8/8 Playwright tests (4 desktop, 4 mobile).
- Populated accessibility regression alone: 2/2 projects passed with zero serious/critical Axe findings.
- Independent browser smoke: desktop 1366×900 and mobile 390×844 had zero serious/critical Axe findings, zero console/page errors, no horizontal overflow, correct connector text with no invalid ARIA, and successful offline reload with the created bridge intact.
- Keyboard/motion: the skip link was first in tab order with a visible focus treatment; plan dialogs opened by keyboard and closed with Escape in the suite; reduced-motion transitions resolved to `0.00001s`.
- Privacy/network: request capture during the free create/save flow contained only the local app origin. No analytics, third-party fonts/scripts, microphone, or billing request occurred.
- Offline/update: service-worker control and offline persistence passed in both Playwright projects. An isolated `bridge-v7` → `bridge-v8` update simulation produced the “An update is ready” toast, applied via “Update now,” retained the local plan after reload, activated `bridge-v8-shell`/`bridge-v8-runtime`, and logged no browser errors.
- Performance/budgets: production JS is 28,345 B raw / 9.31 kB gzip; CSS is 13,848 B raw / 3.94 kB gzip; no webfonts ship; hero WebP is 208,060 B. All factory budgets pass.
- Mobile Lighthouse against the production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 0 ms, CLS 0, Speed Index 1.0 s.
- Legal/privacy routes: `/privacy/` and `/terms/` remain directly addressable and pass both browser projects.
- Package/consumer validation is not applicable: this is a static PWA, not a published library. The production consumer artifact is `dist/`.

## Deployment and live identity

`/opt/fleet/lib/deploy-static.sh solo-practice-bridge dist` uploaded deployment `c97d2a96-92ca-437c-87de-b2356c771ee2` successfully. The custom domain is Ready and <https://solo-practice-bridge.sociobot.in/> returns HTTP 200 over managed TLS.

The factory URL verifier reported a 644 ms load, no console errors, the expected title and `lang="en"`, exactly one `h1`, a main landmark, no missing image alt text, and no unlabeled buttons. `/`, `/privacy/`, `/terms/`, `/manifest.webmanifest`, `/sw.js`, `/offline.html`, JS, CSS, and the hero asset return HTTP 200.

Fresh production downloads byte-match the deployed build:

| File | SHA-256 |
| --- | --- |
| `assets/main.js` | `e0b3370597622baedcc938c4ab185fb4c620556c2a026e7017e62fb70c0cc536` |
| `assets/style.css` | `a6c7f75af4d6b54f56af84808f42a17f0ead6ca42e95374200e4b767e7a1470e` |
| `sw.js` | `175e4cc345fbb3e136304c1a31a097187baf62efddccc13a45d567ff7e8a15ae` |
| `manifest.webmanifest` | `3245595b0aac037ea88c82579e8d14c64ce9124659d8f9e7560d86a04d085588` |
| `offline.html` | `c59b62f6b77f010e626e957fdb0cac008235ec64992fd0e1e61feadc8c396c8b` |

Independent live populated-workspace scans at 1366×900 and 390×844 found zero serious/critical Axe violations, no browser errors, no horizontal overflow, the repaired connector semantics, working 3 px keyboard focus, retained local data after offline reload, and no non-app-origin requests. Live mobile Lighthouse scored Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP/LCP 0.9 s, TBT 0 ms, CLS 0, Speed Index 0.9 s.

Live response policy remains HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and 30-second must-revalidate caching. No secret or billing configuration is shipped in the repository.

## Known gaps

None in product code. The independent verifier’s two non-blocking hosting observations (missing CSP/Permissions-Policy/frame policy and the manifest’s generic MIME type) are deployment-layer hardening items; they are not the release failure repaired here.
