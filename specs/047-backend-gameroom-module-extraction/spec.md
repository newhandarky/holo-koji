# 047 Backend GameRoom Module Extraction

## Summary

在 045/046 已拆出 action 驗證與狀態轉移後，本階段將 `GameRoom` runtime class 搬到獨立 room 模組，讓 `server/index.ts` 回歸啟動與 dependency wiring。

## Requirements

- 新增 `server/rooms/gameRoom.ts`，匯出 `GameRoom` class。
- 搬移 class 專用型別、房間 session helper 與遮蔽卡片 helper。
- `GameRoom` 沿用既有 NPC、round resolution、action validation、action transition、room store 與 logger 模組。
- `server/index.ts` 僅保留：
  - env 載入。
  - HTTP app 與 WebSocket server 建立。
  - room registry。
  - WebSocket handler 註冊。
  - listener 啟動。
- 保持 `RestorableRoomLike` 與 `WebSocketRoomLike` structural interface 相容。
- 不建立循環 import。
- 不改遊戲規則、WebSocket payload、UI、shared package 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/rooms/*.test.js` 通過。
- `cd server && npm test` 通過。
- `rg -n "class GameRoom" index.ts rooms` 只在 `rooms/gameRoom.ts` 找到 class。
