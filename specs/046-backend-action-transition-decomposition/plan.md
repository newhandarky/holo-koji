# 046 Plan

## Scope

本階段只拆 action 狀態轉移，不搬移 `GameRoom` class、不改事件順序或對外 payload。

## Implementation Plan

1. 建立 `server/game/actionTransitions.ts`
   - 使用 immutable player clone。
   - 集中卡片搬移、token 使用、opening deal replay 關閉與 pending interaction 計算。
   - 失敗回傳既有錯誤文字。

2. 補 `server/game/actionTransitions.test.ts`
   - 測四種 action 與兩種互動 resolve。
   - 測事件資料、失敗 atomicity 與輸入不可變。

3. 更新 `server/index.ts`
   - handler 套用純 helper 結果。
   - 保留 runtime side effects 與既有執行順序。

## Validation

- `cd server && npm run build`
- `cd server && node --test dist/game/*.test.js`
- `cd server && npm test`
- 搜尋確認舊 action mutation 已由 helper 接管
