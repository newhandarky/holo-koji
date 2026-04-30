# Implementation Plan: Remote Character Card UI

**Branch**: `002-remote-character-card-ui`  
**Date**: 2026-04-30  
**Spec**: [spec.md](./spec.md)

## Summary

Move character artwork display to server-provided `Geisha.imageUrl` data, remove frontend character artwork mapping as the primary source, and redesign board character cards as 9:16 framed cards. Gameplay logic, scoring, turn order, item ownership rules, and action validation remain unchanged. Item cards continue to use the existing image flow in this feature; the board character frame only displays ownership/count summary.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript, CSS in `src/index.css`  
**Backend**: Node.js, Express, Socket.IO in `server/` submodule  
**Shared Types**: local `game-shared-types` package consumed by root app; server currently depends on GitHub package and also has local TypeScript/JSDoc references  
**Package Manager**: npm  
**Current Data Flow**:

- Server already defines character `imageUrl` in `server/utils/gameUtils.js` and includes it when creating geishas.
- `game-shared-types/src/game.types.ts` does not currently declare `Geisha.imageUrl`.
- Frontend character card display currently ignores `geisha.imageUrl` and calls `src/utils/gameData.ts#getGeishaImageById`.
- `src/utils/gameData.ts` also owns item `cardUrl` mappings used by item-card views; those are out of scope for this feature.

**Validation**:

- `CI=1 npm test -- --watchAll=false`
- `npm run build`
- `git -C server status --short --branch` before final handoff, because server is a submodule.

## Constitution Check

- Game rule correctness: Pass. Plan changes display data and visual card layout only.
- Shared state integrity: Pass. Server remains authoritative; client only renders display fields from synced state.
- Explicit realtime contracts: Pass with documentation. The contract adds/declares display-only `geishas[].imageUrl`; no rule-bearing payload semantics change.
- Mobile-first playability: Pass. 9:16 framed cards must remain readable on mobile board rows.
- Verifiable delivery: Pass. Tests and build are defined.

## Project Structure

```text
game-shared-types/src/game.types.ts
src/components/game/GeishaCard.tsx
src/components/game/GameBoard.tsx
src/index.css
src/utils/gameData.ts
server/utils/gameUtils.js
specs/002-remote-character-card-ui/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See:

- [data-model.md](./data-model.md)
- [contracts/game-state-geisha-display.md](./contracts/game-state-geisha-display.md)
- [contracts/character-card-ui.md](./contracts/character-card-ui.md)
- [quickstart.md](./quickstart.md)

## Phase 2 - Task Planning

Generate tasks in these groups:

1. Shared display data contract: declare `Geisha.imageUrl` and ensure root app consumes updated local type.
2. Server display data: preserve/provide URL-backed artwork in geisha state; convert local paths to externally usable URL values when configured.
3. Frontend source-of-truth migration: update `GeishaCard` to use `geisha.imageUrl`; keep frontend character artwork only as fallback if needed.
4. Character card frame UI: implement 9:16 frame, center-crop artwork, fallback state, name/charm/ownership summary.
5. Validation: run tests/build and record results.

## Risks

- **Server submodule sequencing**: changes under `server/` require a server submodule commit before the root repo can commit the updated pointer.
- **Shared type drift**: the server dependency points to a GitHub shared-types package, while root uses local `game-shared-types`; implementation must avoid assuming the server package is automatically updated from the local folder.
- **Path vs URL mismatch**: server currently stores `/images/...` paths. The implementation must decide whether to keep path-style URLs or normalize to absolute public URLs without breaking GitHub Pages hosting.
- **Frontend item image coupling**: `src/utils/gameData.ts` still provides `cardUrl` for item-card images. Removing the whole file in this feature would break item views, so only character artwork dependency should be migrated.
- **Mobile density**: 9:16 cards may reduce horizontal space in the current 4-over-3 board layout; CSS must keep rows usable on narrow screens.
