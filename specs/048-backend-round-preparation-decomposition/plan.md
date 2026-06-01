# 048 Plan

## Scope

本階段只拆回合準備純計算，不改開局確認、抽牌或換手 runtime 流程。

## Implementation Plan

1. 建立 `server/game/roundPreparation.ts`
   - 匯出 `buildPreparedRoundState()` 與 `inspectRoundSetup()`。
   - 使用可注入 random source 建立 deterministic 發牌結果。
2. 補 `server/game/roundPreparation.test.ts`
   - 測牌數、發牌順序、opening summary、diagnostics 與輸入不可變。
3. 更新 `server/rooms/gameRoom.ts`
   - 委派 round preparation 與 diagnostics。
   - 保留 log 與 runtime state assignment。

## Validation

- `cd server && npm run build`
- `cd server && node --test dist/game/*.test.js`
- `cd server && npm test`
- 搜尋確認 round preparation 計算已集中至 game 模組
