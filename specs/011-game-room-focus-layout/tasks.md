# Tasks: Game Room Focus Layout

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/011-game-room-focus-layout/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 對齊 011 規格與既有版面基線，確認改動範圍在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`、`/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`、`/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`。
- [X] T002 建立聚焦布局 CSS 命名與樣式區段骨架於 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`（三區塊容器、collapsed summary、expanded section、reduced-motion）。

## Phase 2 - Foundational

- [X] T003 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 定義 `FocusSection` 型別與單一來源狀態（`info | characterBoard | handActions`）並設定預設值 `characterBoard`。
- [X] T004 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 加入 blocking interaction 前焦點記憶與恢復機制（`previousFocus`/open-close lifecycle）。
- [X] T005 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 建立安全摘要資料組裝器，僅輸出狀態與數量欄位，禁止傳遞 hidden card identity/thumbnail。
- [X] T006 [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 對齊 `GameBoard` props 介面，確保新 focus layout 不改動既有 `sendGameAction` 及房間事件流。

## Phase 3 - User Story 1 (P1)

**Goal**: 預設聚焦角色區塊，並在同畫面提供資訊區與手牌/指令區摘要。  
**Independent Test**: 進入可遊玩房間時，角色區預設展開，資訊與手牌/指令區收合且可辨識摘要，主畫面不依賴整頁捲動才能理解對局狀態。

- [X] T007 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 與 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 重組為三個可識別 section（information、character board、hand/actions）並綁定單一 expanded section。
- [X] T008 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 實作資訊區 collapsed summary（回合、當前玩家、回合狀態等安全欄位）。
- [X] T009 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 實作手牌/指令區 collapsed summary（手牌數、可行動數、可操作提示）。
- [X] T010 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 套用三區塊預設版型與角色區預設展開樣式，讓非焦點區保持 compact 摘要高度。
- [X] T011 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 實作主畫面單一 viewport 高度與 section-local overflow，避免 whole-page vertical scroll 與 horizontal scroll。

## Phase 4 - User Story 2 (P2)

**Goal**: 支援點擊摘要切換聚焦，並在玩家可操作時自動聚焦手牌/指令區。  
**Independent Test**: 依序點擊三區塊摘要可切換唯一 expanded section；當輪到本地玩家且可操作時，無阻擋互動下自動切到手牌/指令區。

- [X] T012 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 實作摘要點擊切換 focus 行為，確保任一時間只有一個 expanded section。
- [X] T013 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 防止重複點擊目前 focus 造成全部收合。
- [X] T014 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 實作「newly actionable」偵測與自動聚焦 hand/actions，並避免 ordinary updates 造成焦點抖動。
- [X] T015 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 實作短展開/收合 transition 與 reduced-motion fallback。

## Phase 5 - User Story 3 (P3)

**Goal**: 保留既有對戰流程與阻擋互動可用性，且不新增隱藏資訊洩漏。  
**Independent Test**: 在新布局完成一次核心操作（選牌、送出、贈予/競爭回應）；blocking interaction 開關後焦點恢復符合規則；不新增對手隱藏資訊露出。

- [X] T016 [US3] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 讓 draw/gift/competition/order/ready/end-round 等 blocking UI 維持 overlay 優先與可操作性。
- [X] T017 [US3] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 實作 blocking interaction 關閉後焦點恢復邏輯（優先 previous focus，其次 newly actionable -> hand/actions）。
- [X] T018 [US3] [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PendingInteractionModal.tsx` 檢查並修正與新 focus layout 的互動相容性（點擊區、遮罩層級、回應入口）。
- [X] T019 [US3] [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 檢查房間層容器與背景/操作列不干擾三區塊焦點切換與內部捲動。
- [X] T020 [US3] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 追加 hidden-info 防護檢查，確認 summary 及 focus 切換不暴露卡牌細節。

## Phase 6 - Polish & Cross-Cutting

- [X] T021 [P] 更新 011 任務追蹤與完成註記於 `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/011-game-room-focus-layout/tasks.md`。
- [X] T022 執行 `CI=1 npm test -- --watchAll=false` 於 `/Users/zhangzhipeng/MyProject/hanamikoji-game`。
- [X] T023 執行 `npm run build` 於 `/Users/zhangzhipeng/MyProject/hanamikoji-game`。
- [X] T024 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/011-game-room-focus-layout/spec.md` 回填實作後狀態（Draft -> 完成態）與必要驗證紀錄。

## Dependencies

- Phase 1 完成後才能進 Phase 2。
- Phase 2 完成後才能開始 User Story phases。
- User Story 執行順序：US1 (Phase 3) -> US2 (Phase 4) -> US3 (Phase 5)。
- Phase 6 在所有 User Story phases 完成後執行。

## Parallel Execution Examples

- US1 可並行：先做 `T010`（樣式骨架）與 `T008`（資訊摘要），再整合 `T007`。
- US2 可並行：`T015`（動畫/減少動態）可與 `T014`（auto-focus 邏輯）分開進行。
- US3 可並行：`T018`（PendingInteractionModal 相容）與 `T019`（GameRoom 容器檢查）可同時處理。

## Implementation Strategy

- MVP 優先：先交付 US1，讓三區塊可辨識且角色區預設聚焦。
- 第二步交付 US2，完成切換與 auto-focus 行為。
- 第三步交付 US3，確保阻擋互動、隱藏資訊與既有對戰流程不退化。
- 最後做 automated validation 與 spec closeout。
