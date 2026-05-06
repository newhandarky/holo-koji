# Implementation Plan: Game Info Action Status Panel

**Branch**: `013-game-info-action-status-panel`  
**Date**: 2026-05-03  
**Spec**: [spec.md](./spec.md)

## Summary

重排 `資訊` 分頁內容，將原本分散在 active room 頂部與底部的玩家身份、回合狀態、當前玩家與離開遊戲入口集中到資訊區。資訊區同時新增雙方四個 action token 狀態列，並讓我方已使用的 `密約`、`取捨` 可以在資訊區內 inline 回看自己選過的卡牌。

此 feature 只調整前端資訊區 UI 與本地回看展開狀態，不改遊戲規則、server authoritative state、Socket.IO event、shared type、action payload 或 pending interaction 資料流程。對手 action icon 只顯示 used/unused，不揭露任何對手 hidden card identity。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO（不預期變更）  
**Shared Types**: `game-shared-types`（不預期變更）  
**Package Manager**: npm  
**Storage**: 無新增持久化；回看展開狀態是本機 UI state  
**Existing Data Source**: `Player.actionTokens`, `Player.secretCards`, `Player.discardedCards`, `Player.score`, `GameState.currentPlayer`, local player profile/avatar helpers  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`, 使用者進行實際 UI 視覺檢查  
**Target Platform**: Mobile-first web game room, desktop compatible  
**Constraints**: 不新增 gameplay command；不改 action validation；不顯示對手手牌、密約牌、棄牌選擇或未公開互動；modal/bottom-sheet 必須保持在資訊面板上方可操作

## Constitution Check

- Game rule correctness: Pass。此 spec 明確不改規則、計分、行動合法性、回合流程或 hidden-information 邊界。
- Shared state integrity: Pass。資訊面板只讀取 server 同步後的 client-visible state，回看展開是本地 UI state，不繞過 server validation。
- Explicit realtime contracts: Pass。不新增或修改 Socket.IO event / payload；若 implementation 發現現有 state 不足，必須回到 spec/plan 更新 contract。
- Mobile-first playability: Pass。spec 要求不造成水平頁面捲動，並保留 bottom-sheet / modal 優先互動。
- Verifiable delivery: Pass。計畫包含 frontend 必要驗證命令與手動 UI 驗收項。

## Project Structure

```text
src/
├── pages/GameRoom/
│   └── index.tsx
├── components/game/
│   └── ActionTokens.tsx
├── components/game/
│   └── GameBoard.tsx
└── index.css

specs/013-game-info-action-status-panel/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── game-info-action-status-panel-contract.md
└── checklists/
    └── requirements.md
```

## Phase 0 - Research

Research output: [research.md](./research.md)

Key decisions:

- Use existing player state for action status and local replay data.
- Keep replay inline inside the `資訊` panel, below the local player's action icon row.
- Only local used `密約` / `取捨` icons are selectable for replay.
- Show at most one replay panel at a time and preserve it when switching away from and back to `資訊`.
- Keep opponent action icons status-only to protect hidden information.
- Move the leave-game entry into the information status row as a clear button, not a full-row click target.

## Phase 1 - Design

Design outputs:

- [data-model.md](./data-model.md)
- [contracts/game-info-action-status-panel-contract.md](./contracts/game-info-action-status-panel-contract.md)
- [quickstart.md](./quickstart.md)

Implementation design:

- `GameRoom` owns the information section and should render identity, current-player status row, leave-game button, player summaries, and action status panel.
- Introduce local UI state for the currently expanded replay action, likely keyed by `secret` / `trade-off` / `null`.
- Reuse existing action icon assets and existing item card display helpers for local replay cards.
- Keep `GameBoard` hand/action controls behavior unchanged for 013; if reusable rendering is extracted from `ActionTokens`, it must not change hand action submission behavior.
- Remove the standalone bottom `離開遊戲` primary control from normal playable room display after the information status row owns that action.

## Phase 1 Constitution Re-check

- Game rule correctness: Pass。設計不碰 gameplay action 或 scoring。
- Shared state integrity: Pass。所有出牌仍走既有 server flow；資訊面板只顯示 client-visible state。
- Explicit realtime contracts: Pass。UI contract 明確列出無 Socket.IO/API/shared type 變更。
- Mobile-first playability: Pass。資訊面板必須在 mobile/desktop 不水平溢出，並讓 bottom-sheet 保持優先。
- Verifiable delivery: Pass。quickstart 定義 build/test 與手動驗收。

## Phase 2 - Task Planning

Tasks should be generated around these slices:

1. Move identity / turn status and leave-game entry into the information panel.
2. Add current-player + leave-game status row with correct non-clickable/clickable boundaries.
3. Render both players' action status icons with used/unused states.
4. Add local-only inline replay for used `密約` / `取捨`, one replay open at a time, preserved across tab switches.
5. Remove the old standalone bottom leave-game primary control from playable room display.
6. Validate hidden-information boundaries, mobile layout, modal layering, and existing tests/build.

## Risks

- Hidden information leakage through opponent status rows, alt text, tooltips, or replay state. Mitigation: opponent icons are status-only and never receive opponent card arrays for replay.
- Duplicating action token UI could diverge from hand/action controls. Mitigation: reuse icon vocabulary/assets and keep gameplay action submission controls in `手牌&指令`.
- Inline replay may expand the information panel vertically. Mitigation: only one replay area open at a time and content scroll remains within the focused information section.
- Leave-game entry relocation may make the exit harder to find. Mitigation: keep it in the top status row of `資訊` with a clear button and existing confirmation behavior.
