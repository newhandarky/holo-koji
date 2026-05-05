# Implementation Plan: Expanded Character Pools

**Branch**: `022-expanded-character-pools`  
**Date**: 2026-05-05  
**Spec**: [spec.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/spec.md)

## Summary

Formalize the existing character-pool model so every supported set can generate one seven-character board from its full available pool. Current data may contain exactly seven profiles per set, so match creation must still randomize board placement. Future pools larger than seven must use the same path to select a random seven-character subset without changing item cards, charm values, actions, scoring, or room setup choices.

The implementation should stay centered in `server/utils/gameUtils.js`, because the server is authoritative for room creation, restore validation, deck generation, and next-round continuity. Frontend changes should be limited to consuming the server-generated board and preserving existing lobby choices unless tests expose a contract drift.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Primary Data Module**: `server/utils/gameUtils.js`  
**Primary Tests**: `server/utils/gameUtils.test.js`, focused Lobby/GameRoom tests if UI contracts are touched  
**Validation**: `npm --prefix server test`, `CI=1 npm test -- --watchAll=false`, `npm run build`

No unresolved technical clarifications remain.

## Constitution Check

- Game rule correctness: Pass. Character identity remains display-only; charm, item, action, scoring, and win rules remain board-position based.
- Shared state integrity: Pass. Server-generated `baseGeishas` and `gameState.geishas` remain authoritative for multiplayer room state.
- Explicit realtime contracts: Pass. Existing room creation, game state sync, restore, and rematch payloads keep the same `geishaSet` plus seven `geishas` contract; no new Socket.IO event is planned.
- Mobile-first playability: Pass. No layout or bottom-sheet workflow change is planned.
- Verifiable delivery: Pass. Plan defines focused server tests plus repository build/test validation.

## Project Structure

```text
server/utils/gameUtils.js
server/utils/gameUtils.test.js
src/pages/Lobby/
src/pages/GameRoom/
game-shared-types/src/game.types.ts
specs/022-expanded-character-pools/
```

## Phase 0 - Research

See [research.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/research.md).

Key decisions:

- Use the existing server-side pool selection path as the source of truth.
- Treat exactly seven profiles as a valid pool that still shuffles character-to-slot assignment.
- Preserve `Geisha.id` as the board slot identifier and `Geisha.characterId` as the selected profile identifier.
- Validate oversized future pools through injected `characterPool` test data instead of waiting for production data to exceed seven profiles.

## Phase 1 - Design

See [data-model.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/data-model.md), [contracts/character-pool-contract.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/contracts/character-pool-contract.md), and [quickstart.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/quickstart.md).

Design notes:

- The board always contains seven `Geisha` records.
- `characterPool.length === 7` means all profiles are selected, then assigned to shuffled board slots.
- `characterPool.length > 7` means seven profiles are sampled without replacement, then assigned to ordered board slots.
- Next-round continuation clones the existing selected board rather than sampling again.
- Restore accepts only snapshots whose board contains exactly seven unique character IDs from the selected set and seven unique known board slots.

## Phase 2 - Task Planning

Generate tasks in dependency order:

1. Add or tighten focused server tests for exact-seven shuffle, oversized-pool sampling, undersized/duplicate/mismatched validation, restore rejection, and next-round board preservation.
2. Adjust `server/utils/gameUtils.js` only if tests reveal missing behavior or insufficient validation.
3. Update shared/frontend type surfaces only if the implementation changes visible payload shape.
4. Run focused server tests first, then full frontend test/build validation before closeout.

## Risks

- Random behavior can make tests flaky. Mitigation: use `createDeterministicRandomSource()` and injected `characterPool` fixtures for all focused tests.
- Existing full frontend suite may still fail from unrelated Lobby label changes. Mitigation: record exact command output and separate unrelated failures from 022 behavior.
- Future character additions may introduce invalid URLs or duplicate IDs. Mitigation: keep `validateCharacterSetData()` strict and cover invalid fixtures.

## Post-Design Constitution Check

- Game rule correctness: Pass. The design preserves position-based item/charm identity.
- Shared state integrity: Pass. Server state remains the only authority for generated boards.
- Explicit realtime contracts: Pass. Contract artifact documents existing payload expectations and no new event.
- Mobile-first playability: Pass. No UI layout change.
- Verifiable delivery: Pass. Focused and full validation commands are documented.
