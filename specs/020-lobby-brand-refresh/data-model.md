# Data Model: Lobby Brand Refresh And Diagnostics

## LobbyBrandSurface

描述首頁品牌層與主要內容編排。

### Fields
- `brandTitle`: string
- `brandSubtitle`: string
- `themeDirection`: 'ginza-nightlife'
- `primaryActions`: string[]
- `secondaryTools`: string[]
- `showDiagnosticsEntry`: boolean

### Notes
- `brandTitle` 預期為「銀座十字路」。
- 不負責管理建房 payload，只負責呈現與分層。

## DiagnosticsSnapshot

描述 `/diagnostics` 可安全暴露的摘要資料集合。

### Fields
- `connectionState`: 'disconnected' | 'connecting' | 'connected'
- `websocketUrl`: string
- `apiUrl`: string
- `routerMode`: 'BrowserRouter' | 'HashRouter'
- `environmentName`: string
- `diagnosticsEnabled`: boolean
- `handlerCount`: number
- `liffSupportedOrigin`: boolean
- `liffReady`: boolean
- `lineLoggedIn`: boolean | 'unknown'

### Validation Rules
- 不得包含 room-level hidden state
- 不得包含任何卡牌內容
- 不得包含 raw WebSocket payload
- `handlerCount` 只能是數量，不可列出 handler 內容或 payload 內容

## DiagnosticsSummaryItem

畫面單一診斷欄位。

### Fields
- `label`: string
- `value`: string
- `statusTone`: 'neutral' | 'success' | 'warning' | 'danger'
- `helpText?`: string

### Notes
- 用來支援列表或卡片型 diagnostics 呈現
- 僅承載摘要字串，不直接綁完整物件
