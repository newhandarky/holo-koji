# Implementation Plan: Character Set Selection UI

**Branch**: `017-character-set-selection-ui`  
**Date**: 2026-05-04  
**Spec**: [spec.md](./spec.md)

## Summary

Add a simple text-based character-set selector to the existing Lobby room-creation area so players can choose `default`, `collaboration`, or `hololive` before creating either an online room or an NPC room. The selected set should be sent with the existing room-creation flow, preserved when switching between online and NPC creation modes, default to Ginza when untouched, and remain visible-but-disabled if a supported set is temporarily unavailable.

This feature should keep the current lobby structure intact: no preview-card UI, no join-room selector, no extra in-room label for the selected set, and no room-time switching after creation. The room itself continues to reflect the active set through the actual character board produced by the existing match flow.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, WebSocket server using `ws` for active room flow  
**Shared Types**: `game-shared-types` with `GeishaSet = 'default' | 'collaboration' | 'hololive'` already established by spec 016  
**Package Manager**: npm  
**Primary Entry Surface**: `src/pages/Lobby/index.tsx` for room creation, mode switching, and join-room handling  
**Authoritative Source**: Server-side supported-set validation from spec 016 remains the source of truth for accepted room creation values and set availability  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`  
**User Review**: Detailed UI visual review remains user-owned; plan should emphasize data-flow correctness and low-risk lobby behavior changes

## Constitution Check

- Game rule correctness: Pass. This feature does not alter scoring, action rules, round flow, item rules, or charm binding.
- Shared state integrity: Pass. Lobby only chooses a set and sends it during room creation; room-time state remains server-authoritative.
- Explicit realtime contracts: Pass. `CREATE_ROOM` request usage and room/game-state expectations are documented in `contracts/character-set-selection-ui.md`.
- Mobile-first playability: Pass. The selected UI is intentionally a simple control inside the existing lobby rather than a new heavy layout pattern.
- Verifiable delivery: Pass. Frontend validation commands remain applicable and sufficient for this feature’s scope.

## Project Structure

```text
src/
  pages/Lobby/
  pages/GameRoom/
server/
game-shared-types/
specs/017-character-set-selection-ui/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See [data-model.md](./data-model.md), [contracts/character-set-selection-ui.md](./contracts/character-set-selection-ui.md), and [quickstart.md](./quickstart.md).

## Phase 2 - Task Planning

Task generation should keep the work narrowly scoped to lobby selection behavior and room-creation data flow:

1. Add a simple character-set selection state to the Lobby page, defaulting to `default`.
2. Render the selector only in the room-creation area and keep join-room UI unchanged.
3. Preserve the current selection when switching between online and NPC creation modes.
4. Send the selected `geishaSet` with `CREATE_ROOM` for both online and NPC room creation.
5. Reflect temporary unavailability through disabled selection options without removing supported-set labels from the selector.
6. Remove any remaining hardcoded `geishaSet: 'default'` assumptions in the room-creation path while preserving Ginza as the untouched default.
7. Add focused frontend tests for selection defaults, mode switching preservation, create-room payload composition, and join-room isolation.
8. Run build and automated tests.

## Risks

- **Risk**: The current Lobby flow hardcodes `geishaSet: 'default'`, so partial changes can leave online and NPC creation inconsistent.  
  **Mitigation**: Centralize the selected set into one shared lobby state and cover both room-creation modes in tests.

- **Risk**: Adding selector logic can accidentally bleed into the join-room path and create a misleading unused control.  
  **Mitigation**: Keep the join-room area unchanged and document this explicitly in both spec and contract.

- **Risk**: Temporarily unavailable sets may drift from server truth if the frontend invents availability rules.  
  **Mitigation**: Treat frontend availability as a presentation layer over known supported sets and defer authoritative rejection to the existing server contract.

- **Risk**: Players may expect a new room label for the active set if lobby wording is unclear.  
  **Mitigation**: Keep room behavior explicit in spec and tests: set identity is reflected by the character board, not by a new room metadata badge.

## Post-Design Constitution Check

- Game rule correctness: Pass. Design scope stays outside gameplay rules.
- Shared state integrity: Pass. The selector only influences room creation, not in-room mutation.
- Explicit realtime contracts: Pass. Contract file documents request usage and UI boundaries.
- Mobile-first playability: Pass. Design uses a lightweight control inside the existing lobby flow.
- Verifiable delivery: Pass. Quickstart defines focused test/build coverage for the changed frontend surface.
