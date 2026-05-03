# Feature Specification: Game Room Focus Layout

**Feature Branch**: `011-game-room-focus-layout`  
**Created**: 2026-05-03  
**Status**: Completed  
**Input**: User description: "011-game-room-focus-layout"

## Clarifications

### Session 2026-05-03

- Q: 收合摘要應顯示到什麼詳細程度？ → A: 收合摘要只顯示狀態與數量，例如回合、目前玩家、手牌數、可用行動數；不顯示手牌細節或隱藏資訊。
- Q: 觸發行動時是否自動切到手牌/指令區？ → A: 輪到自己且可操作時，自動聚焦手牌/指令區；非自己回合維持使用者目前焦點或預設角色區，避免畫面頻繁跳動。
- Q: 阻擋互動結束後要回到哪個焦點？ → A: 互動結束後回到互動前焦點；若輪到自己且可操作，再切到手牌/指令區。
- Q: 聚焦布局的捲動策略應該如何定義？ → A: 主要遊戲房間維持單一視窗高度，避免頁面垂直捲動；區塊內容必要時在區塊內各自捲動。
- Q: 區塊切換是否需要動畫？ → A: 使用短展開/收合動畫，且尊重減少動態偏好。

## User Scenarios & Testing

### User Story 1 - 預設聚焦角色區塊 (Priority: P1)

玩家進入對戰房間時，畫面應清楚分成上方資訊區、中間角色區、下方手牌與指令區。預設狀態聚焦中間角色區，讓玩家優先看到場上七位角色、掌控狀態、魅力值與對應道具資訊；上方與下方區塊保持收合但仍露出重要摘要。

**Why this priority**: 目前資訊、角色與手牌區域同時佔用大量垂直空間，玩家在小螢幕或對戰後期容易需要捲動尋找重點。先建立穩定的三區塊聚焦架構，能改善主要對戰視野，也為後續手牌和資訊區優化提供清楚容器。

**Independent Test**: 進入任一可遊玩的對戰房間，確認預設畫面聚焦角色區；資訊區和手牌/指令區呈現收合摘要；不用捲動即可理解目前回合、角色列表焦點與可操作區塊位置。

**Acceptance Scenarios**:

1. **Given** 玩家進入遊戲房間，**When** 房間畫面完成載入，**Then** 畫面分為資訊、角色、手牌與指令三個區塊，且角色區塊為預設展開狀態。
2. **Given** 角色區塊為展開狀態，**When** 玩家查看角色列表，**Then** 角色卡、掌控狀態、魅力值與道具標示仍可辨識。
3. **Given** 資訊區與手牌/指令區收合，**When** 玩家不展開它們，**Then** 仍能看到必要摘要，例如當前玩家、回合狀態、手牌數或可操作提示。

---

### User Story 2 - 點擊切換聚焦區塊 (Priority: P2)

玩家需要查看不同操作區域時，可以點擊收合的區塊摘要，將該區塊展開為主要焦點；原本展開的區塊則自動收合。任一時間應只有一個主要展開區塊，避免畫面同時展開過多內容造成擁擠。

**Why this priority**: 三區塊布局只有在切換焦點直覺、穩定時才有價值。玩家需要能快速從角色視野切到手牌操作或房間資訊，且不用管理多個展開狀態。

**Independent Test**: 在房間畫面依序點擊資訊區、手牌與指令區、角色區，確認每次只有被點擊的區塊展開，其他區塊收合且保留摘要。

**Acceptance Scenarios**:

1. **Given** 角色區塊正在展開，**When** 玩家點擊手牌與指令區摘要，**Then** 手牌與指令區展開，角色區與資訊區收合。
2. **Given** 手牌與指令區正在展開，**When** 玩家點擊資訊區摘要，**Then** 資訊區展開，其他區塊收合。
3. **Given** 任一區塊已展開，**When** 玩家再次點擊目前展開區塊，**Then** 系統維持至少一個主要區塊展開，不產生全部收合的空白主畫面。
4. **Given** 玩家進入自己的可操作回合，**When** 沒有阻擋互動視窗需要處理，**Then** 系統自動聚焦手牌與指令區，讓玩家可以直接選牌與出牌。

---

### User Story 3 - 保留既有對戰操作與視覺可讀性 (Priority: P3)

玩家在新布局中仍應能完成既有對戰流程，包括抽牌、選牌、密約、取捨、贈予、競爭、回合結算與再來一場。新布局只改變畫面聚焦與收合方式，不改變遊戲規則、資料來源、出牌流程或對手隱藏資訊邊界。

**Why this priority**: 這是 UI layout 改版，不能讓對戰規則、互動視窗或資料安全跟著改變。玩家的操作成本應下降，而不是需要重新學習規則。

**Independent Test**: 在新布局中完成一次 NPC 或雙人對戰的主要行動流程，確認每個行動仍可送出，互動視窗仍可回應，且對手手牌與未公開選擇不會被顯示。

**Acceptance Scenarios**:

1. **Given** 輪到玩家操作，**When** 玩家展開手牌與指令區，**Then** 可以照既有規則選牌並送出可用行動。
2. **Given** 玩家需要回應贈予或競爭，**When** 互動視窗出現，**Then** 視窗仍優先於聚焦布局，玩家可以完成回應。
3. **Given** 對手有手牌、密約牌或未公開選擇，**When** 玩家切換任一聚焦區塊，**Then** 不會新增任何原本不可見的對手資訊。
4. **Given** 玩家正在查看任一聚焦區塊，**When** 抽牌、贈予、競爭、順序確認、準備確認或結算等阻擋互動開啟又結束，**Then** 系統回到互動前焦點；若互動結束後輪到自己且可操作，則聚焦手牌與指令區。

## Requirements

### Functional Requirements

- **FR-001**: The game room MUST present the play area as three user-recognizable sections: information, character board, and hand/actions.
- **FR-002**: The character board section MUST be the default expanded section when a playable room view is shown.
- **FR-003**: The information section MUST show a collapsed summary when it is not expanded, and the summary fields MUST be limited to: round number, current player, turn phase/state.
- **FR-004**: The hand/actions section MUST show a collapsed summary when it is not expanded, and the summary fields MUST be limited to: local hand card count, available action count, local actionable hint.
- **FR-005**: The system MUST allow the player to expand a collapsed section by selecting its visible summary area.
- **FR-006**: The system MUST keep exactly one primary section expanded at a time in normal play.
- **FR-006a**: The system MUST automatically focus the hand/actions section when it becomes the current player's actionable turn and no blocking interaction is active.
- **FR-007**: The system MUST keep the character board readable and navigable when it is expanded, including role/control state, charm values, and item indicators.
- **FR-008**: The system MUST keep hand card selection and action submission usable when the hand/actions section is expanded.
- **FR-009**: The system MUST keep modal or bottom-sheet interactions for draw, gift, competition, order confirmation, ready checks, and end-of-round flows usable above the section layout.
- **FR-009a**: After a blocking interaction closes, the system MUST restore the previously focused section unless the player has newly entered an actionable turn.
- **FR-010**: The system MUST preserve existing game rules, action legality, scoring, turn order, rematch behavior, and hidden-information boundaries.
- **FR-010a**: Collapsed summaries MUST NOT reveal card identities, card thumbnails, secret selections, or other hidden gameplay details.
- **FR-011**: The system MUST provide a layout that remains usable on common mobile and desktop viewport sizes without requiring horizontal scrolling.
- **FR-012**: The system MUST retain the user's current section focus during ordinary state updates unless a blocking interaction requires temporary focus elsewhere or the player newly enters an actionable turn.
- **FR-013**: The main game room view MUST fit within a single viewport height during normal play; if a focused section has overflow content, scrolling MUST be contained within that section rather than the whole page.
- **FR-014**: Section focus changes MUST use a short expand/collapse transition while still supporting an immediate or reduced-motion presentation for players who prefer reduced motion.

### Non-Functional Requirements

- **NFR-001**: Section switching SHOULD complete visual transition within 250ms in normal mode, and in reduced-motion mode transition SHOULD be removed or completed within 100ms.
- **NFR-002**: The layout MUST preserve mobile-first playability and existing bottom-sheet interaction expectations.
- **NFR-003**: The collapsed summaries MUST remain readable without overlapping other game elements on mobile and desktop.
- **NFR-004**: The feature MUST avoid adding new gameplay data exposure paths for opponent hands, secret cards, pending choices, or unresolved interactions.
- **NFR-005**: The layout MUST avoid whole-page vertical scrolling during normal play on tested mobile and desktop viewport sizes.
- **NFR-006**: Section transition motion MUST NOT delay card selection, action submission, or blocking interaction responses.

### Key Entities

- **Focus Section**: One of the three main game room areas: information, character board, or hand/actions. It determines which area is expanded.
- **Collapsed Summary**: The reduced state of a non-focused section, showing only status and counts needed for navigation and awareness.
- **Character Board Section**: The area containing the role cards, character coverflow, charm values, item indicators, and control state.
- **Hand/Actions Section**: The area containing player hand cards, action tokens, and immediate command controls.
- **Information Section**: The area containing room/player/round/turn status and other non-card contextual information.

## Success Criteria

- **SC-001**: 100% of tested room views show exactly three recognizable sections after the room is ready to display gameplay.
- **SC-002**: In 100% of tested room loads, the character board is the default expanded section.
- **SC-003**: Players can switch from any section to either of the other two sections in one deliberate selection.
- **SC-004**: During manual validation on one mobile-width and one desktop-width viewport, no section summary, card list, or primary command overlaps incoherently, requires horizontal scrolling, or causes normal play to rely on whole-page vertical scrolling.
- **SC-005**: Existing core actions remain completable in the new layout during validation: selecting hand cards, submitting an action, and responding to gift or competition.
- **SC-006**: No new opponent hidden information is visible when switching between sections.
- **SC-007**: Section switching remains understandable with motion enabled and remains usable when reduced-motion behavior is active.

## Assumptions

- The current game room already has working role/status, character board, hand, actions, and modal/bottom-sheet flows.
- UI visual review remains user-owned; automated validation should focus on build/test coverage and obvious layout regressions.
- The default focus is character board because it is currently the main inspection area and was the user's requested default.
- Collapsed summaries should show compact status only; detailed redesign of each area's contents can be refined in later specs if needed.

## Out of Scope

- Changing Hanamikoji game rules, scoring, action availability, turn order, or rematch behavior.
- Changing server events, payload formats, persistence, or game data contracts.
- Redesigning character card artwork, fan hand geometry, item data, or Ginza character/data content.
- Adding new modes, new actions, new cards, or new room permissions.
- Implementing release versioning, changelog updates, or deployment work.

## Implementation Notes

- 2026-05-03: `CI=1 npm test -- --watchAll=false` 通過。
- 2026-05-03: `npm run build` 通過。
