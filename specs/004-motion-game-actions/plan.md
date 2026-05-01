# Implementation Plan: Motion Game Actions

**Branch**: `004-motion-game-actions`  
**Date**: 2026-05-01  
**Spec**: [spec.md](./spec.md)

## Summary

Add presentation-layer motion feedback for confirmed gameplay changes by deriving animation triggers from existing client-visible state transitions. The first version will emphasize card movement or fly-in style motion for draw, placement, gift, and competition outcomes, while using reduced-motion fallbacks and preserving current gameplay logic, Socket.IO contracts, and hidden-information boundaries.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript, CSS in `src/index.css`  
**Backend**: Node.js, Express, Socket.IO (no planned changes)  
**Shared Types**: `game-shared-types` for `GameState`, `ItemCard`, and pending interaction payloads  
**Package Manager**: npm  
**Current UI Hooks**:

- `GameRoom` already exposes `drawHighlightCardId` and `highlightActive` for the hand.
- `GameBoard` already receives synced state and computes per-geisha ownership summaries.
- `PlayerHand`, `PendingInteractionModal`, `CompetitionGroupModal`, and `ActionTokens` already render distinct card regions that can serve as motion source or destination zones.
- Existing client state sync in `useWebSocket` already surfaces draw events and room state updates without animation-specific events.

**Animation Scope**:

- Add first-version motion for draw, played-card placement, gift resolution, and competition resolution.
- Trigger motion from confirmed state diffs or existing client-visible events only.
- Use semantically correct approximate paths instead of exact DOM-to-DOM reconstruction when exact coordinates are not available.
- Replace large movement with low-motion emphasis when reduced motion is requested.

**Validation**:

- `CI=1 npm test -- --watchAll=false`
- `npm run build`
- manual visual review on mobile and desktop

## Constitution Check

- Game rule correctness: Pass. Motion is display-only over confirmed state.
- Shared state integrity: Pass. No client-side rule bypass or speculative outcome logic is planned.
- Explicit realtime contracts: Pass. No new Socket.IO events or payload fields are planned.
- Mobile-first playability: Pass. Motion must fit the existing mobile board and bottom-sheet model.
- Verifiable delivery: Pass. Tests, build, and manual motion review are defined.

## Project Structure

```text
src/pages/GameRoom/index.tsx
src/hooks/useWebSocket.ts
src/components/game/GameBoard.tsx
src/components/game/GeishaCard.tsx
src/components/game/PlayerHand.tsx
src/components/game/PendingInteractionModal.tsx
src/components/game/CompetitionGroupModal.tsx
src/components/game/ActionTokens.tsx
src/index.css
specs/004-motion-game-actions/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See:

- [data-model.md](./data-model.md)
- [contracts/motion-trigger-contract.md](./contracts/motion-trigger-contract.md)
- [contracts/reduced-motion-contract.md](./contracts/reduced-motion-contract.md)
- [quickstart.md](./quickstart.md)

## Phase 2 - Task Planning

Generate tasks in these groups:

1. Motion trigger derivation: define how previous and current confirmed state produce animation cues.
2. Draw and placement motion: wire draw emphasis and card-to-board placement motion into existing hand and board surfaces.
3. Interaction result motion: animate gift and competition outcomes using existing modal and board zones.
4. Reduced motion and layout safety: add low-motion fallback behavior and protect mobile readability.
5. Validation and sync: run build/tests and document manual review expectations.

## Risks

- **State diff ambiguity**: some transitions may not encode exact source coordinates, so tasks must design approximate but semantically correct paths.
- **Hidden information leakage**: animation cues must not reveal card identity or outcome information earlier than current UI already does.
- **Interaction timing conflicts**: pending interaction modals, draw overlays, and board updates may overlap visually if motion sequencing is not bounded.
- **Layout crowding**: card travel and highlight layers can obscure mobile controls if z-index and duration are not tightly scoped.
