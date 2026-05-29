# 043 Backend NPC Strategy Decomposition

## Summary

在 042 已拆出 NPC config 與 evaluation helper 後，本階段繼續拆 `server/index.ts` 中的 NPC 策略決策。目標是把「NPC 會選哪個行動、哪些卡片、哪個競爭分組、如何回應互動」搬到 `server/npc/npcStrategy.ts`，但保留 `GameRoom` 對房間狀態、timer、WebSocket action dispatch 的掌控。

## Requirements

- 新增 `server/npc/npcStrategy.ts`，集中 NPC 策略決策 helper。
- 從 `GameRoom` 移出下列策略邏輯：
  - `pickBestNpcAction`
  - `evaluateNpcAction`
  - `pickGiftCards`
  - `pickCompetitionCards`
  - `pickTradeOffCards`
  - `buildNpcCompetitionGroups`
  - random card/group helper
  - NPC gift / competition response selection
- `GameRoom` 仍保留：
  - `performNpcAction`
  - `performNpcResponse`
  - `scheduleNpcTurn`
  - `scheduleNpcResponse`
  - `handleAction`
- 不改 WebSocket `{ type, payload }` wire shape。
- 不改遊戲規則、房間流程、UI 行為或 shared package 版本。
- 新增 focused tests 鎖住策略 helper 的核心行為。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/npc/*.test.js` 通過。
- `cd server && npm test` 通過。
- `server/index.ts` 不再直接定義 NPC 策略挑選 helper。
- 新的策略 helper 不 import `server/index.ts`，避免 circular dependency。
