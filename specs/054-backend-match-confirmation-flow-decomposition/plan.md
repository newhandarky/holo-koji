# 054 Implementation Plan

## Scope

- 建立 match confirmation 純 helper。
- 建立可注入 room scheduler。
- 讓 `GameRoom` 保留 runtime 編排並改為薄委派。
- 補 confirmation、immutability、scheduler 與 payload focused tests。

## Runtime Boundary

`GameRoom` 保留房間成員驗證、事件廣播、logger、NPC callback 與遊戲啟動；helper 只建立不可變更新結果。

## Verification

```bash
cd server
npm run build
node --test dist/game/*.test.js
node --test dist/rooms/*.test.js
npm test
```
