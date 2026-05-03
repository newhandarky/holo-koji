# Implementation Plan: Character Card Visual Refinement

**Branch**: `014-character-card-visual-refinement`  
**Date**: 2026-05-03  
**Spec**: [spec.md](./spec.md)

## Summary

Refine the `角色` section so the focused character card presents its artwork more completely inside the existing single viewport layout, while preserving current coverflow navigation, looping, side-card overlap, section tabs, and control-border rules. Character card chrome will be simplified: the top-left name treatment becomes smaller and less obstructive, the old `魅力 {value}` text badge is removed, and the position item icon becomes the stable carrier for both item identity and charm number.

This feature stays frontend-only. It must not modify gameplay rules, Socket.IO payloads, server state, shared types, random character selection, item card generation, or hidden-information boundaries. Always-visible position item icons must be derived from existing frontend-visible game data; if planning or implementation proves that impossible, implementation stops for contract clarification instead of expanding scope.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO（不變更）  
**Shared Types**: `game-shared-types`（不變更）  
**Package Manager**: npm  
**Primary Files**: `src/components/game/GameBoard.tsx`, `src/components/game/GeishaCard.tsx`, `src/utils/gameData.ts`, `src/index.css`  
**Existing Data Source**: `GameState.geishas`, `Geisha.boardSlotId`, `Geisha.charmPoints`, `ItemCard.itemIconUrl`, local Ginza item icon definitions in `gameData.ts`  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`, user-owned manual UI visual review  
**Constraints**: preserve 011 single viewport layout, 012 tabs, 013 information panel action status, current hand/action controls, coverflow navigation/drag/looping, modal layering, and hidden-information boundaries

## Constitution Check

- Game rule correctness: Pass. The spec only changes character-section presentation and explicitly preserves scoring, turn order, action legality, random character selection, item generation, rematch behavior, and hidden information.
- Shared state integrity: Pass. Client UI remains read-only for character cards and does not bypass server validation or mutate authoritative state.
- Explicit realtime contracts: Pass. No Socket.IO events, payload shapes, server payloads, or shared types are changed.
- Mobile-first playability: Pass. The plan preserves single viewport layout and requires no whole-page horizontal scrolling.
- Verifiable delivery: Pass. Focused frontend validation includes `CI=1 npm test -- --watchAll=false` and `npm run build`; detailed visual review remains user-owned.

## Project Structure

```text
src/
├── components/game/
│   ├── GameBoard.tsx
│   └── GeishaCard.tsx
├── utils/
│   └── gameData.ts
└── index.css

specs/014-character-card-visual-refinement/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── character-card-visual-refinement-contract.md
└── checklists/
    └── requirements.md
```

## Phase 0 - Research

Research output: [research.md](./research.md)

Key decisions:

- Keep the existing single viewport room layout as the hard boundary for character-card sizing.
- Improve full-image visibility for the focused card only; non-focused cards continue to prioritize coverflow depth, overlap, and side-card visibility.
- Use full-image rendering with intentional empty space/background fill for focused artwork when the image ratio does not fill the frame.
- Replace card-owned/known-card item icon inference with a position-based item icon lookup derived from existing frontend-visible Ginza icon definitions and field slot order.
- Remove only the character-coverflow top opponent action icon row; do not touch 013 information action status or hand/action controls.

## Phase 1 - Design

Design outputs:

- [data-model.md](./data-model.md)
- [contracts/character-card-visual-refinement-contract.md](./contracts/character-card-visual-refinement-contract.md)
- [quickstart.md](./quickstart.md)

Implementation design:

- `GameBoard` should stop rendering the opponent action icon row above the character coverflow.
- `GameBoard` should provide `GeishaCard` with a position-based `itemIcon`, likely using `boardSlotId ?? id` after the same ordering rules used for `orderedGeishas`.
- `gameData.ts` should expose a frontend-only helper for position item icons, reusing existing Ginza item definitions without adding server/shared type fields.
- `GeishaCard` should separate artwork strategy from card frame chrome: focused-card image visibility can be supported through CSS state passed from the coverflow slide/card context.
- `GeishaCard` should remove the old `魅力 {value}` text badge from the overlay and render the charm number as a badge anchored to the item icon.
- `index.css` should tune card media/object-fit, overlay width, 16px bold name, 48px borderless item icon, red circular charm badge, and responsive coverflow constraints.
- Existing controlled-by border classes must remain tied only to `geisha.controlledBy` and must not infer temporary round control from current counts.

## Phase 1 Constitution Re-check

- Game rule correctness: Pass. Control borders remain based on server-visible `controlledBy`; no scoring or ownership logic changes.
- Shared state integrity: Pass. Position item display is derived from existing visible data and does not create state mutations.
- Explicit realtime contracts: Pass. UI contract documents no server, shared type, or Socket.IO changes.
- Mobile-first playability: Pass. CSS work is constrained to the character section and must avoid whole-page horizontal overflow.
- Verifiable delivery: Pass. Quickstart defines automated commands and manual viewport checks.

## Phase 2 - Task Planning

Tasks should be generated around these slices:

1. Confirm current data supports position item icon lookup without server/shared type changes.
2. Remove the character-coverflow top opponent action icon row only.
3. Introduce position-based item icon derivation in `gameData.ts` / `GameBoard.tsx`.
4. Update `GeishaCard` markup so charm value is rendered as an icon badge and the old text badge is removed.
5. Update CSS for focused card image containment, overlay shortening, name typography, item icon size, badge styling, and responsive constraints.
6. Verify coverflow navigation/drag/looping/side overlap, control-border rules, and hidden-information boundaries.
7. Run focused frontend validation and record user-owned visual review notes.

## Risks

- **R1: Position icon data is inferred from card ownership instead of field position**  
  Mitigation: use a position-based helper keyed by board slot/order and stop if existing visible data cannot support it.

- **R2: Full-image focused card introduces awkward empty areas**  
  Mitigation: allow intentional background fill/letterboxing while preserving the Ginza card frame and item/charm hierarchy.

- **R3: Removing command icons affects 013 or 015 surfaces**  
  Mitigation: remove only the top-row opponent action icon render inside the character section; leave information panel and hand/action controls untouched.

- **R4: CSS changes break coverflow width or mobile viewport**  
  Mitigation: keep responsive constraints on viewport/slide/card dimensions and validate no whole-page horizontal overflow.

- **R5: Control borders accidentally reflect temporary mid-round counts**  
  Mitigation: preserve existing `geisha.controlledBy` source and do not derive border color from `myCount`/`opponentCount`.
