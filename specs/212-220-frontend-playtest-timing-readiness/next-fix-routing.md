# 212–220 Frontend Timing 後續修正路線

## 回報分類

### Opening 類

- 症狀：order decision 尚未結束就出現 opening、opening deal 重播、opening hand reveal 提早或卡住。
- 優先檢查：`useGameRoomOpeningPresentation`、`openingDealPresentationModel`、`openingHandRevealRuntime`。
- 自動測試入口：`useGameRoomOpeningPresentation.test.ts`、`GameRoom/index.test.tsx`。

### Draw 類

- 症狀：抽牌通知蓋住 ready / opening / round summary、draw toast 被吞掉、同一張牌重複提示。
- 優先檢查：`useGameRoomDrawPresentation`、`gameRoomDrawPresentationModel`、`gameRoomPresentationFlowModel`。
- 自動測試入口：`useGameRoomDrawPresentation.test.ts`、`gameRoomPresentationFlowModel.test.ts`。

### Ready / Reconnect 類

- 症狀：ready sheet 殘留、重整後重複 join、出現 `PLAYER_ID_TAKEN`、session token 沒恢復。
- 優先檢查：`useWebSocketEventRuntime`、`websocket.ts`、`roomSession` utilities。
- 自動測試入口：`useWebSocketEventRuntime.test.tsx`、`websocket.test.ts`。

### Pending Interaction 類

- 症狀：gift / competition modal 與 draw toast 互相遮擋，或 pending interaction 讓安全的 opponent draw toast 被卡住。
- 優先檢查：`GameRoom` status model、`useGameRoomDrawPresentation` 的 `isInteractionLocked` 與 `isPresentationFlowActive` 分流。
- 自動測試入口：`useGameRoomDrawPresentation.test.ts`、`GameRoom/index.test.tsx`。

## 下一輪修正規則

- 只修手動回報能重現的具體問題，不做大規模 redesign。
- 不改 WebSocket payload、shared types 或 server 遊戲規則。
- 若只是視覺節奏不自然，先補手動回報案例與 focused test，再決定是否調整 duration。
- 若涉及 hidden state 外洩、session 錯亂或遊戲卡死，升級為 P0/P1 hotfix。
- 221–229 的執行紀錄放在 `specs/221-229-frontend-diagnostics-assisted-timing-fixes/triage-log.md`；沒有 Diagnostics 回報時，不做推測式 production timing change。

## 回報轉任務格式

- 問題分類：
- 發生畫面：
- 最小重現步驟：
- 預期時序：
- 實際時序：
- 是否可用現有 Jest 測試覆蓋：
- 建議下一步 spec：
