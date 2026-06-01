# 052 Implementation Plan

## Scope

- 建立 room membership immutable helper。
- 讓 `GameRoom` 與 WebSocket handlers 共用 membership 型別。
- 補加入、重連、移除、detach 與 metadata map focused tests。

## Runtime Boundary

`GameRoom` 保留 logger、persistence 與 NPC 建立；WebSocket handlers 保留 create、join、leave 編排。

## Verification

```bash
cd server
npm run build
node --test dist/rooms/*.test.js
node --test dist/utils/roomSessionReconnect.test.js
npm test
```
