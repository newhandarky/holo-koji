# Implementation Plan: Game Room Section Tabs

**Branch**: `012-game-room-section-tabs`  
**Date**: 2026-05-03  
**Spec**: [spec.md](./spec.md)

## Summary

將 011 的分散式區塊摘要切換改為 active game room 最上方的滿版三段式 tabs：`資訊`、`角色`、`手牌&指令`。tabs 會成為正常遊玩時唯一的區塊切換入口，固定在 active room 頂部，內容區內部捲動時仍保持可見。

此 feature 只調整前端 UI focus control，不改遊戲規則、server state、Socket.IO event、shared types、action payload 或既有區塊內容。011 的預設角色區、newly actionable auto-focus、blocking interaction restore 都必須保留，且 tabs active 狀態要與實際 focus section 同步。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO（不預期變更）  
**Shared Types**: `game-shared-types`（不預期變更）  
**Package Manager**: npm  
**Storage**: 無新增持久化；active tab/focus 仍是本機 UI state  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`, 使用者進行實際 UI 視覺檢查  
**Target Platform**: Mobile-first web game room, desktop compatible  
**Constraints**: tabs 只顯示三個 label 與 active state；不得顯示 badge、count、summary、hidden info；tabs 固定在 active room 頂部；不得水平溢出；支援 touch/pointer/keyboard Enter/Space；reduced-motion 切換 100ms 內或無動畫

## Constitution Check

- Game rule correctness: Pass。此 spec 明確不改規則、計分、行動合法性、回合流程或 hidden-information 邊界。
- Shared state integrity: Pass。tabs 只改本機 UI focus state，不繞過 server validation。
- Explicit realtime contracts: Pass。不新增或修改 Socket.IO event / payload；若 implementation 發現需要 event 變更，必須先回到 spec/plan。
- Mobile-first playability: Pass。spec 要求 mobile/desktop 不水平捲動，並保留 bottom-sheet / modal 優先互動。
- Verifiable delivery: Pass。計畫包含 frontend 必要驗證命令與手動 UI 驗收項。

## Project Structure

```text
src/
├── pages/GameRoom/
│   └── index.tsx
├── components/game/
│   └── GameBoard.tsx
└── index.css

specs/012-game-room-section-tabs/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── game-room-section-tabs-contract.md
└── checklists/
    └── requirements.md
```

## Phase 0 - Research

Research output: [research.md](./research.md)

Key decisions:

- Use the existing 011 focus section state as the source of truth.
- Replace section-summary click switching with one top tab control.
- Keep tabs purely label-only plus active state.
- Keep tabs visible while active section content scrolls internally.
- Preserve newly actionable auto-focus, but only on not-actionable to actionable transition.
- Preserve blocking interaction restore and keep modal/bottom-sheet above tabs.
- Add keyboard activation with Enter/Space.

## Phase 1 - Design

Design outputs:

- [data-model.md](./data-model.md)
- [contracts/game-room-section-tabs-contract.md](./contracts/game-room-section-tabs-contract.md)
- [quickstart.md](./quickstart.md)

Implementation design:

- `ActiveSection` remains `info | characterBoard | handActions`.
- Introduce a top section tab control bound to the same active section state.
- Remove non-active section summary rows as switching controls.
- Preserve manual tab selection after the player manually switches away while already actionable.
- Keep transition motion within 250ms and reduced-motion behavior within 100ms or no animation.

## Phase 1 Constitution Re-check

- Game rule correctness: Pass。設計不碰 gameplay action 或 scoring。
- Shared state integrity: Pass。所有出牌仍走既有 server flow。
- Explicit realtime contracts: Pass。UI contract 明確列出無 Socket.IO/API 變更。
- Mobile-first playability: Pass。tabs 滿版且不水平捲動，bottom-sheet 優先。
- Verifiable delivery: Pass。quickstart 定義 build/test 與手動驗收。

## Phase 2 - Task Planning

Tasks should be generated around these slices:

1. Add top section tab control and bind to active section.
2. Remove / disable section summary switching controls.
3. Preserve 011 focus rules and newly actionable behavior.
4. Add fixed top layout, responsive label handling, transition timing, reduced motion.
5. Add keyboard focus and Enter/Space activation validation.
6. Validate no hidden info, no gameplay/server/shared changes, and run build/test.

## Risks

- Tabs fixed at the top may reduce usable vertical space. Mitigation: section content keeps internal scrolling and tabs stay compact.
- Auto-focus may fight user manual tab choice. Mitigation: auto-focus only when the player newly becomes actionable.
- Two switching systems may coexist accidentally. Mitigation: tasking and contract require the top tabs to be the only normal section switching control.
- Hidden info could accidentally appear if prior summaries are reused. Mitigation: tabs only display static labels and active state.
