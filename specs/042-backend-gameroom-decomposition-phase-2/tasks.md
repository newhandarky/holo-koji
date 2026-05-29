# 042 Tasks

- [X] T001 建立 042 spec、plan、tasks 文件。
- [X] T002 新增 `server/npc/npcConfig.ts`，集中 NPC difficulty 設定與 normalization。
- [X] T003 新增 `server/npc/npcEvaluation.ts`，集中 NPC snapshot 評估純函式。
- [X] T004 更新 `server/index.ts` 使用 NPC helper，保留既有 GameRoom method 呼叫面。
- [X] T005 更新 `server/ws/messageHandlers.ts` 共用 NPC difficulty normalization。
- [X] T006 更新 `server/tsconfig.json` 納入 `npc/**/*.ts`。
- [X] T007 執行 server build/test 與結構搜尋驗證。
- [X] T008 補上 `npcEvaluation` focused tests，並讓 `npm test` 執行 `dist/npc/*.test.js`。
