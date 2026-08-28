# Independent verification — FAIL

**Candidate:** `f0a576d0afd6ef2ba9fd1fc5658d260e6e86f9d6`
**Production URL:** <https://solo-practice-bridge.sociobot.in/>
**Verified:** 2026-08-28 (UTC)
**Verdict:** **FAIL** — the import path accepts malformed user data, writes it over the local workbook, and makes the workbook fail on the next reload. This violates the brief's local-first ownership promise and the required invalid-input/recovery behavior.

## Release-blocking defect

### High — malformed backup can corrupt the local workbook

`validateImport` in `src/domain.ts` accepts a plan containing only `id`, `piece`, and `drill`. It does not require `revisitDates` (or most other fields that the renderer uses). `importFile` then clears IndexedDB and writes the supplied data before rendering it.

Reproduced against the clean production build and separately against the live URL with this otherwise accepted JSON shape:

```json
{
  "version": 1,
  "exportedAt": "2026-08-28T00:00:00.000Z",
  "plans": [{ "id": "malformed-plan", "piece": "Broken Import", "drill": "one note" }],
  "sessions": []
}
```

1. Use **Import backup**, select the JSON above, and accept the replacement confirmation.
2. The application reports `Import did not work. Cannot read properties of undefined (reading 'find')` after already replacing the database.
3. Reload. The page emits the uncaught error `Cannot read properties of undefined (reading 'find')`; both the status strip and workspace are blank. The only remaining recovery is manually clearing site data or importing a valid backup, which the broken workspace no longer exposes.

This can turn a user-supplied file into an unrecoverable-looking data loss event. Validate the complete exported schema, including dates and all rendered properties, before any destructive transaction; reject invalid data without clearing the existing stores. Ideally stage/validate the import and retain an automatic rollback copy until rendering succeeds.

## Evidence collected

### Clean checkout and repository gates

A fresh detached clone of the repository was checked out at exactly the candidate SHA. It was clean before installation.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 61 packages audited, 0 vulnerabilities |
| `npm test` | Passed: 4/4 Vitest tests |
| `npm run build` | Passed: TypeScript no-emit check and Vite production build; `dist/` created |
| `npm run test:e2e` | Passed: 6/6 Playwright tests (desktop and iPhone 13/390px profile) |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Lint/type scripts | No separate lint script is defined. Type checking is part of `npm run build`. |

### Product exercise

On the production Vite preview, in fresh desktop and 390px mobile Chromium contexts, I verified:

- Empty state and normal path: created a plan with a named piece, goal, observed obstacle, drill, success cue, and the legal boundary durations of 1 and 30 minutes.
- Invalid/recovery paths: blank required fields and duration values 0 and 31 were blocked by native constraints; the plan dialog remained open for correction. A blank transfer reflection was also blocked by its required controls.
- Loop workflow: opened the timer, started/paused it, advanced drill → piece → reflection, recorded an `Almost` success result and transfer note, and confirmed it appeared in history.
- Archive cancellation: dismissing the native archive confirmation preserved the active bridge.
- Persistence/offline: after service-worker control, a new offline page load retained the plan and history, showed the offline notice, and had no page errors.
- Legal routes: `/privacy/` and `/terms/` are directly reachable.
- Export and print controls are present; print was not sent to a physical printer.

The malformed import case above is the exception that causes the FAIL verdict.

### Accessibility, interaction, and visual checks

- One `h1`, a `main` landmark, `lang="en"`, titles, labeled form fields, skip link, keyboard-operable native dialogs, and designed visible focus outline were present.
- Axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) returned **0 serious/critical violations** at desktop and 390px.
- Keyboard-only smoke test reached the focused skip link, then the main workspace action; dialogs closed with Escape and did not trap focus.
- At 390px CSS width there was no horizontal overflow (`scrollWidth === clientWidth === 390`). Visible controls met the 44px target; hidden dialog controls were excluded from geometry checks.
- With `prefers-reduced-motion: reduce`, button transition duration became `0.00001s` as designed.
- Desktop and mobile visual inspection found the documented concrete/moss system intact, readable, and stacked in task order on mobile. No console or page errors occurred in normal use.

### PWA, privacy, and network checks

- Chrome DevTools reported no manifest installability errors on both the local production build and the live origin. The manifest has standalone display, versioned start URL, 192/512 maskable icons, and matching theme/background colors.
- Service worker control, precache, offline reload, and explicit update flow were exercised. In an isolated test server that changed only the served `/sw.js` response, `registration.update()` produced an installed waiting worker, the in-app **An update is ready** toast appeared, and **Update now** activated it without errors.
- A normal free-flow browser run made no outbound requests: only the product origin was requested. Source inspection confirms practice records use IndexedDB; the optional license token/state use localStorage and only the deliberate restore/verification flow calls Sociobot billing. No third-party fonts, analytics, microphone, or audio requests were observed.

### Performance and bundles

| Item | Result |
| --- | --- |
| Initial application JS | 27,156 bytes raw / 8,860 bytes gzip (`dist/assets/main.js`), below 200 KB |
| CSS | 13,839 bytes raw / 3,940 bytes gzip |
| Fonts | None shipped or fetched |
| Hero | 208,060-byte WebP, below the 300 KB mobile target |
| Lighthouse mobile, local preview | Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.3 s, TBT 100 ms, CLS 0 |

The Lighthouse run emitted a `TARGET_CRASHED` error while collecting its final screenshot after gathering the displayed category/audit data. The metrics above are therefore recorded as provisional environment evidence, not as a clean Lighthouse completion. Lighthouse also estimated 146 KiB savings from a responsive hero variant; the current 208 KB hero remains within the stated mobile budget.

### Live deployment and browser response policy

The deployed asset bytes match the candidate production build exactly:

| File | SHA-256 |
| --- | --- |
| `assets/main.js` | `d6a64f1a951564d7f3ca83b972b98ba8c298c2dbbdfc51c26221906e21a3719d` |
| `assets/style.css` | `c01111cefd0fa2de4aea3b74b8c5d1ae22155d7262084438dda87e06cb21bcab` |
| `sw.js` | `73299c3efa374878b3c6f9f5a7510735faf6fe1c1b43b7eedbcb410101f38fb6` |
| `manifest.webmanifest` | `3245595b0aac037ea88c82579e8d14c64ce9124659d8f9e7560d86a04d085588` |

`/`, `/privacy/`, `/terms/`, `/offline.html`, `/sw.js`, the manifest, and application assets all returned HTTP 200 on the live origin. Live responses use Brotli where applicable, `cache-control: public, must-revalidate, max-age=30`, HSTS, `referrer-policy: strict-origin-when-cross-origin`, and `x-content-type-options: nosniff`. The short revalidation cache is update-safe for the deliberately unhashed filenames. No CSP, Permissions-Policy, or clickjacking header was observed; this is a deployment hardening observation, not the reason for this FAIL.

## Required remediation and re-verification

1. Make import validation schema-complete and reject invalid records before clearing either IndexedDB store.
2. Add an automated browser regression that imports the malformed JSON above, asserts existing records are preserved, and verifies a reload has no page error.
3. Re-run the clean-checkout gates and the PWA/import cases, then issue a new verification report and verdict.
