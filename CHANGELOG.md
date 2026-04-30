# 版本紀錄（Changelog）

本檔案依目前 git commit 記錄整理，時間戳未完整保留，先以「未標註日期」呈現；後續可依實際提交日期補齊。

## [Unreleased]
- 尚未規劃。

## [0.2.0] - 2026-04-30
- 導入 speckit / Codex agent workflow，新增 `.agents/skills`、`.specify`、`AGENTS.md` 與版本更新 spec。
- 同步 root、server、`game-shared-types` package 版本策略。
- Bottom Sheet 取代多數互動視窗並可收合
- Top Sheet 抽牌提示（5 秒自動收合），抽牌卡片延遲滑入手牌區
- Ready 準備機制（順序確認後才開始發牌/對戰）
- 「再來一場」支援同房間重開
- 行動 ICON 可檢視已執行的密約/取捨卡牌
- 手機版行動 ICON 固定 4 欄、手牌區縮小並可換行
- AI 難度擴充（超強/地獄）與更進階策略
- 競爭分組視窗改為 Bottom Sheet
- 遊戲結束改為 Bottom Sheet（全高，可收合查看戰況）
- 對手剩餘行動移至場上顯示
- 新增藝妓組合：預設 / 曉 / 大姊姊組
- Redis 房間快照（避免房間被重啟清空）
- b7a8078 增加角色與卡片圖片 修改部分連線對戰邏輯
- 4c60494 AI修改尚未測試
- 5c189b4 AI修改尚未測試
- 234970c 更新專案啟動路徑
- 839b413 修復GIT安裝TYPE問題
- 8d71327 更新
- 8d8484a 修正錯誤
- 778411d 更新遊戲規則
- 9d93490 修復錯誤
- 9af0f14 AI測試第一版
- 1d10d08 AI測試第一版
- afa4879 功能未完測試AI
- 6524eb3 功能未完測試AI
- 2ab050b 修正重複程式碼
- 78a9d6f fix: 修正型別錯誤
- ff94cf0 modified:   package-lock.json  modified:   package.json  modified:   src/App.tsx modified:   src/index.tsx
- 6b4dc10 modified:   src/index.tsx
- a9d8356 fix package.json
- bdfdd07 修改index.tsx
- b33406b 調整 environment.ts
