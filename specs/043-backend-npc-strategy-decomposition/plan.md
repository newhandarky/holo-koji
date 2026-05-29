# 043 Plan

## Scope

本階段只拆 NPC 策略純決策，不拆 `GameRoom` class、不改 action payload、不改遊戲規則。

## Implementation Plan

1. 建立 `server/npc/npcStrategy.ts`
   - 定義策略用的玩家 shape。
   - 匯出可注入 random source 的策略 helper。
   - 重用 `npcEvaluation.ts` 的 snapshot、utility、apply/evaluate helper。

2. 補 `server/npc/npcStrategy.test.ts`
   - 測 random card/group helper 可用 deterministic random 驗證。
   - 測 hard/expert 策略會依既有價值排序挑牌。
   - 測 gift / competition response 的選擇規則。

3. 更新 `server/index.ts`
   - `buildNpcAction` 改委派給 `buildNpcActionChoice`。
   - `pickNpcGiftCard` / `pickNpcCompetitionGroup` 改委派給策略 helper。
   - 移除原本直接定義在 `GameRoom` 內的策略挑選 helper。

4. 驗證
   - `cd server && npm run build`
   - `cd server && node --test dist/npc/*.test.js`
   - `cd server && npm test`
   - 搜尋確認舊 helper 不再定義於 `server/index.ts`

## Non-Goals

- 不重寫 NPC AI 演算法。
- 不調整難度平衡。
- 不拆 WebSocket message handlers。
- 不拆 `GameRoom` 核心狀態機。
