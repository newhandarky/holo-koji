# 248–256 前端相依套件安全維護 Tasks

**Input**: `spec.md`、`plan.md`
**Track**: `maintenance`

- [X] T001 在 Node 22.13.0 取得 `npm audit`、公開 direct dependency outdated 與 `npm audit fix --dry-run` 結果。
- [X] T002 確認 critical／high dependency paths，以及 GitNexus 1.6.10 的 Node engine 衝突。
- [ ] T003 將 `gh-pages` 更新至 6.3.0，將 `react-router-dom` 更新至 6.30.6。
- [ ] T004 將測試、型別、TypeScript 與 CRA build tool 移至 `devDependencies`。
- [ ] T005 套用無 `--force` 的 transitive 安全修正並更新 Browserslist DB。
- [ ] T006 比較完整與 production-only audit，記錄仍無修正的 dev-only findings。
- [ ] T007 執行完整測試、production build、bundle 與 CLI smoke。
- [ ] T008 執行 GitNexus change detection，確認沒有 frontend runtime symbol／flow 變更。
- [ ] T009 回填結果與殘留風險，建立可獨立回退的維護 commits。
