# Tasks: Game Data v2 Contract

**Input**: Design documents from `specs/005-game-data-v2-contract/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review `specs/005-game-data-v2-contract/spec.md`, `plan.md`, `research.md`, `data-model.md`, and `quickstart.md` before code changes.
- [x] T002 Confirm the repo is on `005-game-data-v2-contract` and inspect current default-match setup paths in `server/utils/gameUtils.js`, `server/index.js`, `game-shared-types/src/game.types.ts`, and `src/utils/gameData.ts`.

## Phase 2 - Foundational

- [x] T003 Audit all current `geishaId`, `type`, `charmPoints`, and `geishaSet` coupling points in `server/utils/gameUtils.js`, `server/index.js`, `game-shared-types/src/game.types.ts`, `src/utils/gameData.ts`, and `src/components/game/`.
- [x] T004 Define Ginza character-pool records and seven board-slot item-asset definitions in `server/utils/gameUtils.js` or a dedicated adjacent server data module.
- [x] T005 [P] Extend shared gameplay types for Ginza display-only fields in `game-shared-types/src/game.types.ts` and update the generated consumer declaration in `src/types/game-shared-types.d.ts`.
- [x] T006 Add server-side validation helpers for Ginza pool size, board-slot completeness, and stable item-asset naming in `server/utils/gameUtils.js` or the new server data module.
- [x] T007 Define a setup-level random abstraction for selection/shuffle injection in `server/utils/gameUtils.js` so production and test setup share one code path.

## Phase 3 - User Story 1

**Goal**: Start a new default match with Ginza-backed server data, fixed board-slot charm values, and complete item-card display payloads instead of the legacy default data path.

**Independent Test**: Start a new default match and confirm the board shows seven Ginza characters, charm values follow `2,2,2,3,3,4,5`, generated item cards match slot charm counts, and synced item cards expose the required display-only fields.

- [x] T008 [US1] Replace the active `default` setup source with Ginza character-pool and board-slot selection logic in `server/utils/gameUtils.js`.
- [x] T009 [US1] Refactor server match setup in `server/utils/gameUtils.js` to create active board geishas from selected characters plus board-slot charm/item definitions.
- [x] T010 [US1] Update deck generation in `server/utils/gameUtils.js` so each `ItemCard` carries `boardSlotId`, `itemAssetName`, `itemLabel`, `itemImageUrl`, and `itemIconUrl` while preserving rule-facing `geishaId`.
- [x] T011 [US1] Thread the Ginza-backed default setup through room creation and game initialization flows in `server/index.js` without changing Socket.IO event names.
- [x] T012 [US1] Update frontend data helpers in `src/utils/gameData.ts` to prefer server-provided Ginza display data and avoid reconstructing slot-bound item art from legacy local mappings.
- [x] T013 [US1] Update current gameplay surfaces in `src/components/game/PlayerHand.tsx`, `src/components/game/CompetitionGroupModal.tsx`, `src/components/game/ActionTokens.tsx`, `src/components/game/DrawCardModal.tsx`, and `src/pages/GameRoom/index.tsx` to remain compatible with the expanded `ItemCard` payload.
- [x] T014 [US1] Keep the lobby default-mode flow stable in `src/pages/Lobby/index.tsx` while ensuring the selected `default` path now resolves to Ginza-backed match data.
- [x] T015 [US1] Add focused setup validation coverage for Ginza default match creation and invalid-data rejection in `server/utils/gameUtils.test.js`.

## Phase 4 - User Story 2

**Goal**: Preserve the same seven selected characters and existing control state across unresolved rounds, while keeping rematch behavior as a fresh randomized match after match end.

**Independent Test**: Play or simulate an unresolved round transition and confirm board identity remains stable, then trigger rematch after match end and confirm setup runs again with a fresh seven-character selection.

- [x] T016 [US2] Audit and preserve unresolved-round carry-forward behavior for active board geishas and `controlledBy` state in `server/index.js`.
- [x] T017 [US2] Refine rematch setup in `server/index.js` so rematch explicitly runs the Ginza-backed fresh-setup path without reusing unresolved-round board identity.
- [x] T018 [US2] Update any client state assumptions about geisha identity continuity in `src/reducers/gameReducer.ts`, `src/pages/GameRoom/index.tsx`, and `src/components/game/GameBoard.tsx` so unresolved rounds keep stable board identity while rematch resets cleanly.
- [x] T019 [US2] Add focused coverage for unresolved-round continuity and rematch reshuffle behavior in `server/utils/gameUtils.test.js`.

## Phase 5 - User Story 3

**Goal**: Make Ginza character selection reproducible in automated tests without changing normal gameplay randomness.

**Independent Test**: Run the match-setup path multiple times with the same deterministic random input and confirm it produces the same selected characters, board-slot assignments, and item-card payloads, while normal setup still uses ordinary randomness.

- [x] T020 [US3] Implement deterministic random injection plumbing for setup-time selection and shuffle in `server/utils/gameUtils.js` and the matching server call sites in `server/index.js`.
- [x] T021 [US3] Add targeted automated tests for deterministic setup reproducibility and normal random fallback in `server/utils/gameUtils.test.js`.
- [x] T022 [US3] Review `specs/005-game-data-v2-contract/data-model.md`, `contracts/match-setup-data-contract.md`, and `contracts/unresolved-round-and-rematch-contract.md` against the final deterministic setup approach and align any changed assumptions.

## Phase 6 - Polish & Cross-Cutting Concerns

- [x] T023 Review `server/utils/gameUtils.js`, `src/utils/gameData.ts`, and `game-shared-types/src/game.types.ts` for legacy-default assumptions or obsolete lookup helpers made unnecessary by Ginza display payloads, removing only feature-scoped dead paths.
- [x] T024 Run `CI=1 npm test -- --watchAll=false` from the project root and record the result for this feature.
- [x] T025 Run `npm run build` from the project root and record the result for this feature.
- [x] T026 Attempt a short local playable smoke and narrow mobile-width review in the active environment, then record the result in `specs/005-game-data-v2-contract/tasks.md`.
- [x] T027 Update `specs/005-game-data-v2-contract/tasks.md` delivery notes and completion checkboxes after implementation and validation.

## Dependencies

- Phase 1 must complete before foundational work.
- Foundational tasks T003-T007 block all user-story implementation.
- US1 must complete before US2 because unresolved-round and rematch behavior depend on the new Ginza-backed setup model.
- US1 must complete before US3 because deterministic validation must exercise the final setup path rather than the legacy default path.
- US2 and US3 can proceed in parallel after US1 is stable.
- Polish tasks run after all user stories are complete.

## Parallel Execution Examples

- After T003 completes, T005 and T006 can proceed in parallel because one extends shared types while the other defines server validation helpers.
- After T004 completes, T007 can proceed in parallel with T005 because random abstraction and shared type changes touch different concerns.
- In US1, T012 and T014 can proceed in parallel after T010 and T011 stabilize the server payload shape.
- After US1 completes, T019 and T020 can proceed in parallel because unresolved/rematch validation and deterministic setup plumbing target different files and flows.

## Implementation Strategy

- MVP first: complete US1 so the active default mode runs on Ginza-backed server data with complete item display payloads.
- Then lock lifecycle correctness with US2 so unresolved rounds preserve board identity and rematch reshuffles cleanly.
- Finish with US3 by making the same setup flow reproducible in tests through deterministic random injection.
- Leave UI redesign, legacy-data deletion, and broader theme work to later specs.

## Delivery Notes

- Implemented Ginza-backed default setup in `server/utils/gameUtils.js` with server-owned character pool, fixed board-slot definitions, fail-fast validation, and deterministic random injection helpers.
- Extended `game-shared-types` so `Geisha` and `ItemCard` can carry board-slot and display-only Ginza fields without changing rule-facing `geishaId` semantics.
- Updated current item-card UI surfaces to prefer server-provided `itemImageUrl`, `itemIconUrl`, and `itemLabel`, keeping the existing room flow and gameplay layout intact.
- Preserved unresolved-round board continuity via cloned active geisha state and kept rematch on the fresh Ginza setup path in `server/index.js`.
- Validation:
  - `npm test` in `server/`: passed (`node --test utils/*.test.js`)
  - `CI=1 npm test -- --watchAll=false`: passed
  - `npm run build`: passed
- Manual smoke:
  - Attempted local frontend/backend startup for a short playable flow and mobile-width review.
  - Blocked by sandbox port restrictions: `listen EPERM` on both frontend and backend bind attempts, so no browser-side smoke was possible in this environment.
- Known follow-up:
  - Run one user-side NPC or dual-window smoke during closeout once local ports are available, then record the verified flow.
  - `src/utils/gameData.ts` still retains legacy fallback mappings for non-default sets and offline placeholder flows; that cleanup is intentionally left for later specs because `005` only migrates the active default path.
