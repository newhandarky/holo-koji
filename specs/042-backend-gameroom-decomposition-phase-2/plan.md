# 042 Plan

## Scope

本階段只拆 NPC 相關低風險 helper，作為 `server/index.ts` 大檔分解的第二步。這是結構整理，不是行為改動。

## Implementation Plan

1. 建立 `server/npc/npcConfig.ts`：
   - 匯出 `NpcDifficulty`
   - 匯出 NPC 難度 label 與 delay helper
   - 匯出 `normalizeNpcDifficulty`

2. 建立 `server/npc/npcEvaluation.ts`：
   - 匯出 `NpcSnapshot` / `NpcSnapshotEntry`
   - 匯出 `buildGeishaCountSnapshot`
   - 匯出 `getCardUtility`
   - 匯出 `evaluateSnapshot`
   - 匯出 `applyCardsToSnapshot`

3. 更新 `server/index.ts`：
   - 移除本地 NPC 常數、snapshot 型別與 pure helper 實作
   - 透過 import helper 維持既有 method 呼叫點
   - 保留 `GameRoom` class 與 NPC 行動策略流程

4. 更新 `server/ws/messageHandlers.ts`：
   - 移除本地 `normalizeNpcDifficulty`
   - 改用 `server/npc/npcConfig.ts`

5. 更新 `server/tsconfig.json`：
   - include 新增 `npc/**/*.ts`

## Validation

- `cd server && npm run build`
- `cd server && npm test`
- 搜尋確認本地重複定義已移除
