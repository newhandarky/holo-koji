# 048 Backend Round Preparation Decomposition

## Summary

在 047 已將 `GameRoom` 搬到獨立模組後，本階段抽出新回合洗牌、發牌與 diagnostics 純計算。`GameRoom` 保留 base geisha 準備、狀態套用與 runtime log。

## Requirements

- 新增 `server/game/roundPreparation.ts`。
- 抽出洗牌、移除隱藏卡、雙方發牌、draw pile、opening deal summary 與新回合 state 建立。
- 抽出總牌數、手牌數、牌堆數與重複卡片 ID diagnostics。
- helper 支援注入 random source，且不得修改輸入。
- `GameRoom.prepareRoundState()` 保留玩家不足判斷、base geisha 建立、結果套用與 logger。
- 不改遊戲規則、WebSocket payload、UI、shared types 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/game/*.test.js` 通過。
- `cd server && npm test` 通過。
- 回合準備 pure helper 有 deterministic focused coverage。
