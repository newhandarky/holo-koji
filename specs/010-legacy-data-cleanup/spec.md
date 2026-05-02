# Feature Specification: Legacy Data Cleanup

**Feature Branch**: `010-legacy-data-cleanup`  
**Created**: 2026-05-02  
**Status**: Completed  
**Input**: User description: "010-legacy-data-cleanup"

## Clarifications

### Session 2026-05-02

- Q: 010 legacy cleanup 要怎麼處理非 Ginza 的舊角色組？ → A: 移除所有非 Ginza 舊角色組與對應選項，只保留 default->Ginza。
- Q: 如果 cleanup 後遇到舊房間快照或舊資料狀態，系統應怎麼處理？ → A: 明確拒絕載入舊資料，顯示不支援舊房間/需重新建立對戰。
- Q: 010 cleanup 要不要實際刪除舊圖片/素材檔？ → A: 只移除程式引用與資料 mapping，素材檔暫時保留。

## User Scenarios & Testing

### User Story 1 - 清除不再使用的舊資料路徑 (Priority: P1)

玩家建立新的預設對戰時，系統應只使用 Ginza v2 的角色與物品資料，不再保留會讓舊預設角色、非 Ginza 舊角色組、舊物品 mapping 或舊 fallback 流程重新進入遊戲的資料路徑。維護者也應能清楚看出目前預設模式就是 Ginza 資料來源。

**Why this priority**: 005 已將 `ginza` 接到預設對戰路徑，但舊資料仍保留在 repo 中。若不清理，未來維護時容易誤用舊資料、讓 fallback 掩蓋資料錯誤，或讓前後端顯示來源再次分歧。

**Independent Test**: 建立新的預設對戰，確認場上七位角色與物品牌組仍來自 Ginza v2；同時檢查已移除的舊資料路徑不再被任何 active match setup 或主要 UI lookup 使用。

**Acceptance Scenarios**:

1. **Given** 玩家建立新的預設對戰，**When** 對戰初始化完成，**Then** 場上角色、位置魅力值與物品卡仍完全使用 Ginza v2 資料。
2. **Given** Ginza v2 資料設定有錯，例如角色池不足七位，**When** 系統建立新對戰，**Then** 系統應維持明確失敗，不得回退到舊資料。
3. **Given** 維護者搜尋舊預設角色、非 Ginza 舊角色組或舊 item mapping，**When** cleanup 完成，**Then** active game setup、使用者入口與主要 UI 顯示路徑不應再引用這些舊資料。

---

### User Story 2 - 保留必要的安全 fallback (Priority: P2)

玩家在圖片載入失敗、顯示資料短暫缺漏或舊房間快照仍被開啟時，遊戲應保持可讀且可操作；cleanup 不應移除必要的顯示 fallback 或造成畫面空白。

**Why this priority**: 清理舊資料不能犧牲遊戲可玩性。圖片與顯示 fallback 是 UI 韌性，不等同於舊 gameplay data。

**Independent Test**: 模擬缺少圖片或 item 顯示欄位的情境，確認畫面仍有可讀 fallback；同時確認 fallback 不會產生舊角色或舊牌組資料。

**Acceptance Scenarios**:

1. **Given** 角色圖片 URL 無法載入，**When** 角色卡顯示，**Then** 畫面仍顯示可讀的角色名稱與魅力值 fallback。
2. **Given** 物品圖片或 icon 顯示欄位缺漏，**When** 手牌、人物卡或互動畫面需要顯示該物品，**Then** 系統應顯示通用 fallback，而不是重新套用舊物品牌組。
3. **Given** 舊房間快照或測試資料仍包含舊 `geishaSet` 值，**When** 系統讀取該資料，**Then** 系統應明確拒絕載入該舊資料並提示重新建立對戰，不得靜默產生混合資料。

---

### User Story 3 - 確認清理範圍不改變遊戲行為 (Priority: P3)

玩家使用密約、取捨、贈予、競爭、回合延續與勝負判定時，行為應與 cleanup 前一致。此 feature 只移除舊資料與不必要 fallback，不改規則與 realtime contract。

**Why this priority**: Legacy cleanup 的主要風險是把資料清理變成行為變更。必須把規則、payload、回合流程與隱藏資訊邊界鎖住。

**Independent Test**: 執行既有使用者入口驗證與對戰建立驗證，確認新預設對戰、可重現的 Ginza setup、行動流程與建置仍通過。

**Acceptance Scenarios**:

1. **Given** 玩家使用任一既有行動，**When** cleanup 後執行該行動，**Then** 選牌張數、合法性、送出結果與回合流程不變。
2. **Given** 對戰沒有分出勝負並進入下一局，**When** cleanup 後延續對戰，**Then** 同一批七位角色與掌控狀態仍按既有規則保留。
3. **Given** 玩家或對手有隱藏資訊，**When** cleanup 後任一 UI 畫面顯示，**Then** 不得新增對手手牌、秘密牌或未公開選擇的可見資料。

## Requirements

### Functional Requirements

- **FR-001**: 系統 MUST 移除不再被 active Ginza/default 對戰路徑使用的舊角色資料、非 Ginza 舊角色組、舊物品資料與舊資料 mapping。
- **FR-001a**: 系統 MUST 保留舊圖片與素材檔本身，除非後續獨立清理明確確認可刪除；本 feature 只移除程式引用與資料 mapping。
- **FR-002**: 系統 MUST 確保新的預設對戰仍使用 Ginza v2 角色池、固定場上魅力值與位置綁定物品資料。
- **FR-003**: 系統 MUST NOT 在 Ginza v2 資料錯誤時回退到舊資料；錯誤必須保持可診斷。
- **FR-004**: 系統 MUST 移除不再需要的舊 fallback lookup code，但保留圖片載入失敗或顯示欄位缺漏時的通用可讀 fallback。
- **FR-005**: 系統 MUST 清楚區分「舊 gameplay data」與「通用 UI fallback」；cleanup 不得移除必要的 UI 可讀性 fallback。
- **FR-006**: 系統 MUST 保持使用者可見的預設對戰入口穩定；若 `default` 仍是對外模式名稱，它必須繼續解析到 Ginza v2。
- **FR-006a**: 系統 MUST 移除非 Ginza 舊角色組的使用者可選入口與 active setup 路徑，只保留 `default` 解析到 Ginza v2。
- **FR-007**: 系統 MUST 確認主要 UI 顯示路徑不再依賴舊角色卡圖、舊物品卡圖或舊 item icon mapping。
- **FR-007a**: 系統 MUST 對舊房間快照或舊資料狀態採取明確拒絕載入策略，並提示該舊房間不支援繼續遊戲或需要重新建立對戰。
- **FR-008**: 系統 MUST 保留既有密約、取捨、贈予、競爭、抽牌、回合延續與勝負判定流程。
- **FR-009**: 系統 MUST NOT 修改即時通訊事件名稱、行動送出資料格式、共享資料契約或權威驗證規則，除非後續 plan 明確證明該資料只屬於已廢棄內容且不影響玩家流程。
- **FR-010**: 系統 MUST 更新相關測試或驗證紀錄，證明 legacy cleanup 後 default/Ginza setup、前端建置與基本遊戲入口仍可用。

### Non-Functional Requirements

- **NFR-001**: Cleanup MUST reduce ambiguity in data ownership so maintainers can identify Ginza v2 as the active default data source within 5 minutes of inspecting the documented data paths.
- **NFR-002**: Cleanup MUST preserve hidden-information boundaries for opponent hand cards, secret cards, pending choices, and unresolved interactions.
- **NFR-003**: Cleanup MUST preserve mobile-first playability and existing bottom-sheet interaction behavior.
- **NFR-004**: Cleanup SHOULD reduce unused data/fallback surface without introducing new user-visible loading failures or blank card states.

### Key Entities

- **Legacy Gameplay Data**: 舊預設角色、非 Ginza 舊角色組、舊物品牌組、舊 item mapping 或已不再作為 Ginza v2 active setup 來源的資料。
- **Ginza v2 Data**: 目前預設對戰使用的後端角色池、場上位置、固定魅力值、物品素材與 display-only item 資料。
- **UI Fallback**: 圖片失敗、文字缺漏或未知 item 類型時用來保持畫面可讀的通用顯示方式，不應承載舊遊戲資料來源。
- **Default Match Path**: 玩家建立預設對戰時使用的資料入口；cleanup 後仍應解析到 Ginza v2。

## Success Criteria

- **SC-001**: 新建 100% 的預設對戰都使用 Ginza v2 角色與物品資料，且不顯示舊預設角色或舊物品牌組。
- **SC-002**: 當 Ginza v2 setup 資料無效時，驗證能確認系統明確失敗且不回退到舊資料。
- **SC-002a**: 當系統遇到舊房間快照或舊資料狀態時，100% 的情境都應明確拒絕載入並提示重新建立對戰，不得自動轉換或混用資料。
- **SC-003**: 維護者搜尋 cleanup 目標時，active setup 與主要 UI lookup 不再引用已移除的舊資料來源；舊圖片/素材檔可仍存在但不得被 active path 引用。
- **SC-004**: 圖片或顯示欄位缺漏時，角色卡、手牌與互動畫面仍顯示可讀 fallback，不出現空白不可操作卡片。
- **SC-005**: Cleanup 後標準使用者入口驗證、建置驗證與相關對戰建立驗證通過。
- **SC-006**: Cleanup 後既有行動流程、回合延續、計分、勝負判定與隱藏資訊邊界無行為差異。

## Assumptions

- `005-game-data-v2-contract` 已完成，且 active default match path 已解析到 Ginza v2。
- `006` 到 `009` 的主要 Ginza UI 已完成或可用，因此舊資料已不再是主要視覺驗收來源。
- `default` 仍可作為使用者可見或相容性用的模式名稱；本 feature 只清理其背後不再需要的舊資料，不要求改名。
- 清理期間允許呼叫端暫時接受 `GeishaSet | undefined`，但實際邏輯一律在單點 normalize 為 `'default'`。
- 非 Ginza 舊角色組不再保留為使用者可選模式；後續若要新增不同模式，應以新的資料契約與獨立 spec 重新定義。
- 舊圖片/素材檔暫時保留是降低誤刪風險的策略，不代表這些素材仍屬於 active gameplay data。
- 詳細 UI 視覺驗收仍由使用者手動確認；自動驗證聚焦於資料路徑、測試與建置。

## Out of Scope

- 新增新角色、新道具、新模式或新圖片素材。
- 修改 Ginza v2 的角色抽選規則、場上魅力值、物品生成規則或 rematch 行為。
- 修改遊戲規則、計分、勝負判定、行動合法性、即時通訊事件或行動送出資料格式。
- 重做人物 coverflow、手牌扇形、贈予/競爭表面或三區塊聚焦版面。
- release 版本號、CHANGELOG 或正式發布準備。
