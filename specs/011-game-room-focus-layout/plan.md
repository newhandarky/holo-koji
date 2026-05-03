# Implementation Plan: Game Room Focus Layout

**Branch**: `011-game-room-focus-layout`  
**Date**: 2026-05-03  
**Spec**: [spec.md](./spec.md)

## Summary

將遊戲房間主畫面重構為單一視窗高度內的三區塊聚焦布局：上方資訊區、中間角色區、下方手牌與指令區。預設聚焦角色區；玩家點擊收合摘要時切換焦點；輪到自己且可操作時自動聚焦手牌與指令區；阻擋互動結束後恢復互動前焦點，除非玩家此時已可操作。

此 spec 僅調整前端畫面布局、聚焦狀態、摘要內容與 CSS 動態效果。不變更遊戲規則、server authoritative state、Socket.IO payload、shared types、角色/道具資料或出牌合法性。

## Technical Context

**Language/Version**: TypeScript, React 18, Create React App  
**Primary Dependencies**: React, Bootstrap, Socket.IO client, local `game-shared-types`  
**Storage**: 無新增持久化；focus state 為前端暫態 UI 狀態  
**Testing**: `CI=1 npm test -- --watchAll=false`, `npm run build`, 使用者負責實際 UI 視覺檢查  
**Target Platform**: Web browser, mobile-first game room, desktop compatible  
**Project Type**: Frontend UI feature in existing full-stack game repo  
**Performance Goals**: 區塊切換需即時；動畫不得延遲選牌、送出行動或阻擋互動回應  
**Constraints**: 主要遊戲房間維持單一 viewport 高度；避免 whole-page vertical scroll；避免 horizontal scroll；區塊內容 overflow 只能在區塊內部捲動；尊重 reduced motion  
**Scale/Scope**: 影響 `GameRoom` / `GameBoard` 周邊 UI 組合與 CSS；預期不改 `server/`、`game-shared-types/` 或 Socket.IO contract

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Game Rule Correctness**: PASS。此 spec 明確不改規則、計分、行動限制、回合順序或 hidden-information 邊界。
- **II. Shared State Integrity**: PASS。focus layout 是 client-only UI 狀態，不會繞過 server 驗證。
- **III. Explicit Realtime Contracts**: PASS。無 Socket.IO event 或 payload 變更；若實作期間發現需要 realtime contract，必須先回到 spec/plan 補記。
- **IV. Mobile-First Playability**: PASS。需求明確要求單一 viewport、避免頁面捲動、保留 bottom-sheet/modal 互動。
- **V. Verifiable Delivery**: PASS。計畫包含 `CI=1 npm test -- --watchAll=false` 與 `npm run build`，UI 視覺驗收由使用者檢查。

## Project Structure

### Documentation

```text
specs/011-game-room-focus-layout/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── game-room-focus-layout-contract.md
└── checklists/
    └── requirements.md
```

### Source Code

```text
src/
├── pages/GameRoom/
│   └── index.tsx
├── components/game/
│   ├── GameBoard.tsx
│   ├── PlayerHand.tsx
│   └── PendingInteractionModal.tsx
└── index.css
```

**Structure Decision**: 使用既有 React component 結構實作，優先在 `GameRoom` / `GameBoard` 層新增 focus section 狀態與 wrapper，避免拆出過度抽象的新架構。CSS 變更集中在既有 `src/index.css` 或現有 game layout class。

## Phase 0: Research

Research output: [research.md](./research.md)

Resolved decisions:

- Focus state 採 client-only，不進 server/shared types。
- 三區塊維持 exactly one expanded section。
- collapsed summaries 僅允許狀態與數量，不顯示 hidden card identity/thumbnail/secret selections。
- blocking interactions 保持 overlay 優先權，不嵌入 section。
- layout 使用 viewport-bounded container 與 section-local overflow。
- transition 使用短動畫並支援 reduced motion。

## Phase 1: Design & Contracts

Design outputs:

- [data-model.md](./data-model.md)
- [contracts/game-room-focus-layout-contract.md](./contracts/game-room-focus-layout-contract.md)
- [quickstart.md](./quickstart.md)

Implementation design:

- 新增 `FocusSection` UI 狀態：`info | characterBoard | handActions`。
- 初始 playable room focus 為 `characterBoard`。
- ordinary state update 保留使用者目前 focus。
- current player actionable 且沒有 blocking interaction 時，自動 focus `handActions`。
- blocking interaction 開啟前記錄 previous focus；關閉後恢復 previous focus，除非此時玩家 newly actionable。
- collapsed summary component/content 僅接收安全摘要資料，不接收完整手牌或秘密選擇。
- section container 以 CSS 控制 expanded/collapsed 尺寸、內部 overflow 與 reduced-motion transition。

## Phase 1 Constitution Re-check

- **I. Game Rule Correctness**: PASS。設計不修改 gameplay reducer/server action。
- **II. Shared State Integrity**: PASS。所有可操作行為仍走既有 `sendGameAction` / server validation。
- **III. Explicit Realtime Contracts**: PASS。contract 文件明確標示無 API/Socket.IO 變更。
- **IV. Mobile-First Playability**: PASS。設計保留 bottom-sheet/modal overlay，並用 viewport-bounded layout 控制 mobile 可用性。
- **V. Verifiable Delivery**: PASS。quickstart 定義自動檢查與手動 UI 驗收項目。

## Phase 2: Task Planning Approach

Tasks should be generated around these independent slices:

1. 建立 focus section 型別、狀態與切換規則。
2. 包裝資訊/角色/手牌三區塊，加入 collapsed summary。
3. 加入 actionable turn auto-focus 與 blocking interaction restore。
4. 實作 viewport-bounded layout、internal overflow、transition、reduced-motion。
5. 驗證 hidden info 不進 collapsed summary。
6. 執行 automated validation 並記錄 UI 手動檢查交由使用者。

## Risk Log

- **R1: 單一 viewport 可能壓縮既有內容**  
  Mitigation: expanded section 內部允許 scroll，collapsed sections 只保留摘要高度。

- **R2: auto-focus 可能干擾使用者正在查看的區塊**  
  Mitigation: 只在玩家 newly actionable 且無 blocking interaction 時觸發；ordinary state updates 不重設 focus。

- **R3: collapsed summary 不小心接收完整卡牌資料**  
  Mitigation: summary props 限定為 counts/status；review 時檢查不傳 card identity/thumbnail/secret data。

- **R4: modal/bottom-sheet z-index 或高度被 section layout 影響**  
  Mitigation: overlay 保持在 section layout 之上，implementation task 需驗證 gift/competition/order 等 blocking flows。
