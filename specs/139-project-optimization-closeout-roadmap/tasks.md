# 139 Project Optimization Closeout Roadmap Tasks

## 139–141 Frontend Test Harness Closeout

- [x] 139：建立 Lobby test harness。
  - 抽出 `src/pages/Lobby/index.test.tsx` 的 WebSocket mock、LINE account mock、LIFF mock、common render setup。
  - 保留既有 Lobby create/join/invite/account/achievement 整合情境。
  - 驗證：`CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx`、`npm run build`。

- [x] 140：建立 GameRoom test harness。
  - 抽出 `src/pages/GameRoom/index.test.tsx` 的 mock game state、player factory、action token factory、opening hand factory、常用 hidden-state setup。
  - 保留既有 waiting、opening、action、pending interaction、hidden-state、overlay 整合情境。
  - 驗證：`CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx`、`npm run build`。

- [x] 141：收斂大型整合測試重複樣板。
  - 移除 139–140 後剩餘的重複 setup。
  - 不刪除核心 regression 情境，不改 visible UI assertion。
  - 驗證：`CI=1 npm test -- --watchAll=false`、`npm run build`。

## 142–144 Runtime / Logger Typing Cleanup

- [x] 142：收斂 frontend diagnostics / runtime logger 型別。
  - 將 production `any` 改成 narrow structural input type。
  - 保留 redaction 行為與既有 diagnostics 輸出。
  - 驗證：`CI=1 npm test -- --watchAll=false src/utils/runtimeLogger.test.ts src/pages/Diagnostics/index.test.tsx`。

- [x] 143：收斂 frontend test mock `any`。
  - 優先處理 `GameRoom/index.test.tsx`、`Lobby/index.test.tsx` 中容易型別化的 mock props / state。
  - 不為測試 helper 引入過重泛型。
  - 驗證：`CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx src/pages/Lobby/index.test.tsx`。

- [x] 144：盤點必要 escape hatch。
  - 記錄 LIFF SDK window typing 與測試 mock 中保留 `any` 的理由。
  - 若仍保留 `any`，必須集中在 boundary 檔或測試 helper，不擴散到 feature code。
  - 驗證：`rg -n "@ts-ignore|@ts-expect-error|\\bany\\b" src server -g "*.ts" -g "*.tsx" -g "!server/dist/**" -g "!server/node_modules/**"`。
  - 掃描摘要：`@ts-ignore` 0 筆、`@ts-expect-error` 0 筆、`any` 字串 20 筆；其中 14 筆是 Jest `expect.any(...)` matcher、5 筆是 focused hook test fixture cast、1 筆是 LIFF SDK global boundary。
  - 詳細理由：`typing-notes.md`。

## 145–147 Release Readiness / Docs Closeout

- [ ] 145：更新 README 架構與驗證流程。
  - 補 root / server / shared package 的目前關係。
  - 補前端、後端、Render health check 的標準驗證命令。

- [ ] 146：更新 CHANGELOG 架構優化摘要。
  - 摘要記錄 042–138 完成的 backend/frontend boundary closeout。
  - 不改版本號。

- [ ] 147：建立 release readiness checklist。
  - 記錄自動驗證、Render health、手動 UI 驗收、known non-goals。
  - 驗證：文件連結可從 README 找到。

## Closeout Verification

- [ ] `CI=1 npm test -- --watchAll=false`
- [ ] `npm run build`
- [ ] `cd server && npm test`
- [ ] `cd server && npm run verify:deploy`
- [ ] `curl -fsSL https://holo-koji-server.onrender.com/health`
- [ ] root 與 `server/` 工作樹乾淨
