# Strict review 2 — PASS

**Verdict:** **PASS**

**Findings:** **0**

**Untested public claims:** **0**

**Reviewed:** 2026-09-06 UTC

**Live URL:** <https://solo-practice-bridge.sociobot.in>

**Implementation reviewed:** `9e610dd6bcf55ea5620723c1b3b5777af007025b`

**Documentation baseline:** `849d903dde89ca596e5798b2b4935fe2398f2c77`

**Repository baseline:** `326bdf907ab2d15b6a3ca957b45a5216cfc4f569`

The implementation SHA is the last commit that changed product source, tests, or public assets. Later commits changed reports or Graphify output only. Fresh live copies of both app bundles, the stylesheet, service worker, manifest, offline page, and designed 404 byte-match the clean build from `9e610dd`.

## Result

**PASS.** The product performs the researched job end to end: a self-taught musician records one piece problem, alternates a short drill with the piece, and records what transferred. The review found zero defects at every severity and zero untested public claims. No product source was changed.

## First screen and demo sandbox

Fresh 1440×900 desktop and 390×844 phone contexts were opened at the live URL. Before scrolling, both showed:

- Job: **Connect a drill to your piece**.
- Audience: self-taught musicians without regular teacher feedback.
- First action: **Try it with sample data**, with the adjacent explanation that it opens a populated Autumn Leaves plan.
- Facts: records stay in this browser, offline use works after the first visit, and the free/Studio availability is stated.

All of this content fit in each first viewport. Each page had `lang="en"`, one `h1`, a `main` landmark, a route-appropriate title, and no horizontal overflow at the normal phone size.

The one-click action opened `/demo/` and immediately showed a realistic Autumn Leaves bridge, one transfer record, and four revisit dates. The persistent **Demo — sample data, nothing is saved** banner exposed **Reset demo** and **Start for real**. Added transfer notes survived a demo reload, reset removed them and restored the seed, and starting for real removed the demo data. In a desktop isolation check, an existing real record remained unchanged after entering, changing, resetting, and leaving the demo. A separate fresh phone context returned to an empty real workbook. No sample record crossed into real storage.

## Clean checkout and declared commands

A fresh detached checkout at exactly `9e610dd` was used. The documented Node.js setup needed no environment variables.

| Command | Result |
| --- | --- |
| `npm ci` | Pass — 60 packages installed; 0 vulnerabilities |
| `npm test` | Pass — 4/4 Vitest tests |
| `npm run build` | Pass — TypeScript and Vite build; `dist/index.html` produced |
| `npm audit --omit=dev` | Pass — 0 vulnerabilities |
| `npm run check` | Pass — 4 unit tests, production build, 40/40 Playwright tests across desktop and phone |

Every exact command in `.factory/claims.json` was then run separately from that clean checkout. Each command selected one tagged desktop sandbox test and passed:

| Claim | Result |
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
| `license-restore` | Pass with the declared recorded verification response |
| `scope-limits` | Pass |

The registry contains one `@claim:<id>` test for each of its 15 entries. Landing, demo, legal-page, manifest, and README statements map to these tested outcomes. No extra public capability claim was found.

## Functional, invalid, boundary, and recovery checks

- Created a real bridge with the legal duration boundaries of 1 and 30 minutes.
- Blank required input stayed in the dialog with the browser's field-specific correction message.
- Duration values 0 and 31 were rejected with the correct minimum and maximum messages.
- Completed drill → piece → reflection in both fresh live viewport contexts and saw the new transfer note in history.
- A malformed backup was rejected before any replacement confirmation. The existing bridge remained before and after reload, with no page error.
- The complete clean suite also covered valid JSON restore, CSV content, print media, archive confirmation and undo, free-tier limits, license restore, and populated-output persistence.
- The empty state states what will appear and offers the correct first action. Storage and import failures provide a reason and recovery step.

## Accessibility and interaction

- Live populated-demo Axe scans on desktop and phone found zero serious or critical WCAG 2 A/AA/2.1 A/AA violations.
- `/opt/fleet/lib/verify-url.sh` passed the live home page: HTTP 200, title, language, one `h1`, main landmark, image alt text, named buttons, and no console errors.
- The skip link moved focus to `main`. Enter opened the plan dialog; Escape closed it and returned focus to its trigger.
- The practice dialog exposed the expected `dialog` role, **Practice loop** name, named timer state, and named controls in the accessibility tree.
- Visible controls met the 44 px target checks. The only sub-44 geometry reported by a raw selector was the intentionally clipped file input inside its 44 px **Import backup** label.
- Focus uses a 3 px rust outline with 5.30:1 contrast against the concrete background. Tested text/background pairs exceeded 4.5:1.
- At the 200% effective-width check, all text and controls remained present and operable. At 390 px there was no horizontal overflow.
- With reduced motion, transitions resolved to `0.00001s`. There is no autoplay, flashing, or looping decorative motion.

## Privacy, PWA, routes, and links

- Normal real and demo workflows made only same-origin requests. No analytics, third-party font/script, microphone, audio, or cloud practice-data request occurred.
- IndexedDB names remain separated as `solo-practice-bridge` and `demo:solo-practice-bridge`; demo license keys use the separate `demo:` prefix.
- The deliberate license-restore action is the only product path that contacts the declared Sociobot billing origin. Its claim test uses a recorded valid response and spends nothing.
- Service-worker control, offline reload, retained records, and the visible offline state passed on the live URL. The controlled live `?test-update=1` revision showed **An update is ready** and **Update now** without an error.
- The manifest uses standalone display, a versioned start URL, and 192/512 icons. The live manifest returns `application/json`.
- `/`, `/demo/`, `/privacy/`, `/terms/`, `robots.txt`, `sitemap.xml`, the manifest, and the offline page return 200. All normal navigational destinations return 200; the two `mailto:` links are explicit.
- An unknown route returns the designed HTTP 404 page, its own title and `h1`, and a way home. The expected 404 resource message was classified as deliberate behavior, not a defect.
- Live headers include response-header CSP with `frame-ancestors 'none'`, Permissions-Policy, Referrer-Policy, `nosniff`, HSTS, and `X-Frame-Options: DENY`.

There is no backend. Backend tenant, SQLite restart, health, and 429 checks therefore do not apply. The brief deliberately specifies a non-AI local workbook; import/export already covers the useful ownership extension, so there is no missed-AI or missed-sync finding.

## Performance and deployment identity

| Item | Fresh result | Budget |
| --- | ---: | ---: |
| Initial JS | 32,550 B raw / 10,440 B gzip | ≤ 200 KB raw |
| CSS | 16,073 B raw / 4,360 B gzip | ≤ 50 KB raw |
| Fonts | 0 B | ≤ 120 KB |
| Hero WebP | 208,060 B | ≤ 300 KB |

A fresh local Lighthouse 12.8.2 run completed successfully: Performance 100, Accessibility 100, Best Practices 100, SEO 100, FCP 1.3 s, LCP 1.4 s, TBT 40 ms, and CLS 0. This closes the former environment-only final-screenshot limitation with completed current evidence.

Live and clean-build SHA-256 hashes match for `assets/main2.js`, `assets/style.css`, `assets/style.js`, `sw.js`, `manifest.json`, `offline.html`, and `404.html`.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Review F1: no isolated sample sandbox | Closed. The live sample is populated, labelled, resettable, and isolated from an existing real record. |
| Review F2: public claims untested | Closed. All 15 registered commands passed separately; no unlisted claim was found. |
| Review F3: broken Studio checkout | Closed in current behavior. No checkout link is offered; the external registration dependency is stated plainly. |
| Review F4: first screen and copy | Closed on fresh desktop and phone before scrolling. |
| Review F5: missing 404 | Closed. Unknown routes return the designed HTTP 404. |
| Review F6: metadata and structure | Closed. Titles, canonical/social metadata, original social art, icons, sitemap, standard sections, footer identity, and build id are present. |
| Review F7: undersized touch targets | Closed by live phone geometry and full browser checks. |
| Review F8: skip link focus | Closed. `main` receives focus. |
| Review F9: copy audit/plain words | Closed. `.factory/copy-audit.md` is present and first-screen copy meets the stated limits. |
| Review F10: MIME and response policies | Closed. Manifest MIME and all named response policies are live. |
| Earlier malformed-import corruption | Closed. Fresh live malformed import preserved the workbook through reload. |
| Earlier populated-workspace ARIA violation | Closed. Current semantics and populated desktop/phone Axe scans pass. |
| Earlier Lighthouse completion limitation | Closed. The fresh run completed with no warnings. |

## Evidence

- `/work/.evidence/review-2/desktop-initial.png`
- `/work/.evidence/review-2/desktop-demo.png`
- `/work/.evidence/review-2/phone-initial.png`
- `/work/.evidence/review-2/phone-demo.png`
- `/work/.evidence/review-2/verify-url/verify.json`
- `/work/.evidence/review-2/lighthouse.json`

## Conclusion

**PASS — zero findings and zero untested public claims.** Studio checkout registration remains an accurately disclosed external prerequisite. It exposes no broken purchase path and does not limit the useful free workbook.
