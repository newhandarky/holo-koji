# Tasks: Remote Character Card UI

**Input**: Design documents from `specs/002-remote-character-card-ui/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review `specs/002-remote-character-card-ui/spec.md`, `plan.md`, `research.md`, and `quickstart.md` before code changes.
- [x] T002 Confirm the root repo and `server/` submodule are clean with `git status --short --branch` and `git -C server status --short --branch`.

## Phase 2 - Foundational

- [x] T003 Add display-only `imageUrl: string` to `Geisha` in `game-shared-types/src/game.types.ts`.
- [x] T004 Verify root app compilation continues to consume the updated local shared type in `game-shared-types/src/index.ts` and `src/types/game-shared-types.d.ts`.
- [x] T005 Update server character data builders in `server/utils/gameUtils.js` so every geisha record emitted into game state preserves `imageUrl`.
- [x] T006 Document and apply the chosen server-side URL normalization strategy for character artwork in `server/utils/gameUtils.js` without changing event names or rule-bearing payloads.

## Phase 3 - User Story 1

**Goal**: Character cards use server-provided artwork URLs as the source of truth while preserving existing gameplay behavior.

**Independent Test**: Start or inspect a synced game state and confirm board character cards render from `geisha.imageUrl` or fallback UI without changing turn flow, scoring, card ownership, or action availability.

- [x] T007 [US1] Update `src/components/game/GeishaCard.tsx` to use `geisha.imageUrl` as the primary artwork source.
- [x] T008 [US1] Refactor character-artwork lookup helpers in `src/utils/gameData.ts` so frontend character image mapping is no longer the primary source of truth, while preserving item `cardUrl` helpers used elsewhere.
- [x] T009 [US1] Verify `src/components/game/GameBoard.tsx` passes the synced geisha data needed for character rendering without altering action or score logic.
- [x] T010 [US1] Add fallback rendering in `src/components/game/GeishaCard.tsx` for missing or failed `imageUrl` values using readable character identity data.
- [x] T011 [US1] Review client game-state sync handling in `src/hooks/useWebSocket.ts` and `game-shared-types/src/client.types.ts` to ensure the display-only `imageUrl` field is accepted without introducing new events.

## Phase 4 - User Story 2

**Goal**: Character cards present artwork in a stable 9:16 framed layout across mobile and desktop board states.

**Independent Test**: View the board on narrow and wide layouts and confirm every character card keeps a 9:16 artwork frame with center-cropped fallback behavior for non-9:16 images.

- [x] T012 [US2] Redesign the base character card structure in `src/components/game/GeishaCard.tsx` to support a dedicated 9:16 artwork frame.
- [x] T013 [US2] Update character-card styling in `src/index.css` for 9:16 ratio, center-cropped artwork, and mobile-safe board spacing.
- [x] T014 [P] [US2] Adjust board row sizing/layout in `src/components/game/GameBoard.tsx` and related `src/index.css` selectors so the 4-over-3 geisha layout remains usable with taller cards.
- [x] T015 [US2] Ensure fallback character state in `src/components/game/GeishaCard.tsx` preserves the same 9:16 footprint and remains readable when images are loading or broken.

## Phase 5 - User Story 3

**Goal**: Character card frames show readable name, charm score, and item ownership/count summary without redesigning item icons.

**Independent Test**: During active play, each character card clearly shows name, charm score, current player item count, opponent item count, and existing ownership state.

- [x] T016 [US3] Add frame information markup for character name and charm score in `src/components/game/GeishaCard.tsx`.
- [x] T017 [US3] Render current player and opponent item ownership/count summary on the character frame in `src/components/game/GeishaCard.tsx` using existing `myCount` and `opponentCount` inputs.
- [x] T018 [P] [US3] Update `src/index.css` to style frame information, ownership/count summary, and control-state indicators without introducing item icon redesign.
- [x] T019 [US3] Verify existing control-state cues in `src/components/game/GeishaCard.tsx` remain understandable after the frame redesign.

## Phase 6 - Polish & Cross-Cutting Concerns

- [x] T020 Review `src/utils/gameData.ts` for any remaining dead character-artwork helpers and remove only the now-unused character image code paths while preserving item-card image support.
- [x] T021 Review `specs/002-remote-character-card-ui/quickstart.md` and update any implementation notes that changed during delivery.
- [x] T022 Run `CI=1 npm test -- --watchAll=false` from the root project and record the result for this feature.
- [x] T023 Run `npm run build` from the root project and record the result for this feature.
- [ ] T024 If `server/` changed, commit `server` submodule changes first, then verify the root repo records the updated submodule pointer before handoff.

## Dependencies

- Setup must complete before foundational work.
- Foundational tasks T003-T006 block all user story implementation.
- US1 must complete before US2 because the new card frame should render server-provided artwork rather than the old frontend image mapping.
- US2 should complete before US3 so frame information is placed onto the final card structure.
- Polish tasks run after all user stories are complete.

## Parallel Execution Examples

- After T003 completes, T004 and T005 can proceed in parallel because they touch different packages.
- In US2, T014 can run in parallel with T013 once the target 9:16 card structure from T012 is established.
- In US3, T018 can run in parallel with T017 after T016 defines the frame information markup.

## Implementation Strategy

- MVP first: deliver US1 to move character artwork to server-provided URLs with a safe fallback.
- Then stabilize presentation with US2 so the board layout supports the new 9:16 card format.
- Finish with US3 by layering readable frame information on top of the new card structure.
- Leave item icon redesign and motion animation for later specs to avoid mixing visual-system changes with this migration.

## Delivery Notes

- `CI=1 npm test -- --watchAll=false`: Passed. Existing React/Router console warnings remain from prior test setup.
- `npm run build`: Passed.
- `T024` remains open because server submodule and root repo commits were not requested in this implementation pass.
