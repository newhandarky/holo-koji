# 050 Backend Turn Lifecycle Decomposition

## Summary

在 048/049 已拆出回合準備與開局流程後，本階段抽出回合開始、抽牌、換手與結算前密約翻開的純狀態轉移。`GameRoom` 保留 viewer-safe 事件傳送、廣播、logger、NPC timer 與 round resolution runtime 編排。

## Requirements

- 新增 `server/game/turnLifecycle.ts`。
- 抽出當前玩家抽牌、清除 pending interaction、重設 last action 與空牌堆處理。
- 抽出下一位仍有 action token 的玩家查找，以及所有 token 用完後進入結算的判定。
- 抽出結算前密約翻開，將 `secretCards` 移至 `playedCards`。
- helper 必須回傳新狀態或新玩家陣列，不修改輸入。
- `GameRoom` 保留依 viewer 遮蔽 `CARD_DRAWN`、廣播、NPC timer、帳號完成紀錄與下一輪 timer。
- 不改遊戲規則、WebSocket payload、UI、shared types 或版本號。

## Success Criteria

- `cd server && npm run build` 通過。
- `cd server && node --test dist/game/*.test.js` 通過。
- `cd server && node --test dist/rooms/*.test.js` 通過。
- `cd server && npm test` 通過。
