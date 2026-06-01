# 053 Backend Room Messaging Decomposition

## Summary

本階段抽出 room transport 與 viewer-safe projection helper。`GameRoom` 保留原公開 method surface、事件編排、事件後 persistence 與 snapshot 相容性補值。

## Requirements

- 新增 `server/rooms/roomMessaging.ts`。
- 集中單一玩家傳送、generic broadcast、readyState 檢查、send exception handling 與 redacted diagnostics。
- 集中 pending interaction 遮蔽、viewer-specific state projection 與 hidden deal card 建立。
- `GameRoom` method 名稱與 WebSocket payload 維持不變。
- `broadcastGameStateEvent()` 保留事件後 persistence。
- `buildClientGameState()` 保留舊 snapshot 缺少 `geishaSet` 時的相容性補值。
- 不改遊戲規則、事件順序、shared types 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/rooms/*.test.js` 通過。
- `cd server && node --test dist/utils/roomSessionReconnect.test.js` 通過。
- `cd server && npm test` 通過。
