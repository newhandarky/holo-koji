# 056 Implementation Plan

## Scope

- 集中 WebSocket room structural types。
- 搬移 create、join、leave lifecycle handlers。
- 將 lifecycle timer 改為可注入 scheduler。
- 補 validation、reconnect、leave 與 timer focused tests。

## Runtime Boundary

Lifecycle handlers 保留原本 runtime 編排與 wire shape；router 只調整 import 來源，`GameRoom` 與 Redis snapshot contract 不變。

## Verification

```bash
cd server
npm run build
node --test dist/ws/*.test.js
node --test dist/utils/roomSessionReconnect.test.js
npm test
```
