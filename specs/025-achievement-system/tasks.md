# Tasks: Achievement System

**Input**: Design documents from `specs/025-achievement-system/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/achievement-system-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review 025 requirements and design boundaries in `specs/025-achievement-system/spec.md`, `specs/025-achievement-system/plan.md`, and `specs/025-achievement-system/contracts/achievement-system-contract.md`.
- [X] T002 [P] Inspect existing account counter update and match completion flow in `server/utils/accountStore.js` and `server/index.js`.
- [X] T003 [P] Inspect existing Lobby account sync state and tests in `src/pages/Lobby/index.tsx` and `src/pages/Lobby/index.test.tsx`.
- [X] T004 [P] Inspect existing shared type mirrors in `game-shared-types/src/game.types.ts` and `src/types/game-shared-types.d.ts`.

## Phase 2 - Foundation

- [X] T005 Add achievement catalog, summary, status, and WebSocket payload types in `game-shared-types/src/game.types.ts`.
- [X] T006 Mirror achievement shared types in `src/types/game-shared-types.d.ts`.
- [X] T007 [P] Add achievement WebSocket summary redaction coverage in `src/utils/runtimeLogger.test.ts`.
- [X] T008 Add achievement message summarization without private payload leakage in `src/utils/runtimeLogger.ts`.
- [X] T009 [P] Create backend achievement store test scaffold for catalog, durable status, progress, unlocks, summary, and acknowledgement in `server/utils/achievementStore.test.js`.
- [X] T010 Create backend achievement store module skeleton and starter catalog constants in `server/utils/achievementStore.js`.

## Phase 3 - User Story 1: Earn Achievements From Completed Matches (Priority: P1)

**Goal**: Bound durable accounts earn the four starter achievements exactly once from server-confirmed completed matches, with no client-declared proof and no pre-025 backfill.

**Independent Test**: Use bound account profiles, process server-confirmed completed matches, and confirm first completed match, first win, complete 3 matches, and win 3 matches unlock exactly once while preserving first unlock time.

- [X] T011 [P] [US1] Add backend tests for the four starter catalog definitions in `server/utils/achievementStore.test.js`.
- [X] T012 [P] [US1] Add backend tests for first completed match and first win progress/unlocks in `server/utils/achievementStore.test.js`.
- [X] T013 [P] [US1] Add backend tests for complete 3 matches and win 3 matches progress/unlocks in `server/utils/achievementStore.test.js`.
- [X] T014 [P] [US1] Add backend tests for repeated `completionId` processing preserving progress totals, one unlock record, and first `unlockedAt` in `server/utils/achievementStore.test.js`.
- [X] T015 [P] [US1] Add backend tests proving pre-025 account counters do not initialize progress or unlocks in `server/utils/achievementStore.test.js`.
- [X] T016 [P] [US1] Add backend integration tests proving account counters and achievement progress update consistently from one server-confirmed completion in `server/utils/accountStore.test.js`.
- [X] T017 [US1] Implement catalog validation, processed `completionId` guard, progress update, unlock creation, and summary derivation in `server/utils/achievementStore.js`.
- [X] T018 [US1] Integrate achievement evaluation into server-confirmed match completion after account counter updates in `server/utils/accountStore.js`.
- [X] T019 [US1] Pass the stable server-owned `completionId` through the game end flow without changing gameplay rules in `server/index.js`.

## Phase 4 - User Story 2: Preserve Guest Play Without Persistent Achievements (Priority: P1)

**Goal**: Guest players and durable-storage-unavailable bound accounts can keep playing, but they do not create persistent achievement progress or session-only progress.

**Independent Test**: Complete guest and unavailable-storage matches, then confirm no progress or unlock records are written and achievement status returns guest or unavailable messaging.

- [X] T020 [P] [US2] Add backend tests for guest match completion creating no achievement progress or unlock records in `server/utils/achievementStore.test.js`.
- [X] T021 [P] [US2] Add backend tests for temporary or unavailable account persistence returning unavailable achievement state with no session-only progress in `server/utils/achievementStore.test.js`.
- [X] T022 [P] [US2] Add backend tests proving client-supplied achievement progress, unlock claims, match results, and `lineUserId` are ignored in `server/utils/achievementStore.test.js`.
- [X] T023 [US2] Enforce durable-only achievement writes and unavailable summaries in `server/utils/achievementStore.js`.
- [X] T024 [US2] Add WebSocket `ACHIEVEMENT_STATUS` handling for guest and unavailable states in `server/index.js`.
- [X] T025 [US2] Add Lobby tests for guest and unavailable achievement messaging in `src/pages/Lobby/index.test.tsx`.
- [X] T026 [US2] Render non-blocking guest and unavailable achievement states in `src/pages/Lobby/index.tsx`.

## Phase 5 - User Story 3: View Achievement Progress And Unlocks In Lobby (Priority: P1)

**Goal**: Bound durable players can open a compact Lobby achievement view that lists locked, in-progress, and unlocked starter achievements with measurable progress.

**Independent Test**: Seed a bound account with locked, in-progress, and unlocked achievements, open the Lobby achievement entry, and confirm the list shows correct titles, progress, states, and no private account data.

- [X] T027 [P] [US3] Add frontend tests for a bound durable achievement entry and list rendering in `src/pages/Lobby/index.test.tsx`.
- [X] T028 [P] [US3] Add frontend tests for locked, in-progress, unlocked, and zero-progress starter states in `src/pages/Lobby/index.test.tsx`.
- [X] T029 [P] [US3] Add backend tests for `ACHIEVEMENT_STATUS` available summary including all four starter achievements in `server/utils/achievementStore.test.js`.
- [X] T030 [US3] Add WebSocket `ACHIEVEMENT_STATUS` handling for bound available summaries in `server/index.js`.
- [X] T031 [US3] Add frontend achievement WebSocket helper functions for status request and result handling in `src/utils/achievementAccount.ts`.
- [X] T032 [US3] Wire Lobby achievement status loading to connected account sync state in `src/pages/Lobby/index.tsx`.
- [X] T033 [US3] Build the compact Lobby achievement entry and achievement list UI in `src/pages/Lobby/index.tsx`.
- [X] T034 [US3] Add mobile-friendly achievement UI styles in `src/index.css`.

## Phase 6 - User Story 4: Surface New Unlocks In Lobby (Priority: P2)

**Goal**: Newly unlocked achievements surface as a non-blocking Lobby entry/list marker after match completion and can be cleared when the player opens or acknowledges the achievement view.

**Independent Test**: Complete a match that unlocks an achievement, return to Lobby, confirm the new-unlock marker appears once, then open/acknowledge achievements and confirm the marker clears while unlock records remain.

- [X] T035 [P] [US4] Add backend tests for unseen unlock count, refreshed acknowledgement summary, and acknowledgement idempotency in `server/utils/achievementStore.test.js`.
- [X] T036 [P] [US4] Add frontend tests for Lobby new-unlock marker display and clearing behavior in `src/pages/Lobby/index.test.tsx`.
- [X] T037 [US4] Implement `seenAt` acknowledgement, refreshed summary result, and new-unlock count updates in `server/utils/achievementStore.js`.
- [X] T038 [US4] Add WebSocket `ACHIEVEMENT_ACK_NEW_UNLOCKS` handling in `server/index.js`.
- [X] T039 [US4] Send acknowledgement when the Lobby achievement view is opened or cleared in `src/utils/achievementAccount.ts` and `src/pages/Lobby/index.tsx`.
- [X] T040 [US4] Style the Lobby new-unlock marker without blocking room creation, joining, NPC mode, or navigation in `src/index.css`.

## Phase 7 - Polish & Cross-Cutting Concerns

- [X] T041 [P] Run shared type validation with `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json`.
- [X] T042 [P] Run focused backend validation with `npm --prefix server test`.
- [X] T043 [P] Run focused frontend validation with `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx src/utils/runtimeLogger.test.ts`.
- [X] T044 Run full frontend test suite with `CI=1 npm test -- --watchAll=false`.
- [X] T045 Run production build with `npm run build`.
- [X] T046 Update implementation validation notes in `specs/025-achievement-system/quickstart.md`.
- [X] T047 Review starter achievement Traditional Chinese copy, stable catalog IDs, and catalog expansion boundaries in `server/utils/achievementStore.js` and `src/pages/Lobby/index.tsx`.
- [X] T048 Review `specs/025-achievement-system/spec.md`, `specs/025-achievement-system/plan.md`, and `specs/025-achievement-system/tasks.md` for drift after implementation.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before any user story implementation because shared types, runtime redaction, and backend store scaffolding are cross-story prerequisites.
- US1 is the MVP and must complete before US3 or US4 can show meaningful bound achievement summaries.
- US2 can run after Phase 2 and may proceed in parallel with US1 tests, but its implementation depends on the backend store shape from T010/T017.
- US3 depends on shared contracts from Phase 2 and available/guest/unavailable status behavior from US1/US2.
- US4 depends on US1 unlock records and US3 Lobby achievement view wiring.
- Phase 7 validation runs after all implemented story phases.

## Parallel Execution Examples

```text
US1 backend test split:
- T012 Add first completed match / first win tests in server/utils/achievementStore.test.js
- T013 Add 3-match / 3-win milestone tests in server/utils/achievementStore.test.js
- T014 Add completionId idempotency tests in server/utils/achievementStore.test.js
```

```text
US2 frontend/backend split:
- T020 Add unavailable persistence backend tests in server/utils/achievementStore.test.js
- T025 Add Lobby guest/unavailable frontend tests in src/pages/Lobby/index.test.tsx
```

```text
US3 frontend split:
- T027 Add achievement entry/list rendering tests in src/pages/Lobby/index.test.tsx
- T031 Add achievement WebSocket helper functions in src/utils/achievementAccount.ts
- T034 Add achievement UI styles in src/index.css
```

```text
US4 split:
- T035 Add unseen unlock acknowledgement tests in server/utils/achievementStore.test.js
- T036 Add Lobby marker clearing tests in src/pages/Lobby/index.test.tsx
- T040 Add new-unlock marker styles in src/index.css
```

## Implementation Strategy

### MVP First

Deliver US1 first: backend starter catalog, durable bound account progress, unlock persistence, idempotency, and server-confirmed match completion integration. This proves the core achievement value without requiring Lobby UI.

### Incremental Delivery

1. Complete Phase 1 and Phase 2 to establish shared contracts and store scaffolding.
2. Complete US1 and validate with backend tests.
3. Complete US2 to preserve guest play and durable-unavailable behavior.
4. Complete US3 to expose the Lobby achievement view.
5. Complete US4 to add Lobby new-unlock feedback.
6. Run Phase 7 validation and update quickstart validation notes.

### Notes

- Do not add LINE Login Channel ID handling in this spec.
- Do not backfill from pre-025 account counters or historical matches.
- Do not change post-match result or rematch UI.
- Keep detailed visual review as a user-owned manual check under AGENTS.md.
