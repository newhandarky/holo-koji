# 053 Implementation Plan

## Scope

- 建立 room transport 與 viewer-safe projection helper。
- 讓 `GameRoom` 保留 method surface 並改為薄委派。
- 補 transport failure、broadcast exclusion 與 hidden information tests。

## Runtime Boundary

`GameRoom` 保留事件編排、事件後 persistence 與相容性補值；WebSocket handlers 保留 create、join、leave 流程。

## Verification

```bash
cd server
npm run build
node --test dist/rooms/*.test.js
node --test dist/utils/roomSessionReconnect.test.js
npm test
```
