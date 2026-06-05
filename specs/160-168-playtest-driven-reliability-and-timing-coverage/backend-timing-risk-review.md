# 166 Backend Room Timing Risk Review

## 檢查範圍

- `server/rooms/roomOpeningRuntime.ts`
- `server/rooms/roomTurnRoundRuntime.ts`
- `server/rooms/roomActionRuntime.ts`
- `server/rooms/roomNpcRuntime.ts`
- `server/rooms/roomRuntimeResume.ts`

## 目前事件順序假設

- 順序決定完成後，兩位玩家都確認才會進入 ready check。
- ready check 完成後，server 會準備 round state，廣播 `GAME_STARTED`，接著送 `DEAL_ANIMATION`，再呼叫 `beginTurnForCurrentPlayer()`。
- `beginTurnForCurrentPlayer()` 可能立刻送 `CARD_DRAWN`，所以前端必須能延後 draw presentation，避免與 opening deal / opening hand reveal 重疊。
- 回合結算會先送 `ROUND_COMPLETE`，再更新結算後 game state；前端 round summary 顯示期間也必須延後 draw presentation。
- restore resume 會依 snapshot phase 補回 round scheduling 或 NPC pending response，前端不應假設 restore 一定從 idle 畫面開始。

## 風險評估

- 未發現需要立即修改後端 source 的 P0/P1 風險。
- 後端目前允許 `GAME_STARTED`、`DEAL_ANIMATION`、`CARD_DRAWN` 在短時間內連續抵達；這是設計上合理的 authoritative runtime 行為，前端需負責 presentation queue。
- NPC turn / response 使用 scheduler replacement，現有 tests 已覆蓋 stale timer replacement 與 restore resume。
- 後續若要改後端 event order，必須同步更新前端 `useWebSocketEventRuntime`、opening/draw presentation tests，並視為 gameplay contract 變更。

## 建議

- 本輪不拆後端 production runtime。
- 保留 server focused regression 作為信心檢查。
- 若後續手動試玩發現「server 事件順序導致前端無法可靠 defer」，再另開 backend/frontend contract spec，不混入本輪。
