# Tasks: Character Set Expansion

**Input**: Design documents from `specs/016-character-set-expansion/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/character-set-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review the active spec, plan, data model, contract, and quickstart in `specs/016-character-set-expansion/`.
- [x] T002 [P] Audit current default-only character-set references in `server/index.js`, `server/utils/gameUtils.js`, `game-shared-types/src/game.types.ts`, `game-shared-types/dist/game.types.d.ts`, `src/types/game-shared-types.d.ts`, `src/components/game/GameBoard.tsx`, and `src/pages/GameRoom/index.tsx`.

## Phase 2 - Foundation

- [x] T003 Update `GeishaSet` to include `default`, `collaboration`, and `hololive` in `game-shared-types/src/game.types.ts`, `game-shared-types/dist/game.types.d.ts`, and `game-shared-types/dist/index.d.ts`.
- [x] T004 Update frontend module augmentation for expanded set keys in `src/types/game-shared-types.d.ts`.
- [x] T005 Add canonical supported set metadata and availability helpers in `server/utils/gameUtils.js`.
- [x] T006 Add collaboration and Hololive character pools from `docs/plan/update-phase3.md` in `server/utils/gameUtils.js`, normalizing `、マリン` to `マリン`.
- [x] T007 Add validation helpers for unique character IDs, required names/image URLs, supported set keys, and at-least-seven availability in `server/utils/gameUtils.js`.
- [x] T008 [P] Add foundational character-set validation tests in `server/utils/gameUtils.test.js` for all supported set keys, normalized `マリン`, fewer-than-seven rejection, and legacy `akatsuki` rejection.

## Phase 3 - User Story 1: Create a match with an expanded character set (P1)

**Goal**: New matches can use Ginza, 擅自合作系列, or Hololive while keeping board-position item/icon/charm rules unchanged.

**Independent Test**: Create boards for `default`, `collaboration`, and `hololive`; verify seven characters from the selected set and charm distribution `2,2,2,3,3,4,5`.

- [x] T009 [US1] Update board generation to create seven geishas from the requested supported set while preserving Ginza board slot definitions in `server/utils/gameUtils.js`.
- [x] T010 [US1] Ensure deck generation still uses board slot item data independent of character set in `server/utils/gameUtils.js`.
- [x] T011 [US1] Update create-room validation to accept supported `geishaSet` values and default missing values to `default` in `server/index.js`.
- [x] T012 [US1] Preserve the selected `geishaSet` when creating `GameRoom.baseGeishas` and initial waiting state in `server/index.js`.
- [x] T013 [US1] Update frontend consumers so server-supplied `geishaSet` is accepted without narrowing back to `default` in `src/components/game/GameBoard.tsx` and `src/pages/GameRoom/index.tsx`.
- [x] T014 [P] [US1] Add server tests for `default`, `collaboration`, and `hololive` board generation and deck invariants in `server/utils/gameUtils.test.js`.
- [x] T015 [US1] Add room creation tests or focused helper coverage proving created game state preserves the requested set in `server/utils/gameUtils.test.js` or a new `server/utils/roomFlow.test.js`.

## Phase 4 - User Story 2: Preserve characters across unresolved next rounds (P1)

**Goal**: If a round ends without a match winner, the next round keeps the same selected set, same seven characters, same board positions, and carried control state.

**Independent Test**: Clone or advance an unresolved board with controls assigned and verify set, character IDs, board slot IDs, and control states are unchanged.

- [x] T016 [US2] Update next-round clone and round transition paths to preserve selected `geishaSet` with the cloned board in `server/utils/gameUtils.js` and `server/index.js`.
- [x] T017 [US2] Ensure `createGameStateWithOrder` preserves `existingState.geishaSet` instead of forcing `default` in `server/index.js`.
- [x] T018 [P] [US2] Add tests for unresolved next-round preservation across at least one non-default set in `server/utils/gameUtils.test.js` or `server/utils/roomFlow.test.js`.

## Phase 5 - User Story 3: Rematch reshuffles within the same selected set (P2)

**Goal**: User-initiated rematch keeps the same character set and regenerates the board from that set.

**Independent Test**: Start from a completed non-default match, request rematch, and verify the next match keeps the same set while regenerating board identity from that set.

- [x] T019 [US3] Update rematch setup to use `room.geishaSet` instead of defaulting to Ginza in `server/index.js`.
- [x] T020 [US3] Ensure rematch-created game state and broadcasts preserve the selected `geishaSet` in `server/index.js`.
- [x] T021 [P] [US3] Add rematch tests for `collaboration` or `hololive` preserving set and regenerating board from that set in `server/utils/gameUtils.test.js` or `server/utils/roomFlow.test.js`.

## Phase 6 - User Story 4: Reject unsupported or removed character sets (P2)

**Goal**: Unsupported, removed, unknown, or unavailable character sets are rejected during room creation and snapshot restoration without fallback to Ginza.

**Independent Test**: Attempt room creation and snapshot restoration with unsupported set keys and fewer-than-seven sets; verify rejection and no fallback state.

- [x] T022 [US4] Update `isSupportedGeishaSet` and related room creation rejection logic to use centralized availability checks in `server/index.js`.
- [x] T023 [US4] Update `restoreRoomFromSnapshot` to preserve supported set keys and reject unsupported or unavailable set keys in `server/index.js`.
- [x] T024 [US4] Update `createWaitingGameState` to reject unsupported/unavailable set keys and preserve supported set keys in `server/index.js`.
- [x] T025 [US4] Ensure error messages for unsupported or unavailable sets provide a create-new-match recovery path without hidden state details in `server/index.js`.
- [x] T026 [P] [US4] Add snapshot restoration rejection and preservation tests in `server/utils/gameUtils.test.js` or a new `server/utils/roomSnapshot.test.js`.

## Phase 7 - Polish & Cross-Cutting Concerns

- [x] T027 [P] Update 016 spec status and implementation notes after completion in `specs/016-character-set-expansion/spec.md`.
- [x] T028 [P] Update quickstart or contract notes if implementation changes the planned validation commands in `specs/016-character-set-expansion/quickstart.md` or `specs/016-character-set-expansion/contracts/character-set-contract.md`.
- [x] T029 Run `cd server && npm test`.
- [x] T030 Run `CI=1 npm test -- --watchAll=false`.
- [x] T031 Run `npm run build`.
- [x] T032 Confirm no remaining default-only narrowing for active gameplay set flow using `rg -n "activeGeishaSet: 'default'|geishaSet: DEFAULT_GEISHA_SET|geishaSet: 'default'" src server game-shared-types`.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before all user story phases.
- US1 before US2 and US3 because next-round and rematch behavior require expanded board generation.
- US1 before US4 where room creation and snapshot validation need supported set definitions.
- US2, US3, and US4 can proceed in parallel after US1 if they touch separate tests and focused server paths.
- Phase 7 after all user story phases.

## Parallel Execution Examples

- Setup: T002 can run while T001 review is being completed.
- Foundation: T008 can be drafted after T005-T007 interfaces are decided, while T003-T004 type updates proceed separately.
- US1: T014 can be written in parallel with T011-T013 once T009-T010 behavior is defined.
- US2: T018 can be written in parallel with T016-T017 after expected preservation behavior is clear.
- US3: T021 can be written in parallel with T019-T020 after rematch state contract is clear.
- US4: T026 can be written in parallel with T022-T025 after rejection rules are centralized.
- Polish: T027 and T028 can be done in parallel before validation commands T029-T031.

## Implementation Strategy

1. MVP first: complete Foundation and US1 so all three sets can create valid boards with unchanged item/charm rules.
2. Preserve game continuity: complete US2 and US3 so lifecycle behavior stays aligned with existing rules.
3. Harden invalid data boundaries: complete US4 to reject unsupported or unavailable sets without fallback.
4. Validate with server tests first, then frontend tests/build.
