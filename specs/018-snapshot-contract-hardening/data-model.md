# Data Model: Snapshot And Contract Hardening

## Entity: Room Character Set Identity

- Purpose: 定義一個 room 在整個 lifecycle 中唯一有效的角色組合 key。
- Canonical Values:
  - `default`
  - `collaboration`
  - `hololive`
- Validation Rules:
  - 必須屬於支援清單。
  - 在同一 room lifecycle 中不得隱性切換。
  - waiting room、active game、unresolved next round、rematch、restore 後都必須維持一致。

## Entity: Room Snapshot

- Purpose: 用來 restore room 的保存資料。
- Core Fields:
  - `roomId`
  - `hostId`
  - `geishaSet`
  - `baseGeishas`
  - `gameState`
  - `npcId` / `npcDifficulty`（若為 NPC room）
- Validation Rules:
  - `geishaSet` 必須存在於支援清單。
  - 若 `baseGeishas` 存在，必須可被驗證為該 set 的合法七位角色 board。
  - 若 `gameState.geishas` 存在，也必須可被驗證為該 set 的合法七位角色 board。
  - 任一合法性驗證失敗時，snapshot 不可 restore。

## Entity: Board Character Assignment

- Purpose: 表示目前 room 的 7 個固定位置上，實際被放入的角色資料。
- Core Attributes:
  - 七位角色的 identity
  - display name
  - image URL
  - 位置對應 public control / score state
- Validation Rules:
  - 必須剛好七位。
  - 每位角色都必須屬於 room 的 `geishaSet`。
  - 不可混入其他 set。
  - 不可用缺位、fallback、跨 set 補位來修復 snapshot。
- Invariants:
  - 角色資料可變，但位置綁定的 charm / item / icon 規則不在此 entity 內變動。
  - unresolved next round 會沿用同一份 board character assignment。

## Entity: Player-Visible Room State

- Purpose: 發送給 client 的 room / gameplay 狀態子集。
- Core Attributes:
  - room-level `geishaSet`
  - public board data
  - 依玩家可見權限裁切後的 game state
- Validation Rules:
  - host 與 joiner 必須看到相同的 room-level set identity。
  - 不得暴露 opponent hidden hand。
  - 不得暴露未授權的 secret cards 或 pending choices。
- Invariants:
  - restore、resend、rematch 後仍維持同一份 visibility contract。

## Entity: Restore Failure Outcome

- Purpose: 表示 restore 不可繼續時，系統對使用者的行為結果。
- Core Attributes:
  - restore 被拒絕
  - 使用者收到簡單錯誤訊息
  - 系統導向重新建立房間流程
- Validation Rules:
  - 不保留部分可用 room shell。
  - 不顯示技術細節。
- State Transition:
  - `restore requested` -> `restore rejected` -> `new room recovery path`

## Relationship Summary

- 一個 `Room Snapshot` 對應一個 `Room Character Set Identity`。
- 一個 `Room Snapshot` 可包含一份 `Board Character Assignment` 與一份 `Player-Visible Room State`。
- `Player-Visible Room State` 必須繼承同一份 `Room Character Set Identity`，但會依玩家權限裁切 hidden data。
- `Restore Failure Outcome` 只在 snapshot validation 失敗時產生，且會終止該 snapshot 的 room reuse。
