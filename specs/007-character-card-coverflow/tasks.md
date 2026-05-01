# Tasks: Character Card Coverflow Redesign

**Input**: Design documents from `specs/007-character-card-coverflow/`  
**Prerequisites**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/character-card-coverflow-ui-contract.md](./contracts/character-card-coverflow-ui-contract.md), [quickstart.md](./quickstart.md)

## Phase 1 - Setup

- [X] T001 Review story priorities, acceptance scenarios, and scope guardrails in `specs/007-character-card-coverflow/spec.md`.
- [X] T002 Review implementation plan, risks, and validation scope in `specs/007-character-card-coverflow/plan.md`.
- [X] T003 [P] Review coverflow interaction and card-face contract rules in `specs/007-character-card-coverflow/contracts/character-card-coverflow-ui-contract.md`.
- [X] T004 [P] Review manual visual validation checklist in `specs/007-character-card-coverflow/quickstart.md`.

## Phase 2 - Foundation

- [X] T005 Identify current static geisha-row rendering and ordering logic in `src/components/game/GameBoard.tsx`.
- [X] T006 Identify current geisha card sections for control label, item block, and bottom counters in `src/components/game/GeishaCard.tsx`.
- [X] T007 Identify current `.geisha-card*` selectors and responsive room styles that will be replaced or extended in `src/index.css`.
- [X] T008 Confirm 007 stays frontend-only and does not require `server/` or `game-shared-types/` payload changes in `specs/007-character-card-coverflow/plan.md`.

## Phase 3 - User Story 1: 以 Coverflow 瀏覽七張人物卡 (Priority: P1)

**Goal**: 玩家可在 active game room 以手動 coverflow 瀏覽七張依魅力值排序的人物卡。  
**Independent Test**: 進入 active game room，確認人物卡區只顯示一組七張 coverflow；待機 10 秒不自動輪播，且可用滑動/拖曳與左右按鈕切換焦點。

- [X] T009 [US1] Replace the static top-row and bottom-row geisha layout with one ordered seven-card data source in `src/components/game/GameBoard.tsx`.
- [X] T010 [US1] Implement stable charm-ascending ordering with preserved board-slot order for ties in `src/components/game/GameBoard.tsx`.
- [X] T011 [US1] Add active coverflow state, manual left/right navigation handlers, and non-autoplay focus behavior in `src/components/game/GameBoard.tsx`.
- [X] T012 [US1] Add the coverflow viewport, track, and navigation button markup around `GeishaCard` rendering in `src/components/game/GameBoard.tsx`.
- [X] T013 [US1] Define base coverflow layout, focus/adjacent card transforms, and non-breaking room integration styles in `src/index.css`.
- [X] T014 [US1] Add mobile drag/swipe-friendly interaction affordances and pointer/overflow behavior for the coverflow surface in `src/components/game/GameBoard.tsx`.
- [X] T015 [P] [US1] Add navigation control, idle-state, and coverflow responsive styling for mobile and desktop density rules in `src/index.css`.
- [X] T016 [US1] Manually review coverflow ordering, manual-only behavior, and focus changes against `specs/007-character-card-coverflow/quickstart.md`.

## Phase 4 - User Story 2: 人物卡資訊重排為新版卡面 (Priority: P2)

**Goal**: 人物卡改為新版卡面，將名稱、魅力值、item icon 收斂到左上資訊區，底部改為 50/50 數量區，並移除舊控制與道具區塊。  
**Independent Test**: 檢查任一人物卡，確認舊的「未掌控」與獨立道具區塊消失，左上斜三角資訊區與底部雙欄數量區完整且可讀。

- [X] T017 [US2] Remove the old control label block and standalone item-information block from `src/components/game/GeishaCard.tsx`.
- [X] T018 [US2] Rebuild the card markup so the portrait remains primary while a top-left overlay shows name, charm, and item icon in `src/components/game/GeishaCard.tsx`.
- [X] T019 [US2] Rebuild the bottom counter band so self count stays left in blue and opponent count stays right in red with non-wrapping content in `src/components/game/GeishaCard.tsx`.
- [X] T020 [US2] Replace legacy geisha card layout styles with Ginza-compatible overlay, counter band, and readable card chrome styles in `src/index.css`.
- [X] T021 [P] [US2] Tune typography, icon sizing, and text overflow rules so overlay and bottom counters remain readable across card scales in `src/index.css`.
- [X] T022 [US2] Manually review card-face information hierarchy and removal of legacy sections against `specs/007-character-card-coverflow/contracts/character-card-coverflow-ui-contract.md`.

## Phase 5 - User Story 3: 延續局掌控邊框只在局後狀態顯示 (Priority: P3)

**Goal**: 只在延續局且已有同步掌控狀態時顯示 3px 陣營邊框，不提前用當局暫時條件改變卡面邊框。  
**Independent Test**: 在可重現的延續局房間中，確認已掌控角色顯示正確藍/紅 3px 邊框；當局進行中暫時滿足條件者不提前變框。

- [X] T023 [US3] Audit the current border-state rendering path and confirm it only consumes synced authoritative `controlledBy` meaning in `src/components/game/GeishaCard.tsx`.
- [X] T024 [US3] Adjust geisha border class application so only persisted control owners receive the camp border presentation in `src/components/game/GeishaCard.tsx`.
- [X] T025 [P] [US3] Update border, shadow, and neutral-state styles so 3px camp borders remain visible without restoring white slabs in `src/index.css`.
- [X] T026 [US3] Manually review carried-over control-border behavior and record any local reproducibility limits using `specs/007-character-card-coverflow/quickstart.md`.

## Phase 6 - Polish & Cross-Cutting Concerns

- [X] T027 Review mobile-width overflow, drag interaction conflicts, and bottom-sheet coexistence for the final coverflow/card styles in `src/index.css`.
- [X] T028 [P] Confirm the final `GameBoard` structure still preserves existing room flow, modals, and hand/action sections in `src/components/game/GameBoard.tsx`.
- [X] T029 Verify the final diff does not modify `server/`, `game-shared-types/`, Socket.IO payloads, or gameplay rules against `specs/007-character-card-coverflow/spec.md`.
- [X] T030 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T031 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T032 Record manual validation outcomes and any unresolved local test limitations in `specs/007-character-card-coverflow/tasks.md`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before implementation phases.
- User Story 1 is the MVP and must complete before User Story 2 because the new card face depends on the final coverflow container and focus behavior.
- User Story 2 should complete before User Story 3 because border-state readability depends on the redesigned card shell.
- Phase 6 validation runs after all implemented user stories.

## Parallel Execution Examples

### User Story 1

- T015 can run in parallel with T014 after T011-T013 establish the core coverflow structure.
- T016 runs after T009-T015.

### User Story 2

- T021 can run in parallel with T020 after T018-T019 define the new card-face markup.
- T022 runs after T017-T021.

### User Story 3

- T025 can run in parallel with T024 after T023 confirms the border-state rendering path.
- T026 runs after T023-T025.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, and User Story 1. This delivers the manual seven-card coverflow surface and can be independently reviewed before redesigning the inner card face.

### Incremental Delivery

1. Deliver User Story 1: replace static rows with manual coverflow ordering and controls.
2. Deliver User Story 2: redesign the card face to the overlay plus bottom-band layout.
3. Deliver User Story 3: tighten persisted control-border behavior and styling.
4. Finish with Phase 6 regression checks and manual validation notes.

### Scope Guardrails

- Do not redesign player hand, gift modal, competition modal, or top-sheet action flow.
- Do not add autoplay, looping carousel behavior, or alternate card datasets.
- Do not modify `server/`, `game-shared-types/`, Socket.IO contracts, scoring, turn order, or hidden-information boundaries.
- Do not change the Ginza room shell outside what is required for the character-card browsing surface.

## Validation Notes

- `CI=1 npm test -- --watchAll=false` passed on 2026-05-02. Existing warnings remain: React `act` deprecation and React Router v7 future flags.
- `npm run build` passed on 2026-05-02.
- Manual browser review completed on 2026-05-02 at `http://localhost:3000` using an NPC room.
- Manual review covered lobby -> NPC room creation -> active game room, left/right coverflow navigation, drag/scroll interaction, mobile-width layout, bottom-sheet coexistence, and 10-second idle no-autoplay observation.
- Carried-over unresolved-match border state was not reproduced locally during this pass; implementation was verified to rely only on synced `geisha.controlledBy` and does not add local control inference.
