# 055 Backend NPC Room Runtime Decomposition

## Summary

本階段抽出 NPC room runtime 的 seat 建立、排程 gate 與 action / response 選擇。`GameRoom` 保留 timer ownership、logger 與 gameplay dispatch。

## Requirements

- 新增 `server/rooms/roomNpcRuntime.ts`。
- 抽出 NPC seat 建立、difficulty 正規化與假連線。
- 抽出 NPC turn / response gate。
- 抽出 NPC action / response 建立，沿用既有策略模組。
- NPC timer 使用 054 scheduler replacement helper，避免重複 timer。
- 不改 NPC 策略、思考時間、遊戲規則、WebSocket payload、shared types 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/npc/*.test.js` 通過。
- `cd server && node --test dist/rooms/*.test.js` 通過。
- `cd server && npm test` 通過。
