# Implementation Plan: Lobby Brand Refresh And Diagnostics

**Branch**: `020-lobby-brand-refresh`  
**Date**: 2026-05-05  
**Spec**: [/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/spec.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/spec.md)

## Summary

將 Lobby 從開發測試風格重構為「銀座十字路」品牌首頁，保留既有建房、加房、模式選擇與角色組合選擇流程，但移除首頁常駐診斷資訊，改由新 `/diagnostics` 頁集中承接安全的環境與連線摘要。實作以純前端為主，重點是版面/視覺重構、路由補充、診斷資料摘要化，以及首頁與 diagnostics 的資訊邊界切割。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`

## Constitution Check

- Game rule correctness: Pass. 020 不改遊戲規則、分數、回合或 hidden-state 規則。
- Shared state integrity: Pass. `/diagnostics` 只讀前端既有摘要狀態，不建立新的 client-authoritative game state。
- Explicit realtime contracts: Pass. 不改 Socket.IO payload contract；若需新增 diagnostics 摘要欄位，只能來自前端既有可觀測狀態。
- Mobile-first playability: Pass. 首頁重構需維持 mobile-first 操作，主要 CTA 不可被 diagnostics 入口稀釋。
- Verifiable delivery: Pass. 前端測試與 build 可驗證，UI 細節仍由使用者手動檢查。

## Project Structure

```text
src/
  App.tsx
  config/
  pages/
    Lobby/
    Diagnostics/
  services/
  utils/
server/
game-shared-types/
specs/020-lobby-brand-refresh/
```

## Phase 0 - Research

1. 診斷資料來源
   - 優先重用既有 `config/environment.ts`、`services/websocket.ts`、`utils/lineLiff.ts` 暴露出的可觀測摘要。
   - 不直接讀 reducer 完整 state，不顯示任何房間內手牌、pending choice 或 room snapshot。
2. 路由策略
   - 延續現有 `App.tsx` 中 `BrowserRouter/HashRouter` 自動切換策略。
   - `/diagnostics` 需同時支援本地與 GitHub Pages hash route。
3. 首頁品牌改版策略
   - 保留既有 Lobby 表單與互動流程，改造包裝層、版面結構、配色、材質感、文字層級。
   - 不把 020 擴成規則文案重寫或大規模 bootstrap 退場專案。
4. 風險取捨
   - 診斷頁若展示過多 runtime 細節，容易重新把 019 才清掉的資訊搬回 UI；因此只保留摘要項目與安全布林/字串值。

## Phase 1 - Design

### UI Architecture

- `Lobby` 拆成兩層責任：
  - `LobbyBrandSurface`: 主視覺、品牌層、CTA 區、低干擾 diagnostics 入口
  - `LobbyPlayControls`: 建房、加房、模式、AI 難度、角色組合
- 新增 `DiagnosticsPage`：
  - 以靜態摘要卡或列表呈現
  - 不連到遊戲房間 state，不訂閱房內事件

### Diagnostics Data Boundary

允許顯示：
- WebSocket 連線狀態
- WebSocket URL
- API URL
- Router 模式
- LIFF 初始化狀態
- LINE 登入狀態
- 目前環境
- 已註冊 handler 數量

禁止顯示：
- 玩家手牌 / 對手手牌
- pending gift offered cards
- competition groups
- room snapshot 原始內容
- reducer full state dump
- 任意原始 WebSocket payload

### Styling Direction

- 方向：成熟、都會、夜生活感銀座
- 手法：深酒紅/琥珀/金屬光澤、分層背景、非 bootstrap card 式首頁構圖
- 文案策略：只改必要標題與副標，不大改操作文案

### Routing Notes

- `App.tsx` 新增 `/diagnostics`
- Lobby 提供次級入口返回或跳轉 diagnostics
- Diagnostics 頁需可回到首頁

## Phase 2 - Task Planning

任務將分成下列區塊：

1. 現況盤點
   - 盤點 Lobby 目前所有首頁可見開發資訊來源
   - 盤點 diagnostics 頁所需摘要欄位來源
2. 首頁品牌重構
   - Lobby 版面與樣式重做
   - 移除首頁常駐 diagnostics 區塊
   - 保留原有 create/join/mode/character-set flow
3. Diagnostics 頁建立
   - 新 route
   - 新頁面元件
   - 安全摘要資料模型與畫面
4. 驗證與回歸
   - 前端 focused tests
   - 確認 diagnostics 不暴露 hidden game data
   - build 與手動 UI 驗收說明

## Risks

- Lobby 視覺重構若直接在現有單檔元件硬改，容易讓表單邏輯與品牌層耦合過深。
  - Mitigation: 以子元件或明確區段分層，不重寫 socket/create/join 核心流程。
- Diagnostics 頁若讀取過寬的 runtime state，可能重新引入 019 已清掉的資料外洩風險。
  - Mitigation: 先定義白名單欄位，只輸出摘要字串/布林/數量。
- GitHub Pages 與本地的 Router 模式不同，若 diagnostics route 沒有一起驗證，部署後可能失效。
  - Mitigation: 在 quickstart 中明確要求 BrowserRouter/HashRouter 兩種導向檢查。
