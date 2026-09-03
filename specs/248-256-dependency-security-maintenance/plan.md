# 248–256 前端相依套件安全維護計畫

**Branch**: `codex/248-256-dependency-security-maintenance`
**Date**: 2026-09-03
**Track**: `maintenance`

## 變更目標

先降低可安全修正的直接與 transitive findings，再把建置／測試工具正確隔離為 devDependencies。無上游修正或需要框架遷移的項目只記錄，不以 force／不相容 overrides 掩蓋。

## 執行順序

1. 保存 Node 22.13.0 下的 audit、outdated、dependency path 與 dry-run 結果。
2. 更新 direct safe lane：`gh-pages@6.3.0`、`react-router-dom@6.30.6` 與相容 patch updates。
3. 將 testing-library、型別、TypeScript、`react-scripts` 移至 devDependencies。
4. 執行不含 `--force` 的 `npm audit fix`，只接受目前相依範圍可解析的更新。
5. 以固定版本更新 Browserslist DB。
6. 比較完整與 `--omit=dev` audit，檢查 direct dependencies 與 production tree。
7. 執行完整測試、build、bundle 比較與 GitNexus change detection。

## 相容性與衝突策略

- `gh-pages` 6.3.0 支援 Node >=10，與 Node 22.13.0 相容；以既有 `gh-pages -d build` CLI smoke 驗證參數。
- `react-router-dom` 6.30.6 的 React peer range 為 >=16.8，與 React 18 相容；不接受 Router 7。
- GitNexus 1.6.10 的 Node engine 不相容，因此保持 1.6.9 並將殘留 findings 視為 dev-only tool risk。
- 若 lockfile 更新造成測試、build、bundle 或 route 行為回歸，先回退該 direct update；不使用 force 修補。
- `plan-uiux.md` 與 `plan-api.md` 不需要：本工作不改 UI、API 或 runtime contract。

## 驗證命令

```bash
CI=1 npm test -- --watchAll=false
npm run build
npm audit --json
npm audit --omit=dev --json
npm ls react-router-dom gh-pages gitnexus react-scripts
npm ls --omit=dev gitnexus react-scripts @testing-library/react typescript
```

## Commit 拆分

1. `建立前端相依套件安全維護規格`
2. `更新可安全修正的前端相依套件`
3. `完成相依套件安全驗收紀錄`
