# 045 Backend Action Validation Decomposition

## Summary

在 044 已拆出回合結算後，本階段繼續降低 `server/index.ts` 的責任混雜度。目標是把 action payload 解析與可獨立驗證的規則搬到純函式模組，讓 `GameRoom` 保留房間狀態判斷與錯誤傳送。

## Requirements

- 新增 `server/game/actionValidation.ts`，集中 action payload 正規化與純驗證。
- 從 `GameRoom` 移出：
  - 字串卡片 ID 陣列與 competition groups 解析。
  - action token 可用性判定。
  - 重複卡片與卡片持有權判定。
  - pending interaction initiate / resolve 衝突判定。
- `GameRoom` 仍保留：
  - 房間成員與目前輪次判定。
  - 遊戲 phase 判定。
  - 錯誤傳送與 runtime log。
- `server/index.ts` 與 `server/ws/messageHandlers.ts` 共用內部 `ServerAction` 型別。
- 純 helper 不得修改輸入。
- 不改 WebSocket `{ type, payload }` wire shape。
- 不改遊戲規則、UI 行為、shared package 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/game/*.test.js` 通過。
- `cd server && npm test` 通過。
- `server/index.ts` 不再定義 action payload normalizer 或純 action 驗證規則。
