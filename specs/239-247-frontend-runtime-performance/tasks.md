# 239–247 前端執行期效能優化 Tasks

**Input**: `spec.md`、`plan.md`、`plan-uiux.md`  
**Track**: `maintenance`

## Phase 1 — 規格與工具鏈

- [X] T001 從乾淨 `main@61b2da4` 建立並切換 `codex/239-247-frontend-runtime-performance`。
- [X] T002 建立 `specs/239-247-frontend-runtime-performance/spec.md`、`plan.md`、`plan-uiux.md`、`tasks.md`。
- [X] T003 以 Node 22.13.0 在 `package.json` 精確固定 `gitnexus` 1.6.9，新增 `gitnexus:status`、`gitnexus:analyze`，同步 `package-lock.json`。
- [X] T004 驗證本地 GitNexus 版本、devDependency 邊界與 production bundle 排除，將工具鏈修正獨立 commit。
- [X] T005 使用固定本地版本刷新 `.gitnexus/`，驗證 index commit，審查並還原 `AGENTS.md`、`CLAUDE.md`、`.claude/skills` 的自動改寫。

## Phase 2 — Baseline 與候選確認

- [X] T006 固定 Lighthouse 12.8.2 與 Node 22.13.0，記錄 production bundle baseline、量測環境及三次行動／一次桌機結果。
- [X] T007 以 React Profiler 記錄 WebSocket state update、抽牌、發牌與 focus-section scripted flows。
- [X] T008 使用刷新後的 GitNexus 查詢 route、LIFF 與 profiler 候選流程；對每個預定修改的 symbol 執行 upstream impact analysis。

## Phase 3 — Route-level code splitting

- [X] T009 保留 Lobby eager，將 GameRoom、Diagnostics、LINE callback 改成 route-level `React.lazy`。
- [X] T010 新增 `role="status"` Suspense fallback，補 lazy route fallback 與導航測試。
- [X] T011 驗證三個 async chunk 與 Lobby 初始 JS gzip；未觀察到需要預取的切換延遲，因此維持不預取。

## Phase 4 — LIFF SDK loader

- [X] T012 移除 `public/index.html` 的 LIFF SDK 無條件 script。
- [X] T013 新增可重入、Promise 去重、失敗可重試、測試可 reset 的內部 LIFF loader。
- [X] T014 將 LINE client／支援 origin／使用者登入、綁定、分享意圖接到 loader，保留既有 fallback。
- [X] T015 補成功、並行去重、失敗重試、不支援環境、不在首載觸發、登入與分享 fallback 測試。

## Phase 5 — 條件式 runtime 優化

- [X] T016 Profiler 未證明有可達 20% 門檻的非必要 subtree render，因此未保留 memo、state slice 或 callback 修改。
- [X] T017 為適合的圖片補 `decoding`、非關鍵 lazy loading 與固定尺寸；Lighthouse CLS 中位數維持 0。
- [X] T018 Trace 未證明 filter、backdrop blur、box-shadow 或動畫為可重現熱點，因此未修改 CSS／動畫。

## Phase 6 — 驗收與 Closeout

- [X] T019 執行 LIFF、route、GameRoom／WebSocket／抽牌／發牌 focused regression tests。
- [X] T020 使用 Node 22.13.0 執行 `CI=1 npm test -- --watchAll=false`；75 suites／400 tests 通過（含合併前 review 補上的非 LINE clipboard fallback 回歸測試）。
- [X] T021 使用 Node 22.13.0 執行 `npm run build`，記錄 async chunks 與 gzip 差異。
- [X] T022 重跑三次行動 Lighthouse 取中位數並記錄 FCP、LCP、TBT、CLS；桌機執行一次 smoke。
- [X] T023 執行 320、375、768、1024、1440 與 reduced-motion 最小瀏覽器 smoke。
- [X] T024 執行 `gitnexus_detect_changes()`，核對 affected symbols／flows 與預期相符。
- [X] T025 更新本文件勾選，並將最終效能結果與回退項目記錄於 `performance-results.md`。
- [ ] T026 由使用者完成詳細 UI 視覺品質確認後才合併。
- [X] T027 合併前 review 修正非 LINE 分享先等待 LIFF SDK、可能失去 clipboard user activation 的回歸；focused 26 suites／140 tests、完整 75 suites／400 tests 與 production build 通過。

## Dependencies

- T003–T005 必須先於任何 GitNexus query／impact analysis。
- T006–T008 必須先於條件式 render／CSS 優化。
- Route 與 LIFF 可在 baseline 後依序實作，但各自必須可獨立回退。
- T016、T018 未達量測門檻時以「已評估、未保留修改」完成。
- T019–T025 在所有保留的實作完成後執行。
