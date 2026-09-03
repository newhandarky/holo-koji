# 248–256 相依套件安全驗收紀錄

**Date**: 2026-09-03  
**Node**: 22.13.0  
**Package manager**: npm／`package-lock.json`

## 結果摘要

| 範圍 | 修改前 | 修改後 | 判定 |
| --- | ---: | ---: | --- |
| 完整 audit | 64（11 low／17 moderate／33 high／3 critical） | 38（9 low／10 moderate／19 high／0 critical） | critical 歸零，降低 26 項 |
| Production audit | 未能正確區分 build/test 工具 | 2 moderate／0 high／0 critical | 接受並登錄 Router 7 blocker |
| `gh-pages` | 4.0.0 | 6.3.0 | CLI smoke 通過 |
| React Router | 6.30.3 | 6.30.6 | 留在主版本 6 |
| GitNexus | 1.6.9 | 1.6.9 | 精確固定，未進 production tree |
| Browserslist | 過期警告 | 4.28.8／caniuse-lite 1.0.30001810 | Build 無過期警告 |

## Production findings

`npm audit --omit=dev` 只剩 React Router 6 的兩項 moderate：

- backslash navigation 的 open redirect；目前專案沒有 `Link`／`NavLink`，`useNavigate` 只建立站內固定 route 或經 `encodeURIComponent` 處理的 room id。
- SSR hydration error deserialization；本專案為 CRA client-only build，沒有 SSR hydration 或 data router error deserialization。

npm 提供的唯一修正是強制升級 `react-router-dom@7.18.3`。這是主版本遷移，因此本工作不執行 `--force`；風險以限制導覽輸入來源、維持 client-only 架構與既有 route tests 控制。

## Dev-only findings

- Create React App 5 鏈：SVGO／nth-check、PostCSS、serialize-javascript、webpack-dev-server、Workbox 與 Jest/jsdom。npm 的 force 建議會安裝無效的 `react-scripts@0.0.0`，不能採用。
- GitNexus 1.6.9 鏈：`@huggingface/transformers`、onnxruntime、adm-zip 與 sharp。1.6.10 已移除部分問題鏈，但要求 Node `^22.18.0 || >=24.11.0`，不符合本專案 Node 22.13.0 基線。
- `npm audit fix --dry-run` 在目前 lockfile 不再降低 38 項 findings，只會補列跨平台 optional binaries；因此不產生額外 lockfile churn。

上述工具均在 `devDependencies`；`npm ls --omit=dev --depth=0` 已確認 production tree 不含 GitNexus、CRA、TypeScript、Testing Library 或 gh-pages。

## 相容性與驗證

- `npm ci`：通過，未出現 peer dependency 或 lockfile 衝突。
- `CI=1 npm test -- --watchAll=false`：75 suites／400 tests 全數通過（含後續合併前 review 新增的非 LINE clipboard fallback 回歸測試）。
- `npm run build`：通過，無 Browserslist 過期警告。
- `gh-pages --version`：6.3.0。
- Bundle：main JS 69.46 kB gzip（-486 B）、CSS 43.65 kB gzip（-433 B）；async chunks 21.93 kB、3.35 kB、1.14 kB。
- GitNexus detect changes：0 changed symbols、0 affected processes、LOW risk。

## 建議的後續順序

1. 優先另立 CRA 5 → Vite（或其他受維護 bundler）遷移規格；這是降低 dev-only findings 與 deprecated packages 的主要路徑。
2. 其次另立 Router 7.18+ 規格，先補 future flags 與 route／LINE flow 回歸，再升級主版本。
3. Node 基線可升至 22.18+ 後，再單獨更新 GitNexus；不得與 runtime framework migration 混成同一 commit。

## 參考資料

- React 官方 CRA sunset 說明：https://react.dev/blog/2025/02/14/sunsetting-create-react-app
- React Router 官方 changelog：https://reactrouter.com/changelog
- React Router v7 compatibility guidance：https://reactrouter.com/blog/home
- gh-pages releases：https://github.com/tschaub/gh-pages/releases
