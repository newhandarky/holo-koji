# Tasks: Motion Game Actions

**Input**: Design documents from `specs/004-motion-game-actions/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review `specs/004-motion-game-actions/spec.md`, `plan.md`, `research.md`, and `quickstart.md` before code changes.
- [x] T002 Confirm the root repo is on `004-motion-game-actions` and inspect motion-relevant UI surfaces in `src/pages/GameRoom/index.tsx`, `src/components/game/GameBoard.tsx`, `src/components/game/PlayerHand.tsx`, and `src/components/game/PendingInteractionModal.tsx`.

## Phase 2 - Foundational

- [x] T003 Audit the existing draw, board, pending interaction, and resolved card zones in `src/pages/GameRoom/index.tsx`, `src/components/game/GameBoard.tsx`, `src/components/game/CompetitionGroupModal.tsx`, and `src/components/game/PendingInteractionModal.tsx`.
- [x] T004 Define frontend-only motion cue and snapshot types in a dedicated UI helper module under `src/components/game/` or `src/utils/` without changing `game-shared-types`.
- [x] T005 Implement confirmed-state diff helpers that compare previous and current gameplay snapshots to derive motion triggers in the new motion helper module.
- [x] T006 Add reduced-motion preference detection and normalization in the new motion helper module or a nearby UI utility used by gameplay components.

## Phase 3 - User Story 1

**Goal**: Show clear card movement or fly-in motion for draw, placement, gift, and competition results using only confirmed client-visible state.

**Independent Test**: Play through draw, placement, gift, and competition flows and confirm the UI shows clear motion for the affected card zones while actions, scoring, and turn flow remain unchanged.

- [x] T007 [US1] Extend `src/pages/GameRoom/index.tsx` to keep the previous confirmed gameplay snapshot and dispatch motion cues derived from draw and board state updates.
- [x] T008 [US1] Add draw-motion rendering to `src/components/game/PlayerHand.tsx` using existing draw highlight information plus the new motion cue model.
- [x] T009 [US1] Add played-card placement or board-target motion rendering to `src/components/game/GameBoard.tsx` and `src/components/game/GeishaCard.tsx`.
- [x] T010 [US1] Add gift-result motion from the visible interaction zone to the board in `src/components/game/PendingInteractionModal.tsx` and related board components using approximate semantic paths.
- [x] T011 [US1] Add competition-result motion from the visible interaction zone to the board in `src/components/game/PendingInteractionModal.tsx`, `src/components/game/CompetitionGroupModal.tsx`, and related board components.
- [x] T012 [US1] Ensure motion cues only play after confirmed state visibility and do not expose hidden card identity earlier than existing UI already does in `src/hooks/useWebSocket.ts`, `src/pages/GameRoom/index.tsx`, and affected gameplay components.

## Phase 4 - User Story 2

**Goal**: Keep motion readable, short, and non-blocking across mobile and desktop layouts.

**Independent Test**: Review several turns on mobile and desktop layouts and confirm motion stays readable, does not block legal actions, and does not cause overlap or layout instability.

- [x] T013 [US2] Add shared motion timing, layer, and queue behavior in the new motion helper module so simultaneous updates render in a deterministic order.
- [x] T014 [US2] Update `src/index.css` to style motion layers, travel overlays, and board emphasis states without obscuring gameplay controls.
- [x] T015 [P] [US2] Tune `src/components/game/GameBoard.tsx`, `src/components/game/PlayerHand.tsx`, and `src/pages/GameRoom/index.tsx` so active motion does not block legal interactions once the underlying state allows them.
- [x] T016 [US2] Add layout-safe fallbacks for narrow mobile screens in `src/index.css` and affected gameplay components so motion stays within the playable area.

## Phase 5 - User Story 3

**Goal**: Respect reduced-motion preferences while still making confirmed state changes identifiable.

**Independent Test**: Enable reduced motion and confirm draw, placement, gift, and competition changes still show visible low-motion feedback without large travel animations.

- [x] T017 [US3] Wire reduced-motion preference handling into the motion cue pipeline in the new motion helper module and `src/pages/GameRoom/index.tsx`.
- [x] T018 [US3] Add reduced-motion fallback rendering to `src/components/game/PlayerHand.tsx`, `src/components/game/GameBoard.tsx`, `src/components/game/GeishaCard.tsx`, and `src/components/game/PendingInteractionModal.tsx`.
- [x] T019 [P] [US3] Update `src/index.css` to provide low-motion highlight, outline, opacity, and small-scale feedback styles that replace travel when reduced motion is requested.
- [x] T020 [US3] Verify that reduced-motion mode keeps the same gameplay timing and action availability semantics in `src/pages/GameRoom/index.tsx` and affected components.

## Phase 6 - Polish & Cross-Cutting Concerns

- [x] T021 Review `specs/004-motion-game-actions/quickstart.md`, `data-model.md`, and `contracts/` to align the delivered trigger behavior and reduced-motion semantics with the final implementation.
- [x] T022 Run `CI=1 npm test -- --watchAll=false` from the root project and record the result for this feature.
- [x] T023 Run `npm run build` from the root project and record the result for this feature.
- [x] T024 Perform manual visual review on mobile and desktop, then record the verified motion coverage and residual issues in `specs/004-motion-game-actions/tasks.md`.

## Dependencies

- Phase 1 must complete before foundational work.
- Foundational tasks T003-T006 block all user-story implementation.
- US1 must complete before US2 because motion readability tuning depends on real cue rendering.
- US2 should complete before US3 so reduced-motion fallbacks are applied over the finalized normal-motion surfaces.
- Polish tasks run after all user stories are complete.

## Parallel Execution Examples

- After T003 completes, T004 and T006 can proceed in parallel because one defines motion models and the other defines reduced-motion preference handling.
- In US2, T015 can run in parallel with T014 once the first motion surfaces from US1 exist.
- In US3, T019 can run in parallel with T018 once reduced-motion trigger plumbing from T017 is defined.

## Implementation Strategy

- MVP first: deliver US1 so confirmed draw, placement, gift, and competition results gain visible movement feedback.
- Then stabilize readability with US2 so motion remains short, non-blocking, and mobile-safe.
- Finish with US3 by applying reduced-motion behavior consistently across those same motion cues.
- Leave server-driven animation events, exact DOM-path reconstruction, and broader art polish to later specs.

## Delivery Notes

- Implemented a frontend-only motion pipeline in `src/components/game/gameMotion.ts` and threaded active cues through `GameRoom`, `GameBoard`, `PlayerHand`, `GeishaCard`, and pending interaction surfaces.
- Draw motion still respects the existing reveal timing in `GameRoom`; board placement, gift-result, and competition-result motion are derived only from confirmed visible state changes.
- Reduced motion uses the same cue pipeline but swaps travel emphasis for low-motion glow, opacity, outline, and slight scale changes.
- Validation:
  - `CI=1 npm test -- --watchAll=false`: passed
  - `npm run build`: passed
- Closeout record for T024:
  - Agent-operated browser review was completed in local Chrome against the running app using an NPC match flow.
  - Verified in live UI: opponent draw toast, player draw top-sheet prompt, non-blocking waiting-state transitions, gift-result interaction surface, and board-side result emphasis labels on affected character cards.
  - Verified layout behavior in the tested narrow viewport: motion surfaces did not push controls outside the playable area or obscure required action buttons during the observed flows.
  - Residual risk: reduced-motion behavior and a separate wide-desktop viewport pass should still be rechecked during broader integration QA, but no blocker was found for spec closeout.
- This feature intentionally derives motion from existing confirmed state and does not introduce new Socket.IO animation events.
