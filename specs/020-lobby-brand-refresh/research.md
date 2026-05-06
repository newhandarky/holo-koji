# Research: Lobby Brand Refresh And Diagnostics

## Decision 1: Diagnostics page remains frontend-only

- Decision: `/diagnostics` 由前端直接組裝摘要資料，不新增後端 API 或 Socket.IO contract。
- Rationale: 020 的需求是把首頁上的診斷資訊搬到獨立頁面，不是建立新的遙測系統。現有資訊大多已可從 `config`、`gameWebSocket` 與 `lineLiff` 推得。
- Alternatives considered:
  - 新增後端 diagnostics endpoint: 不必要，且會把 020 擴成跨端 contract 變更。
  - 直接顯示完整 runtime state: 違反 019 的 production safety 邊界。

## Decision 2: Brand refresh focuses on layout and styling, not copy rewrite

- Decision: 020 以首頁風格重構為主，只調整必要品牌標題與少量引導文案。
- Rationale: 使用者已明確要求重點是首頁風格符合成熟、都會、夜生活感的銀座氛圍，而不是大量改字。
- Alternatives considered:
  - 大幅重寫首頁文案: 成本高，也會把需求從視覺改版擴成產品敘事重寫。

## Decision 3: Keep lobby gameplay controls intact

- Decision: 建房、加房、模式切換、AI 難度與角色組合選擇流程維持現有互動，只重包裝與調整資訊層級。
- Rationale: 017 已經處理角色組合選擇，020 不應重新改動建立房間 contract 或互動順序。
- Alternatives considered:
  - 順便重設建房流程: 會把 020 變成新一輪 UX/contract spec。

## Decision 4: Diagnostics uses allowlist fields only

- Decision: Diagnostics 頁只顯示白名單欄位：連線狀態、URL、環境、router mode、LIFF/LINE 狀態、handler count。
- Rationale: 019 已經把 raw payload 與 full state dump 移出預設 runtime；020 不能用頁面形式把它們放回來。
- Alternatives considered:
  - 顯示 room state snapshot 方便 debug: 風險過高，且不是本 spec 允許範圍。

## Decision 5: Diagnostics entry is intentionally low-contrast

- Decision: 入口放在 Lobby 低干擾區域，例如頁尾文字連結或次要工具列。
- Rationale: 一般玩家不應被 diagnostics 搶走注意力，但開發者仍要能找到入口。
- Alternatives considered:
  - 無入口，只能手打 URL: 可用性太差。
  - 主 CTA 等級入口: 會稀釋首頁品牌與遊戲入口焦點。
