# 051 Implementation Plan

## Scope

- 建立 typed snapshot helper 與 optional persistence wrapper。
- 讓 `GameRoom` 與 restore path 使用同一份 snapshot type。
- 補 snapshot serialization 與 persistence focused tests。

## Runtime Boundary

`GameRoom` 保留 snapshot method surface；`roomStore.ts` 保留 Redis key、TTL、錯誤處理與實際 I/O。

## Verification

```bash
cd server
npm run build
node --test dist/rooms/*.test.js
npm test
```
