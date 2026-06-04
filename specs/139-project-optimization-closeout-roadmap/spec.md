# 139 Project Optimization Closeout Roadmap

## Summary

目前專案已進入優化收斂後期。後端 authoritative game runtime、WebSocket lifecycle/message、GameRoom facade，以及前端 GameRoom、Lobby、WebSocket hook、LINE LIFF/account utility 邊界都已完成主要拆分。

接下來的重點不再是持續拆 production code，而是降低大型整合測試維護成本、補齊 typing / diagnostics 小型清理，並整理 release readiness 文件。完成這些後，這一波 042–138 的架構優化即可視為告一段落。

## Current Assessment

- 後端 domain / WebSocket 架構：約 85–90% 告一段落。
- 前端頁面與 hook/component 邊界：約 80–85% 告一段落。
- 測試結構與維護成本：約 60–70% 告一段落。
- release / 文件 / 長期維護節奏：約 50–60% 告一段落。

目前剩餘風險主要不是遊戲規則或 WebSocket contract，而是：

- `src/pages/Lobby/index.test.tsx` 與 `src/pages/GameRoom/index.test.tsx` 仍是最大檔案，後續修改測試時成本偏高。
- 少數 runtime / component 仍屬中型檔案，但不構成立即架構風險。
- diagnostics、runtime logger、test mocks 仍有少量 `any`，可做小型收斂。
- README / CHANGELOG / 開發流程文件尚未完整反映 042–138 的新邊界。

## Closeout Definition

以下條件全部成立時，可將目前這波架構優化視為告一段落：

- `CI=1 npm test -- --watchAll=false` 通過。
- `npm run build` 通過。
- `cd server && npm test` 通過。
- `cd server && npm run verify:deploy` 通過。
- Render `/health` 回 production `ok`。
- root 與 `server/` 工作樹乾淨。
- 沒有已知 P0/P1：hidden info leak、server authoritative bypass、session/auth bypass、production crash、deploy regression。
- 大型整合測試不再阻礙日常開發，或已完成 139–141 test harness closeout。
- 文件能說明 root / server / shared types、Render deploy、測試命令與主要模組邊界。

## Remaining Optimization Tracks

### 139–141: Frontend Test Harness Closeout

目標是瘦身 `Lobby/index.test.tsx` 與 `GameRoom/index.test.tsx` 的重複 setup，不刪除核心整合 regression 情境。

預期成果：

- 抽出 Lobby test harness：mock WebSocket、LINE account / LIFF、common render setup、常用事件 emit helpers。
- 抽出 GameRoom test harness：mock game state factory、player/action token factory、常用 opening / hidden-state setup。
- 保留現有整合測試語意，不改 UI、不改 payload、不改產品行為。
- 完整 frontend tests/build 通過。

### 142–144: Runtime / Logger Typing Cleanup

目標是收斂 production `any` 與 diagnostics 型別，但保留必要的 SDK escape hatch。

預期成果：

- `runtimeLogger` summary input 改用明確的 narrow structural types。
- diagnostics summary 維持 redaction，不暴露 token、LINE identity、hidden card details。
- 測試 mock 的 `any` 只保留在必要 mock boundary。
- 不為了消滅所有 `any` 造成測試樣板暴增。

### 145–147: Release Readiness / Docs Closeout

目標是讓新工程師可以從文件理解目前架構與操作方式。

預期成果：

- README 更新目前 frontend/server/shared types 架構。
- 補上後端 Render deploy / health check / verify commands。
- CHANGELOG 補記 042–138 的架構優化摘要。
- 記錄手動 UI 驗收清單與 release 前門檻。

## Non-goals

- 不把所有檔案都拆到 150 行以下。
- 不強制移除所有 compatibility barrel。
- 不在這波 closeout 中新增遊戲規則、WebSocket event、payload shape 或 shared package version。
- 不把測試瘦身做成 coverage 刪減。

## Assumptions

- 下一階段仍以穩定性與維護性為優先。
- compatibility barrel 是相容策略，不是必須清除的技術債。
- 真正的完成標準以風險與可維護性為準，不以拆檔數量為準。
