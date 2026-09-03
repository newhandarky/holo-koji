# 239–247 前端執行期效能優化規格

**Feature Branch**: `codex/239-247-frontend-runtime-performance`  
**Created**: 2026-09-03  
**Status**: In Progress  
**Track**: `maintenance`

## 變更背景

目前 production build baseline 為 JavaScript 91.85 kB gzip、CSS 44.08 kB gzip。這次工作同時改善一般 Lobby 首載、WebSocket 驅動的 React 重繪，以及行動裝置動畫流暢度；所有修改都必須以量測證據為前提，不能為套用 Skill 而改碼。

GitNexus CLI 目前可用版本為 1.6.9，但尚未固定於專案依賴，既有 index 仍停在 commit `9e78997`，相對目前基準 `61b2da4` 已過期。效能實作前必須先解決工具可重現性並刷新 index。

## 目前既有行為

- Lobby 維持 eager loading，並負責建立／加入房間及 LINE 相關入口。
- GameRoom、Diagnostics 與 LINE callback 隨主程式同步載入。
- `public/index.html` 無條件載入 LIFF SDK。
- 多人遊戲狀態由 WebSocket 驅動，authoritative state 位於後端。
- UI 採 mobile-first 與 bottom-sheet 互動，既有登入、邀請、clipboard fallback、診斷與錯誤處理必須保留。

## 這次要修改的行為

### FR-001 路由切割

- Lobby MUST 保持 eager loading。
- GameRoom、Diagnostics 與 LINE callback MUST 使用 route-level `React.lazy`，並各自形成 async chunk。
- Suspense fallback MUST 使用 `role="status"`，且不破壞鍵盤焦點或 screen reader 語意。
- 不做無條件預載；只有量測證明切換延遲明顯時，才可在建立／加入房間意圖後預取 GameRoom chunk。

### FR-002 LIFF SDK 條件載入

- MUST 移除 `public/index.html` 對 LIFF SDK 的無條件首載。
- MUST 新增內部 loader，支援並行呼叫 Promise 去重、載入失敗後明確重試，以及測試重設。
- MUST 僅在 LINE client、支援的 LIFF origin，或使用者觸發 LINE 綁定／分享時載入。
- 一般非 LINE Lobby 首載 MUST 不請求 LIFF SDK。
- 同一頁面生命週期內成功或進行中的載入最多建立一次 script 請求；失敗後下一次明確呼叫 MUST 可重試。

### FR-003 React 重繪

- MUST 使用 React Profiler 量測 WebSocket state update、抽牌、發牌與 focus-section 切換。
- 只有 trace 證明非必要 subtree 重繪時，才可新增 memo boundary、縮小 state slice 或穩定 callback。
- 每一項 render-boundary 修改 MUST 讓對應 scripted flow 的非必要 render 次數降低至少 20%，否則撤回。

### FR-004 圖片與視覺效果

- 圖片 SHOULD 補上適當的 `decoding`、非關鍵圖片 lazy loading 與固定尺寸，前提是不影響首屏必要內容。
- 只有 trace 證明 filter、backdrop blur、box-shadow 或動畫是 paint/composite 熱點時才降低效果。
- CSS／動畫修改沒有可重現 trace 改善時 MUST 撤回。

## 相容性判斷

- 不修改遊戲規則、WebSocket event 或 payload、後端合約、shared types 或 authoritative server state。
- 唯一允許新增的介面是 frontend 內部 LIFF SDK loader。
- 不升級 React、Create React App、TypeScript 或狀態管理框架。
- 不新增 Redux、Zustand、Jotai 或 React Query；維持 state colocated，僅依量測縮小訂閱或 render boundary。
- 必須保留 LINE 登入、綁定、邀請、分享、clipboard fallback、Diagnostics 與載入失敗行為。
- hidden information（對手手牌、秘密卡、待選擇內容）不得因 profiler、log、state 拆分或測試 fixture 外洩。

## 影響範圍

- 前端入口與路由。
- GameRoom、Diagnostics、LINE callback 的載入邊界。
- LINE／LIFF utility 與其測試。
- 經 profiler 證明需要處理的 GameRoom subtree、圖片或 CSS。
- `package.json`、`package-lock.json` 的 GitNexus 開發工具固定。
- 本規格目錄與效能量測紀錄。

## 非功能需求

- **NFR-001**: 所有量測、安裝與驗證使用 Node 22.13.0。
- **NFR-002**: Lighthouse 使用固定版本；本機 production build 行動節流各跑三次取中位數，桌機只做 smoke。
- **NFR-003**: Lobby 初始 JavaScript gzip 相對 91.85 kB baseline 至少降低 15%。
- **NFR-004**: Lighthouse 行動效能分數不得下降超過 2 分，並記錄 FCP、LCP、TBT、CLS 前後差異。
- **NFR-005**: 所有 runtime 改善都必須可獨立回退，不可犧牲正確性、可及性或 hidden-information 安全。
- **NFR-006**: GitNexus 只能使用精確版本 1.6.9；`.gitnexus/` 維持 ignore 且不得提交。

## 驗收條件

- `gitnexus` 以 devDependency 精確固定為 `1.6.9`，lockfile 同步，npm scripts 使用本地固定版本。
- 刷新後 index 對應當時目前 commit，且沒有未審查的 `AGENTS.md`、`CLAUDE.md` 或 `.claude/skills` 改寫。
- production build 顯示 GameRoom、Diagnostics、LINE callback 各自為 async chunk。
- Lobby 初始 JavaScript gzip 至少下降 15%，且 Lighthouse 行動分數退步不超過 2 分。
- 一般非 LINE Lobby 首載不發出 LIFF SDK 請求。
- LIFF loader 測試涵蓋成功、並行去重、失敗重試、不支援環境、不在首載觸發、登入與分享 fallback。
- lazy route fallback、導航、GameRoom／WebSocket／抽牌／發牌既有回歸測試通過。
- `CI=1 npm test -- --watchAll=false` 與 `npm run build` 通過。
- 代理完成 320、375、768、1024、1440 與 reduced-motion 的最小 smoke；詳細視覺品質由使用者合併前手動確認。

## 停止與回退條件

- 任何階段若發現非本工作造成的未提交變更，立即停止，不自動 stash。
- baseline 若顯示瓶頸不在候選區域，只保留分析紀錄，不強行改碼。
- 任一改善破壞 LINE 登入、遊戲時序、hidden information、安全驗證或使用者手動 UI 結果，立即回退該項改善。
- render-boundary 未達 20% 非必要 render 降幅，或 CSS／動畫沒有可重現 trace 改善，撤回該項修改。

## 不在這次範圍的事項

- 後端、shared package、WebSocket contract 或遊戲規則變更。
- React、CRA、TypeScript 或狀態管理技術升級。
- 新增全域 state library、Jest／WebGL／Azure／Tailwind 類工具或 Skill。
- 大幅改版、重新設計 bottom sheet，或由代理取代使用者的詳細 UI 視覺驗收。
