# Independent verification 4 — PASS

**Verdict:** **PASS**
**Findings:** **0**
**Untested public claims:** **0**
**Verified:** 2026-09-06 UTC
**Candidate implementation:** `9e610dd6bcf55ea5620723c1b3b5777af007025b`
**Documentation handoff:** `dd07afc`
**Repository documentation baseline:** `2b3286163ef5f27278e4f0b4e15216442035f141`
**Live URL:** <https://solo-practice-bridge.sociobot.in>

The live production assets byte-match a clean production build of implementation `9e610dd`. Later commits change only the handoff or Graphify output, so no newer product image required review. This verification changed no product source.

## Result

**PASS.** The product meets the researched job: a private local workbook for self-taught musicians to connect one observed piece problem to a modest drill, a return to the piece, and a recorded transfer. There are zero findings at every severity and zero untested public claims.

## Clean setup and declared claims

A fresh detached worktree at exactly `9e610dd` was used. `npm ci` installed 60 packages without vulnerabilities. `npm test` passed 4 Vitest tests; `npm run build` passed and produced `dist/`; `npm audit --omit=dev` found 0 vulnerabilities.

`npm run check` passed: 4 unit tests, production build, and 40 Playwright tests across desktop and phone. The following 15 declared commands were then run separately from the clean checkout; each passed with one outcome-based desktop demo test.

| Claim id | Result |
| --- | --- |
| `practice-loop` | Pass |
| `demo-isolation` | Pass |
| `spaced-revisits` | Pass |
| `local-persistence` | Pass |
| `print-history` | Pass |
| `json-backup` | Pass |
| `csv-history` | Pass |
| `pwa-install` | Pass |
| `offline-reload` | Pass |
| `update-notice` | Pass |
| `local-privacy` | Pass |
| `free-core` | Pass |
| `studio-availability` | Pass |
| `license-restore` | Pass (recorded verification response) |
| `scope-limits` | Pass |

The registry has one tagged test per public claim. Landing-page, README, privacy, and terms promises match the declared claim set; no unlisted public claim was found.

## Live product exercise

Fresh live Chromium contexts were used for independent 1440×900 desktop and 390×844 phone checks. Before scrolling, both showed:

- Job: **Connect a drill to your piece**.
- Audience: self-taught musicians without regular teacher feedback.
- First action: **Try it with sample data**, which opens the populated Autumn Leaves plan without saving real data.

All three visible facts were present: records stay in this browser, offline works after the first visit, and the free core/Studio registration status is stated. Phone had no horizontal overflow; its primary action, audience, and facts were visible in the first viewport.

The one-click demo opened `/demo/` with the realistic Autumn Leaves bridge, a transfer note, four revisit dates, and the persistent **Demo — sample data, nothing is saved** banner. **Reset demo** restored the seed sample. **Start for real** opened an empty real workbook in the same fresh context; sample data was absent. This verifies the isolated demo path without accessing another user's data.

The real-workbook exercise created a Blue Bossa plan, completed its drill → piece → reflection loop, exported CSV, archived it with an explicit confirmation, and exposed the reversible Undo action. A separate live recovery run confirmed blank fields and both invalid duration boundaries (0 and 31 minutes) remain correctable. A malformed backup was rejected before the replacement confirmation; the existing plan remained before and after reload, with no page errors. Offline reload retained the plan and transfer record and showed the offline notice. The controlled `?test-update=1` worker revision displayed **An update is ready** and **Update now**.

Normal live use generated only same-origin product requests. No microphone request, analytics, third-party font/script, or cloud practice-data request was observed. License restoration is a deliberate exception that contacts Sociobot only after an explicit token action; its recorded-response claim test passed.

## Accessibility, routes, and deployment

- Live Axe scans on populated desktop and populated 390px phone demo pages found **0 serious or critical** WCAG 2 A/AA/2.1 A/AA violations.
- The live desktop/phone flows had no console errors or uncaught page errors.
- Keyboard skip moves focus to `main`; dialogs operate with keyboard; the reduced-motion phone context resolves transition duration to `0.00001s`.
- `/opt/fleet/lib/verify-url.sh` passed against the live home page: HTTP 200, title, `lang=en`, one h1, main landmark, image alt coverage, labelled buttons, and zero console errors.
- `/privacy/` and `/terms/` return 200 with route-specific titles and one h1. `/not-a-real-solo-practice-bridge-page` returns a designed HTTP **404**, its own title, explanatory h1, and a home link. The deliberate 404 is expected behavior, not a defect.
- Live responses include CSP with response-header `frame-ancestors 'none'`, Permissions-Policy, Referrer-Policy, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`. `/manifest.json` returns `application/json`.

Clean-build and live SHA-256 values match for `assets/main2.js`, `assets/style.css`, `assets/style.js`, `sw.js`, `manifest.json`, `offline.html`, and `404.html`. The clean build reports 32,550 B raw / 10,440 B gzip initial JS, 16,073 B raw / 4,360 B gzip CSS, no webfonts, and a 208,060 B hero WebP; all are within the applicable budgets.

## Earlier finding disposition

| Earlier finding | Disposition and current evidence |
| --- | --- |
| Review F1: no isolated sample sandbox | Closed. `/demo/` is populated, visibly labelled, resettable, and exits to an empty real workbook. |
| Review F2: public claims untested | Closed. 15 claims are registered; all 15 exact commands passed separately. |
| Review F3: broken Studio checkout | Closed in behavior. Checkout is honestly unavailable pending external registration; no buy link remains, while free core and license restore work. |
| Review F4: first screen/copy | Closed. Job, audience, sample action, result, and three facts are visible before scrolling on desktop and phone. |
| Review F5: missing 404 | Closed. Live unknown route returns designed HTTP 404. |
| Review F6: metadata/site structure | Closed. Route titles, canonical/social assets, icons, sitemap, footer identity, and coherent How it works structure are present. |
| Review F7: undersized touch targets | Closed by mobile target checks in the browser suite and fresh phone exercise. |
| Review F8: skip link did not move focus | Closed. Fresh live phone check found `#main` focused after activation. |
| Review F9: missing copy audit/plain words | Closed. Copy audit exists and the live first screen uses plain job-focused language. |
| Review F10: manifest MIME and headers | Closed. Linked manifest is JSON and live security headers are present. |
| Earlier malformed import corruption | Closed. Fresh live malformed-import recovery rejected the file before replacement and retained the plan after reload. |
| Earlier populated-workspace ARIA violation | Closed. Populated live desktop and phone Axe scans have no serious or critical violations. |
| Lighthouse final-screenshot Chromium crash | Environment-only collection issue in prior reports; not reproduced as a product failure and not a public claim. Build-size and live interaction evidence are clean. |

## Evidence

- `/work/.evidence/verification-4-desktop-initial.png`
- `/work/.evidence/verification-4-phone-demo.png`
- `/work/.evidence/verification-4-404-phone.png`
- `/work/.evidence/verification-4-verify-url/verify.json`

