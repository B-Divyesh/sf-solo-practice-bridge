# Visual thesis — brutalist concrete and moss

Solo Practice Bridge should feel like a serious workbench beside an instrument: a cast-concrete rehearsal room softened by moss, pencil notes, and daylight. The interface is sturdy rather than clinical. Heavy rules, square controls, exposed counters, and honest local-storage language give the workbook weight; green marks signal a useful transfer taking root. This is deliberately not a neon tuner, a gamified lesson streak, or a generic SaaS card grid.

## Palette

This v1 is intentionally single-mode. The explicitly painted warm-concrete background supports long practice sessions and clean print output; a dark-mode inversion would weaken the physical notebook metaphor.

| Token | Value | Use |
| --- | --- | --- |
| `--concrete` | `#e8e5dc` | page field |
| `--paper` | `#f7f5ed` | working surfaces |
| `--charcoal` | `#1d211c` | primary text and rules |
| `--muted` | `#596055` | secondary text |
| `--moss` | `#355f3b` | primary actions and progress |
| `--moss-dark` | `#234329` | active states |
| `--lichen` | `#d8e2cc` | selected/supportive state |
| `--rust` | `#9b3f2f` | errors/destructive action |
| `--amber` | `#795b18` | warnings and offline state |

All body pairings meet 4.5:1. State always includes words or symbols, never color alone.

## Type and rhythm

Headings use the self-host-free Georgia/Cambria serif stack: editorial, patient, and familiar from marked-up scores. Interface copy uses Arial/Helvetica system sans; timings and session measures use `ui-monospace` with tabular numerals. This uses zero font bytes and makes offline first paint immediate. Scale: 14, 16, 20, 28, and fluid 42–68px. Body text is at least 16px with 1.55 line height and a 66-character reading measure.

Spacing follows an 8px base rhythm with 4px for optical corrections: `4, 8, 12, 16, 24, 32, 48, 72`. Borders are 2px charcoal and shadows are hard 5px offsets, like pinned sheets over a slab. Corners stay at 0–4px; pills are reserved for compact status labels.

## Layout and interaction grammar

The landing/workspace is one continuous practice bench. The hero has an offset editorial split, then the active plan becomes a two-column “bridge”: obstacle/drill on the left, piece/transfer on the right, connected by a central arrow rule. Independent plans may use bordered ledger rows; forms group by proximity rather than nesting everything in cards.

Buttons depress 2px toward their hard shadow. New plans open as a focused dialog, session notes reveal in place, and saved changes announce through a live region. Touch targets are at least 44px. On 390px screens the bridge stacks in musical order—goal, obstacle, drill, piece, transfer—and peripheral explanatory copy recedes.

## Motion

Only state changes move: dialogs rise 12px over 180ms, progress fills over 240ms, and the update toast enters from its bottom edge. No looping animation. Under `prefers-reduced-motion: reduce`, transitions and smooth scrolling are removed; hierarchy remains through border weight, scale, and contrast.

## Asset plan and provenance

The hero is a generated editorial still life that makes the product mechanism visible without pretending the app listens or teaches: a rough concrete bridge/slab connects a pencilled exercise card to a piece of sheet music; small moss growth appears only at the join. The crop leaves quiet negative space and uses the product palette. Product marks, interface icons, arrows, and the PWA icon are hand-authored SVG geometry.

### Prompt sheet

- **Use case:** `stylized-concept`
- **Asset:** wide landing-page editorial hero, no UI mockup
- **Subject:** overhead still life; two off-white rehearsal cards on separate raw concrete slabs, left card carries abstract pencil practice marks, right card carries abstract musical staff-like marks, connected by one narrow concrete bridge with a small patch of living moss at the joint
- **World/materials:** cast concrete, deckled paper, graphite, restrained moss; tactile imperfections and soft dust
- **Light/lens:** quiet northern window light, long soft shadow, 50mm editorial product photograph, shallow but readable depth
- **Palette words:** warm concrete, chalk paper, charcoal, forest moss, muted rust accent
- **Composition:** landscape; objects weighted to the right with generous calm concrete negative space on the left; no people or instruments
- **Negative list:** no legible text, no letters, no numbers, no logos, no watermark, no branded objects, no screens, no neon, no gradients, no fantasy, no hands, no excessive plants

Generated with the factory Azure image deployment via `/opt/fleet/lib/gen-image.sh` on 2026-08-28. The selected output is original to this product, reviewed for artifacts/marks, stored with its prompt sidecar in `assets/src/`, and exported to WebP in `public/assets/`. Generated imagery is disclosed in the product footer.

## Print

Printing removes navigation, artwork, purchase UI, and controls; plans and session history render as black-on-white teacher-ready ledgers with expanded URLs avoided. Each plan begins intact where possible and includes the user's success cue and transfer notes.
