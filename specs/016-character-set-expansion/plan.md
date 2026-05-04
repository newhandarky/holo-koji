# Implementation Plan: Character Set Expansion

**Branch**: `016-character-set-expansion`  
**Date**: 2026-05-04  
**Spec**: [spec.md](./spec.md)

## Summary

Expand the authoritative character-set contract from Ginza-only to three supported sets: `default` for Ginza, `collaboration` for 擅自合作系列, and `hololive` for Hololive. The server remains the source of truth for match board generation, room creation, rematch, and snapshot restoration. New sets only provide character identities, display names, and character image URLs; item cards, item icons, charm values, and deck generation remain bound to the existing seven board slots.

The implementation should update shared types first, add server-side character-set definitions and validation, then update all room creation, restoration, rematch, and waiting-state paths to preserve the selected set. Frontend changes are limited to accepting the expanded shared type and avoiding default-only normalization where it would erase server state; the visual selection UI remains out of scope for this spec.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, WebSocket server using `ws`; legacy Socket.IO files remain present but are not the active room flow for this feature  
**Shared Types**: local `game-shared-types` package for frontend; server currently imports package types through JSDoc and must stay contract-compatible  
**Package Manager**: npm  
**Primary Data Source**: `docs/plan/update-phase3.md` for collaboration and Hololive character names/image URLs  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`, `cd server && npm test`  
**User Review**: Detailed UI visual review is owned by the user; this spec should rely on automated contract and state tests.

## Constitution Check

- Game rule correctness: Pass. Item/charm rules remain board-position based; unresolved next rounds preserve board and control state.
- Shared state integrity: Pass. Server remains authoritative for selected set, generated board, rematch, and snapshot restoration.
- Explicit realtime contracts: Pass. Room creation payload and game-state `geishaSet` contract are documented in `contracts/character-set-contract.md`.
- Mobile-first playability: Pass. No new UI layout or bottom-sheet behavior is introduced in this spec.
- Verifiable delivery: Pass. Plan includes frontend build/test and server tests for set validation, deck invariants, rematch, and restoration.

## Project Structure

```text
src/
server/
game-shared-types/
specs/016-character-set-expansion/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See [data-model.md](./data-model.md), [contracts/character-set-contract.md](./contracts/character-set-contract.md), and [quickstart.md](./quickstart.md).

## Phase 2 - Task Planning

Task generation should prioritize contract-safe backend and shared-type work before frontend consumers:

1. Update shared `GeishaSet` contract and generated declarations.
2. Add server-side supported set definitions and validation for all character pools.
3. Update board creation to select seven characters from the requested set while preserving existing board slot definitions.
4. Update room creation, waiting-state creation, snapshot restoration, and rematch to preserve and validate selected set.
5. Add focused server tests for `default`, `collaboration`, `hololive`, less-than-seven unavailable sets, unsupported set rejection, rematch reshuffle, and unresolved next-round preservation.
6. Update frontend type consumers so server-supplied `geishaSet` is not narrowed back to `default`.
7. Run automated validation.

## Risks

- **Risk**: The server currently normalizes restored and created rooms back to `default`.  
  **Mitigation**: Cover create-room, restore, waiting state, and rematch paths with tests that assert selected set preservation.

- **Risk**: Future UI selection work could expose a set with fewer than seven characters.  
  **Mitigation**: Centralize set availability validation and treat fewer-than-seven sets as unavailable everywhere.

- **Risk**: The active server package dependency for shared types is not the local package.  
  **Mitigation**: Keep runtime validation explicit in server code and ensure shared type source/dist updates are included for frontend consumers; note dependency alignment as a follow-up if server TypeScript adoption is planned.

- **Risk**: Adding more remote image URLs increases dependency on external asset availability.  
  **Mitigation**: Do not add fallback local assets in this spec; failures should remain visible as broken image data during manual UI review or smoke testing.

## Post-Design Constitution Check

- Game rule correctness: Pass. Design keeps deck and charm identity bound to board positions.
- Shared state integrity: Pass. All state-changing paths validate set identity server-side.
- Explicit realtime contracts: Pass. Contract document defines accepted set keys, payload preservation, and rejection behavior.
- Mobile-first playability: Pass. No layout changes are planned.
- Verifiable delivery: Pass. Quickstart defines focused validation commands and expected behavioral checks.
