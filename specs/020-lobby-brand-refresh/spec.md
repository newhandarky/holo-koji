# Feature Specification: Lobby Brand Refresh And Diagnostics

**Feature Branch**: `020-lobby-brand-refresh`  
**Created**: 2026-05-05  
**Status**: Complete  
**Input**: User description: "020-lobby-brand-refresh-and-diagnostics"

## Clarifications

### Session 2026-05-05

- Q: `/diagnostics` 的入口要放在哪裡？ → A: 在 Lobby 放低干擾的小入口，例如頁尾文字連結或次要按鈕。
- Q: 首頁品牌改版的語氣要偏哪一種？ → A: 採成熟、都會、夜生活感的銀座氛圍，但以首頁風格調整為主，不擴大改寫文案。

## User Scenarios & Testing

### User Story 1 - 品牌化大廳首頁 (Priority: P1)

新玩家進入首頁時，第一眼看到的是「銀座十字路」主題化的大廳，而不是偏開發測試用途的 Bootstrap 卡片與診斷資訊。玩家可以直接理解這是正式遊戲入口，並快速開始建立或加入對戰。首頁整體風格應偏成熟、都會、夜生活感的銀座氛圍，而不是依賴大量新文案堆疊品牌感。

**Why this priority**: 這是 Phase 4 的入口改版，若首頁仍維持測試感與開發資訊暴露，後續角色選擇、動畫與帳號功能再完整，第一印象仍然不成立。

**Independent Test**: 開啟 Lobby 首頁，確認畫面主標題、品牌文案與主要操作區已改為「銀座十字路」主題，且原本的開發資訊區塊不再出現在首頁。

**Acceptance Scenarios**:

1. **Given** 玩家開啟首頁，**When** Lobby 載入完成，**Then** 首頁主標題與主視覺呈現「銀座十字路」品牌，而不是「花見小路」測試風格頁面。
2. **Given** 玩家位於首頁，**When** 檢視主操作區，**Then** 可以直接看到建立房間、加入房間與模式選擇等主要入口，不需要穿過開發資訊。
3. **Given** 玩家位於首頁，**When** 檢查可見資訊，**Then** 不會看到 WebSocket、Router、環境、連線狀態或已註冊事件等開發資訊直接常駐在首頁。
4. **Given** 玩家位於首頁，**When** 需要進入診斷頁的使用者尋找入口，**Then** 只會看到低干擾的小型入口，不會讓診斷頁入口與主要遊戲操作搶主視覺。

---

### User Story 2 - 獨立診斷頁面 (Priority: P1)

開發者或測試者需要查看環境與連線資訊時，可以進入獨立的 `/diagnostics` 頁面集中檢查，而不必讓一般玩家在首頁看到這些資訊。

**Why this priority**: 020 的核心不是完全移除診斷能力，而是把診斷資訊從玩家首頁分離。若沒有獨立診斷頁，後續除錯成本會上升。

**Independent Test**: 直接進入 `/diagnostics`，確認頁面能顯示指定的環境與連線資訊，且不包含手牌、對手隱藏資訊、pending choice 或完整 game state。

**Acceptance Scenarios**:

1. **Given** 使用者進入 `/diagnostics`，**When** 頁面載入完成，**Then** 可以看到連線、環境與 LIFF 相關診斷資訊的集中列表。
2. **Given** 診斷頁已開啟，**When** 使用者查看頁面內容，**Then** 可見資訊僅限於環境、連線、登入與 handler 摘要，不會包含任何隱藏遊戲資料。
3. **Given** 一般玩家從首頁開始操作，**When** 不主動進入 `/diagnostics`，**Then** 不會在首頁被動看到這些診斷資料。
4. **Given** 使用者從首頁前往 `/diagnostics`，**When** 尋找入口，**Then** 可透過低干擾的小型入口抵達，而不是透過首頁主操作區的主要 CTA。

---

### User Story 3 - 首頁與診斷頁資訊邊界清楚 (Priority: P2)

玩家使用首頁時只看到品牌化入口；開發者需要排查時才使用診斷頁。這兩個頁面應該各自清楚，避免首頁變成半產品半除錯畫面。

**Why this priority**: 即使首頁改名，如果首頁與診斷頁邊界不明確，仍會回到資訊混雜的問題。

**Independent Test**: 對照 Lobby 與 `/diagnostics`，確認首頁只保留玩家需要的資訊，而診斷頁承接原本需要保留的環境與連線觀測能力。

**Acceptance Scenarios**:

1. **Given** 首頁與診斷頁都可進入，**When** 比較兩者內容，**Then** 首頁只承接品牌與遊戲入口，診斷頁承接除錯資訊。
2. **Given** 開發環境中存在診斷需求，**When** 查看 `/diagnostics`，**Then** 仍能取得基本排查資訊，不需要把這些資訊重新放回首頁。

## Requirements

### Functional Requirements

- **FR-001**: 系統 MUST 將 Lobby 首頁主要品牌名稱更新為「銀座十字路」。
- **FR-002**: 系統 MUST 移除 Lobby 首頁上原本常駐的開發資訊區塊，包括連線狀態、已註冊事件、環境、WebSocket 與 Router 類型資訊。
- **FR-003**: 系統 MUST 重新設計 Lobby 首頁的主要視覺與內容層次，讓首頁優先呈現品牌與建立/加入對戰入口，而不是測試卡片風格。
- **FR-003a**: 系統 MUST 讓首頁品牌風格偏向成熟、都會、夜生活感的銀座氛圍，並以視覺風格調整為主，不要求大幅改寫既有遊戲文案。
- **FR-004**: 系統 MUST 保留建立房間、加入房間、模式選擇與既有遊戲入口，不因品牌改版而移除這些核心操作。
- **FR-005**: 系統 MUST 提供獨立的 `/diagnostics` 頁面承接原本需要保留的診斷資訊。
- **FR-006**: 系統 MUST 在 `/diagnostics` 顯示以下資訊：WebSocket 連線狀態、WebSocket URL、API URL、Router 模式、LIFF 初始化狀態、LINE 登入狀態、目前環境，以及已註冊 WebSocket handler 數量。
- **FR-007**: 系統 MUST 確保 `/diagnostics` 的資訊為摘要型診斷資訊，而不是完整遊戲資料輸出。
- **FR-008**: 系統 MUST 防止 `/diagnostics` 顯示手牌、對手隱藏資訊、pending choice、完整 game state 或其他未授權遊戲狀態。
- **FR-009**: 系統 MUST 讓首頁與 `/diagnostics` 有明確分工：首頁供玩家使用，診斷頁供排查與測試使用。
- **FR-010**: 系統 MUST 允許在本地與部署環境中直接進入 `/diagnostics`，不需要先進房或進入對戰。
- **FR-011**: 系統 MUST 保持首頁與診斷頁之間的基本導覽可理解，讓需要排查的人能找到診斷頁，而一般玩家不會被首頁上的診斷內容干擾。
- **FR-012**: 系統 MUST 在 Lobby 提供前往 `/diagnostics` 的低干擾入口，例如頁尾文字連結或次要按鈕，而不是與建立房間、加入房間同層級的主要操作入口。

### Non-Functional Requirements

- **NFR-001**: 首頁 MUST 在一般玩家視角下具有正式產品入口感，不再呈現開發測試面板風格。
- **NFR-002**: 診斷頁 MUST 使用摘要化資訊，讓排查可行，但不擴大隱藏遊戲資訊外洩風險。
- **NFR-003**: 品牌改版 MUST 不改變建立房間、加入房間與模式選擇的基本可用性。
- **NFR-004**: 此功能 MUST 可透過現有前端驗證流程與使用者手動頁面檢查驗收，不需要完整後端規則調整。

### Key Entities

- **Lobby Brand Surface**: 玩家進入首頁後第一眼看到的品牌、主視覺、標題文案與主要遊戲入口。
- **Diagnostics Surface**: 獨立的診斷頁，集中呈現環境、連線、登入與 handler 摘要資訊。
- **Diagnostics Summary Item**: 診斷頁上可顯示的單一資訊項目，例如 WebSocket URL、Router 模式或 LIFF 初始化狀態。

## Success Criteria

- **SC-001**: 100% 的首頁手動驗收中，不再出現原本常駐的開發資訊區塊。
- **SC-002**: 新玩家能在首頁第一畫面直接辨識「銀座十字路」品牌與主要遊戲入口，不需要先閱讀診斷資訊才能開始操作。
- **SC-003**: `/diagnostics` 能集中顯示規格要求的診斷摘要資訊，且 0 個隱藏遊戲資料欄位被暴露在頁面上。
- **SC-004**: 建立房間、加入房間與模式切換在品牌改版後仍可完成，不因首頁重做而失效。

## Assumptions

- Phase 4 的 020 目標是先完成首頁品牌改版與診斷資訊搬移，不同時處理角色選擇擴充或動畫回接。
- `/diagnostics` 屬於前端可直接進入的功能頁，不需要額外登入流程才能查看環境摘要。
- 診斷頁需要的資料可以來自既有前端狀態與環境設定，不需要在這個 spec 內新增完整的持久化診斷系統。
- 首頁品牌名稱更新為「銀座十字路」後，其餘遊戲規則、角色組合與房間合約維持不變。
- 首頁品牌改版的主要差異來自視覺風格、版面與少量必要標題/引導文字調整，而不是大規模重寫整套產品文案。

## Implementation Notes

- Lobby 首頁已改為品牌化英雄區與分離式操作面板，主品牌固定為「銀座十字路」。
- 原本常駐於首頁的環境、WebSocket、Router 與 handler 診斷資訊已移出首頁，改由 `/diagnostics` 集中承接。
- `/diagnostics` 目前只使用白名單摘要欄位，資料來源限制在前端環境設定、WebSocket 連線狀態、router 模式與 LIFF 診斷摘要。
- `App.tsx` 已加入 `/diagnostics` 路由，並保留既有 BrowserRouter/HashRouter 自動切換策略。
- LIFF 錯誤橫幅仍保留於全域 `App` 層，因其屬於可行動錯誤訊息，而不是首頁常駐診斷面板；020 未改動這條錯誤表面。
- 使用者已完成首頁與 diagnostics 頁面的手動視覺驗收，確認畫面與資訊邊界符合 020 預期，無新增 residual UI issue。

## Out of Scope

- 完成 017 角色組合選擇 Draft 以外的房間 payload 調整。
- 補回發牌動畫、抽牌動畫或其他 `gameMotion` 視覺回接。
- 擴充每個主題超過 7 位角色池。
- 自訂 7 位角色選取模式。
- LIFF 帳號綁定、成就系統與好友邀請成就記錄。
- 後端規則、快照還原合約或隱藏資訊判定邏輯的新增修改。
