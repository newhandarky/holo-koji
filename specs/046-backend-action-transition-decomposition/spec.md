# 046 Backend Action Transition Decomposition

## Summary

在 045 已拆出 action 驗證後，本階段把四種 action 的卡片搬移、token 更新與 pending interaction 計算搬到純函式模組。`GameRoom` 保留 WebSocket 廣播、隱藏資訊處理、NPC timer 與回合編排。

## Requirements

- 新增 `server/game/actionTransitions.ts`，集中 immutable action 狀態轉移。
- 支援：
  - 密約與取捨。
  - 贈予 initiate / resolve。
  - 競爭 initiate / resolve。
- helper 回傳新的玩家狀態、pending interaction、opening deal replay 狀態與事件所需資料。
- helper 失敗時不得修改任何輸入或產生部分更新。
- `GameRoom.handleAction()` 保留 dispatch。
- `GameRoom` 仍保留錯誤傳送、runtime log、遮罩、廣播、NPC timer、persistence 與 `endTurn()`。
- 不改 WebSocket `{ type, payload }` wire shape。
- 不改遊戲規則、UI 行為、shared package 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/game/*.test.js` 通過。
- `cd server && npm test` 通過。
- action 狀態更新 helper 不修改輸入。
