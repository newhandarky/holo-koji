# Tasks: Snapshot And Contract Hardening

**Input**: Design documents from `specs/018-snapshot-contract-hardening/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/snapshot-contract-hardening.md`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review the active spec, plan, research, data model, contract, and quickstart in `specs/018-snapshot-contract-hardening/`.
- [x] T002 [P] Audit current restore, resend, waiting-room, rematch, and room-creation `geishaSet` handling in `server/index.js`, `server/utils/gameUtils.js`, `server/utils/roomStore.js`, `src/pages/GameRoom/index.tsx`, `src/components/game/GameBoard.tsx`, `src/reducers/gameReducer.ts`, and `game-shared-types/src/game.types.ts`.

## Phase 2 - Foundation

- [x] T003 Consolidate supported-set and restore validation entry points for snapshot flows in `server/utils/gameUtils.js`.
- [x] T004 Define shared restore failure contract and user-facing recovery message expectations in `server/index.js`, `src/pages/GameRoom/index.tsx`, and `specs/018-snapshot-contract-hardening/contracts/snapshot-contract-hardening.md`.
- [x] T005 Audit and align `geishaSet` producer/consumer typing across `game-shared-types/src/game.types.ts`, `game-shared-types/dist/game.types.d.ts`, and `src/types/game-shared-types.d.ts`.
- [x] T006 [P] Add or extend focused utility test scaffolding for restore validation and room-state visibility boundaries in `server/utils/gameUtils.test.js` and relevant frontend room tests under `src/pages/GameRoom/`.

## Phase 3 - User Story 1: Restore a valid room with the correct character set (P1)

**Goal**: Valid saved rooms for supported sets restore with the same room set identity and board state.

**Independent Test**: Restore valid `default`, `collaboration`, and `hololive` room snapshots and verify the room resumes with the same set identity, board characters, and room state.

- [x] T007 [US1] Ensure restore paths resolve supported `geishaSet` values consistently from snapshot room-level and game-state data in `server/utils/gameUtils.js` and `server/index.js`.
- [x] T008 [US1] Ensure valid restored rooms preserve the resolved `geishaSet` into `GameRoom`, waiting state, and active game state in `server/index.js` and `src/pages/GameRoom/index.tsx`.
- [x] T009 [US1] Ensure restored board character assignments are accepted only when the seven saved characters are valid for the resolved set in `server/utils/gameUtils.js` and `server/index.js`.
- [x] T010 [P] [US1] Add focused server tests for successful restore of valid `default`, `collaboration`, and `hololive` snapshots in `server/utils/gameUtils.test.js`.
- [x] T011 [P] [US1] Add focused room rendering coverage proving restored room content continues to consume the resolved `geishaSet` without drift in `src/pages/GameRoom/index.test.tsx`.

## Phase 4 - User Story 2: Reject invalid or obsolete saved room data (P1)

**Goal**: Invalid snapshots are rejected deterministically, with no fallback, no partial shell, and a simple recovery message.

**Independent Test**: Attempt restore with unknown set keys, unavailable sets, mixed-set boards, and incomplete seven-character boards, and verify rejection plus new-room recovery behavior.

- [x] T012 [US2] Reject unknown, removed, or unsupported set keys during restore without falling back to another set in `server/utils/gameUtils.js` and `server/index.js`.
- [x] T013 [US2] Reject restore attempts when the referenced supported set is currently unavailable for valid match generation in `server/utils/gameUtils.js` and `server/index.js`.
- [x] T014 [US2] Reject snapshots whose board contains fewer than seven valid characters or mixes characters from multiple sets in `server/utils/gameUtils.js` and `server/index.js`.
- [x] T015 [US2] Ensure rejected restore attempts terminate into a new-room recovery path and do not leave a partial waiting room or playable shell in `server/index.js` and `src/pages/GameRoom/index.tsx`.
- [x] T016 [US2] Keep restore-failure messaging simple and non-technical in `server/index.js` and any affected room error display surface in `src/pages/GameRoom/index.tsx`.
- [x] T017 [P] [US2] Add focused server tests for unsupported set rejection, unavailable set rejection, mixed-set board rejection, and incomplete-board rejection in `server/utils/gameUtils.test.js`.

## Phase 5 - User Story 3: Keep room contracts aligned across creation, waiting, rematch, and restore (P2)

**Goal**: One room keeps one consistent `geishaSet` identity across all valid lifecycle transitions for both host and joiner.

**Independent Test**: Start rooms for supported sets and verify `geishaSet` consistency through waiting room, active gameplay, unresolved next round, rematch, and valid restore for host and joiner.

- [x] T018 [US3] Audit and fix waiting-room state creation so `geishaSet` remains aligned with the room identity in `server/index.js`.
- [x] T019 [US3] Audit and fix active gameplay state creation and resend paths so non-default room identity is not normalized away in `server/index.js`, `src/pages/GameRoom/index.tsx`, and `src/components/game/GameBoard.tsx`.
- [x] T020 [US3] Preserve `geishaSet` and existing seven characters through unresolved next-round transitions in `server/index.js`.
- [x] T021 [US3] Preserve room `geishaSet` correctly through rematch setup and rematch-confirmation flows in `server/index.js`.
- [x] T022 [P] [US3] Add focused server tests covering `geishaSet` preservation across waiting room, unresolved next round, rematch, and valid restore in `server/utils/gameUtils.test.js` and any relevant server test file.
- [x] T023 [P] [US3] Add focused frontend room tests for host/joiner room-level set identity consistency across room entry and restored room rendering in `src/pages/GameRoom/index.test.tsx`.

## Phase 6 - User Story 4: Prevent hidden state leakage while hardening contracts (P2)

**Goal**: Restore and resend paths keep room identity public while hidden hands, secret cards, and pending choices remain private.

**Independent Test**: Inspect player-visible state for host and joiner across create, restore, resend, and rematch flows and verify no unauthorized hidden information is exposed.

- [x] T024 [US4] Audit player-visible room/game-state shaping during create, restore, resend, and rematch flows in `server/index.js`.
- [x] T025 [US4] Ensure room-level `geishaSet` remains visible to valid participants without exposing opponent hidden hand contents in `server/index.js` and `src/pages/GameRoom/index.tsx`.
- [x] T026 [US4] Ensure pending secret choices and secret cards remain restricted to authorized players after restore-related state rebuilds in `server/index.js`.
- [x] T027 [P] [US4] Add focused test coverage for player-visible state boundaries during restore/resend flows in `server/utils/gameUtils.test.js` or the most relevant server test file.

## Phase 7 - Polish & Cross-Cutting Concerns

- [x] T028 [P] Sync 018 implementation notes after implementation in `specs/018-snapshot-contract-hardening/spec.md`.
- [x] T029 [P] Sync contract and quickstart wording with the final restore failure, identity, and visibility behavior in `specs/018-snapshot-contract-hardening/contracts/snapshot-contract-hardening.md` and `specs/018-snapshot-contract-hardening/quickstart.md`.
- [x] T030 Run `cd server && npm test`.
- [x] T031 Run `CI=1 npm test -- --watchAll=false`.
- [x] T032 Run `npm run build`.
- [x] T033 Confirm no fallback-style restore behavior remains by scanning restore and room shell handling in `server/index.js` and `server/utils/gameUtils.js`.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before all user story phases.
- US1 before US2 because valid-restore acceptance rules establish the same restore contract that reject paths are enforcing.
- US1 before US3 because room lifecycle consistency depends on valid room-level set preservation being in place first.
- US2 before US4 because restore rejection and state-rebuild boundaries should be hardened before auditing visibility behavior.
- US3 and US4 can proceed in parallel after US2 if work is split across non-overlapping files/tests.
- Phase 7 after all user story phases.

## Parallel Execution Examples

- Setup: T002 can run while T001 review is being completed.
- Foundation: T006 can be prepared in parallel with T003-T005 once the key restore and contract surfaces are identified.
- US1: T010 and T011 can be written in parallel after T007-T009 define the valid restore contract.
- US2: T017 can be written in parallel with T012-T016 once reject conditions are finalized.
- US3: T022 and T023 can be written in parallel with T018-T021 because they validate lifecycle identity preservation from separate server/frontend angles.
- US4: T027 can be written in parallel with T024-T026 after the visibility audit targets are identified.
- Polish: T028 and T029 can run in parallel before validation commands T030-T032.

## Implementation Strategy

1. MVP first: complete Foundation, US1, and US2 so valid snapshots restore and invalid snapshots fail safely.
2. Lifecycle consistency next: complete US3 so room identity remains stable across waiting room, gameplay, unresolved next round, rematch, and valid restore.
3. Visibility hardening after contract correctness: complete US4 so restore/rebuild flows do not leak hidden state.
4. Finish with validation and documentation sync.
