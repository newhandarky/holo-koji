# Implementation Plan: Fan Player Hand

**Branch**: `008-fan-player-hand`  
**Date**: 2026-05-02  
**Spec**: [spec.md](./spec.md)

## Summary

Redesign the active game-room player hand from a compact wrapped row into a fan-shaped hand surface. The implementation should keep the existing card selection semantics, make the clicked card both selected/deselected and the visual focus, use medium fan spread on desktop, use denser overlap on mobile, and preserve draw highlights, action gating, hidden-information boundaries, bottom-sheet flows, and all server-authoritative game behavior.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript, Bootstrap, global CSS in `src/index.css`  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Current Implementation Reality**:

- `src/components/game/PlayerHand.tsx` currently renders hand cards inside `.player-hand-row`, tracks selected cards locally, and calls `onCardSelect(nextSelected)` after each click.
- `PlayerHand` already receives draw-highlight props, motion cues, current `geishaSet`, and a server-first charm lookup callback.
- `src/index.css` currently styles `.player-hand-row`, `.item-card--hand`, `.item-card.selected`, `.item-card--new`, and draw motion classes around compact 60px hand cards.
- `src/components/game/GameBoard.tsx` owns action gating and passes `selectedCards` into existing action flows, so 008 should not change action payloads or action enablement rules.
- 006 established the Ginza room shell and 007 established the character-card coverflow; the fan hand must coexist visually and spatially with those surfaces.

**Planned Scope Boundary**:

- Update only the active game-room main player hand surface and the CSS required for its fan layout.
- Keep interaction-modal card layouts, bottom-sheet structure, action tokens, and game rules unchanged.
- Keep card data, item images, action payloads, Socket.IO events, server validation, scoring, turn order, and hidden-information behavior unchanged.
- Treat detailed UI visual review as user-owned per `AGENTS.md`; implementation handoff should include automated checks and residual manual UI review notes.

**Validation**:

- `CI=1 npm test -- --watchAll=false`
- `npm run build`
- Minimal local smoke check only when explicitly requested by the user.
- User manual UI review for detailed desktop/mobile visual acceptance.

## Constitution Check

- Game rule correctness: Pass. The plan changes only hand presentation and leaves action rules, scoring, turn order, and hidden-information boundaries unchanged.
- Shared state integrity: Pass. Selection remains client UI state used for existing user actions; authoritative legality remains server-side.
- Explicit realtime contracts: Pass. No Socket.IO event names or payload shapes are changed.
- Mobile-first playability: Pass. The spec defines mobile fan density, no horizontal page scroll, and bottom-sheet coexistence.
- Verifiable delivery: Pass. The plan includes the required frontend test/build checks and user-owned UI review notes.

## Project Structure

```text
src/components/game/PlayerHand.tsx
src/index.css
specs/008-fan-player-hand/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See:

- [data-model.md](./data-model.md)
- [contracts/fan-player-hand-ui-contract.md](./contracts/fan-player-hand-ui-contract.md)
- [quickstart.md](./quickstart.md)

## Phase 2 - Task Planning

Generate tasks in these groups:

1. Fan hand foundation: introduce focus state and fan-position presentation without changing selected-card semantics.
2. Desktop layout: medium spread, clear click zones, readable image/charm information.
3. Mobile layout: denser overlap, no horizontal page scroll, focus card lift/scale.
4. Flow compatibility: preserve draw highlight, action selection counts, bottom-sheet coexistence, and hidden-information constraints.
5. Validation: run frontend test/build and record user-owned UI review needs.

## Risks

- **Selection semantics risk**: focus state must follow clicks without changing the selected-card list rules used by action tokens.
- **Tap-target risk**: fan overlap can make cards hard to tap, especially on mobile; tasks must preserve a visible/clickable portion per card and a clear focused state.
- **Layout conflict risk**: lifted/focused hand cards can overlap action tokens, coverflow, or bottom sheets; responsive spacing and z-index rules must be checked.
- **Motion interaction risk**: draw highlight and existing motion cues must remain visible when cards are rotated or lifted.
