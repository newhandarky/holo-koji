# Tasks: Game Room Section Tabs

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/012-game-room-section-tabs/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 對齊 012 spec/plan/contracts，確認只改區塊切換入口，不變更 server/shared types，盤點改動檔案於 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`、`/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`、`/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`。
- [x] T002 建立 tabs 相關 CSS 命名區段骨架於 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`（top tab bar、active state、fixed visible、reduced-motion、keyboard focus style）。

## Phase 2 - Foundational

- [x] T003 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 與 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 對齊單一 `ActiveSection` 狀態來源，避免新增第二份 tab state。
- [x] T004 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 對齊 011 的 blocking interaction 開關記憶欄位，確保後續 tabs active 能同步 restore。
- [x] T005 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 封裝 tab label 常量（`資訊`、`角色`、`手牌&指令`），禁止混入 badge/count/summary/action hint。
- [x] T006 [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 標註或調整舊 summary click 入口掛點，準備切換為 tab-only 控制。

## Phase 3 - User Story 1 (P1)

**Goal**: 將區塊切換入口集中到最上方滿版 tabs，並以 tabs 作為唯一正常切換控制。  
**Independent Test**: 進入 playable room 後看到三段 tabs；點擊任一 tab 展開對應區塊；重點擊 active tab 不會造成全部收合。

- [x] T007 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 新增最上方滿版 tabs（`資訊`、`角色`、`手牌&指令`）並綁定 `ActiveSection`。
- [x] T008 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 實作 tab 切換行為（選中 section 展開、其他收合、active 樣式同步）。
- [x] T009 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 移除非 active section summary 的可點擊切換行為，確保 tabs 是唯一正常切換入口。
- [x] T010 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 實作 tabs 滿版顯示、active state 視覺、文字可讀且不水平溢出。
- [x] T011 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 實作 tabs 固定可見與區塊內容內部捲動協作，確保內容捲動時 tabs 仍可操作。

## Phase 4 - User Story 2 (P2)

**Goal**: 保留 011 焦點自動切換與 restore 規則，並讓 tab active 與焦點完全同步。  
**Independent Test**: 觸發 not-actionable -> actionable 時自動切 `手牌&指令`；手動切離後一般更新不拉回；blocking interaction 關閉後 active tab 與預期焦點一致。

- [x] T012 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 實作「僅在 not-actionable -> actionable 時 auto-focus `handActions`」規則。
- [x] T013 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 實作「已可操作且使用者手動切離後，普通狀態更新維持手動選擇」規則。
- [x] T014 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 對齊 blocking interaction restore，使關閉後 active tab 與 restored section 同步。
- [x] T015 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 確保現有 section 展開渲染邏輯完全跟隨 `ActiveSection`，避免 tab active 與實際展開不一致。

## Phase 5 - User Story 3 (P3)

**Goal**: 確保 tabs 在 mobile/desktop 可用、支援鍵盤、且不暴露 hidden info。  
**Independent Test**: 手機與桌機都不水平溢出；Enter/Space 可切換；gift/competition 等 overlay 仍在 tabs 之上可操作；tabs 不顯示任何 card/summary 資訊。

- [x] T016 [US3] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 驗證 tabs 鍵盤 focus 與 Enter/Space activation 可用性（維持 button 原生互動）。
- [x] T017 [US3] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 增加 tabs focus-visible 與 reduced-motion 切換樣式（<=100ms 或無動畫）。
- [x] T018 [US3] [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 與 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` 檢查並移除 tabs 來源中可能混入的 count/summary/hidden-data 顯示。
- [x] T019 [US3] [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 驗證 tabs 與 bottom-sheet/modal 層級關係，避免遮蔽阻擋互動入口。

## Phase 6 - Polish & Cross-Cutting

- [x] T020 [P] 更新 012 任務追蹤狀態於 `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/012-game-room-section-tabs/tasks.md`。
- [x] T021 執行 `CI=1 npm test -- --watchAll=false` 於 `/Users/zhangzhipeng/MyProject/hanamikoji-game`。
- [x] T022 執行 `npm run build` 於 `/Users/zhangzhipeng/MyProject/hanamikoji-game`。
- [x] T023 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/012-game-room-section-tabs/spec.md` 回填狀態與驗證紀錄（Draft -> 完成態）。

## Dependencies

- Phase 1 完成後才能進 Phase 2。
- Phase 2 完成後才能開始 User Story phases。
- User Story 執行順序：US1 (Phase 3) -> US2 (Phase 4) -> US3 (Phase 5)。
- Phase 6 在所有 User Story phases 完成後執行。

## Parallel Execution Examples

- US1 可並行：`T010`（tabs 樣式）可與 `T009`（移除 summary click）並行，最後由 `T008` 收斂切換行為。
- US2 可並行：`T015`（render 跟隨 ActiveSection）可與 `T014`（restore 同步）交錯驗證。
- US3 可並行：`T018`（hidden-info 清查）與 `T019`（overlay 層級）可同時處理。

## Implementation Strategy

- MVP 優先：先完成 US1，確保 top tabs 成為唯一正常切換入口。
- 第二步完成 US2，確保 auto-focus 與 blocking restore 行為不回歸。
- 第三步完成 US3，補齊 keyboard、可讀性與 hidden-info 保護。
- 最後執行測試/建置與 spec 回填收尾。
