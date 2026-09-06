# Repair 3 handoff — PASS except external billing registration

**Implementation SHA:** `eedac19e77524da051ebef63b51379819edb4dcc`
**Prior reviewed implementation:** `c6b2118c43f4e5a7f085002b01ad946bcf2e17d4`
**Live URL:** <https://solo-practice-bridge.sociobot.in>
**Deployed:** 2026-09-06 UTC

## Product at first screen

- **Job:** Connect a drill to your piece.
- **Audience:** Self-taught musicians without regular teacher feedback.
- **First action:** **Try it with sample data** opens a populated Autumn Leaves plan without saving to real data.

## What changed

- Added `/demo/`, `?demo=1`, a realistic Autumn Leaves sample, persistent demo banner, reset, and start-for-real flow.
- Put demo plans and sessions in IndexedDB `demo:solo-practice-bridge`. Real records stay in `solo-practice-bridge`.
- Put demo license keys in `demo:` localStorage keys. Demo mode does not read or write real practice or license data.
- Added 15 declared, outcome-based public claim checks in `.factory/claims.json` and documented the sandbox in `.factory/demo.md`.
- Rewrote the first screen in plain words, added the three facts, corrected the loop target, and added a copy audit.
- Added a static demo page, designed HTTP 404, social metadata/image, favicon, Apple icon, sitemap entry, footer build id, and response security configuration.
- Fixed skip-link focus and 44px link targets. Populated desktop and phone Axe scans remain clean.
- Replaced the broken Studio buy link with an honest registration-status message. Free core remains useful; eligible license restore remains available.
- Added `billing-offer.json` at `/work/.evidence/billing-offer.json` for the separate billing-registration operator.
- Replaced the host-served octet-stream manifest with the linked `/manifest.json`, which Azure serves as `application/json`.
- Removed inline fallback-page CSS so the deployed CSP produces no style violations.

## Review finding disposition

| Finding | Result |
| --- | --- |
| F1 sample sandbox | Closed. One-click `/demo/` is isolated, populated, labelled, resettable, and exits to an empty real workbook. |
| F2 undeclared claims | Closed. 15 claims have one tagged browser test each. |
| F3 broken Studio checkout | Closed in product behavior. No broken checkout is offered; billing registration is named as an external dependency. |
| F4 first screen and copy | Closed. Job, audience, sample action, result, and three facts appear before scrolling on desktop and phone. |
| F5 404 | Closed. Unknown live routes return designed HTTP 404 responses. |
| F6 metadata and structure | Closed. Added canonical/OG/Twitter metadata, social image, icons, demo sitemap route, footer identity, and correct How it works content. |
| F7 touch targets | Closed. Header, footer, and legal-email links are at least 44px. |
| F8 skip focus | Closed. Skip now focuses `main`. |
| F9 copy audit | Closed. `.factory/copy-audit.md` records landing text and terminology. |
| F10 MIME and headers | Closed. Linked manifest returns `application/json`; live responses send CSP, Permissions-Policy, `X-Frame-Options`, and `nosniff`. |
| Earlier malformed-import defect | Remains closed with unit and browser recovery checks. |
| Earlier populated-ARIA defect | Remains closed with populated desktop/mobile Axe checks. |

## Verification

From the documented clean setup:

```sh
npm ci
npm run check
npm audit --omit=dev
```

- `npm run check`: pass — 4 Vitest tests, production build, 40 Playwright tests across desktop and phone.
- `npm audit --omit=dev`: pass — 0 vulnerabilities.
- All 15 exact commands in `.factory/claims.json` were run separately with the desktop demo sandbox and passed.
- `/opt/fleet/lib/verify-url.sh` passed locally and against the live HTTPS origin: title, language, one h1, main, alt text, labels, and console checks are clean.
- Live Axe checks on fresh desktop and 390px phone demo contexts found zero violations, including zero serious or critical findings.
- Fresh live desktop and phone contexts verified the first screen, sample plan, persistent banner, reset, Start for real, and no sample data in the real workbook. Both had zero console or page errors.
- Live headers include CSP with response-header `frame-ancestors 'none'`, Permissions-Policy, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`. The linked manifest returns `application/json`. An unknown route returns HTTP 404 with the designed page.
- Offline reload, update notice, JSON/CSV export, import recovery, print media, reduced motion, keyboard dialogs, focus, and request privacy are covered by the browser suite.

## Performance

| Asset | Result |
| --- | ---: |
| Initial JS | 32,550 B raw / 10,440 B gzip |
| CSS | 16,073 B raw / 4,360 B gzip |
| Fonts | 0 B |
| Hero WebP | 208,060 B |

All assets are within the product budgets. Local Lighthouse produced 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO, LCP 1.47 s, and CLS 0. The CLI then reported a Chromium tab crash while finalizing, so those Lighthouse numbers are retained as provisional environment evidence.

## Known external dependency

Studio checkout cannot be re-enabled until the separate billing-registration operator registers the existing one-time Studio offer. The former public endpoint returned HTTP 404 before this repair. The product deliberately does not claim that a purchase can start, and it does not simulate payment. Registration metadata is in `/work/.evidence/billing-offer.json`; it contains no credentials.

## Deploy

Deploy the built `dist/` folder as a static site. The durable deployment configuration is `public/staticwebapp.config.json`. No backend, volumes, replicas, or product data stores are involved.
