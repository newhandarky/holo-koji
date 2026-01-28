# 花見小路線上對戰（Hanamikoji）

本專案為花見小路的線上對戰版本，前端使用 React（Create React App），後端使用 Node.js + WebSocket，讓兩位玩家可在房間中進行遊戲。

## 專案結構

- `src/`：前端 React 應用
- `server/`：後端 WebSocket 伺服器
- `docs/`：規則與開發文件

## 環境需求

- Node.js（建議 16+）
- npm

## 安裝依賴

```bash
npm install
```

後端依賴（可獨立安裝）：

```bash
cd server
npm install
```

## 前端啟動（開發模式）

```bash
npm start
```

預設會啟動在 `http://localhost:3000`。

## 後端啟動

```bash
cd server
npm run dev
```

預設 WebSocket 伺服器在 `http://localhost:3001`。

## 測試

```bash
npm test
```

若要在 CI 或一次性跑完：

```bash
CI=1 npm test -- --watchAll=false
```

## 建置

```bash
npm run build
```

輸出會在 `build/` 資料夾。

## 部署（GitHub Pages）

```bash
npm run deploy
```

## 補充說明

- 遊戲規則請參考 `docs/0127-花見小路規則.md`。
- 開發與檢查清單請參考 `docs/0127-花見小路線上遊戲 - 開發與檢查清單.md`。

