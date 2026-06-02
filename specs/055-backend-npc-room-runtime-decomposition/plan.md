# 055 Implementation Plan

## Scope

- 建立 NPC room runtime helper。
- 將 `GameRoom` NPC gate 與 response 選擇改為薄委派。
- 讓 NPC timer 統一使用 scheduler replacement。
- 補 seat、gate、response、immutability 與 timer focused tests。

## Runtime Boundary

`GameRoom` 保留 timer handle、logger、`handleAction()` 與 `endTurn()`；helper 不直接 dispatch，不修改輸入。

## Verification

```bash
cd server
npm run build
node --test dist/npc/*.test.js
node --test dist/rooms/*.test.js
npm test
```
