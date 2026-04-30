# Tasks: Icon Item Cards

**Input**: Design documents from `specs/003-icon-item-cards/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review `specs/003-icon-item-cards/spec.md`, `plan.md`, `research.md`, and `quickstart.md` before code changes.
- [x] T002 Confirm the root repo is on `003-icon-item-cards` and inspect the current item-related UI entry points in `src/components/game/GeishaCard.tsx`, `src/components/game/GameBoard.tsx`, and `src/utils/gameData.ts`.

## Phase 2 - Foundational

- [x] T003 Audit actual `ItemCard.type` usage in `game-shared-types/src/game.types.ts`, `server/utils/gameUtils.js`, and client item renderers to define the supported new item identifiers for this feature.
- [x] T004 Create a centralized icon-definition source for supported item types in `src/utils/gameData.ts` or a dedicated adjacent frontend display module.
- [x] T005 Add helper functions in `src/utils/gameData.ts` or the new display module to resolve icon definitions from existing item types and return a safe fallback for unknown values.
- [x] T006 Define the frontend-only derived summary shape needed for character-card icon rendering in `src/components/game/GameBoard.tsx` and any nearby utility module without changing shared types or server contracts.

## Phase 3 - User Story 1

**Goal**: Show supported new item types as icons on the related character cards so players can understand item-to-character relationships without relying on full item artwork.

**Independent Test**: Start or inspect a game state that includes supported new items and confirm each affected character card shows the correct icon mapping while gameplay actions, scoring, ownership, and turn flow remain unchanged.

- [x] T007 [US1] Derive per-geisha supported item summaries from existing `playedCards` in `src/components/game/GameBoard.tsx` using `ItemCard.type` and `geishaId`.
- [x] T008 [US1] Thread the derived icon-summary data from `src/components/game/GameBoard.tsx` into `src/components/game/GeishaCard.tsx` without changing action handling or score logic.
- [x] T009 [US1] Extend `src/components/game/GeishaCard.tsx` to render a dedicated icon area for supported items using the centralized icon mapping.
- [x] T010 [US1] Add fallback rendering in `src/components/game/GeishaCard.tsx` for unknown or unsupported item types so the board remains readable.
- [x] T011 [US1] Verify that `src/components/game/PlayerHand.tsx`, `src/components/game/PendingInteractionModal.tsx`, `src/components/game/CompetitionGroupModal.tsx`, and `src/components/game/ActionTokens.tsx` remain on the existing artwork flow in this feature.

## Phase 4 - User Story 2

**Goal**: Make the new character-card icon area visually consistent and readable across existing gameplay layouts.

**Independent Test**: Inspect the board on mobile and desktop widths and confirm supported item icons use a shared visual treatment inside a clear card information area without breaking the current board layout.

- [x] T012 [US2] Add the explicit character-card icon-area markup structure and supporting labels in `src/components/game/GeishaCard.tsx`.
- [x] T013 [US2] Update `src/index.css` to style the icon area, icon grouping, labels, and ownership/state cues for supported item icons.
- [x] T014 [P] [US2] Tune `src/index.css` and any related `src/components/game/GameBoard.tsx` layout hooks so the new icon area remains readable on current mobile card sizes.
- [x] T015 [US2] Ensure the icon area has a stable empty or no-entry state in `src/components/game/GeishaCard.tsx` so cards without supported items do not collapse visually.

## Phase 5 - User Story 3

**Goal**: Keep the icon system centralized and replaceable so future custom icon work can swap assets without changing gameplay logic.

**Independent Test**: Review the supported item icon source and confirm each item type resolves through one replaceable mapping layer rather than scattered per-component icon choices.

- [x] T016 [US3] Normalize the icon-definition API in `src/utils/gameData.ts` or the dedicated display module so all supported item types resolve through one mapping layer.
- [x] T017 [US3] Refactor `src/components/game/GeishaCard.tsx` to consume mapping output rather than embedding per-item icon decisions inline.
- [x] T018 [P] [US3] Document the supported item-type to icon-definition contract in `specs/003-icon-item-cards/quickstart.md` and align any changed assumptions.
- [x] T019 [US3] Review `specs/003-icon-item-cards/data-model.md` and `contracts/item-icon-mapping.md` to confirm the final implementation still relies on existing item identifiers and replaceable icon definitions.

## Phase 6 - Polish & Cross-Cutting Concerns

- [x] T020 Review `src/utils/gameData.ts` and related frontend display helpers for dead code or naming drift introduced during icon mapping work, removing only obsolete paths tied to this feature.
- [x] T021 Run `CI=1 npm test -- --watchAll=false` from the root project and record the result for this feature.
- [x] T022 Run `npm run build` from the root project and record the result for this feature.
- [x] T023 Update `specs/003-icon-item-cards/tasks.md` delivery notes and completion checkboxes after implementation and validation.

## Dependencies

- Phase 1 must complete before foundational work.
- Foundational tasks T003-T006 block all user-story implementation.
- US1 must complete before US2 because the icon area needs real per-geisha icon data before styling can be finalized.
- US2 should complete before US3 so the replaceable icon API is validated against the actual rendered UI surface.
- Polish tasks run after all user stories are complete.

## Parallel Execution Examples

- After T003 completes, T004 and T006 can proceed in parallel because one defines icon mapping and the other defines board-level derived summaries.
- In US2, T014 can run in parallel with T013 once T012 establishes the icon-area markup.
- In US3, T018 can run in parallel with T017 once the centralized mapping API from T016 is stable.

## Implementation Strategy

- MVP first: deliver US1 so supported new item types appear on the correct character cards through a centralized mapping.
- Then stabilize presentation with US2 so the icon area is explicit and mobile-safe.
- Finish with US3 by tightening the replaceable icon-definition API and syncing docs/contracts.
- Leave broader item-card icon migration, Motion animation, and final custom icon tooling to later specs.

## Delivery Notes

- `CI=1 npm test -- --watchAll=false`: Passed. Existing ReactDOMTestUtils and React Router future-flag warnings remain from prior test setup.
- `npm run build`: Passed.
- Current audited gameplay item identifiers for icon mapping are `geisha-1` through `geisha-7`; hidden placeholder cards remain out of scope.
- This feature intentionally does not migrate `PlayerHand`, interaction modals, or other artwork-based item-card surfaces.
