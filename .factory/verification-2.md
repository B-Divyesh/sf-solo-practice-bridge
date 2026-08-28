# Independent verification 2 — FAIL

**Candidate:** `1a0eaf15a5aa69b6a9ae33267293876fa554e1ea`
**Live URL:** <https://solo-practice-bridge.sociobot.in/>
**Verified:** 2026-08-28 UTC
**Verdict:** **FAIL** — the actual bridge workspace has an Axe **serious** WCAG 2.1 A / 4.1.2 violation at desktop and 390px. The acceptance contract requires no serious or critical findings.

## Release blocker

### High — invalid ARIA on every created bridge

After saving any bridge, `src/main.ts:147` emits:

```html
<div class="bridge-joint" aria-label="Then return to the piece"><span aria-hidden="true">→</span></div>
```

The `div` has no valid role, so its `aria-label` is prohibited. Axe 4.10.2 reports `aria-prohibited-attr`, **serious**, tagged `wcag2a` / `wcag412`, with the message: “aria-label attribute cannot be used on a div with no valid role attribute.” This was reproduced independently on the clean production build and again on the live URL after the normal create-plan flow, in desktop and 390px contexts.

The repository Axe test only scans the initial empty workspace, before this dynamically rendered element exists, so it misses the defect. Remove the invalid ARIA attribute, expose appropriate visible/screen-reader text, or give the element a semantically appropriate role; then add a regression that scans a populated bridge.

## Exact evidence

### Clean checkout and automated gates

A new detached clone was checked out at the specified SHA and was clean before installing dependencies.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 60 packages installed, 61 audited, 0 vulnerabilities |
| `npm test` | Passed: 4/4 Vitest tests |
| `npm run build` | Passed: TypeScript `--noEmit` then Vite production build, producing `dist/` |
| `npm run test:e2e` | Passed: 8/8 Playwright cases (4 desktop, 4 iPhone 13/390px); Playwright’s result file reports `status: passed` |
| Separate lint/type check | No lint script exists; the TypeScript check is part of `npm run build` |

The production build is small: `main.js` 28,301 B raw / 9.30 KB gzip, CSS 13,839 B raw / 3.94 KB gzip, no fonts, and hero WebP 208,060 B. All are inside the stated 200 KB JS, 50 KB CSS, 120 KB font, and 300 KB hero budgets.

### Independent end-to-end exercise

On both the local production preview and the live host, in fresh desktop and 390px Chromium contexts, I independently:

- created a representative “Autumn Leaves, bars 17–24” bridge with goal, observed obstacle, concrete drill, and success cue;
- exercised both allowed duration boundaries (1-minute drill, 30-minute return), started and paused the timer, advanced drill → piece → reflection, recorded an `Almost` transfer note, and saw it in history;
- confirmed empty required plan and reflection submissions stay open for correction; native number constraints reject values outside 1–30;
- downloaded JSON backup and CSV history; malformed-import JSON was rejected before confirmation and preserved the existing bridge;
- verified persistence after service-worker control and an explicit offline reload, including the “Offline · changes stay here” state;
- verified no console errors or page errors in normal, invalid-input, import-recovery, or offline paths.

Normal free-flow request capture contained only the page’s own origin. No analytics, third-party fonts/scripts, microphone/audio requests, or API calls were observed. Source and rendered privacy notice confirm plans/sessions use IndexedDB; optional license tokens use localStorage and only a deliberate checkout/license verification contacts Sociobot.

### Accessibility, keyboard, visual, and motion checks

- Semantic basics are present: `lang="en"`, titles, a single `h1`, skip link, main landmark, labeled fields, live status, and direct `/privacy/` and `/terms/` routes.
- Keyboard-only smoke at 390px reached the skip link, home, primary action, loop link, secondary action, empty-state action, and print action. Each received the designed 3px `:focus-visible` outline; dialogs opened with Enter and closed with Escape.
- The only serious/critical Axe finding is the High defect above. It appears after plan creation; initial-empty-screen Axe passes are therefore not sufficient.
- At 390px, `documentElement.scrollWidth === clientWidth === 390`; the populated bridge stacks without horizontal overflow. The reduced-motion media query makes transitions `0.00001s`.
- Desktop/mobile visual inspection found the documented concrete-and-moss visual system, readable controls, and task-order stacking intact.

### PWA and update behavior

- The live manifest, standalone display, versioned start URL, 192/512 icons, service-worker control, precache, and offline reload all work.
- An isolated static-server update simulation served only a changed service-worker version (`bridge-v6` → `bridge-v7`). Calling `registration.update()` produced `waiting: true`; the live-style **An update is ready** toast appeared, and **Update now** caused the controlled page to reload. This verifies the shipped update path without altering product code.

### Deployment identity, policies, and performance

Fresh live downloads exactly match this candidate’s production build:

| File | SHA-256 |
| --- | --- |
| `assets/main.js` | `d154e6a5c4ab0c6d96a018ac9f454df971664fb23dc57220277a47fe444946f1` |
| `assets/style.css` | `c01111cefd0fa2de4aea3b74b8c5d1ae22155d7262084438dda87e06cb21bcab` |
| `sw.js` | `509264fce5767ba78abce550545db7dc08bfe8a10d2eaa5ab789a7e4be517cf9` |
| `manifest.webmanifest` | `3245595b0aac037ea88c82579e8d14c64ce9124659d8f9e7560d86a04d085588` |
| `offline.html` | `c59b62f6b77f010e626e957fdb0cac008235ec64992fd0e1e61feadc8c396c8b` |

`/`, `/privacy/`, `/terms/`, `/manifest.webmanifest`, `/sw.js`, `/offline.html`, JS, CSS, and hero all returned HTTP 200. Live responses use HSTS, `referrer-policy: strict-origin-when-cross-origin`, `x-content-type-options: nosniff`, and `cache-control: public, must-revalidate, max-age=30` (conservative and update-safe).

Live Lighthouse produced Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.5 s, TBT 10 ms, CLS 0. Lighthouse then reported a container Chromium tab crash while finishing, so these are provisional environment metrics rather than a clean completed run.

## Lower-severity deployment observations

- **Low / infrastructure:** live responses do not set CSP, `Permissions-Policy`, or frame-ancestors/X-Frame-Options. This did not cause the product failure and is outside the static repository, but the deployment should add these policies.
- **Low / infrastructure:** the manifest is served as `application/octet-stream` rather than a manifest MIME type. Chromium still recognized it in the PWA checks; serving `application/manifest+json` is safer interoperability hardening.

## Required before acceptance

1. Correct the invalid `aria-label` at `src/main.ts:147` with accessible semantics that do not create an ARIA violation.
2. Extend the Axe regression to create at least one populated plan before scanning, in both configured viewports.
3. Re-run the clean-checkout gates and independent populated-workspace Axe scan, then issue a new verification report.
