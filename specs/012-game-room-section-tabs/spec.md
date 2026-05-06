# Feature Specification: Game Room Section Tabs

**Feature Branch**: `012-game-room-section-tabs`  
**Created**: 2026-05-03  
**Status**: Completed  
**Input**: User description: "012-game-room-section-tabs"

## Clarifications

### Session 2026-05-03

- Q: Tabs 是否要固定可見？ → A: Tabs 固定在 active game room 最上方，內容區內部捲動時仍保持可見。
- Q: 非 active 區塊的摘要列要怎麼處理？ → A: 移除非 active 區塊的可點擊摘要列，只保留最上方 tabs 作為切換入口。
- Q: 自動切到手牌&指令後，使用者手動切離時要怎麼處理？ → A: 只有從不可操作變成可操作的那一刻自動切到手牌&指令；使用者之後手動切離就維持使用者選擇。
- Q: Tabs 上是否顯示額外狀態提示？ → A: Tabs 只顯示資訊、角色、手牌&指令與 active 狀態，不顯示任何 badge 或摘要。
- Q: Tabs 是否需要鍵盤可操作？ → A: 需要，tabs 可用鍵盤 focus 並以 Enter/Space 切換。

## User Scenarios & Testing

### User Story 1 - 固定入口切換遊戲區塊 (Priority: P1)

玩家進入可遊玩的對戰房間後，應在畫面最上方看到滿版三段式控制列，並可透過 `資訊`、`角色`、`手牌&指令` 三個按鈕切換主要區塊。玩家不需要點擊各區塊內的摘要列，就能理解目前展開的是哪一個區塊並快速切換。

**Why this priority**: 011 已建立三區塊 focus layout，但切換入口分散在各區塊摘要上。將切換入口集中到最上方可降低操作成本，也讓後續資訊區、角色區、手牌區改版有穩定容器。

**Independent Test**: 進入任一 playable room，確認最上方顯示 `資訊 / 角色 / 手牌&指令` 三段控制；依序點擊三個按鈕後，對應區塊展開且 active 狀態同步更新。

**Acceptance Scenarios**:

1. **Given** 玩家進入 playable room，**When** 房間畫面完成載入，**Then** 最上方顯示滿版三段式控制列，且 `角色` 為預設 active 區塊。
2. **Given** `角色` 為 active 區塊，**When** 玩家點擊 `資訊`，**Then** 資訊區展開，角色區與手牌&指令區收合，且 `資訊` 顯示為 active。
3. **Given** `資訊` 為 active 區塊，**When** 玩家點擊 `手牌&指令`，**Then** 手牌&指令區展開，其他區塊收合，且 `手牌&指令` 顯示為 active。
4. **Given** 任一區塊已 active，**When** 玩家再次點擊同一個 active 按鈕，**Then** 仍維持該區塊展開，不產生全部收合的空白狀態。

---

### User Story 2 - 保留既有焦點自動切換規則 (Priority: P2)

玩家在對戰中仍應受益於 011 的焦點自動切換行為：輪到自己且可操作時自動切到 `手牌&指令`；阻擋互動結束後回復互動前焦點，除非玩家此時已可操作。新的最上方 tabs 必須反映這些焦點變化。

**Why this priority**: tabs 取代摘要列成為主要切換入口後，如果自動切換規則不同步，玩家會看到 active tab 與實際展開區塊不一致，或在關鍵操作時停留在錯誤區塊。

**Independent Test**: 在 NPC 或雙人對戰中觸發輪到自己、抽牌提示、贈予/競爭、準備確認或結算等流程，確認 tabs active 狀態與展開區塊一致。

**Acceptance Scenarios**:

1. **Given** 玩家目前正在查看 `角色` 或 `資訊`，**When** 玩家從不可操作變成可操作，**Then** 系統自動切換到 `手牌&指令`，且 `手牌&指令` tab 顯示 active。
2. **Given** 玩家正在查看任一區塊，**When** gift、competition、order confirmation、ready 或 end-round 等阻擋互動開啟，**Then** 互動視窗仍顯示在 tabs 與區塊布局之上。
3. **Given** 阻擋互動開啟前玩家正在查看某一區塊，**When** 阻擋互動關閉且玩家沒有 newly actionable，**Then** 系統回到互動前區塊，且該 tab 顯示 active。
4. **Given** 阻擋互動關閉後玩家 newly actionable，**When** 系統恢復主畫面，**Then** 系統切到 `手牌&指令`，且該 tab 顯示 active。
5. **Given** 玩家已經處於可操作狀態且手動切到 `資訊` 或 `角色`，**When** 房間收到一般狀態更新但玩家沒有重新從不可操作變成可操作，**Then** 系統維持玩家手動選擇的 active tab。

---

### User Story 3 - 維持資訊安全與響應式可用性 (Priority: P3)

玩家在手機與桌機上都應能使用 tabs，不會造成水平捲動、遮蔽阻擋互動，或透過 tab 文字/摘要看見不應公開的卡牌資訊。這個改版只調整切換入口，不改變遊戲資料、出牌流程或 hidden information 邊界。

**Why this priority**: tabs 位於畫面最上方，會成為所有玩家最常看到的 UI。如果 tabs 顯示過多內容或在小螢幕跑版，會直接破壞主要遊戲體驗；如果誤放 hidden 資訊，會破壞遊戲公平性。

**Independent Test**: 在一個手機寬度與一個桌機寬度檢查 tabs，確認不水平溢出、不遮蔽阻擋互動，且 tab 只顯示區塊名稱與 active 狀態。

**Acceptance Scenarios**:

1. **Given** 玩家使用手機寬度畫面，**When** playable room 顯示，**Then** 三段 tabs 仍在一列內可辨識，不需要水平捲動。
2. **Given** 玩家使用桌機寬度畫面，**When** playable room 顯示，**Then** tabs 佔滿主要遊戲區寬度且 active 狀態清楚。
3. **Given** 對手持有手牌、密約牌或有未公開選擇，**When** 玩家查看 tabs，**Then** tabs 不顯示卡牌名稱、縮圖、秘密選擇或對手 hidden details。
4. **Given** gift、competition 或其他 bottom-sheet / modal 顯示中，**When** tabs 存在於背景畫面，**Then** 阻擋互動仍優先可操作。
5. **Given** 玩家使用鍵盤操作，**When** tab control 取得 focus 並按下 Enter 或 Space，**Then** 對應區塊切換為 active。

## Requirements

### Functional Requirements

- **FR-001**: The playable game room MUST show a full-width three-option section control at the top of the active room surface.
- **FR-002**: The section control MUST expose exactly these user-facing options: `資訊`, `角色`, `手牌&指令`.
- **FR-002a**: The section control MUST display only the three section labels and active state; it MUST NOT display badges, counts, summaries, or actionable hints.
- **FR-003**: The `角色` option MUST be active by default when a playable room view is first shown.
- **FR-004**: Selecting `資訊` MUST expand the information section and collapse the character board and hand/actions sections.
- **FR-005**: Selecting `角色` MUST expand the character board section and collapse the information and hand/actions sections.
- **FR-006**: Selecting `手牌&指令` MUST expand the hand/actions section and collapse the information and character board sections.
- **FR-007**: Selecting the currently active option MUST keep that section expanded and MUST NOT collapse all sections.
- **FR-008**: Non-active section summary rows MUST no longer be clickable section switching controls.
- **FR-009**: The top section control MUST be the only section switching control in normal play.
- **FR-010**: The section control MUST visually indicate which one of the three sections is active.
- **FR-011**: The existing auto-focus behavior MUST focus `手牌&指令` only when the local player transitions from not actionable to actionable and no blocking interaction is active.
- **FR-012**: The existing blocking interaction restore behavior MUST keep the active tab synchronized with the restored focused section.
- **FR-012a**: After the local player manually switches away from `手牌&指令` while already actionable, ordinary state updates MUST preserve the manually selected active tab unless the player later newly becomes actionable again.
- **FR-013**: Blocking interactions such as draw, gift, competition, order confirmation, ready checks, and end-of-round flows MUST remain usable above the section control and section layout.
- **FR-014**: The section control MUST NOT submit gameplay actions, emit room events, or modify game state beyond local UI focus.
- **FR-015**: The section control MUST NOT expose any hidden-information content, including opponent hand details, secret selections, unresolved hidden interaction details, card names, or card thumbnails.
- **FR-016**: The section control MUST remain readable and usable on common mobile and desktop viewport sizes without horizontal scrolling.
- **FR-017**: This feature MUST preserve existing game rules, action legality, scoring, turn order, rematch behavior, hidden-information boundaries, and current section content.
- **FR-018**: The section control MUST remain visible at the top of the active game room while section content scrolls internally.
- **FR-019**: The section control MUST be keyboard focusable and MUST support switching sections with Enter or Space.

### Non-Functional Requirements

- **NFR-001**: Switching sections through the control SHOULD complete visual transition within 250ms in normal motion mode.
- **NFR-002**: Players who prefer reduced motion SHOULD see an immediate switch or a transition completed within 100ms.
- **NFR-003**: The section control MUST remain usable with touch input and pointer input.
- **NFR-004**: The section control MUST not overlap or block modal / bottom-sheet interactions.
- **NFR-005**: The control labels MUST remain legible without wrapping into an incoherent layout on tested mobile and desktop widths.

### Key Entities

- **Section Tab Control**: The top full-width three-option control used to switch the active game room section.
- **Active Section**: The currently expanded game room section, one of information, character board, or hand/actions.
- **Blocking Interaction**: A modal or bottom-sheet flow that temporarily takes priority over the section layout.

## Success Criteria

- **SC-001**: In 100% of tested playable room loads, the top section control is visible and contains exactly three options: `資訊`, `角色`, `手牌&指令`.
- **SC-002**: In 100% of tested playable room loads, `角色` is the initially active option.
- **SC-003**: Players can switch from any section to either of the other two sections with one deliberate selection.
- **SC-004**: In tested mobile and desktop viewports, the three-option control does not require horizontal scrolling and all labels remain understandable.
- **SC-005**: During validation, at least one actionable-turn transition automatically activates `手牌&指令` without user selection.
- **SC-006**: During validation, at least one blocking interaction closes back to the correct active tab according to the prior focus or newly actionable rule.
- **SC-007**: No hidden opponent card details, secret selections, or unresolved interaction details are visible in the section control during validation.

## Assumptions

- 011 `game-room-focus-layout` is the baseline behavior for section focus, auto-focus, and blocking interaction restore.
- The section control is part of the active game room surface, not the waiting room or error/loading screens.
- The control only shows section labels and active state; detailed section summaries remain inside their respective sections or later specs.
- UI visual review remains user-owned; automated validation should cover build/test and obvious regressions.

## Out of Scope

- Reworking the content of the information section.
- Adding player action history or action card reveal behavior.
- Changing character card visuals, item icon presentation, or coverflow behavior.
- Changing hand fan layout, hand focus carousel, selected-card check icons, or action token placement.
- Changing pending interaction data flow or modal content.
- Changing server authoritative state, Socket.IO events, shared types, action payloads, or game rules.

## Implementation Notes

- 2026-05-03: 完成 top tabs (`資訊`/`角色`/`手牌&指令`) 實作，並移除資訊/角色/手牌區塊的摘要列切換入口，tabs 成為正常遊玩唯一切換控制。
- 2026-05-03: 保留 011 的 focusSection 單一狀態來源與 auto-focus/restore 規則，僅在 not-actionable -> actionable 自動切換至 `handActions`。
- 2026-05-03: 完成 tabs 的 keyboard focus、active state、mobile label 可讀性、reduced-motion 與層級樣式協作。

## Validation Record

- 2026-05-03: `CI=1 npm test -- --watchAll=false`（pass）
- 2026-05-03: `npm run build`（pass）
