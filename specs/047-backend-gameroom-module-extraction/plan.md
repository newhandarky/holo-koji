# 047 Plan

## Scope

本階段只搬移 `GameRoom` runtime class，不繼續拆 rematch、ready check、order decision 或 turn lifecycle。

## Implementation Plan

1. 建立 `server/rooms/gameRoom.ts`
   - 搬移 `GameRoom` 與 class 專用 helper。
   - 調整相對 import 並維持既有 runtime 行為。

2. 瘦身 `server/index.ts`
   - 僅保留 server 啟動與 handler dependency wiring。

3. 補 `server/rooms/gameRoom.test.ts`
   - 測獨立 import 與建構預設值。
   - 測 snapshot 不含 socket。
   - 測 restore 相容。

4. 更新 `server/package.json`
   - 完整測試納入 `dist/rooms/*.test.js`。

## Validation

- `cd server && npm run build`
- `cd server && node --test dist/rooms/*.test.js`
- `cd server && npm test`
- `rg -n "class GameRoom" index.ts rooms`
