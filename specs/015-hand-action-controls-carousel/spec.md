# Feature Specification: Hand Action Controls Carousel

**Feature Branch**: `015-hand-action-controls-carousel`  
**Created**: 2026-05-03  
**Status**: Completed  
**Input**: User description: "015-hand-action-controls-carousel"

## Clarifications

### Session 2026-05-03

- Q: 手牌焦點 carousel 到第一張或最後一張時，左右切換是否要循環銜接？ → A: 循環銜接；第一張按左切到最後一張，最後一張按右切到第一張。
- Q: 手牌 carousel 的左右切換按鈕是否需要鍵盤可操作與 aria label？ → A: 需要；左右控制是可聚焦的 button，支援鍵盤操作，並提供清楚 aria label。
- Q: 玩家直接點擊某張手牌時，除了選取/取消選取外，是否也要讓該牌成為焦點牌？ → A: 需要；點擊手牌時，同時更新焦點並切換選取狀態。
- Q: 手牌載入或手牌內容變動時，焦點牌要怎麼決定？ → A: 優先保留目前焦點；若該牌已不在手牌中，改聚焦最接近原位置的剩餘手牌；首次載入聚焦中間牌。
- Q: 當目前不是玩家可操作時，底部四個 action token 要怎麼顯示？ → A: 固定顯示四個 token，但在不可操作時全部停用並保留狀態提示。

## User Scenarios & Testing

### User Story 1 - 底部固定四等分 action controls (Priority: P1)

玩家展開 `手牌&指令` 分頁時，四個 action token 應固定在手牌區底部並以滿版四等分呈現。玩家可以清楚看出 `密約`、`取捨`、`贈予`、`競爭` 的可用、已使用與不可用狀態，且點擊 action token 仍走既有行動流程。

**Why this priority**: action token 是玩家送出四種核心行動的入口。將它們放在手牌區底部能避免和扇形手牌互相擠壓，並讓玩家在完成選牌後自然往下方送出行動。

**Independent Test**: 進入可操作回合並展開 `手牌&指令`，確認四個 action token 位於區塊底部、滿版四等分，且每個 action 仍依既有規則送出或顯示不可用狀態。

**Acceptance Scenarios**:

1. **Given** 玩家展開 `手牌&指令` 分頁，**When** 手牌區完成載入，**Then** 四個 action token 顯示在該區塊底部並平均分成四欄。
2. **Given** 某個 action token 已使用，**When** 玩家查看底部 action controls，**Then** 該 token 保留已使用狀態且不可被當作新行動重送。
3. **Given** 玩家尚未符合某 action 的選牌數量，**When** 玩家點擊該 action token，**Then** 系統保留既有提示/阻擋行為，不送出無效 action。
4. **Given** 玩家正確選取所需手牌數量，**When** 玩家點擊對應 action token，**Then** 系統使用既有 action flow 送出，不改 action payload 或 server validation。
5. **Given** 目前不是玩家可操作時機，**When** 玩家查看 `手牌&指令` 分頁，**Then** 四個 action token 仍固定顯示在底部，但全部停用並保留狀態提示。

---

### User Story 2 - 手牌焦點 carousel 操作 (Priority: P2)

玩家在 `手牌&指令` 分頁中應能透過左右按鈕切換目前焦點手牌。焦點牌位於最上層、最容易查看與點擊；切換焦點本身不會自動選取或取消選取手牌。

**Why this priority**: 扇形手牌在卡片重疊時容易出現點擊區不足或焦點不明確。左右切換焦點能讓玩家穩定檢視目前要操作的牌，降低誤點。

**Independent Test**: 在有多張手牌時展開 `手牌&指令`，使用左右按鈕切換焦點，確認焦點牌切換、位於最上層，且選取狀態不因切換焦點而改變。

**Acceptance Scenarios**:

1. **Given** 玩家有至少兩張手牌，**When** 玩家點擊右側切換按鈕，**Then** 下一張手牌成為焦點牌，但不自動被選取。
2. **Given** 玩家有至少兩張手牌，**When** 玩家點擊左側切換按鈕，**Then** 上一張手牌成為焦點牌，但不自動被選取。
3. **Given** 玩家焦點位於第一張手牌，**When** 玩家點擊左側切換按鈕，**Then** 最後一張手牌成為焦點牌，且不自動被選取。
4. **Given** 玩家焦點位於最後一張手牌，**When** 玩家點擊右側切換按鈕，**Then** 第一張手牌成為焦點牌，且不自動被選取。
5. **Given** 任一手牌成為焦點牌，**When** 玩家查看手牌扇形，**Then** 焦點牌位於最上層且可被清楚點擊。
6. **Given** 某張手牌已被選取，**When** 玩家用左右按鈕切換到其他焦點牌，**Then** 原本的選取狀態維持不變。
7. **Given** 玩家使用鍵盤聚焦左右切換按鈕，**When** 玩家啟動按鈕，**Then** 焦點手牌依相同循環規則切換，且按鈕提供可辨識的 aria label。
8. **Given** 玩家手牌首次載入，**When** 手牌區顯示，**Then** 中間手牌成為初始焦點牌。
9. **Given** 玩家目前焦點牌仍存在於手牌中，**When** 手牌內容因抽牌、送出 action 或狀態同步而變動，**Then** 系統保留目前焦點牌。
10. **Given** 玩家目前焦點牌已不在手牌中，**When** 手牌內容更新，**Then** 系統聚焦最接近原位置的剩餘手牌。

---

### User Story 3 - 保留扇形手牌與選取行為 (Priority: P3)

玩家仍應透過既有扇形手牌檢視與點擊選取/取消選取卡牌。點擊某張手牌時，該牌也應成為焦點牌。被選取的手牌右上角應顯示 48px 綠色 check icon，並避免遮蔽卡牌關鍵資訊到無法辨識。

**Why this priority**: 008 已建立扇形手牌操作模型。015 應改善焦點與行動入口，而不是改掉玩家已習慣的選牌方式。

**Independent Test**: 在 `手牌&指令` 中點擊手牌選取與取消選取，確認選取狀態仍正確切換，且已選取牌右上角出現 48px 綠色 check icon。

**Acceptance Scenarios**:

1. **Given** 玩家點擊未選取的手牌，**When** 該手牌被加入選取，**Then** 該牌成為焦點牌，且右上角顯示 48px 綠色 check icon。
2. **Given** 玩家點擊已選取的手牌，**When** 該手牌被取消選取，**Then** 該牌成為焦點牌，且綠色 check icon 從該牌移除。
3. **Given** 多張手牌重疊呈扇形，**When** 玩家查看已選取手牌，**Then** check icon 不應遮蔽卡牌主要圖像、魅力值或關鍵文字到無法辨識。
4. **Given** 玩家使用任一 action 流程，**When** 系統檢查選牌數量，**Then** 選牌數量限制與 action validation 仍由既有流程處理。

---

### User Story 4 - 響應式與動態效果保留 (Priority: P4)

玩家在手機與桌機上都應能操作新的手牌焦點與底部 action controls。draw motion、hand motion cue 與 reduced-motion 行為應保持可用，且手牌區不造成水平溢出。

**Why this priority**: 015 觸及手牌區主要操作面，若手機尺寸、動畫或可達性退化，會直接影響遊戲可玩性。

**Independent Test**: 在手機寬度與桌機寬度各檢查一次 `手牌&指令`，確認底部 action controls 不換行、不水平溢出，手牌扇形可操作，抽牌/手牌動態提示仍可辨識。

**Acceptance Scenarios**:

1. **Given** 玩家在手機寬度展開 `手牌&指令`，**When** 查看底部 action controls，**Then** 四個 token 保持單列四等分且不造成水平捲動。
2. **Given** 玩家在桌機寬度展開 `手牌&指令`，**When** 查看手牌扇形與 action controls，**Then** 兩者都維持可操作且不互相遮蔽。
3. **Given** 系統觸發抽牌或手牌 motion cue，**When** 新手牌區布局顯示中，**Then** 既有動態提示仍可辨識。
4. **Given** 玩家偏好 reduced motion，**When** 使用手牌焦點切換或接收手牌動態提示，**Then** 系統保留 reduced-motion 友善呈現。

## Requirements

### Functional Requirements

- **FR-001**: The hand/actions section MUST place the four action tokens at the bottom of the section.
- **FR-002**: Bottom action tokens MUST occupy the full available section width and be divided into four equal columns.
- **FR-003**: Bottom action tokens MUST preserve existing disabled, used, and available states.
- **FR-003a**: Bottom action tokens MUST remain visible when the player cannot act, but all tokens MUST be disabled while preserving status cues.
- **FR-004**: Clicking an action token MUST use the existing action flow and MUST NOT change action payload meaning.
- **FR-005**: The feature MUST preserve existing server validation, action legality, turn order, scoring, and game rules.
- **FR-006**: The player hand MUST remain displayed as a fan layout.
- **FR-007**: The player hand fan MUST use adaptive width and MUST NOT become abnormally wider on SM-and-below viewports.
- **FR-008**: The hand fan MUST remain operable without causing whole-page horizontal overflow.
- **FR-009**: The hand/actions section MUST provide left and right hand-focus controls.
- **FR-009a**: Left and right hand-focus controls MUST be keyboard-focusable buttons and MUST provide clear aria labels.
- **FR-010**: Left and right controls MUST change the focused hand card only and MUST NOT automatically select or deselect a card; focus movement MUST wrap from first to last and last to first.
- **FR-011**: The focused hand card MUST be visually on top of other hand cards.
- **FR-011a**: The hand fan MUST focus the middle card on first load, preserve the current focused card when it remains in hand, and move focus to the closest remaining card when the focused card leaves the hand.
- **FR-012**: Clicking a hand card MUST preserve existing select/deselect behavior and MUST also make that card the focused hand card.
- **FR-013**: Selected hand cards MUST show a 48px green check icon at the top-right of the card.
- **FR-014**: The selected-card check icon MUST NOT obscure card-critical information so much that the card becomes unidentifiable.
- **FR-015**: Existing selection count limits and action validation MUST remain owned by the existing action flow.
- **FR-016**: Existing draw motion, hand motion cues, and reduced-motion behavior MUST remain usable.
- **FR-017**: The feature MUST NOT reveal opponent hand cards, secret cards, pending choices, or unrevealed selections.
- **FR-018**: The feature MUST NOT change information panel action status, character coverflow behavior, gift/competition modal behavior, Socket.IO events, server payloads, or shared type contracts.

### Non-Functional Requirements

- **NFR-001**: The hand/actions section MUST remain operable on common mobile and desktop viewport sizes.
- **NFR-002**: The bottom action control row MUST remain a single row without horizontal overflow in tested mobile and desktop widths.
- **NFR-003**: Hand focus changes SHOULD feel immediate and complete within 250ms in normal motion mode.
- **NFR-004**: Reduced-motion mode SHOULD avoid non-essential movement while preserving focus and selected-state clarity.
- **NFR-005**: UI visual validation remains user-owned; automated validation should cover build/test and obvious layout regressions.
- **NFR-006**: Hand focus controls SHOULD remain accessible to keyboard users and assistive technologies without requiring pointer-only interaction.

### Key Entities

- **Hand/Actions Section**: The active `手牌&指令` tab content containing player hand cards, focus controls, and action tokens.
- **Hand Focus Control**: A left or right control that changes which hand card is focused without changing selection state.
- **Focused Hand Card**: The hand card currently emphasized for viewing and clicking; it is visually above overlapping cards.
- **Selected Hand Card**: A hand card included in the current action selection; it displays a green check icon.
- **Bottom Action Control Row**: The full-width four-column row containing `密約`, `取捨`, `贈予`, and `競爭` action tokens.

## Success Criteria

- **SC-001**: In 100% of tested playable hand/action views, the four action tokens appear at the bottom as a single full-width four-column row.
- **SC-002**: In one mobile-width and one desktop-width validation pass, the action control row does not wrap and does not introduce horizontal page scrolling.
- **SC-003**: In validation games with at least two hand cards, left and right focus controls change the focused hand card, wrap at first/last boundaries, and do not change selected card count.
- **SC-004**: In 100% of tested focused-card changes, the focused hand card appears above neighboring overlapping cards.
- **SC-005**: In 100% of tested selected cards, a 48px green check icon appears at the top-right and the card remains identifiable.
- **SC-006**: During validation, existing `密約`, `取捨`, `贈予`, and `競爭` actions still submit through existing legality and validation behavior.
- **SC-007**: During validation, draw motion, hand motion cues, and reduced-motion presentation remain usable.
- **SC-008**: During validation, no opponent hidden card identity is revealed through the hand/actions section.
- **SC-009**: In keyboard validation, users can reach and trigger hand focus previous/next controls with Tab and Enter/Space, and controls expose clear aria labels.
- **SC-010**: In local interaction checks, hand focus transitions complete within approximately 250ms in normal motion mode.

## Assumptions

- 012, 013, and 014 are already integrated before this spec is implemented.
- Existing hand selection state can support a separate focused-card state without changing action payloads.
- The hand fan should remain the primary hand presentation; this spec improves focus and controls, not the card data model.
- UI visual review remains user-owned; implementation should still run automated tests/build and avoid obvious layout regressions.

## Out of Scope

- Changing action payloads, Socket.IO events, server validation, shared type contracts, action legality, scoring, turn order, or game rules.
- Redesigning the information panel action status from 013.
- Redesigning the character coverflow from 014.
- Redesigning gift, competition, order, ready, draw, or end-game blocking interactions.
- Adding new actions or new game modes.
- Revealing opponent hand cards, secret cards, or pending hidden selections.

## Implementation Notes

- 2026-05-03: 015 implementation completed for bottom four-column action controls, wrapping hand focus carousel, card-click focus+selection behavior, and selected-card 48px green check indicator.
- 2026-05-03: Automated verification completed with `CI=1 npm test -- --watchAll=false` and `npm run build`.
- 2026-05-03: Keyboard accessibility check target defined as Tab focus + Enter/Space activation for hand focus controls.
- 2026-05-03: NFR-003 validation target defined as approximately 250ms focus transition in normal motion mode.
- UI visual validation remains user-owned and should be confirmed manually in playable room views for mobile and desktop widths.
