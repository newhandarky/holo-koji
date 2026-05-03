# Tasks: Game Info Action Status Panel

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/013-game-info-action-status-panel/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 對齊 013 spec/plan/contracts，確認此 feature 僅調整資訊分頁 UI，不變更 server/shared types，盤點改動檔案於 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`、`/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`、`/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/ActionTokens.tsx`（候選共用元件；本次最終未修改）。
- [x] T002 建立資訊面板 action-status 與 inline replay 的 CSS 命名區段骨架於 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`（狀態列、icon used/unused、inline replay、mobile 可讀性、focus 狀態）。

## Phase 2 - Foundational

- [x] T003 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 建立資訊面板用的衍生資料映射（雙方 action token 狀態、我方 replay 卡來源、當前玩家名稱）並確保來源為現有 `state.players`。
- [x] T004 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 新增本地 replay 展開狀態（`secret` / `trade-off` / `null`）與可回看資格判定（僅我方已使用 `密約` / `取捨`）。
- [x] T005 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 對齊資訊分頁切換生命週期，確保離開再回到 `資訊` 時保留目前 replay 展開內容。
- [x] T006 [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 建立 status-only icon 與可回看 icon 的可視差異樣式規則，避免空回看可點擊狀態。

## Phase 3 - User Story 1 (P1)

**Goal**: 將玩家身份、回合狀態、當前玩家與離開遊戲入口集中到資訊分頁，並移除 playable room 底部獨立離開按鈕。  
**Independent Test**: 切到 `資訊` 後可看到身份與回合狀態、左資訊右按鈕狀態列；`離開遊戲` 使用既有確認流程；底部獨立離開按鈕不再作為主要入口。

- [x] T007 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 將 `你是：{name}` 與 `你的回合/等待對手` 移入 `資訊` 分頁內容頂部。
- [x] T008 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 新增「左側當前玩家資訊 + 右側離開遊戲按鈕」滿版兩段狀態列，左側保持不可點擊。
- [x] T009 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 將既有 `離開遊戲` 行為綁定到資訊分頁狀態列右側按鈕，保留原確認流程。
- [x] T010 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 移除 playable room 內容區底部的獨立 `離開遊戲` 主要按鈕呈現。
- [x] T011 [US1] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 完成資訊分頁頂部身份區與雙段狀態列的 responsive 樣式，確保 mobile/desktop 不水平溢出。

## Phase 4 - User Story 2 (P2)

**Goal**: 在資訊分頁顯示雙方四個 action icon，並清楚區分 used/unused，同時確保對手只顯示狀態不揭露隱藏資訊。  
**Independent Test**: 雙方玩家各顯示 `密約/取捨/贈予/競爭` 四個 icon；used/unused 可區分；對手 icon 不顯示任何卡牌內容。

- [x] T012 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 於每個玩家摘要區塊下方渲染四個 action status icons（固定順序 `密約`、`取捨`、`贈予`、`競爭`）。
- [x] T013 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 套用 used/unused 狀態映射，確保 icon 視覺與 token.used 一致。
- [x] T014 [US2] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 實作 status-only icon 邏輯：非我方已使用 `密約/取捨` 的 icon 一律不可開啟回看內容。
- [x] T015 [US2] [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 完成 action status row、icon 狀態樣式與可點擊態/不可點擊態差異。
- [x] T016 [US2] [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 檢查並封鎖對手資料外露路徑（不傳 opponent `secretCards` / `discardedCards` 到任何 replay 區）。

## Phase 5 - User Story 3 (P3)

**Goal**: 讓我方已使用 `密約/取捨` 可在資訊分頁 inline 回看，且同時僅展開一個回看區，分頁切換後保留狀態。  
**Independent Test**: 我方已用 `密約` 可回看 1 張、已用 `取捨` 可回看 2 張；點另一個可回看 icon 會切換內容；切到別的分頁再回來保留目前回看。

- [x] T017 [US3] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 建立 inline replay 區塊，僅渲染我方已使用 `密約` 與 `取捨` 的卡牌內容。
- [x] T018 [US3] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 實作「同一時間只展開一個 replay」切換規則（`secret` 與 `trade-off` 互斥）。
- [x] T019 [US3] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 實作 replay 狀態跨分頁保留，確保離開 `資訊` 再返回仍維持當前展開內容。
- [x] T020 [US3] [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` 完成 inline replay 卡牌區樣式（mobile/desktop 可讀、區塊高度可控）。
- [x] T021 [US3] [P] 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` 追加互動保護：回看開關不送出 gameplay action，且不改變原有 pending interaction 流程。

## Phase 6 - Polish & Cross-Cutting

- [x] T022 [P] 檢查 013 文件一致性並更新任務勾選狀態於 `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/013-game-info-action-status-panel/tasks.md`。
- [x] T023 執行 `CI=1 npm test -- --watchAll=false` 於 `/Users/zhangzhipeng/MyProject/hanamikoji-game`。
- [x] T024 執行 `npm run build` 於 `/Users/zhangzhipeng/MyProject/hanamikoji-game`。
- [x] T025 在 `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/013-game-info-action-status-panel/spec.md` 回填狀態與驗證紀錄（Draft -> 完成態）。

## Dependencies

- Phase 1 完成後才能進 Phase 2。
- Phase 2 完成後才能開始 User Story phases。
- User Story 執行順序：US1 (Phase 3) -> US2 (Phase 4) -> US3 (Phase 5)。
- Phase 6 在所有 User Story phases 完成後執行。

## Parallel Execution Examples

- US1 可並行：`T011`（狀態列樣式）可與 `T009`（離開流程接線）並行，最後由 `T010` 收斂入口。
- US2 可並行：`T015`（icon 視覺狀態）可與 `T016`（hidden-info 防護檢查）並行。
- US3 可並行：`T020`（inline replay 樣式）可與 `T021`（互動保護）並行。

## Implementation Strategy

- MVP 優先：先完成 US1，確保資訊區成為主要狀態與離開入口。
- 第二步完成 US2，讓雙方 action token 狀態完整呈現且不暴露 hidden info。
- 第三步完成 US3，補齊我方 `密約/取捨` inline 回看與跨分頁保留行為。
- 最後執行測試/建置與 spec 回填收尾。
