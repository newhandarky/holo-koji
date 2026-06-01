# 049 Plan

## Scope

本階段只拆開局流程純計算，不搬移 timer 或廣播責任。

## Implementation Plan

1. 建立 `server/game/openingFlow.ts`
   - 匯出 waiting state、順序、confirmation 與 gate helper。
2. 補 `server/game/openingFlow.test.ts`
   - 測 deterministic 順序、重排、重複確認、waiting list 與開局 gate。
3. 更新 `server/rooms/gameRoom.ts`
   - 委派 opening flow helper，保留 timer、NPC 與事件編排。
4. 補 `server/rooms/gameRoom.test.ts`
   - 鎖定 `GAME_STARTED` 與 hidden `DEAL_ANIMATION` 順序。

## Validation

- `cd server && npm run build`
- `cd server && node --test dist/game/*.test.js`
- `cd server && node --test dist/rooms/*.test.js`
- `cd server && npm test`
