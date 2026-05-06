# Tasks: Custom Character Selection

**Input**: Design documents from `specs/023-custom-character-selection/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/custom-character-selection-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review custom-selection requirements, setup-mode decisions, and validation scenarios in `specs/023-custom-character-selection/spec.md`, `specs/023-custom-character-selection/plan.md`, `specs/023-custom-character-selection/research.md`, `specs/023-custom-character-selection/data-model.md`, `specs/023-custom-character-selection/contracts/custom-character-selection-contract.md`, and `specs/023-custom-character-selection/quickstart.md`.
- [X] T002 Confirm current 023 branch hygiene and ensure unrelated user changes are not modified with `git status --short` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.

## Phase 2 - Foundation

- [X] T003 Extend shared room setup contract types with `RoomSetupMode`, `CustomCharacterSelection`, and `CreateRoomPayload` in `game-shared-types/src/game.types.ts`.
- [X] T004 Mirror any required local ambient type additions for setup mode and create-room payload compatibility in `src/types/game-shared-types.d.ts`.
- [X] T005 [P] Export frontend-readable character profile pools from `game-shared-types/src/game.types.ts` and consume them through Lobby lookup helpers in `src/utils/gameData.ts`.
- [X] T006 Add server custom-selection constants and validation helper skeletons without changing existing random behavior in `server/utils/gameUtils.js`.
- [X] T007 Add focused helper test scaffolding for custom setup validation and custom board creation in `server/utils/gameUtils.test.js`.

## Phase 3 - User Story 1: Choose the seven board characters during room creation (Priority: P1)

**Goal**: Room creators can select exactly seven characters from the chosen set, and the server builds the board from those selected identities while assigning board positions itself.

**Independent Test**: Create online and NPC rooms for Ginza, 擅自合作系列, and Hololive with custom selections; confirm each generated board contains exactly the selected seven unique character IDs and still uses the fixed seven board positions and charm distribution.

- [X] T008 [P] [US1] Add server tests for accepting exactly seven valid custom character IDs from each supported set in `server/utils/gameUtils.test.js`.
- [X] T009 [P] [US1] Add Lobby tests for enabling custom setup, exactly-seven preselection, selected count, readiness state, and custom payload submission in `src/pages/Lobby/index.test.tsx`.
- [X] T010 [US1] Implement `normalizeRoomSetupMode`, `validateCustomCharacterSelection`, and `createCustomSelectedGeishas` in `server/utils/gameUtils.js`.
- [X] T011 [US1] Ensure `createCustomSelectedGeishas` assigns selected character identities to shuffled existing board slots without accepting client board-slot order in `server/utils/gameUtils.js`.
- [X] T012 [US1] Import custom setup helpers and persist `setupMode` plus `customSelection` fields on `GameRoom` instances in `server/index.js`.
- [X] T013 [US1] Extend `GameRoom.buildRoomSnapshot()` to include `setupMode` and validated custom selected IDs in `server/index.js`.
- [X] T014 [US1] Extend `handleCreateRoom` to validate `setupMode: "custom"` payloads, reject invalid custom selections, and initialize `room.baseGeishas` from selected character IDs in `server/index.js`.
- [X] T015 [US1] Keep NPC room creation on the same custom setup path as online room creation in `server/index.js`.
- [X] T016 [P] [US1] Add setup mode state, selected character ID state, and set-change reset/preselection behavior in `src/pages/Lobby/index.tsx`.
- [X] T017 [US1] Pass setup mode, available profiles, selected IDs, selection toggles, and readiness metadata from `src/pages/Lobby/index.tsx` into `src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T018 [US1] Render random/custom setup controls, selectable character profile controls, selected count, and invalid-count readiness copy in `src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T019 [US1] Disable room creation in custom mode until exactly seven profiles are selected in `src/pages/Lobby/index.tsx`.
- [X] T020 [US1] Send `setupMode: "custom"` and `customSelection.characterIds` only for custom room creation in `src/pages/Lobby/index.tsx`.
- [X] T021 [P] [US1] Add compact mobile-safe styles for custom selection controls and selected-count readiness in `src/index.css`.

## Phase 4 - User Story 2: Keep random setup available when custom selection is not used (Priority: P1)

**Goal**: Room creators who do not opt into custom selection keep the existing random seven-character setup flow.

**Independent Test**: Create online and NPC rooms without custom selection; confirm the room creation payload remains compatible and the server still samples seven characters from the selected set using existing random behavior.

- [X] T022 [P] [US2] Add server tests that omitted or `random` setup mode ignores custom selection input and uses existing random board generation in `server/utils/gameUtils.test.js`.
- [X] T023 [P] [US2] Add Lobby tests that untouched online and NPC room creation send `setupMode: "random"` or an otherwise backward-compatible random payload without `customSelection` in `src/pages/Lobby/index.test.tsx`.
- [X] T024 [US2] Preserve `GameRoom.regenerateBaseGeishas()` random behavior for random setup rooms in `server/index.js`.
- [X] T025 [US2] Ensure `handleCreateRoom` defaults missing setup mode to random and ignores custom selection data unless setup mode is custom in `server/index.js`.
- [X] T026 [US2] Keep the Lobby default setup mode as random and preserve join-room submission independence from setup fields in `src/pages/Lobby/index.tsx`.

## Phase 5 - User Story 3: Preserve shared room identity for joiners and rematches (Priority: P2)

**Goal**: Joiners receive the same generated board as the creator, and rematches in custom rooms reuse the same selected seven-character pool while allowing board position reassignment.

**Independent Test**: Create a custom-selected room, join as a second player, confirm both players receive the same board identity, then request a rematch and confirm the custom selected ID set is reused while board slots may be reassigned.

- [X] T027 [P] [US3] Add server tests for waiting-state joiner sync with custom selected board identity in `server/utils/gameUtils.test.js`.
- [X] T028 [P] [US3] Add server tests for custom rematch reusing stored selected IDs while allowing board-position reassignment in `server/utils/gameUtils.test.js`.
- [X] T029 [US3] Update `GameRoom.regenerateBaseGeishas()` to rebuild from stored custom selected IDs when `setupMode` is custom and keep random behavior otherwise in `server/index.js`.
- [X] T030 [US3] Ensure `startRematch()` persists and reuses custom setup state while resetting only match-specific state in `server/index.js`.
- [X] T031 [US3] Ensure `createWaitingGameState` and `createGameStateWithOrder` continue to consume the room-generated board without adding hidden setup-only data to client-visible game state in `server/utils/gameUtils.js`.

## Phase 6 - User Story 4: Reject invalid or stale custom selections safely (Priority: P2)

**Goal**: Duplicate, cross-set, unavailable, stale, malformed, or restored invalid custom selections fail safely with a clear recovery path instead of generating a fallback or mixed board.

**Independent Test**: Submit invalid custom selections and restore invalid custom snapshots; confirm room creation or restore is rejected, no broken room is created, and user-facing errors avoid technical internals.

- [X] T032 [P] [US4] Add server tests rejecting fewer than seven, more than seven, duplicate, cross-set, unavailable, stale, and malformed custom selected IDs in `server/utils/gameUtils.test.js`.
- [X] T033 [P] [US4] Add restore tests rejecting custom snapshots whose saved selection or board no longer validates against the selected set in `server/utils/gameUtils.test.js`.
- [X] T034 [P] [US4] Add Lobby tests that invalid custom count disables creation and server errors leave the selected setup available for correction in `src/pages/Lobby/index.test.tsx`.
- [X] T035 [US4] Extend `resolveRestorableBoardForSet` or adjacent restore helpers to validate custom snapshot setup fields against current character pools in `server/utils/gameUtils.js`.
- [X] T036 [US4] Update `restoreRoomFromSnapshot` to restore valid custom setup metadata and reject invalid custom snapshots with the existing recovery error path in `server/index.js`.
- [X] T037 [US4] Ensure `handleCreateRoom` deletes failed custom rooms from `gameRooms`, clears current connection room state, and sends a non-technical recovery error in `server/index.js`.
- [X] T038 [US4] Ensure runtime logging summarizes setup mode and set only, without logging hidden hand, secret card, pending choice, or removed-card detail in `server/utils/runtimeLogger.js` and `src/utils/runtimeLogger.ts`.

## Phase 7 - Polish & Cross-Cutting Concerns

- [X] T039 [P] Update custom selection contract notes with final implementation details or validation caveats in `specs/023-custom-character-selection/contracts/custom-character-selection-contract.md`.
- [X] T040 [P] Update quickstart validation notes for any known unrelated full-suite failure or manual UI review residue in `specs/023-custom-character-selection/quickstart.md`.
- [X] T041 Run focused server validation with `npm --prefix server test` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T042 Run focused Lobby validation with `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T043 Run full frontend validation with `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T044 Run production build validation with `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T045 Record validation results, unrelated failures, residual mobile UI manual review item, and completed task checkboxes in `specs/023-custom-character-selection/tasks.md`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before any user story implementation.
- User Story 1 and User Story 2 are both P1 and together form the MVP because custom setup must ship with random setup compatibility.
- User Story 3 depends on the server setup metadata and board generation from User Story 1.
- User Story 4 depends on the validation helper shape from User Story 1 and restore metadata from User Story 3.
- Polish and validation tasks run after all implemented stories.

## Parallel Execution Examples

### User Story 1

After T003-T007 are complete, one agent can implement server helper tests in `server/utils/gameUtils.test.js` while another updates Lobby tests in `src/pages/Lobby/index.test.tsx`. Once the failing tests are in place, server work in `server/utils/gameUtils.js` and Lobby state work in `src/pages/Lobby/index.tsx` can proceed in parallel before integrating `src/pages/Lobby/LobbyPlayControls.tsx`.

### User Story 2

Server random fallback tests in `server/utils/gameUtils.test.js` and Lobby compatibility tests in `src/pages/Lobby/index.test.tsx` can be written independently. The server defaulting work in `server/index.js` should complete before final Lobby payload assertions are finalized.

### User Story 3

Joiner sync tests and rematch tests both live in `server/utils/gameUtils.test.js`, so keep them sequential within that file. After the tests are clear, `server/index.js` rematch metadata handling and `server/utils/gameUtils.js` public game-state review can be handled separately.

### User Story 4

Invalid create-room tests, restore tests, and Lobby invalid-count tests cover separate behaviors. The restore helper work in `server/utils/gameUtils.js`, room cleanup work in `server/index.js`, and logger review in `server/utils/runtimeLogger.js` plus `src/utils/runtimeLogger.ts` can proceed in parallel after validation semantics are agreed.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, User Story 1, and User Story 2 first. This delivers custom seven-character setup while preserving the existing random setup path.

### Incremental Delivery

1. Build and validate the authoritative server helper layer before wiring UI payloads.
2. Add Lobby controls only after shared types and server validation semantics are stable.
3. Add rematch and restore persistence once custom room creation is passing.
4. Finish with focused server tests, focused Lobby tests, full frontend tests, build, and documented manual UI review residue.
