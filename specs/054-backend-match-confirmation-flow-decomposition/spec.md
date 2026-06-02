# 054 Backend Match Confirmation Flow Decomposition

## Summary

本階段抽出再來一場、ready confirmation 純計算與 room scheduler。`GameRoom` 保留事件廣播、logger、NPC callback 與開局流程編排。

## Requirements

- 新增 `server/game/matchConfirmationFlow.ts`。
- 抽出 rematch confirmation、NPC 自動確認、waiting list 與 ready check 初始狀態。
- 新增 `server/rooms/roomScheduler.ts`，集中 timeout 建立、取消與 replacement。
- `GameRoom` constructor 支援 optional scheduler，既有呼叫維持相容。
- 開局相關 timer 改用 scheduler，delay 與事件順序維持不變。
- 不改遊戲規則、WebSocket payload、shared types 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/game/*.test.js` 通過。
- `cd server && node --test dist/rooms/*.test.js` 通過。
- `cd server && npm test` 通過。
