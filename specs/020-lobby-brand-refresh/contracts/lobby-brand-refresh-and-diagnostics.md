# Contract: Lobby Brand Refresh And Diagnostics

## Scope

020 僅調整前端 Lobby 首頁與新增 `/diagnostics` 路由，不改 Socket.IO payload contract。

## Lobby UI Contract

### Required visible areas
- 品牌標題「銀座十字路」
- 主要遊戲入口區
  - 建立房間
  - 加入房間
  - 對戰模式選擇
  - NPC 難度選擇（條件式）
  - 角色組合選擇
- 低干擾 diagnostics 入口

### Removed from lobby homepage
- 連線狀態常駐文字
- 環境名稱常駐文字
- WebSocket URL 常駐文字
- Router 模式常駐文字
- 已註冊事件或 handlers 常駐文字

## Diagnostics Route Contract

### Route
- `/diagnostics`

### Allowed fields
- WebSocket 連線狀態
- WebSocket URL
- API URL
- Router 模式
- LIFF 初始化狀態
- LINE 登入狀態
- 目前環境
- 已註冊 WebSocket handler 數量

### Forbidden fields
- 玩家手牌 / 對手手牌
- pending interaction cards
- competition groups
- reducer full state
- room snapshot raw content
- raw WebSocket payload

## Navigation Contract

- Lobby 必須能前往 `/diagnostics`
- `/diagnostics` 必須能回到 Lobby
- Diagnostics 入口不得與主要建房/加房 CTA 同層級競爭
