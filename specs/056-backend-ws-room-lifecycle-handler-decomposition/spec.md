# 056 Backend WebSocket Room Lifecycle Handler Decomposition

## Summary

本階段將 WebSocket 建房、加房、離房流程移到獨立 lifecycle handlers。`messageHandlers.ts` 保留遊戲訊息的輕量 dispatch。

## Requirements

- 新增 `server/ws/roomHandlerTypes.ts`，集中 structural room interface 與 dependencies。
- 新增 `server/ws/roomLifecycleHandlers.ts`，搬移 create、join、leave handlers。
- lifecycle dependencies 支援 optional scheduler，滿房 delay 維持 `800ms` 與 `1000ms`。
- `messageRouter.ts` 直接引用 lifecycle handlers。
- 測試指令納入 `dist/ws/*.test.js`。
- 不改遊戲規則、WebSocket payload、shared types 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/ws/*.test.js` 通過。
- `cd server && node --test dist/utils/roomSessionReconnect.test.js` 通過。
- `cd server && npm test` 通過。
