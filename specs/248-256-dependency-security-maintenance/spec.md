# 248–256 前端相依套件安全維護規格

**Feature Branch**: `codex/248-256-dependency-security-maintenance`
**Base Commit**: `680f7bd`
**Created**: 2026-09-03
**Status**: In Progress
**Track**: `maintenance`

## 變更背景

Node 22.13.0 下的 `npm audit` 顯示 64 項 findings：11 low、17 moderate、33 high、3 critical。多數問題來自 Create React App 5 的建置／測試鏈；另有 GitNexus 1.6.9 的開發期 transitive findings。Browserslist 資料同時落後 8 個月。

## 目前既有行為

- React 18、Create React App 5、TypeScript 4 與 React Router 6 正常通過 399 項測試及 production build。
- `gh-pages` 4.0.0 是 direct critical devDependency。
- `react-router-dom` lockfile 解析為 6.30.3，包含已提供 6.30.6 修正的 advisory。
- 測試、型別、TypeScript 與 `react-scripts` 目前列在 `dependencies`，使 `npm audit --omit=dev` 無法代表實際瀏覽器 runtime surface。
- GitNexus 精確固定為 1.6.9；1.6.10 要求 Node `^22.18.0 || >=24.11.0`，不相容於本工作的 Node 22.13.0。

## 這次要修改的行為

- MUST 使用 Node 22.13.0 執行安裝、audit、測試與 build。
- MUST 將 `gh-pages` 升級至 6.3.0，並驗證 deploy CLI 可執行。
- MUST 將 React Router 6 更新至包含 advisory 修正的 6.30.6，不升級 Router 7。
- MUST 套用不需要 `--force` 的 npm transitive 安全更新，並同步 `package-lock.json`。
- MUST 更新 Browserslist 資料，使 production build 不再顯示資料過期警告。
- MUST 將只用於 build、型別與測試的 direct packages 移至 `devDependencies`。
- MUST 保持 GitNexus 精確版本 1.6.9，不以不相容的 Node 版本升級 1.6.10。
- MUST 記錄修正後 total 與 `--omit=dev` audit 結果，以及仍無安全修正的 dev-only findings。

## 相容性判斷

- 不升級 React 19、React Router 7、TypeScript 7、Testing Library major、web-vitals major 或 Create React App。
- 不執行 `npm audit fix --force`；npm 對 `react-scripts` 的強制建議為無效的 `0.0.0`，不可採用。
- 不修改遊戲規則、frontend runtime code、WebSocket payload、shared types 或後端。
- build/test dependency 移至 devDependencies 後，建置環境必須安裝 devDependencies；實際部署產物仍是 `build/` 靜態檔案。

## 影響範圍

- `package.json`
- `package-lock.json`
- `specs/248-256-dependency-security-maintenance/`

## 驗收條件

- `npm audit` 不再有 critical finding。
- `npm audit --omit=dev` 為 0，或明確記錄無法修正的 runtime blocker。
- `react-router-dom` 實際解析為 6.30.6，`gh-pages` 實際解析為 6.3.0。
- GitNexus 仍精確解析為 1.6.9，且 production dependency tree 不包含 GitNexus／CRA／測試工具。
- `CI=1 npm test -- --watchAll=false` 與 `npm run build` 通過。
- Build 不再輸出 Browserslist 資料過期警告。
- Bundle 尺寸與 async chunk 結構沒有非預期回歸。

## 不在這次範圍的事項

- React 19、Router 7、TypeScript 7 或 Testing Library major migration。
- Create React App 到 Vite／其他 bundler 的遷移。
- 以 overrides 強制跨 major 取代 CRA 內部相依套件。
- 升級 Node 以採用 GitNexus 1.6.10。
