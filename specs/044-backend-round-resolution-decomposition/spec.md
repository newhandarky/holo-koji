# 044 Backend Round Resolution Decomposition

## Summary

在 042/043 已拆出 NPC helper 後，本階段繼續降低 `server/index.ts` 的責任混雜度。目標是把回合結算中的藝妓控制權、玩家分數、勝者判定與下一輪順序計算搬到純函式模組，讓 `GameRoom` 保留 runtime 編排責任。

## Requirements

- 新增 `server/game/roundResolution.ts`，集中回合結算純計算。
- 從 `GameRoom` 移出：
  - 特定藝妓的 played card 計數。
  - 藝妓控制權更新與平手保留規則。
  - 玩家魅力值與好感數更新。
  - 勝者判定。
  - 下一輪起手順序計算。
- `GameRoom.resolveRound()` 仍保留：
  - phase 切換。
  - 密約翻開。
  - WebSocket 廣播。
  - 帳號完成紀錄。
  - 下一輪 timer。
- `GameRoom.startNextRound()` 仍保留回合建立、發牌動畫與廣播編排。
- 純 helper 不得修改傳入的藝妓陣列。
- 不改 WebSocket `{ type, payload }` wire shape。
- 不改遊戲規則、UI 行為、shared package 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/game/*.test.js` 通過。
- `cd server && npm test` 通過。
- `server/index.ts` 不再定義 `countCardsForGeisha`、`updatePlayerScores`、`determineWinner`、`getNextRoundOrder`。

