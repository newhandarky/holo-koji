# Quickstart: Lobby Brand Refresh And Diagnostics

## Prerequisites

- 前端依賴已安裝
- 本地 server 可選；020 主要驗首頁與 diagnostics，不要求完整對戰流程

## Automated Validation

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual Review

### Lobby homepage
1. 開啟首頁 `/`
2. 確認首頁主品牌為「銀座十字路」
3. 確認首頁第一屏不再顯示：
   - WebSocket 連線狀態
   - 環境
   - WebSocket URL
   - Router 模式
   - handlers / registered events 診斷資訊
4. 確認建房、加房、模式切換、AI 難度、角色組合選擇仍可正常操作
5. 確認 diagnostics 入口存在，但屬低干擾次級入口

### Diagnostics page
1. 進入 `/diagnostics`
2. 確認可看到以下摘要資訊：
   - WebSocket 連線狀態
   - WebSocket URL
   - API URL
   - Router 模式
   - LIFF 初始化狀態
   - LINE 登入狀態
   - 目前環境
   - 已註冊 handler 數量
3. 確認頁面不顯示：
   - 玩家手牌 / 對手手牌
   - pending choice / pending gift / competition groups
   - 完整 game state
   - raw payload
4. 確認可從 diagnostics 回到首頁

### Router parity
1. 本地 `BrowserRouter` 路徑下檢查 `/diagnostics`
2. 若使用 GitHub Pages，確認 hash route 也能正確到達 diagnostics

## Manual Review Result

- 使用者已完成 020 的首頁與 diagnostics 頁面手動驗收。
- 驗收結果：首頁品牌風格、diagnostics 入口干擾程度、資訊白名單邊界均符合預期。
