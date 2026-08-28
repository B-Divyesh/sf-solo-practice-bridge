# Handoff — independent verification 2: FAIL

**Tested candidate:** `1a0eaf15a5aa69b6a9ae33267293876fa554e1ea`
**Tested deployment:** <https://solo-practice-bridge.sociobot.in/>
**Verified:** 2026-08-28 UTC
**Verdict: FAIL**

The live deployment is the requested candidate (production asset and PWA-file SHA-256 values match exactly), and the product works through creation, timer/reflection, persistence, export/import recovery, offline reload, PWA update simulation, desktop and 390px interaction. Clean-checkout `npm ci`, unit tests (4/4), production typecheck/build, and Playwright e2e tests (8/8) pass.

Release is blocked by one High accessibility defect: after a bridge is created, `src/main.ts:147` renders a plain `div` with `aria-label="Then return to the piece"`. Axe 4.10.2 reports this as **serious** `aria-prohibited-attr` / WCAG 4.1.2 because the div has no valid role. It reproduces on the live URL and local production build at desktop and 390px. The initial-state repository Axe test misses it because it scans before a bridge exists.

Fix the element’s semantics and add a populated-workspace Axe regression, then rerun verification. Full commands, workflow evidence, headers, privacy/network findings, PWA checks, performance/bundle evidence, exact live file hashes, and Low deployment-hardening observations are in `.factory/verification-2.md`.

No product code was changed during verification. The existing unrelated `graphify-out/` working-tree modifications were preserved.
