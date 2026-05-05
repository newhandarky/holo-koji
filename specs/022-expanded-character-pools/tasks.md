# Tasks: Expanded Character Pools

**Input**: Design documents from `specs/022-expanded-character-pools/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/character-pool-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review 022 scope and clarified exactly-seven behavior in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/spec.md`.
- [x] T002 Review implementation plan and validation expectations in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/plan.md`.
- [x] T003 [P] Review board generation and validation helpers in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.js`.
- [x] T004 [P] Review existing focused server tests in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.

## Phase 2 - Foundation

**Purpose**: Establish shared fixtures and assertions used by all user stories.

- [x] T005 Add reusable test helpers for serializing character-to-slot assignment and asserting seven unique board characters in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T006 Add an injected oversized character-pool fixture with at least eight valid profiles in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T007 Add an injected duplicate-character fixture and incomplete-character fixture in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.

## Phase 3 - User Story 1: Start matches from whole character pools (P1)

**Goal**: New online or NPC matches always generate exactly seven unique board characters from the selected set's full available pool.

**Independent Test**: Repeated board generation for Ginza, 擅自合作系列, and Hololive produces exactly seven unique characters from the selected set; exactly-seven pools can still change character-to-slot placement; an oversized fixture selects seven unique profiles from more than seven available.

- [x] T008 [P] [US1] Add a focused test that each supported production pool has at least seven valid profiles in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T009 [P] [US1] Add a focused test that exactly-seven production pools select all seven profiles while deterministic seeds can produce different character-to-slot assignments in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T010 [P] [US1] Add a focused test that an injected oversized pool returns exactly seven unique selected characters in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T011 [US1] Update `createRandomizedGeishas()` or its helper only if the new tests reveal missing full-pool sampling behavior in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.js`.
- [x] T012 [US1] Run `npm --prefix server test` and record whether US1 focused tests pass in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/tasks.md`.

## Phase 4 - User Story 2: Preserve current game rules while randomizing cast setup (P1)

**Goal**: Random character identity does not change charm distribution, item identity, action legality, scoring, or win rules.

**Independent Test**: Generated boards keep the seven fixed board slots and charm distribution; deck generation derives item card payload from board slot rather than character identity.

- [x] T013 [P] [US2] Add or tighten a test that generated boards for all supported sets preserve boardSlotId order and charm distribution in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T014 [P] [US2] Add or tighten a test that `buildDeckForGeishas()` keeps item card `boardSlotId`, `itemAssetName`, `itemLabel`, `itemImageUrl`, and `itemIconUrl` tied to board slots in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T015 [US2] Update deck or board-slot helper logic only if tests show character identity affects item/charm behavior in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.js`.
- [x] T016 [US2] Run `npm --prefix server test` and record whether US2 focused tests pass in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/tasks.md`.

## Phase 5 - User Story 3: Keep round continuation stable within a match (P2)

**Goal**: Unresolved next rounds preserve the same selected seven characters, board slots, and control state.

**Independent Test**: A generated board with control state cloned for next round keeps the same `characterId`, `boardSlotId`, `charmPoints`, and `controlledBy` values.

- [x] T017 [P] [US3] Add a focused test for `cloneGeishasForNextRound()` preserving character IDs, board slots, charm values, and control state in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T018 [P] [US3] Add a focused test that `createGameStateWithOrder()` reuses provided base geishas instead of sampling a new board in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T019 [US3] Update next-round or ordered-state helper logic only if tests show selected board casts are regenerated mid-match in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.js`.
- [x] T020 [US3] Run `npm --prefix server test` and record whether US3 focused tests pass in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/tasks.md`.

## Phase 6 - User Story 4: Keep unsupported or incomplete pools unavailable (P2)

**Goal**: Invalid, undersized, duplicate, incomplete, or mismatched pools fail safely instead of creating or restoring broken boards.

**Independent Test**: Invalid fixtures and mismatched restore snapshots throw validation errors without fallback characters.

- [x] T021 [P] [US4] Add a focused test that `validateCharacterSetData()` rejects duplicate character IDs and incomplete character profiles in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T022 [P] [US4] Add a focused test that `validateMatchBoardForSet()` rejects duplicate board slots and characters outside the selected set in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T023 [P] [US4] Add a focused test that `resolveRestorableBoardForSet()` rejects mismatched `baseGeishas` and `gameState.geishas` for the selected set in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T024 [US4] Update validation helpers only if tests reveal fallback, duplicate, or mismatch acceptance in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.js`.
- [x] T025 [US4] Run `npm --prefix server test` and record whether US4 focused tests pass in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/tasks.md`.

## Phase 7 - Polish & Cross-Cutting Concerns

- [x] T026 Review whether shared type payloads remain unchanged in `/Users/zhangzhipeng/MyProject/hanamikoji-game/game-shared-types/src/game.types.ts`.
- [x] T027 Review whether existing Lobby character-set choices remain unchanged in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/characterSetOptions.ts`.
- [x] T028 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and record pass/fail plus unrelated failures in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/tasks.md`.
- [x] T029 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and record pass/fail in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/tasks.md`.
- [x] T030 Update `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools/quickstart.md` if validation commands or residual manual review items change.
- [x] T031 Run a final spec-artifact scan for unresolved clarification markers or template residue under `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/022-expanded-character-pools` and resolve any findings in the affected artifact file.
- [x] T032 Add explicit FR-012 coverage for joiner waiting state preserving the room creator selected set and generated board in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`.
- [x] T033 Confirm player-visible recovery messages for invalid room snapshots and character-set configuration failures remain generic and actionable in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 fixtures and helpers must complete before user-story test implementation.
- US1 and US2 are both P1 and can be implemented after Phase 2; US2 should not depend on US1 implementation unless helper behavior changes.
- US3 depends on the selected-board contract from US1 but can be tested independently with explicit fixture boards.
- US4 depends on Phase 2 invalid fixtures and can run in parallel with US3 after Phase 2.
- Polish validation runs after all selected user-story phases.

## Parallel Execution Examples

- Phase 1: T003 and T004 can run in parallel because they inspect different files.
- Phase 2: T006 and T007 can be prepared in parallel once T005 helper naming is agreed.
- US1: T008, T009, and T010 can be written in parallel in separate test blocks.
- US2: T013 and T014 can be written in parallel because one checks generated boards and one checks deck payloads.
- US3: T017 and T018 can be written in parallel because they target different helper behavior.
- US4: T021, T022, and T023 can be written in parallel as independent validation tests.

## Implementation Strategy

1. MVP first: complete Phase 1, Phase 2, and US1 to prove the full-pool seven-character selection rule.
2. Preserve rules next: complete US2 before changing any gameplay-facing helper behavior.
3. Add stability and failure safety: complete US3 and US4.
4. Close out with focused server validation, full frontend test/build validation, and any required documentation updates.

## Notes

- Keep implementation scoped to 022; do not add new character sets or custom selection UI.
- Do not expand production character data unless a later user request explicitly asks for it.
- Do not change package versions or release notes in this spec.
- Detailed UI visual review remains user-owned under AGENTS.md; record it as residual unless the user confirms it.

## Validation Notes

- `npm --prefix server test` failed before implementation as expected: the new restore mismatch test exposed that `resolveRestorableBoardForSet()` did not compare `baseGeishas` and `gameState.geishas` board identity.
- `npm --prefix server test` passed after implementation: 25 tests passed, 0 failed.
- `CI=1 npm test -- --watchAll=false` was executed and did not pass because of existing unrelated Lobby label expectations in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`: tests still query `藝妓組合` and old unavailable-copy text, while the UI currently exposes `女公關組合`.
- `npm run build` passed.
- FR-012 join-room coverage is explicit in `server/utils/gameUtils.test.js`: joiner waiting state keeps the room creator's selected `geishaSet` and generated board identity.
- NFR-002 recovery-path coverage is documented against `server/index.js`: invalid room snapshots return `房間資料無效，請重新建立對戰。`; unsupported legacy character sets return `不支援舊版藝妓組合資料，請重新建立對戰。`; character-set configuration failures return `角色組合資料設定錯誤，請重新建立對戰。` These messages avoid technical internals and tell players to recreate the match.
- No shared type payload change was required in `/Users/zhangzhipeng/MyProject/hanamikoji-game/game-shared-types/src/game.types.ts`.
- No Lobby character-set option change was required in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/characterSetOptions.ts`.
- Manual UI visual review remains a user-owned residual item.
