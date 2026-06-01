# 045 Plan

## Scope

本階段只拆 action payload 正規化與純驗證，不搬移 action 狀態轉移、不改 runtime side effects。

## Implementation Plan

1. 建立 `server/game/actionValidation.ts`
   - 匯出內部 `ServerAction` 型別。
   - 匯出 payload normalizer 與純驗證 helper。
   - 保留現有錯誤文字與驗證優先順序。

2. 補 `server/game/actionValidation.test.ts`
   - 測有效與格式錯誤 payload。
   - 測 token、持有權、重複卡片與 pending interaction。
   - 測 helper 不修改輸入。

3. 更新後端整合
   - `GameRoom` wrapper 委派純驗證並保留 `sendError()`。
   - WebSocket handler 改用共用內部 action 型別。

## Validation

- `cd server && npm run build`
- `cd server && node --test dist/game/*.test.js`
- `cd server && npm test`
- 搜尋確認重複 action 型別與 pure helper 已移出入口檔
