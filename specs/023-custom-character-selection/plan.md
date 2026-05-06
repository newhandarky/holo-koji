# Implementation Plan: Custom Character Selection

**Branch**: `023-custom-character-selection`  
**Date**: 2026-05-05  
**Spec**: [spec.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/023-custom-character-selection/spec.md)

## Summary

Add an optional room-creation setup mode where the room creator chooses exactly seven character identities from the selected character set. The server remains authoritative: it validates the submitted custom selection, builds the seven-character board from those identities, assigns board positions through the existing system rules, persists the setup mode in room snapshots, and rejects invalid or stale selections. If custom selection is not used, room creation continues to use the existing random seven-character setup from 022.

The frontend work is limited to the Lobby room-creation surface. It must expose random/custom setup choice, show available profiles for the selected set, preselect all seven when a set has exactly seven available profiles, show selection count/readiness, and send the custom setup payload only for room creation. Join-room and in-game surfaces consume the server-generated room state as they do today.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Primary Frontend Surface**: `src/pages/Lobby/`  
**Primary Backend Surface**: `server/index.js`, `server/utils/gameUtils.js`  
**Shared Contract Surface**: `game-shared-types/src/game.types.ts`, `src/types/game-shared-types.d.ts` if local ambient declarations remain needed  
**Shared Character Profile Source**: `game-shared-types/src/game.types.ts` exports `characterProfilesBySet`; frontend Lobby helpers and server validation consume that shared runtime data.
**Validation**: `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json`, `npm --prefix server test`, `CI=1 npm test -- --watchAll=false`, `npm run build`

No unresolved technical clarifications remain.

## Constitution Check

- Game rule correctness: Pass. Character identity remains display-only; board positions continue to own charm, item, action, scoring, and win behavior.
- Shared state integrity: Pass. Client submits setup intent, but server validates selected character IDs and generates authoritative board state.
- Explicit realtime contracts: Pass. This plan and contract artifact document the `CREATE_ROOM` payload extension and room snapshot additions before implementation.
- Mobile-first playability: Pass. The Lobby selection flow must work on mobile-sized screens and preserve the existing room creation path.
- Verifiable delivery: Pass. Focused server tests, Lobby tests, full frontend test command, and build are defined.

## Project Structure

```text
src/pages/Lobby/
src/utils/gameData.ts
server/index.js
server/utils/gameUtils.js
server/utils/gameUtils.test.js
game-shared-types/src/game.types.ts
src/types/game-shared-types.d.ts
specs/023-custom-character-selection/
```

## Phase 0 - Research

See [research.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/023-custom-character-selection/research.md).

Key decisions:

- Use a setup mode field rather than overloading the presence of selected IDs.
- Submit custom selection as stable `characterId` values, not board slot IDs.
- Server validates custom selections and then assigns board positions with the existing slot logic.
- Rematch reuses the stored seven-character custom pool but may reshuffle board position assignment.
- Exactly-seven pools preselect all available profiles in custom mode.

## Phase 1 - Design

See [data-model.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/023-custom-character-selection/data-model.md), [contracts/custom-character-selection-contract.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/023-custom-character-selection/contracts/custom-character-selection-contract.md), and [quickstart.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/023-custom-character-selection/quickstart.md).

Design notes:

- The canonical setup mode values are `random` and `custom`.
- Custom selection contains exactly seven unique `characterId` values from one selected set.
- The client may preselect all seven profiles when the available set size is exactly seven, but the server still validates the submitted selection.
- Room snapshots persist setup mode and selected custom IDs so restore and rematch can validate the same room setup contract.
- Joiners receive only public board state; no opponent hands, secret cards, removed card details, or pending-choice data are added to setup payloads.

## Phase 2 - Task Planning

Generate tasks in dependency order:

1. Add focused tests for custom-selection validation, exact-seven preselection behavior, random fallback, joiner sync, rematch reuse, and snapshot restore rejection.
2. Extend shared type surfaces for setup mode, room creation payload, and canonical character profile pools.
3. Add server helpers to validate custom selected IDs and build selected-board casts from a supplied custom pool.
4. Extend room creation, rematch, and restore to persist and reuse custom setup state.
5. Extend Lobby UI to choose setup mode, select/preselect seven characters, show readiness count, and send the custom payload.
6. Compile shared types, then run focused server tests, focused Lobby tests, full frontend test command, and build before closeout.

## Risks

- Custom selection can accidentally let character identity control charm/item strength. Mitigation: server only accepts character IDs and keeps board-slot assignment server-owned.
- Payload or character pool data can drift between frontend, backend, and shared types. Mitigation: keep canonical `characterProfilesBySet` in `game-shared-types`, have frontend Lobby helpers and server validation consume it, and cover payload behavior with server plus Lobby tests.
- Full frontend validation previously had a known Lobby label risk; 023 validation did not reproduce it. Continue recording any future unrelated suite failures separately from 023 behavior.
- Mobile room creation can become crowded. Mitigation: use compact selection controls with visible selected count and preserve quick random setup.

## Post-Design Constitution Check

- Game rule correctness: Pass. Board-position rules remain authoritative.
- Shared state integrity: Pass. Server validates all custom setup data.
- Explicit realtime contracts: Pass. Contract artifact documents payload and snapshot changes.
- Mobile-first playability: Pass. Mobile usability is a success criterion and quickstart check.
- Verifiable delivery: Pass. Focused and full validation commands are documented.
