# Independent verification 3 — PASS

**Candidate tested:** `b4dee2330890094e978b8beda764d06cd7932919`
**Live URL:** <https://solo-practice-bridge.sociobot.in/>
**Verified:** 2026-08-28 UTC
**Verdict:** **PASS** — the live deployment is byte-identical to the candidate production build and passed the clean-install, functional, accessibility, PWA, privacy, policy, and performance checks below. No release-blocking defects were found.

This verification did not modify product source code. Testing was performed from a clean detached worktree at the exact candidate SHA; the report and handoff are the only verifier changes in the repository.

## Clean-checkout gates

| Check | Fresh result |
| --- | --- |
| Clean detached checkout | Passed at exactly `b4dee2330890094e978b8beda764d06cd7932919`; no tracked changes before install |
| `npm ci` | Passed; 60 packages installed, 61 audited, 0 vulnerabilities |
| `npm test` | Passed: 4/4 Vitest domain tests |
| `npm run build` | Passed: `tsc --noEmit` then Vite production build; generated `dist/` |
| `npm run test:e2e` | Passed: 8/8 Playwright tests across desktop and the configured iPhone 13 / 390px project |
| `npm audit --omit=dev` | Passed: 0 vulnerabilities |
| Lint/type scripts | No separate lint script exists; TypeScript checking is part of the build |

## End-to-end product evidence

Independent fresh-browser runs exercised the actual brief workflow locally at production build output and again on the live origin.

- Created a realistic bridge containing repertoire, a goal, observed obstacle, self-authored drill, success cue, and both duration boundaries: 1-minute drill and 30-minute return to the piece.
- Native constraints rejected 0 and 31 minutes. Required transfer reflection input was also rejected until completed, leaving the dialog available for correction.
- Started, paused, advanced drill → piece → reflection, saved an `Almost` transfer observation, and confirmed it entered the teacher-ready history.
- Dismissed an archive confirmation and verified the active bridge remained intact.
- Reproduced the formerly dangerous incomplete import shape (only `id`, `piece`, and `drill`). It was rejected before any replacement confirmation; the existing bridge persisted after reload with no page error.
- Imported a complete valid JSON backup, accepted the explicit replacement confirmation, and verified it persisted after reload. JSON backup and CSV history export both produced the expected downloads.
- Verified print media retains the bridge ledger while hiding hero, site navigation, and practice controls.
- Privacy and terms routes are directly reachable.

## Accessibility, keyboard, responsive, and visual checks

- Populated-workspace Axe 4.10.2 scans with `wcag2a`, `wcag2aa`, `wcag21a`, and `wcag21aa` found **0 serious or critical violations** on local desktop, local 390px mobile, live desktop, and live 390px mobile.
- The rendered page has `lang="en"`, a descriptive title, exactly one `h1`, a `main` landmark, labeled form fields, live status, and direct legal routes.
- Keyboard-only smoke: Enter opened the plan dialog and Escape closed it. Focus on the primary action had the designed 3px rust focus outline (`rgb(155, 63, 47)`), not a removed/default-invisible focus state.
- At 390px, `scrollWidth === clientWidth === 390` on a populated bridge. Visible tested action buttons were 44–49px high; the mobile layout stacks the workbench in task order without horizontal overflow.
- Under reduced motion, button transitions resolve to `0.00001s` as specified.
- Live desktop and mobile visual inspection confirmed the documented concrete/moss workbench system, legible hierarchy, and intentional mobile stacking. No console errors or uncaught page errors occurred during normal, validation, import-recovery, offline, or update tests.

## PWA, local-first storage, privacy, and outbound requests

- The manifest has standalone display, a versioned start URL, matching theme/background colors, and 192/512 maskable-capable icons. Service-worker control was achieved on the live URL.
- On fresh live desktop and 390px contexts, a newly saved bridge survived an explicit `context.setOffline(true)` reload; the offline notice appeared and there were no browser errors.
- The update path was independently exercised on an isolated static server serving the exact `dist/` content while changing only service-worker cache version `bridge-v7` → `bridge-v8`. `registration.update()` showed **An update is ready**; **Update now** activated the new worker, produced `bridge-v8-shell` and `bridge-v8-runtime` caches, reloaded successfully, and retained the saved bridge.
- Normal free-flow request capture contained only the applicable app origin (local or `https://solo-practice-bridge.sociobot.in`). No analytics, third-party fonts/scripts, microphone/audio, or cloud-data requests were observed.
- Source and runtime checks confirm plans/sessions use IndexedDB. License token/state use localStorage only after an explicit license action; the only external request in source is the deliberate Sociobot license-verification endpoint. Core planning, exports, and history are usable without it.

## Build budgets and Lighthouse

| Asset | Fresh production build result | Budget |
| --- | ---: | ---: |
| Initial main JS | 28,345 B raw / 9.31 kB gzip | ≤ 200 kB |
| CSS | 13,848 B raw / 3.94 kB gzip | ≤ 50 kB |
| Fonts | 0 B / no webfont requests | ≤ 120 kB |
| Hero WebP | 208,060 B | ≤ 300 kB mobile |

Fresh local-production Lighthouse mobile-style run: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.0 s, LCP 1.1 s, TBT 140 ms, interactive 1.3 s, CLS 0.

## Live deployment identity and response policy

Fresh live downloads byte-match the candidate build exactly:

| File | SHA-256 |
| --- | --- |
| `assets/main.js` | `e0b3370597622baedcc938c4ab185fb4c620556c2a026e7017e62fb70c0cc536` |
| `assets/style.css` | `a6c7f75af4d6b54f56af84808f42a17f0ead6ca42e95374200e4b767e7a1470e` |
| `sw.js` | `175e4cc345fbb3e136304c1a31a097187baf62efddccc13a45d567ff7e8a15ae` |
| `manifest.webmanifest` | `3245595b0aac037ea88c82579e8d14c64ce9124659d8f9e7560d86a04d085588` |
| `offline.html` | `c59b62f6b77f010e626e957fdb0cac008235ec64992fd0e1e61feadc8c396c8b` |

`/`, `/privacy/`, `/terms/`, `/manifest.webmanifest`, `/sw.js`, `/offline.html`, app JS/CSS, and the hero asset all returned HTTP 200. Responses use HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and conservative update-safe `Cache-Control: public, must-revalidate, max-age=30` for the deliberately unhashed asset names.

## Defects by severity

### Release-blocking / High / Medium

None found.

### Low — deployment hardening observations (not a product release failure)

1. `manifest.webmanifest` is served as `application/octet-stream`, rather than `application/manifest+json`. Chromium recognized and used the manifest in testing, but the standard manifest MIME type is safer for interoperability.
2. The live host does not currently send CSP, `Permissions-Policy`, or a frame-ancestor / `X-Frame-Options` policy. This static, no-third-party application passed all functional/privacy checks; these are hosting-layer defense-in-depth improvements.

## Verification conclusion

The previously failed import and populated-bridge accessibility paths are both covered and pass on this candidate. The candidate meets the researched brief’s local, self-authored drill-to-piece workbook job, including offline persistence, export/import ownership, teacher-ready history, accessibility-friendly timing, and print support. **PASS.**
