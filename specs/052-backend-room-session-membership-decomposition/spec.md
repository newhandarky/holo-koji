# 052 Backend Room Session Membership Decomposition

## Summary

本階段抽出 human room seat 加入、matching-token reconnect、移除、detach 與玩家 metadata map 純狀態轉移。`GameRoom` 保留 logger、persistence 與原公開 method surface。

## Requirements

- 新增 `server/rooms/roomMembership.ts`。
- 集中 `PlayerMetaPayload`、`AddPlayerResult`、session token 正規化與 metadata 正規化。
- token source 可注入，正式環境沿用 `randomBytes(24)`。
- helper 回傳新的 seat 陣列，不修改輸入。
- NPC 加入與 difficulty 選擇保留在 `GameRoom`。
- `ws/messageHandlers.ts` 改用共用 membership 型別。
- 不改 reconnect contract、錯誤文字、WebSocket payload、遊戲規則或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/rooms/*.test.js` 通過。
- `cd server && node --test dist/utils/roomSessionReconnect.test.js` 通過。
- `cd server && npm test` 通過。
