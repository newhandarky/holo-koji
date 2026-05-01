# Implementation Plan: Game Data v2 Contract

**Branch**: `005-game-data-v2-contract`  
**Date**: 2026-05-01  
**Spec**: [spec.md](./spec.md)

## Summary

Replace the current `default` geisha data path with server-owned `ginza` match data while preserving existing Hanamikoji rules, Socket.IO event names, and current gameplay UI compatibility. The implementation separates persistent character identity from board-position charm and item asset data, extends shared item-card payloads with display-only fields, introduces deterministic setup injection for tests, and makes invalid Ginza data fail fast instead of silently falling back to legacy defaults.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript, CSS in `src/index.css`  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Current Implementation Reality**:

- Server setup currently builds `default` geishas in `server/utils/gameUtils.js`, where `id`, `name`, `imageUrl`, and `charmPoints` are coupled by array index.
- Server deck generation currently derives `ItemCard.type` as `geisha-{id}` and uses `geishaId` as both rule identity and display lookup key.
- Frontend lookup helpers in `src/utils/gameData.ts` still infer names, charm, card images, and icons from `geishaId` / `type` plus client-local mappings.
- `Room.startRematch()` in [server/index.js](/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js:294) already creates a fresh randomized board, while unresolved rounds continue from existing `gameState`.
- Lobby still exposes `default` as the user-facing option; this feature changes what `default` resolves to, not the option name or room flow.

**Planned Scope Boundary**:

- Replace `default` setup data with `ginza` on the server.
- Keep legacy data in the repo but remove it from the active default match path.
- Keep current gameplay UI rendering functional, even if some client lookup helpers must temporarily support both old and new shapes during migration.
- Do not redesign room UI, coverflow, fan hand, or interaction modals in this feature.
- Do not add new Socket.IO event names or change gameplay rule semantics.

**Validation**:

- Focused automated coverage for Ginza match setup, invalid data rejection, unresolved-round persistence, and rematch reshuffle behavior.
- Attempt a short playable smoke flow plus a narrow mobile-width review when the local environment permits binding frontend/backend ports.
- `CI=1 npm test -- --watchAll=false`
- `npm run build`

## Constitution Check

- Game rule correctness: Pass. Plan changes data sourcing and display payloads, but preserves scoring, turn order, action legality, and hidden-information rules.
- Shared state integrity: Pass. Server remains authoritative for selected cast, board positions, item-card payloads, and rematch / unresolved-round transitions.
- Explicit realtime contracts: Pass with documentation. No new event names are planned; existing game-state sync payloads will carry expanded display-only fields in the same feature scope.
- Mobile-first playability: Pass. This feature preserves the current gameplay surfaces and does not replace the existing bottom-sheet interaction flow.
- Verifiable delivery: Pass. Focused setup validation plus repo-standard test/build checks are defined.

## Project Structure

```text
server/index.js
server/utils/gameUtils.js
src/utils/gameData.ts
src/pages/Lobby/index.tsx
src/components/game/
game-shared-types/src/game.types.ts
specs/005-game-data-v2-contract/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See:

- [data-model.md](./data-model.md)
- [contracts/match-setup-data-contract.md](./contracts/match-setup-data-contract.md)
- [contracts/unresolved-round-and-rematch-contract.md](./contracts/unresolved-round-and-rematch-contract.md)
- [quickstart.md](./quickstart.md)

## Phase 2 - Task Planning

Generate tasks in these groups:

1. Server data foundation: add Ginza character pool and board-position item asset definitions, plus fail-fast validation.
2. Match setup refactor: decouple character identity from board-slot charm/item assets and generate seven-character board state from validated Ginza data.
3. Shared type migration: extend `ItemCard` and any affected state types with display-only fields required by current and future UI.
4. Client compatibility path: update frontend lookup/render helpers so current screens keep working from server-provided Ginza display data without changing gameplay behavior.
5. Deterministic testability: introduce setup-level random injection for tests and add focused coverage for reshuffle / unresolved-round behavior.
6. Verification and cleanup guardrails: run tests/build and document any remaining legacy data kept intentionally for later cleanup.

## Risks

- **Identity coupling risk**: current code assumes `geishaId` index order maps to charm, image, and item identity; refactor must avoid subtle regressions in score evaluation and card placement displays.
- **Partial migration risk**: some frontend surfaces still read from client-local `gameData` helpers; tasks must define a compatibility path so old assumptions do not override server Ginza payloads.
- **Randomness drift risk**: production randomness and test determinism must share the same setup logic; duplicating setup branches would create flaky validation.
- **Silent fallback risk**: current code often defaults to `default`; tasks must ensure invalid Ginza data fails explicitly instead of reactivating legacy behavior by accident.
