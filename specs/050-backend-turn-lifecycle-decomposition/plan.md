# 050 Implementation Plan

## Scope

- 建立 turn lifecycle pure helper。
- 讓 `GameRoom` 委派抽牌、換手與密約翻開狀態轉移。
- 補 focused tests 與 viewer-safe `CARD_DRAWN` fake socket 整合驗證。

## Runtime Boundary

`GameRoom` 仍負責 WebSocket 傳送、遮蔽卡片、logger、NPC timer、帳號完成紀錄、回合結算與下一輪排程。helper 僅處理 immutable state transition。

## Verification

```bash
cd server
npm run build
node --test dist/game/*.test.js
node --test dist/rooms/*.test.js
npm test
```
