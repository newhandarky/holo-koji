# Tasks: Fan Player Hand

**Input**: Design documents from `specs/008-fan-player-hand/`  
**Prerequisites**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/fan-player-hand-ui-contract.md](./contracts/fan-player-hand-ui-contract.md), [quickstart.md](./quickstart.md)

## Phase 1 - Setup

- [x] T001 Review 008 scope, clarifications, and out-of-scope boundaries in `specs/008-fan-player-hand/spec.md`.
- [x] T002 Review implementation constraints and risk notes in `specs/008-fan-player-hand/plan.md`.
- [x] T003 [P] Review fan-hand UI behavior contract in `specs/008-fan-player-hand/contracts/fan-player-hand-ui-contract.md`.
- [x] T004 [P] Review manual validation ownership and closeout expectations in `specs/008-fan-player-hand/quickstart.md`.

## Phase 2 - Foundation

- [x] T005 Identify current player-hand selection and reset flow in `src/components/game/PlayerHand.tsx`.
- [x] T006 Identify current hand card classes that affect selected/new/motion states in `src/components/game/PlayerHand.tsx`.
- [x] T007 Identify current hand-related selectors (`.player-hand-row`, `.item-card--hand`, `.item-card.selected`, motion styles) in `src/index.css`.
- [x] T008 Confirm 008 remains frontend-only and does not require edits in `server/` or `game-shared-types/` using `specs/008-fan-player-hand/plan.md`.

## Phase 3 - User Story 1: 以扇形手牌檢視自己的卡片 (Priority: P1)

**Goal**: 玩家在 active game room 看到我方手牌改為扇形排列，桌機中等展開、手機高重疊，仍可辨識並點擊。  
**Independent Test**: 進入 active game room，確認主手牌區為扇形；桌機有中等展開且每張有可點擊區；手機維持扇形高重疊且無主畫面水平捲動。

- [x] T009 [US1] Add local focused card id state and reset behavior when hand list changes in `src/components/game/PlayerHand.tsx`.
- [x] T010 [US1] Compute per-card fan presentation metadata (relative index, stack order, desktop/mobile spread inputs) in `src/components/game/PlayerHand.tsx`.
- [x] T011 [US1] Keep card click flow as existing selection toggle while also setting clicked card as focus in `src/components/game/PlayerHand.tsx`.
- [x] T012 [US1] Add fan-hand structural classes and per-card style variables for layout metadata in `src/components/game/PlayerHand.tsx`.
- [x] T013 [US1] Replace wrapped row styling with fan-surface base layout for desktop medium spread in `src/index.css`.
- [x] T014 [US1] Add mobile dense-overlap fan rules that preserve fan form and prevent main horizontal overflow in `src/index.css`.
- [x] T015 [P] [US1] Tune z-index, clickable region, and card readability for overlapped hand cards in `src/index.css`.
- [x] T016 [US1] Verify fan layout behavior against `specs/008-fan-player-hand/contracts/fan-player-hand-ui-contract.md`.

## Phase 4 - User Story 2: 點擊手牌時局部放大 (Priority: P2)

**Goal**: 點擊手牌時，原卡片在扇形內抬起放大，且選取狀態與放大焦點同步。  
**Independent Test**: 點擊任一卡片時該卡抬起放大；點擊另一張焦點切換；不產生額外預覽卡或新互動視窗。

- [x] T017 [US2] Bind focus class/state to the same clicked card used by selection toggling in `src/components/game/PlayerHand.tsx`.
- [x] T018 [US2] Ensure focused card follows latest click and clears consistently on hand reset in `src/components/game/PlayerHand.tsx`.
- [x] T019 [US2] Add focused-card lift/scale styling on original card element without creating preview-card markup in `src/index.css`.
- [x] T020 [US2] Preserve selected/new/draw-motion visual signals while focused card is lifted in `src/index.css`.
- [x] T021 [P] [US2] Tune transition timing and pointer behavior so focus switching remains responsive and readable in `src/index.css`.
- [x] T022 [US2] Verify no extra preview card/modal is introduced and focus-switch behavior matches contract in `specs/008-fan-player-hand/contracts/fan-player-hand-ui-contract.md`.

## Phase 5 - User Story 3: 維持既有手牌流程與手機可玩性 (Priority: P3)

**Goal**: 扇形手牌與局部放大不影響既有四種行動流程、抽牌提示、bottom sheet 共存與隱藏資訊邊界。  
**Independent Test**: 在 NPC 或多人房間做基本選牌與至少一種行動，確認行動條件、抽牌提示與互動流程維持不變，且手機操作無明顯衝突。

- [x] T023 [US3] Verify selected-card output to `onCardSelect` remains unchanged in semantics and count behavior in `src/components/game/PlayerHand.tsx`.
- [x] T024 [US3] Verify draw highlight and draw motion classes still apply correctly with fan/focus presentation in `src/components/game/PlayerHand.tsx`.
- [x] T025 [US3] Adjust fan-hand spacing against action token area and room sections to avoid overlap conflicts in `src/index.css`.
- [x] T026 [P] [US3] Adjust mobile tap ergonomics and touch handling so hand interaction does not conflict with bottom-sheet usage in `src/index.css`.
- [x] T027 [US3] Verify hidden-information boundaries remain unchanged by checking no opponent/secret data surfaces in `src/components/game/PlayerHand.tsx`.
- [x] T028 [US3] Verify compatibility expectations against `specs/008-fan-player-hand/contracts/fan-player-hand-ui-contract.md`.

## Phase 6 - Polish & Cross-Cutting Concerns

- [x] T029 Confirm final diff scope does not modify `server/`, `game-shared-types/`, Socket.IO contracts, game rules, or modal structures in `specs/008-fan-player-hand/spec.md`.
- [x] T030 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [x] T031 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [x] T032 Record user-owned manual UI review status and any residual visual-check risks in `specs/008-fan-player-hand/tasks.md`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before story implementation phases.
- User Story 1 is the MVP and must complete before User Story 2 because local focus behavior depends on the final fan layout structure.
- User Story 2 should complete before User Story 3 because flow-compatibility checks depend on final focus/selection behavior.
- Phase 6 runs after all user stories are completed.

## Parallel Execution Examples

### User Story 1

- T015 can run in parallel with T014 after T012-T013 establish the fan structure.
- T016 runs after T009-T015.

### User Story 2

- T021 can run in parallel with T020 after T017-T019 define focus behavior and base styling.
- T022 runs after T017-T021.

### User Story 3

- T026 can run in parallel with T025 after T023-T024 confirm behavior integrity.
- T028 runs after T023-T027.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, and User Story 1 first. This delivers the core fan-hand presentation and can be independently verified before adding focus-lift behavior.

### Incremental Delivery

1. Deliver User Story 1: fan layout with desktop medium spread and mobile dense overlap.
2. Deliver User Story 2: click-to-focus lift behavior tied to existing selection clicks.
3. Deliver User Story 3: compatibility safeguards for action flow, draw feedback, and mobile usability.
4. Finish with Phase 6 validation and manual-review status recording.

### Scope Guardrails

- Do not change card data contracts, action payloads, Socket.IO events, or server validation.
- Do not redesign 007 character-card coverflow.
- Do not redesign gift/competition/order/pending-interaction modal structures.
- Keep detailed UI visual acceptance as user-owned review per `AGENTS.md`.

## Manual UI Review Record (T032)

- Owner: User (per `AGENTS.md` policy)
- Status: Completed by user confirmation (active game room visual check)
- Notes: User confirmed fan-hand UI update appears after server restart.
- Residual risk: NPC/multiplayer full-path visual interactions still rely on user-side exploratory playthrough.

## Post-Closeout UI Tuning Record

- 2026-05-02: Hand cards were adjusted to 9:16 and reduced from the initial large test size while preserving the fan interaction.
- 2026-05-02: `.player-hand-row` width was restored to 100%; spread should be tuned through fan spacing, rotation, and overlap variables instead of widening the row container.
- Deferred: Additional request to increase spread by approximately 30% and add SM/XS hand-card size tiers should be handled in a follow-up layout/tuning scope, currently planned under 011 if the three-section room layout proceeds.
