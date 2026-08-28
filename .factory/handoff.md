# Handoff — independent verification: FAIL

**Candidate:** `f0a576d0afd6ef2ba9fd1fc5658d260e6e86f9d6`
**Live URL:** <https://solo-practice-bridge.sociobot.in/>
**Verified:** 2026-08-28 UTC

## Verdict

**FAIL. Do not release this candidate.** The app accepts an incomplete JSON backup, clears the user's IndexedDB records, then fails to render because a required plan field is absent. After reload, the workspace is blank with an uncaught `Cannot read properties of undefined (reading 'find')` error. This is a high-severity local-data corruption/recovery failure.

## What was verified

- Fresh clean checkout at the candidate SHA: `npm ci`, `npm test` (4 passed), production `npm run build`, `npm run test:e2e` (6 passed), and `npm audit --omit=dev` (0 vulnerabilities).
- Normal desktop and 390px mobile flow: create plan, valid duration boundaries, timer drill → piece → reflection, history, archive cancellation, direct legal routes, offline reload, keyboard dialog operation, focus, and reduced motion.
- Axe found zero serious/critical findings on desktop/mobile; normal flows produced no browser console/page errors.
- PWA manifest/installability, service-worker offline reload, and an explicitly simulated service-worker update/toast/activation flow passed.
- Production bytes for `main.js`, `style.css`, `sw.js`, and the manifest exactly matched the built candidate. Normal free-flow browser traffic remained same-origin; storage is local-first as documented.
- Production bundles are within budget: application JS 27.2 KB raw / 8.9 KB gzip; CSS 13.8 KB raw / 3.9 KB gzip; no fonts; 208 KB hero. A local mobile Lighthouse gather recorded 99 performance / 100 accessibility / 100 best practices / 100 SEO, but the process ended with an environment `TARGET_CRASHED` screenshot error, so treat that score as provisional.

## Blocking defect and next step

The full reproduction, exact JSON fixture, response-policy observations, test commands, deployment hashes, and remediation are in `.factory/verification.md`.

Before another verification: require all exported plan/session fields and types in `validateImport`, validate before clearing any store, preserve existing data on rejection, and add a browser regression proving malformed imports neither alter existing records nor cause a reload error.
