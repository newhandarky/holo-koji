# 049 Backend Opening Flow Decomposition

## Summary

在 048 已拆出回合準備後，本階段抽出開局順序決定、confirmation 與 ready gate 純計算。`GameRoom` 保留 timer、NPC 自動確認、事件廣播與實際開始遊戲的 runtime 編排。

## Requirements

- 新增 `server/game/openingFlow.ts`。
- 抽出 order decision waiting state、可注入 random value 的先後手選擇、玩家重排、confirmation update 與開局 gate。
- 重複 confirmation 必須維持 idempotent。
- `GameRoom` 保留 2000ms 順序動畫延遲、800ms ready 延遲、NPC 自動確認、廣播與呼叫 round preparation。
- 發牌動畫維持 viewer-safe hidden cards。
- 不改遊戲規則、WebSocket payload、UI、shared types 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/game/*.test.js` 通過。
- `cd server && node --test dist/rooms/*.test.js` 通過。
- `cd server && npm test` 通過。
