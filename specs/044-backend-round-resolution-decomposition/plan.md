# 044 Plan

## Scope

本階段只拆回合結算純計算，不搬移 `GameRoom` class、不改 action payload、不改遊戲規則。

## Implementation Plan

1. 建立 `server/game/roundResolution.ts`
   - 匯出 structural player / score 型別。
   - 匯出 `resolveRoundBoard`、`determineWinner`、`getNextRoundOrder`。
   - 複製藝妓陣列後再計算控制權，避免修改輸入。

2. 補 `server/game/roundResolution.test.ts`
   - 測控制權、平手保留、輸入不可變與分數計算。
   - 測魅力值、好感數與平手勝負規則。
   - 測下一輪起手玩家輪替。

3. 更新 `server/index.ts`
   - `resolveRound()` 委派控制權、分數與勝者計算。
   - `startNextRound()` 委派下一輪順序計算。
   - 保留 runtime side effects 與既有執行順序。

4. 更新後端設定
   - `server/tsconfig.json` 納入 `game/**/*.ts`。
   - `server/package.json` 測試指令納入 `dist/game/*.test.js`。

## Validation

- `cd server && npm run build`
- `cd server && node --test dist/game/*.test.js`
- `cd server && npm test`
- 搜尋確認舊 helper 不再定義於 `server/index.ts`

