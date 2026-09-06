# Review 1 — FAIL

**Verdict:** **FAIL**
**Findings:** **10** (3 High, 6 Medium, 1 Low)
**Untested public claims:** **14**
**Reviewed:** 2026-09-06 UTC
**Live URL:** <https://solo-practice-bridge.sociobot.in>
**Implementation reviewed:** `c6b2118c43f4e5a7f085002b01ad946bcf2e17d4`
**Previous documentation baseline:** `baf2ee503ca6bf1306b3df4e5159c992e9d93b08`
**Repository base:** `8dd1cea0a5c51a1858f317215c5cda606f3374c0`

The implementation SHA is the last commit that changed product source, tests, or public files. The later `b4dee23` candidate changed only Graphify output, `baf2ee5` changed reports, and `8dd1cea` changed only Graphify output. Fresh live downloads of `assets/main.js`, `assets/style.css`, `sw.js`, `manifest.webmanifest`, and `offline.html` byte-match the clean build from repository base. No new product image is required to establish identity.

## Findings

### F1 — High — The required sample sandbox does not exist

There is no **Try it with sample data** action on the first screen. Both `/?demo=1` and `/demo` render the empty real workbook. Neither route contains sample data, the persistent **Demo — sample data, nothing is saved** label, **Reset demo**, or **Start for real**. Source uses the same IndexedDB database, `solo-practice-bridge`, regardless of route. A visitor opening either advertised demo entry shape would therefore read and change real local records rather than an isolated namespace. `.factory/demo.md` is also absent.

This prevents the required one-click sample exercise, populated-output check, reset check, and proof that sample actions leave real data unchanged.

### F2 — High — All 14 public claims lack declared claim tests

`.factory/claims.json` is absent. There are no `@claim:<id>` tests or claim commands. The normal Vitest and Playwright suites pass, and this review independently observed several outcomes, but those checks do not satisfy the required one-test-per-public-claim registry. The 14 unique public promises found on the live site and in README are:

1. A piece obstacle can be mapped to a timed drill/piece loop and transfer record.
2. Revisit dates are spaced automatically.
3. Plans and sessions persist in local browser storage.
4. History is printable and teacher-ready.
5. JSON backup export and import work.
6. History exports as CSV.
7. The product is installable as a PWA.
8. The workbook works offline after the first visit.
9. An update prompt appears when a new app version is ready.
10. Practice data stays in the browser; normal use has no account, microphone, analytics, or cloud sync.
11. The free tier permits one active bridge and unlimited sessions, printing, and exports.
12. A $12 one-time Studio purchase permits unlimited active bridges.
13. A valid license can be restored on another device.
14. The product does not listen, grade audio, generate lessons, or replace a teacher.

Each is contractually untested until it appears in the registry with exactly one tagged sandbox test. This is true even where the independent outcome below passed.

### F3 — High — The live purchase action is broken

The visible **Buy Studio unlock** link targets `https://api.sociobot.in/api/v1/products/solo-practice-bridge/checkout`. A direct GET to that exact link returned HTTP 404 with `{"error":"enabled factory product","status":404}`. Invalid-license verification itself returned a normal `valid:false` response, and the UI recovered with a useful error. The advertised $12 purchase cannot start, so the paid-tier claim is false in production.

### F4 — Medium — The first screen does not state the job, audience, and required first action

Desktop and phone show the metaphor headline **Make the drill meet the music.** instead of a title naming the job. The supporting copy does not identify intermediate self-taught musicians who no longer have regular teacher feedback. The primary action is **Build a practice bridge**, not the required sample action, and it has no adjacent explanation of what happens next. The required three short privacy/offline/price facts are not present together on the first screen.

### F5 — Medium — Unknown routes do not produce the required 404

`/404` and `/definitely-not-a-real-route-review-1` both return HTTP 200 and render the normal home screen with the home title and heading. There is no `404.html` and no deployment route configuration for a designed not-found response. A deliberate HTTP 404 would be expected; this is instead a missing route and misleading success response.

### F6 — Medium — Required site structure and metadata are incomplete

The home and legal pages have no canonical link, Open Graph metadata, Twitter card metadata, Apple touch icon, or 1200×630 social image. The footer omits **Built by Param Factory** and a version/build identifier. The sitemap has no demo route. The apparent **See the four-part loop** link targets `#how`, whose heading is **Your notes stay yours** and which contains data/export and license material rather than a three-step or four-step explanation. `staticwebapp.config.json` is absent.

### F7 — Medium — Several phone touch targets are shorter than 44 px

At 390 px, the wordmark link is 26 px high and the Privacy and Terms footer links are about 25 px high. On legal pages the email links are 17 px high. These are visible interactive targets and do not meet the 44×44 px accessibility baseline. Axe does not report target-size failures in this configuration, so its clean result does not close this finding.

### F8 — Medium — The skip link does not move keyboard focus to main content

The skip link receives a clear 3 px focus ring. Activating it changes the URL to `#main`, but `document.activeElement` becomes `BODY`, not the main landmark or its heading. A keyboard user has not actually moved focus past the repeated navigation.

### F9 — Medium — The required plain-words proof is absent and public copy exceeds the limit

`.factory/copy-audit.md` is absent. Public examples over the 22-word hard cap include the 26-word README description sentence, the 33-word privacy license-verification sentence, and the 25-word terms sentence about record loss. The metaphor headline is also prohibited by the plain-words contract, separately reflected in F4.

### F10 — Low — Earlier hosting hardening findings remain open

The live manifest is still served as `application/octet-stream`, not `application/manifest+json`. Responses still lack Content-Security-Policy, Permissions-Policy, and frame-ancestor/X-Frame-Options protection. HSTS, `Referrer-Policy`, and `X-Content-Type-Options` are present. These are the same minor findings recorded in verification 2 and verification 3.

## Product exercise and passing evidence

All browser work used fresh, isolated Chromium contexts; no existing user profile or real workbook data was read or changed.

- Desktop 1440×900 and phone 390×844: created a realistic Autumn Leaves bridge using the valid 1-minute and 30-minute boundaries. Empty required fields, 0 minutes, and 31 minutes were rejected with browser validation.
- Advanced drill → piece → reflection, recorded a transfer observation, and saw the populated history. JSON contained one plan and one session; CSV contained the transfer note.
- Valid backup import showed the specific replacement confirmation and restored the plan. The former incomplete-backup payload was rejected before confirmation, the existing plan survived reload, and no browser error occurred.
- Cancelled archive preserved the plan. Attempting a second active bridge opened the Studio explanation.
- Print media retained plan/history and hid header, hero, and controls. At 200% text size the 390 px page retained all text with no horizontal overflow.
- After service-worker control, an offline reload retained the plan and showed **Offline · changes stay here** on both viewports.
- Keyboard Enter opened the plan dialog and Escape closed it. Reduced motion resolved transitions to `0.00001s` and scrolling to `auto`.
- Axe 4.10.2 found zero WCAG 2 A/AA serious or critical violations on empty and populated desktop/phone pages and on the legal/demo/unknown-route responses. Normal-flow request capture had no external request and no console or page errors.
- `/privacy/` and `/terms/` returned 200 with distinct titles, one h1, and privacy/support email links. Invalid license verification returned a clear recoverable error.
- The shipped image, type, palette, spacing, and mobile stacking match `.factory/design.md`. The brief deliberately calls for a non-AI workbook, so there is no missed-AI-leverage finding.

## Clean checkout and commands

A fresh clone at `8dd1cea0a5c51a1858f317215c5cda606f3374c0` was used. Product files at that revision are unchanged from implementation `c6b2118`.

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 60 packages installed, 0 vulnerabilities |
| `npm test` | Pass; 4/4 tests |
| `npm run build` | Pass; `dist/` created |
| `npm run test:e2e` | Pass; 8/8 desktop/mobile tests |
| `npm run check` | Pass; repeated all three declared gates |
| `npm audit --omit=dev` | Pass; 0 vulnerabilities |
| Claim commands from `.factory/claims.json` | None could be run because the required file is missing (F2) |
| `/opt/fleet/lib/verify-url.sh` | Pass; HTTP 200, title/lang/main/alt/buttons and console checks passed |

Fresh build sizes: main JS 28,345 B raw / 9,275 B gzip; CSS 13,848 B raw / 3,948 B gzip; hero WebP 208,060 B; no webfonts. These meet the stated static budgets. A fresh Lighthouse 12.8.2 attempt gathered 100/100/100/100 category scores, LCP 0.9 s, and CLS 0, then exited with `TARGET_CRASHED` while taking its full-page screenshot. This reproduces the earlier container-only collection issue; Playwright screenshots completed separately.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Incomplete import could replace and corrupt records | Closed. Unit test, clean E2E, and independent live malformed-import recovery pass. |
| Populated bridge used prohibited `aria-label` on a plain div | Closed. Current markup exposes hidden text; populated Axe passes on both viewports. |
| Manifest MIME type | Open as F10. |
| Missing CSP, Permissions-Policy, and clickjacking policy | Open as F10. |
| Lighthouse final-screenshot tab crash | Recurred after metrics were gathered; recorded as environment-limited evidence, not a product defect. |

## Evidence

- `/work/.evidence/review-1/live-audit.json`
- `/work/.evidence/review-1/live-edge-audit.json`
- `/work/.evidence/review-1/desktop-initial.png`
- `/work/.evidence/review-1/mobile-initial.png`
- `/work/.evidence/review-1/mobile-populated.png`
- `/work/.evidence/review-1/demo-query.png`
- `/work/.evidence/review-1/unknown-route.png`
- `/work/.evidence/review-1/mobile-200-percent-text.png`
- `/work/.evidence/review-1/verify-url/verify.json`
- `/work/.evidence/review-1/lighthouse.json`

## Conclusion

**FAIL.** The existing workbook is functional, local, fast, and accessible in its tested core paths, and both former High defects are closed. It cannot pass the current strict contract because it has no isolated sample demo, no claim registry, a broken production checkout, and seven additional site/copy/accessibility findings. A PASS requires zero findings and zero untested claims.
