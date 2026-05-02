# Tasks: Legacy Data Cleanup

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/010-legacy-data-cleanup/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/legacy-data-cleanup-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review requirement baseline and acceptance criteria in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/010-legacy-data-cleanup/spec.md`
- [X] T002 Record active cleanup scope and constraints in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/010-legacy-data-cleanup/plan.md`

## Phase 2 - Foundational

**Goal**: Establish shared-type and server constraints so removed legacy modes cannot be reintroduced by later story work.

- [X] T003 Narrow `GeishaSet` to default-only compatibility key in `/Users/zhangzhipeng/MyProject/hanamikoji-game/game-shared-types/src/game.types.ts`
- [X] T004 Align frontend shared-type augmentation with narrowed mode key in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/types/game-shared-types.d.ts`
- [X] T005 Remove non-Ginza mode selection state shape from lobby create-room form in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`
- [X] T006 Add server-side legacy mode rejection/normalization guard for room setup input in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`

## Phase 3 - User Story 1 (P1)

**Goal**: Clear old gameplay data paths so new default matches always use Ginza v2 and cannot fallback to legacy datasets.

**Independent Test**: Create a new default match and verify Ginza board-slot setup remains active while old mode/data entrypoints no longer execute.

- [X] T007 [US1] Remove legacy geisha set data and mapping branches from active setup helpers in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.js`
- [X] T008 [US1] Remove legacy deck fallback branch (`geisha-*` card generation path) from deck construction in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.js`
- [X] T009 [US1] Replace frontend legacy geisha/item source maps with Ginza-default-only data access in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/gameData.ts`
- [X] T010 [US1] Remove non-Ginza room option rendering and submission payload values in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`
- [X] T011 [P] [US1] Update server setup tests to assert default→Ginza behavior without legacy fallback in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`

## Phase 4 - User Story 2 (P2)

**Goal**: Keep generic display fallback resilience while rejecting old snapshot/state data explicitly.

**Independent Test**: Simulate missing display fields and old-mode input; UI remains readable with generic fallback, and legacy state is rejected with explicit unsupported handling.

- [X] T012 [US2] Implement explicit unsupported-legacy-state handling for stale room/match data load path in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`
- [X] T013 [US2] Ensure card/image fallback logic uses generic fallback only and never legacy mapping in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/gameData.ts`
- [X] T014 [P] [US2] Surface unsupported-old-room user feedback copy in room/game flow UI in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`
- [X] T015 [P] [US2] Add focused regression test for rejected legacy mode/setup request in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js`

## Phase 5 - User Story 3 (P3)

**Goal**: Prove cleanup does not change gameplay behavior, realtime contracts, or hidden-information boundaries.

**Independent Test**: Run existing action flow and build validations; confirm no contract/payload changes and no hidden-information leak introduced by cleanup.

- [X] T016 [US3] Audit and preserve action/event payload compatibility while removing legacy data references in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`
- [X] T017 [P] [US3] Verify frontend gameplay views still consume existing payload fields without exposing hidden info in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`
- [X] T018 [P] [US3] Update feature verification notes for behavior-equivalence checks in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/010-legacy-data-cleanup/quickstart.md`

## Phase 6 - Polish & Cross-Cutting

- [X] T019 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`
- [X] T020 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`
- [X] T021 Run `npm test` from `/Users/zhangzhipeng/MyProject/hanamikoji-game/server`
- [X] T022 Run legacy reference audit and document intentional leftovers with `rg "akatsuki|onesan|collaboration|createLegacyGeishas|geishaSetMap|geisha-" src server game-shared-types` in `/Users/zhangzhipeng/MyProject/hanamikoji-game`
- [X] T023 Confirm retained old asset files remain on disk while inactive in code paths by reviewing `/Users/zhangzhipeng/MyProject/hanamikoji-game/public/images`

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before any user story phase.
- User Story 1 (Phase 3) must complete before User Story 2 because fallback and rejection behavior depends on cleaned data sources.
- User Story 2 (Phase 4) should complete before User Story 3 verification.
- Polish phase runs after all story phases are complete.

## Parallel Execution Examples

- US1 parallel set: run T011 in parallel with T009 after T007/T008 are stable.
- US2 parallel set: run T014 and T015 in parallel after T012 is implemented.
- US3 parallel set: run T017 and T018 in parallel after T016 confirms no payload contract drift.

## Implementation Strategy

- MVP first: complete Phase 3 (US1) to ensure default Ginza-only runtime with no legacy fallback.
- Increment 2: complete Phase 4 (US2) for explicit old-state rejection and safe generic fallback.
- Increment 3: complete Phase 5 (US3) to verify no gameplay behavior regressions.
- Finalize with Phase 6 automated checks and static audit before closeout.

