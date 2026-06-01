# 051 Backend Room Snapshot Persistence Decomposition

## Summary

本階段抽出 room snapshot 建立與 optional Redis persistence 委派，讓 `GameRoom` 保留原 method surface，但不再直接組裝 snapshot。

## Requirements

- 新增 `server/rooms/roomSnapshot.ts`，集中 typed snapshot、建立 helper 與 persistence wrapper。
- snapshot 排除 socket、timer、confirmation set 與 deal animation sequence。
- `roomRestore.ts` 與 `GameRoom` 共用 snapshot type。
- 維持 Redis disabled 時不儲存、enabled 時沿用現有 room store。
- 不改 snapshot schema、restore fail-fast 規則、WebSocket payload、遊戲規則或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/rooms/*.test.js` 通過。
- `cd server && npm test` 通過。
