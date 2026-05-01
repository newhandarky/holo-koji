# Implementation Plan: Character Card Coverflow Redesign

**Branch**: `007-character-card-coverflow`  
**Date**: 2026-05-02  
**Spec**: [spec.md](./spec.md)

## Summary

Redesign the active game-room character cards into a hand-operated coverflow presentation built on the Ginza v2 data contract and 006 visual shell. The implementation should replace the current two-row static card layout with a single ordered seven-card flow, move key display information into a top-left overlay and bottom counters, and preserve existing gameplay state, server authority, hidden-information boundaries, and modal interaction flow.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript, Bootstrap, global CSS in `src/index.css`  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Current Implementation Reality**:

- `src/components/game/GameBoard.tsx` currently splits geishas into a static top row (`3/3/4/5`) and bottom row (`2/2/2`) using `geisha.charmPoints`.
- `src/components/game/GeishaCard.tsx` currently renders the header with name, charm badge, and `未掌控 / 我方掌控 / 對手掌控`, plus a standalone item-icon block and bottom count pills.
- `src/index.css` currently defines `.geisha-card*` styles around a static grid-like card layout and local icon panel.
- `005-game-data-v2-contract` already documents `characterId`, `boardSlotId`, `itemImageUrl`, and `itemIconUrl` as synced display data, so 007 should consume server-provided state instead of reconstructing local mappings.
- `006-theme-room-surface` already established the Ginza v2 room shell, so 007 should preserve the dark/red room backdrop and readable local panels instead of restoring white card slabs.

**Planned Scope Boundary**:

- Replace the current static geisha rows with one coverflow-style character-card strip in the active game room.
- Keep seven cards ordered by board-slot charm value `2,2,2,3,3,4,5`, preserving stable board-slot order for ties.
- Redesign only the character cards and their immediate browsing surface.
- Preserve current game actions, score logic, pending interactions, room flow, and Socket.IO payload semantics.
- Do not redesign player hand, gift modal, competition modal, top-sheet interaction, or action-token flow.

**Validation**:

- Manual desktop and mobile-width review of active game room with focus on coverflow behavior, information readability, and bottom-sheet coexistence.
- Manual unresolved-round / persisted-control-state review when a reusable local setup is available.
- `CI=1 npm test -- --watchAll=false`
- `npm run build`

## Constitution Check

- Game rule correctness: Pass. The plan changes only the presentation of existing geisha state and explicitly preserves scoring, action limits, turn order, and control-state rules.
- Shared state integrity: Pass. Server remains authoritative for geisha ordering inputs, control state, and display data; client work is limited to rendering and local interaction affordances.
- Explicit realtime contracts: Pass. No new Socket.IO event names or payload fields are planned in this feature; 007 consumes the already-established synced state from 005.
- Mobile-first playability: Pass. The plan explicitly preserves mobile usability, keeps bottom-sheet interaction flow, and adds mobile-specific coverflow density constraints.
- Verifiable delivery: Pass. Repo-standard test/build checks plus focused desktop/mobile visual review are defined.

## Project Structure

```text
src/components/game/GeishaCard.tsx
src/components/game/GameBoard.tsx
src/index.css
specs/007-character-card-coverflow/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See:

- [data-model.md](./data-model.md)
- [contracts/character-card-coverflow-ui-contract.md](./contracts/character-card-coverflow-ui-contract.md)
- [quickstart.md](./quickstart.md)

## Phase 2 - Task Planning

Generate tasks in these groups:

1. Coverflow foundation: introduce the ordered seven-card browsing surface and remove the old two-row character layout.
2. Card information redesign: move key data into the top-left overlay and bottom counters while removing old control/item sections.
3. Control-state surfacing: keep border display aligned with persisted round-to-round control state and avoid premature in-round border updates.
4. Responsive interaction: enforce mobile and desktop density rules, manual drag/swipe behavior, and left/right navigation controls.
5. Compatibility and validation: keep existing motion/modal flow intact, verify no payload or rule changes, and run frontend test/build plus focused visual review.

## Risks

- **Ordering drift risk**: current board rendering logic already performs a charm-based split; replacing it with one ordered strip must preserve stable tie ordering for the three `2`-charm and two `3`-charm slots.
- **State-display risk**: `geisha.controlledBy` currently drives border state immediately; tasks must confirm rendering logic matches “persisted previous-round control only” and does not mislead during active play.
- **Density/readability risk**: the top-left overlay, bottom counters, and coverflow scaling can easily make text unreadable on mobile; responsive design tasks must explicitly validate density on narrow widths.
- **Interaction conflict risk**: drag/swipe gestures and left/right controls must coexist with the existing room scroll and bottom-sheet/modal interactions without causing accidental input conflicts.
