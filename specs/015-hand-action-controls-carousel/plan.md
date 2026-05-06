# Implementation Plan: Hand Action Controls Carousel

**Branch**: `015-hand-action-controls-carousel`  
**Date**: 2026-05-03  
**Spec**: [spec.md](./spec.md)

## Summary

Refine the `手牌&指令` section so action controls become a stable bottom four-column row and the player hand keeps the fan presentation while gaining explicit left/right focus carousel controls. The focused hand card remains visually above overlapping cards, clicking a card still toggles selection and also makes it focused, and focus movement wraps at first/last boundaries.

This feature is frontend-only. It preserves the existing action payloads, Socket.IO events, server validation, shared type contracts, scoring, turn order, hidden-information boundaries, draw motion, hand motion cues, and reduced-motion behavior. The implementation should concentrate the changes in the hand/action UI layer and avoid changing game rules or backend state.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO（不變更）  
**Shared Types**: `game-shared-types`（不變更）  
**Package Manager**: npm  
**Primary Files**: `src/components/game/GameBoard.tsx`, `src/components/game/PlayerHand.tsx`, `src/components/game/ActionTokens.tsx`, `src/index.css`  
**Existing State Source**: `GameState.players[].hand`, `ActionToken[]`, existing local selected-card state, `canAct`, existing motion cue props  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`, user-owned manual UI visual review  
**Constraints**: preserve 011 focus layout, 012 section tabs, 013 information panel action status, 014 character coverflow, modal layering, action legality, and hidden-information boundaries

## Constitution Check

- Game rule correctness: Pass. The spec only changes frontend layout and local hand focus state; all action legality, scoring, turn order, and rule validation remain unchanged.
- Shared state integrity: Pass. Focus and selection display remain client UI state; action submission still uses existing server-authoritative validation.
- Explicit realtime contracts: Pass. No Socket.IO event, payload shape, server payload, or shared type change is planned.
- Mobile-first playability: Pass. The plan keeps the hand/actions section inside the existing focus layout and requires no horizontal page overflow.
- Verifiable delivery: Pass. Focused validation includes `CI=1 npm test -- --watchAll=false` and `npm run build`; detailed UI visual review remains user-owned per project rule.

## Project Structure

```text
src/
├── components/game/
│   ├── ActionTokens.tsx
│   ├── GameBoard.tsx
│   └── PlayerHand.tsx
└── index.css

specs/015-hand-action-controls-carousel/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── hand-action-controls-carousel-contract.md
└── checklists/
    └── requirements.md
```

## Phase 0 - Research

Research output: [research.md](./research.md)

Key decisions:

- Keep this feature frontend-only and local-state-only; do not introduce server events or shared type fields for hand focus.
- Keep selection state separate from focused-card state, but clicking a hand card updates both focus and selection.
- Implement focus movement as an index/card-id carousel with first/last wrapping.
- Preserve current focused card when possible across hand changes; if removed, focus the nearest remaining card; initial load focuses the middle card.
- Keep action tokens visible in the hand/actions section even when the player cannot act, but disable them and preserve status cues.
- Treat keyboard-accessible focus controls and aria labels as required UI contract, not optional polish.

## Phase 1 - Design

Design outputs:

- [data-model.md](./data-model.md)
- [contracts/hand-action-controls-carousel-contract.md](./contracts/hand-action-controls-carousel-contract.md)
- [quickstart.md](./quickstart.md)

Implementation design:

- `GameBoard` should keep using the existing action flow and `handleAction`; no action payload or server validation changes.
- `ActionTokens` should render as a bottom full-width four-column row and remain visible when disabled. It should preserve used/available/disabled cues and existing replay inspection behavior for eligible used actions.
- `PlayerHand` should own local `focusedCardId` and selected cards, deriving a stable focused index from current hand contents.
- `PlayerHand` should add previous/next controls that wrap across the current hand card list and do not alter selected cards.
- `PlayerHand` should update focus when a card is clicked while still toggling selected state and notifying `onCardSelect` with the selected cards.
- CSS should preserve fan layout, z-index ordering, focused-card emphasis, draw/motion cue classes, and reduced-motion friendliness while avoiding horizontal page overflow.

## Phase 2 - Task Planning

Task generation notes:

- Build tasks by user story priority: bottom action row first, hand focus carousel second, selection/check indicator third, responsive/motion validation fourth.
- Keep server/shared-type tasks out of implementation unless a regression is discovered; this spec explicitly has no contract change there.
- Include focused tests or verification tasks for carousel wrapping, focus preservation after hand changes, disabled action tokens, and selected-card check indicator.
- Include final validation tasks for `CI=1 npm test -- --watchAll=false`, `npm run build`, and user-owned visual review notes.

## Risks

- Risk: Focus state can desynchronize when hand cards are removed after an action. Mitigation: derive focus from card IDs and explicitly preserve-or-nearest fallback on hand changes.
- Risk: Bottom fixed four-column tokens can conflict with small viewport width. Mitigation: use full-width grid/flex columns with no horizontal overflow and keep icon sizing responsive.
- Risk: Focused card z-index can obscure selected-state affordance or motion cue. Mitigation: make selected check icon and motion cue layers explicit above card art.
- Risk: Used action token replay inspection may be accidentally disabled when global disabled state is true. Mitigation: document and test whether disabled waiting state should still block all tokens while preserving status cues; do not alter replay semantics beyond spec scope.
