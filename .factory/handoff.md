# Handoff — Solo Practice Bridge v1

## What shipped

- A complete local-first practice workbook for turning one observed repertoire obstacle into a user-authored drill → piece loop.
- Plan capture for piece/passage, desired change, observed obstacle, drill, drill/piece timings, and an observable success cue.
- A keyboard-accessible drill/piece timer with pause, advance, and a required post-loop transfer reflection.
- Four spaced revisit dates (1, 3, 7, and 14 days), an eight-session progress target, multiple-session history, archival with undo, and explicit empty/error/offline states.
- IndexedDB persistence, JSON export/import, CSV export, and print-specific teacher-ready history. No practice data, audio, or analytics leaves the device.
- Installable PWA manifest, 192/512 and maskable icons, versioned service-worker caches, fresh shell precaching, cache-first assets, network-first navigation, offline fallback, and an in-app update action.
- One-time Sociobot paid unlock contract: production checkout link, URL token capture/cleanup, local cached verdict, daily-at-most background verification, invalid-license handling, restore field, and remove-from-device action. Free includes one active bridge plus unlimited sessions, history, print, and export; $12 Studio adds unlimited active bridges.
- Standalone `/privacy/` and `/terms/` pages, README, MIT license, robots/sitemap, and original product imagery with full provenance in `.factory/design.md`.

## Visual system

The product uses the documented “brutalist concrete and moss” system: warm concrete/paper surfaces, dark structural rules, hard physical shadows, moss-green transfer states, Georgia editorial headings, system UI/mono utilities, an 8px rhythm, and motion that disappears under reduced-motion. The original Azure-generated hero is 208 KB WebP and was manually inspected for brands, text artifacts, people, and misleading capability cues.

## Verification performed

All checks were run against the production Vite build on 2026-08-28.

```sh
npm ci
npm run check
npm audit
```

- Unit tests: 4 passed.
- Playwright 1.58.2: 6 passed across desktop Chromium and a 390px mobile Chromium profile.
- End-to-end coverage: create plan → timed alternation → transfer note → persisted history → offline reload; direct legal routes; keyboard dialog operation.
- Playwright Axe: zero serious or critical WCAG 2/2.1 A/AA violations on desktop and mobile.
- Factory `verify-url.sh`: HTTP 200, title present, `lang="en"`, exactly one h1, main landmark present, zero missing image alts, zero unlabeled buttons, zero console/page errors; measured load 585 ms on the local preview.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab metrics: FCP 1.0 s, LCP 1.1 s, TBT 0 ms, CLS 0, Speed Index 1.0 s.
- Transfer budgets: initial main JS 9.2 KB, CSS 4.3 KB, no fonts, hero 208.3 KB. Source build sizes are 27.2 KB JS and 13.8 KB CSS uncompressed.
- `npm audit`: zero vulnerabilities.
- Visual review completed at 1280px desktop and 390px mobile widths; controls remain at least 44px and content stacks in workflow order.

Build output is exactly `./dist`, with `dist/index.html` at its root.

## Known gaps / factory follow-up

- The live billing product and test license are not registered in this repository, so checkout and a successful server-side license verdict could not be exercised end to end. The UI uses the required slug-based Sociobot endpoint; the factory should register the product and run one staging purchase before release. Set `VITE_BILLING_API=https://pilot-api.sociobot.in/api/v1` for that staging build, then omit it for production.
- There is intentionally no account or cross-device sync. Users must export a backup before clearing browser data or moving devices.
- Lighthouse’s experimental `agentic-browsing` category scored 67; it is outside the supplied product quality gates. All required Lighthouse categories scored 100.

## Next steps

1. Register the one-time product and return URL with the Sociobot billing factory, then complete a test-mode purchase using the registered staging product.
2. Deploy `dist/` with clean directory routes and immutable caching for `/assets/*`; keep `/sw.js` and HTML on revalidation-friendly cache headers.
3. Run a four-week pilot and evaluate the brief’s target: eight completed sessions and at least one named transfer for 60% of participants.
