# Handoff — import-corruption repair

**Work order:** `solo-practice-bridge-repair-1`
**Base reviewed:** `f0a576d0afd6ef2ba9fd1fc5658d260e6e86f9d6` (the independent verifier report is retained in `.factory/verification.md`)
**Repair commit:** this handoff is included in the repair commit.

## Fixed release blocker

The malformed-backup data-loss path reported by independent verification is repaired. `validateImport` now validates the entire v1 persisted schema *before* the replacement confirmation and IndexedDB transaction:

- export timestamp, plan/session IDs, all rendered plan properties, date/datetime values, durations, archive state, and success-cue enum;
- the v1 UI field limits and four valid revisit dates;
- unique plan/session IDs and a corresponding plan for every session.

An invalid backup shows the existing import error and leaves the current workbook untouched. Only a fully valid payload reaches the single atomic `replaceData` transaction. `public/sw.js` advances from `bridge-v5` to `bridge-v6`, so installed copies receive this repaired application shell and show the existing update prompt.

## Regression coverage

- Unit: `tests/domain.test.ts` passes the verifier's exact malformed JSON (`id`, `piece`, `drill` only) and asserts rejection; a complete exported plan/session remains accepted.
- Browser: `tests/e2e/app.spec.ts` creates an existing bridge, uploads that exact malformed JSON, asserts the replacement confirmation is never reached and the error is shown, reloads, then confirms the old bridge remains and no page error occurred.
- This browser regression ran in both configured Chromium projects: desktop and iPhone 13 / 390px.

## Verification evidence (2026-08-28 UTC)

```sh
npm ci                         # passed: 60 packages installed, 0 audit vulnerabilities
npm run check                  # passed: 4 Vitest tests; typecheck + Vite production build; 8 Playwright tests
npm audit --omit=dev           # passed: 0 vulnerabilities
```

`npm run check` includes the normal bridge/timer/reflection/offline-reload path, keyboard dialog smoke test, direct legal routes, reduced-motion/a11y coverage, and Axe serious/critical checks. All 8 Playwright cases passed: 4 desktop and 4 mobile, including the new preservation/reload regression. The production build emits `dist/` with 28,301-byte raw main JS (9.30 KB gzip), 13,839-byte CSS (3.94 KB gzip), and the existing 208,060-byte WebP hero.

Additional local production-preview checks passed:

- service worker became controlling; a 390px offline reload showed the offline notice with no page errors and no horizontal overflow (`scrollWidth === clientWidth === 390`);
- a normal free-flow request capture was same-origin only, with no console/page errors; no analytics or third-party assets are used;
- mobile Lighthouse JSON recorded Performance 100, Accessibility 100, Best Practices 100, SEO 100 (FCP 0.2 s, LCP 0.2 s, TBT 0 ms, CLS 0). Chromium crashed only while Lighthouse captured its final screenshot after writing the JSON report, a repeat of the container-level `TARGET_CRASHED` condition; the recorded metrics are retained as provisional environment evidence;
- live pre-deploy identity check at `https://solo-practice-bridge.sociobot.in/` returned the expected Solo Practice Bridge title/manifest and HTTP 200 with HSTS, strict-origin referrer policy, and `nosniff`.

## Deployment

The repository has no deployment workflow or provider configuration; its documented static deployment contract is to publish `dist/` and the factory owns infrastructure. Repair commit `5d094c15e60c95f2b08fdb88ee673e157f91f9d9` was pushed to `main`. The factory deployment/status API remained `pending` with no configured status provider, and the live `/sw.js` still reported `bridge-v5` during the final check. Deployment therefore remains pending outside this repository; after propagation, verify live `/sw.js` contains `bridge-v6`, then accept the in-app **Update now** prompt in an already-installed client.

## Known gaps / next steps

None in the application repair. The live host does not currently send CSP, `Permissions-Policy`, or clickjacking protection headers; those are deployment-layer hardening items and are outside this static repository's authority.
