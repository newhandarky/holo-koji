# 239–247 前端執行期效能優化計畫

**Branch**: `codex/239-247-frontend-runtime-performance`  
**Date**: 2026-09-03  
**Spec**: [spec.md](./spec.md)

## Summary

先固定 GitNexus 1.6.9 並刷新 index，再建立可重現 baseline。實作順序依風險由低到高為 route-level code splitting、LIFF SDK 條件 loader、量測驅動的 render boundary、圖片與必要的 paint/composite 修正。每階段都設定保留或撤回門檻。

## Technical Context

**Frontend**: React 18、Create React App、TypeScript、Bootstrap  
**Backend**: 不修改；獨立 Node.js、Express、`ws` 服務  
**Shared Types**: 不修改 `@newhandarky/hanakoji-game-types`  
**Package Manager**: npm  
**Runtime**: Node 22.13.0  
**Validation**: `CI=1 npm test -- --watchAll=false`、`npm run build`

## Constitution Check

- Game rule correctness: Pass；不碰規則或回合流程。
- Shared state integrity: Pass；server authoritative state 不變。
- Explicit realtime contracts: Pass；WebSocket event／payload 不變。
- Mobile-first playability: Pass；保留 bottom sheet、焦點、screen reader、reduced-motion。
- Verifiable delivery: Pass；每階段有量測、測試與回退門檻。

## 執行順序

### Phase 0 — 分支與規格

1. 從乾淨 `main@61b2da4` 建立並切換 `codex/239-247-frontend-runtime-performance`。
2. 建立 `spec.md`、`plan.md`、`plan-uiux.md`、`tasks.md`。
3. 將規格文件作為獨立 commit，避免與工具鏈或 runtime 變更混合。

### Phase 1 — GitNexus P3 工具鏈

固定與刷新順序不可交換：

1. 在 `devDependencies` 精確加入 `gitnexus: "1.6.9"`，同步 `package-lock.json`。
2. 新增 `gitnexus:status` 與 `gitnexus:analyze` npm scripts，命令直接呼叫本地 `gitnexus` binary。
3. 使用 Node 22.13.0 執行安裝，確認 `npm ls gitnexus` 與 `node_modules/.bin/gitnexus --version` 均為 1.6.9。
4. 確認 production build 未引用 GitNexus，且套件只存在 devDependency。
5. 將工具鏈修正作為獨立、可回退 commit。
6. commit 後才執行 `npm run gitnexus:analyze` 刷新 index；固定版本前若必須執行，只能用 `npx gitnexus@1.6.9 analyze`。
7. 以 `npm run gitnexus:status` 驗證 index 對應目前 commit。
8. 審查 `AGENTS.md`、`CLAUDE.md`、`.claude/skills` 是否被改寫；只保留經審查且屬於本工作範圍的內容。
9. `.gitnexus/` 保持 ignored，不加入 commit。

**保留門檻**：精確版本、lockfile、script 與 index freshness 全部可重現。  
**撤回門檻**：版本解析不是 1.6.9、production bundle 引入工具、或 analyze 產生無法安全隔離的 repo 變更。

### Phase 2 — Baseline

1. 固定 Node 22.13.0 與 Lighthouse 版本。
2. 建置目前 production 基準，記錄 main bundle／CSS gzip 與 async chunk。
3. 對本機 production build 執行三次行動節流 Lighthouse 並取中位數，桌機執行一次 smoke。
4. 使用 React Profiler scripted flows 記錄 WebSocket update、抽牌、發牌、focus-section 切換的 commit 與 render 數。
5. 記錄 FCP、LCP、TBT、CLS、環境與測試步驟。

**保留門檻**：資料可重現且候選瓶頸與量測相符。  
**撤回門檻**：若瓶頸不在候選區域，不進行對應 render／CSS 改碼，只保存分析。

### Phase 3 — Route-level code splitting

1. 保留 Lobby eager import。
2. 對 GameRoom、Diagnostics、LINE callback 建立靜態可分析的 `React.lazy(() => import(...))` 邊界。
3. 以可及的 `role="status"` Suspense fallback 包覆 lazy routes。
4. 預設不預取 GameRoom；只有量測顯示建立／加入後的 chunk 延遲明顯，才在使用者意圖後預取。

**保留門檻**：三個各自 async chunk、Lobby 初始 JS gzip 降幅朝 15% 門檻前進、fallback 與導航測試通過。  
**撤回門檻**：chunk 未分離、初始 bundle 無改善、導航／焦點／錯誤行為回歸。

### Phase 4 — LIFF SDK loader

1. 移除 `public/index.html` 無條件 LIFF script。
2. 新增內部 loader，以 module-level in-flight Promise 去重；成功後重用、失敗清除 Promise 以允許明確重試。
3. 提供測試專用 reset，移除測試建立的 script 與內部狀態。
4. 只在 LINE client、支援的 LIFF origin、登入／綁定／分享意圖發生時呼叫。
5. 保留既有登入、邀請、clipboard、Diagnostics 與錯誤 fallback。

**保留門檻**：一般 Lobby 首載零 LIFF 請求；並行最多一個請求；失敗可重試；所有 LINE regression 通過。  
**撤回門檻**：登入／分享 fallback 失效、重複請求、錯誤無法重試或非 LINE 首載仍請求 SDK。

### Phase 5 — 量測驅動的 React rendering

1. 使用已刷新的 GitNexus 查詢候選 symbol 與 flow。
2. 每個預定修改的 function／component 先執行 upstream impact analysis。
3. 只對 profiler 證明的非必要 subtree 套用 memo boundary、較窄 state slice 或 stable callback。
4. 不新增 global store，不將 authoritative／hidden state 複製到其他 client store。

**保留門檻**：對應 scripted flow 的非必要 render 次數至少降低 20%，且 props／state 語意不變。  
**撤回門檻**：未達 20%、增加複雜度卻沒有 trace 改善，或影響遊戲時序／hidden information。

### Phase 6 — 圖片與 paint/composite

1. 盤點首屏與非首屏圖片，加入適當 `decoding`、`loading` 與固定尺寸。
2. 只有 trace 指向 filter、backdrop blur、box-shadow 或動畫時才降低特效。
3. 保留 `prefers-reduced-motion`、mobile-first bottom sheet 與視覺層級。

**保留門檻**：圖片 layout shift／解碼改善或 paint trace 可重現改善。  
**撤回門檻**：沒有 trace 改善、CLS 變差或使用者 UI 驗收不通過。

### Phase 7 — 驗收與 closeout

1. 執行 focused tests，再執行完整 test/build。
2. 重跑三次行動 Lighthouse、桌機 smoke，與 baseline 比較中位數。
3. 執行最小瀏覽器 smoke：320、375、768、1024、1440、reduced-motion。
4. 實作完成前執行 `gitnexus_detect_changes()`，核對 affected symbols／flows。
5. 將詳細 UI 視覺品質留給使用者，列為 merge checklist。

## API 與資料邊界

不需要 `plan-api.md`：公開 API、WebSocket contract、後端與 shared types 均不變。唯一新增的是 frontend 內部 LIFF loader，介面只服務現有 LINE utility，必須支援並行去重、失敗重試與測試重設。

## Skill 決策

- Vercel React：採靜態可分析 dynamic import、條件載入第三方 SDK、量測後才預取與 memo。
- React state management：維持 state colocated，不新增全域 store；只在 trace 證明時縮小訂閱。
- Frontend UI engineering：fallback 使用語意化 status，保留 keyboard、screen reader、responsive 與 reduced-motion。
- Composition patterns：不為效能新增 boolean mode 或重做元件 API；僅在 profiler 證明時建立小而明確的 render boundary。

## 預期 Commit 拆分

1. `建立前端執行期效能優化規格`
2. `固定 GitNexus 1.6.9 開發工具`
3. `拆分非首屏前端路由載入`
4. `改為依需求載入 LIFF SDK`
5. `依量測降低遊戲畫面非必要重繪`（只有達門檻才建立）
6. `依量測優化圖片與行動裝置繪製`（只有達門檻才建立）
7. `完成前端效能驗收紀錄`

每筆 runtime commit 必須可獨立回退；不得把 GitNexus 工具鏈與 runtime code 混在同一筆。
