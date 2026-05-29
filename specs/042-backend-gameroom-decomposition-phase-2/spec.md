# 042 Backend GameRoom Decomposition Phase 2

## Summary

在不改 WebSocket wire shape、遊戲規則、UI、shared package 的前提下，先從 `server/index.ts` 拆出低風險的 NPC 設定與純評估 helper。`GameRoom` class 本階段仍留在 `server/index.ts`，只降低 entrypoint 內部的責任混雜度。

## Requirements

- 新增 `server/npc/npcConfig.ts`，集中 NPC 難度名稱、思考時間與 difficulty normalization。
- 新增 `server/npc/npcEvaluation.ts`，集中 NPC 評估用的純函式與 snapshot 型別。
- `server/index.ts` 不再直接宣告 NPC 難度常數與純評估細節。
- `server/ws/messageHandlers.ts` 改用同一份 NPC difficulty normalization，避免重複邏輯。
- `server/tsconfig.json` 必須納入 `npc/**/*.ts`。
- 不改 WebSocket `{ type, payload }` wire shape。
- 不改遊戲規則、房間流程、UI 行為或 shared package 版本。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && npm test` 通過。
- `server/index.ts` 與 `server/ws/messageHandlers.ts` 不再有 NPC difficulty normalization 的本地重複定義。
- `GameRoom` 核心仍留在 `server/index.ts`，後續再另開 spec 拆核心狀態機。
