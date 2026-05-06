# Feature Specification: Character Card Visual Refinement

**Feature Branch**: `014-character-card-visual-refinement`  
**Created**: 2026-05-03  
**Status**: Completed  
**Input**: User description: "014-character-card-visual-refinement"

## Clarifications

### Session 2026-05-03

- Q: 當角色卡完整可見性與 011 單一 viewport layout 衝突時，優先順序為何？ → A: 優先維持單一 viewport layout；角色卡在現有角色區高度內盡量改善完整可見性。
- Q: 角色卡完整性改善要套用到哪些 coverflow 卡片？ → A: 只要求焦點卡完整性明顯改善；非焦點卡維持 coverflow 深度、重疊與側邊露出優先。
- Q: item icon 常駐顯示要怎麼處理資料來源邊界？ → A: 僅使用現有前端可見資料；若不足就停止並回報，不在 014 直接改資料契約。
- Q: 焦點角色卡的圖片顯示策略要怎麼取捨？ → A: 焦點卡圖片優先完整顯示；必要時允許留白或背景填補。
- Q: 014 要移除的「四個指令 icon」精確範圍是哪一個？ → A: 只移除角色分頁/角色 coverflow 上方的四個指令 icon。

## User Scenarios & Testing

### User Story 1 - 提高角色卡主體可見性 (Priority: P1)

玩家展開 `角色` 分頁時，應能在既有單一 viewport layout 內更完整地看見焦點角色卡與人物主體，不會因卡片容器或裁切策略讓主要人物內容被明顯遮蔽。非焦點卡仍以 coverflow 深度、重疊與側邊露出效果為優先，並維持目前的 coverflow 操作體驗與單一主要視窗布局。

**Why this priority**: 角色卡是遊戲房間的主要觀察區。若人物主體被裁切或資訊遮罩過大，玩家需要辨識角色、掌控狀態與位置資訊時會受到干擾。

**Independent Test**: 進入 playable room 並切到 `角色` 分頁，檢查焦點角色卡能更完整辨識主要人物內容，非焦點卡仍維持 coverflow 深度與側邊露出，且不造成整頁水平跑版或破壞既有 coverflow 切換。

**Acceptance Scenarios**:

1. **Given** 玩家位於 playable room，**When** 玩家切到 `角色` 分頁，**Then** 焦點角色卡應顯示更完整的人物主體，避免主要臉部或上半身被不必要裁切。
2. **Given** 玩家使用左右按鈕或手動滑動 coverflow，**When** 焦點角色切換，**Then** 新焦點卡仍維持角色卡全貌可見性改善，非焦點卡仍維持重疊深度與側邊露出，且首尾循環照常運作。
3. **Given** 焦點角色卡圖片比例與卡框不完全一致，**When** 系統顯示焦點卡圖片，**Then** 圖片應優先完整顯示，必要時可使用留白或背景填補，不應為了填滿卡框而重新裁切主要人物。
4. **Given** 玩家在手機或桌機視窗查看角色分頁， **When** 角色卡重新排版，**Then** 畫面不應產生整頁水平捲動，且 `資訊 / 角色 / 手牌&指令` 主要區塊布局仍可使用。

---

### User Story 2 - 精簡角色卡資訊遮罩 (Priority: P2)

玩家查看角色卡時，左上角角色名稱與深色斜角資訊區應更精簡，保留必要角色辨識但減少對圖片的遮蔽。原本的 `魅力 {數值}` 文字 badge 應移除，讓魅力值與位置道具 icon 統一呈現。

**Why this priority**: 角色卡資訊目前佔用視覺空間較多，會和人物圖片競爭注意力。精簡遮罩能提升卡面質感，也讓後續 item icon 與魅力數字更一致。

**Independent Test**: 在 `角色` 分頁檢查每張角色卡，確認角色名稱為 16px 粗體，左上斜角深色區塊變短，且不再看到 `魅力 {數值}` 文字 badge。

**Acceptance Scenarios**:

1. **Given** 任一角色卡顯示於角色分頁，**When** 玩家查看卡片左上角，**Then** 角色名稱以 16px 粗體呈現。
2. **Given** 任一角色卡顯示於角色分頁，**When** 玩家查看左上角深色斜角資訊區，**Then** 該區塊上方寬度應比目前縮短約 40%，減少圖片遮蔽。
3. **Given** 任一角色卡顯示於角色分頁，**When** 玩家查看魅力資訊，**Then** 不應再看到 `魅力 {數值}` 文字 badge。

---

### User Story 3 - 常駐顯示位置道具與魅力數字 (Priority: P3)

玩家查看角色分頁時，每個場上位置都應穩定顯示對應 item icon，不應因玩家目前是否持有該位置道具而消失。魅力值應改為 item icon 右上角的紅底白字圓形數字 badge。

**Why this priority**: 目前 Ginza 資料中，魅力值與道具 icon 都跟場上位置綁定，而不是跟角色本身或玩家持有狀態綁定。常駐位置 icon 能讓玩家更快理解每個位置對應的道具與魅力。

**Independent Test**: 在新局、行動中、回合結束後與延續局中查看角色分頁，確認七個位置都持續顯示對應 item icon 與魅力數字，且玩家持有狀態變化不會讓位置 icon 消失。

**Acceptance Scenarios**:

1. **Given** playable room 剛開始顯示角色分頁，**When** 玩家查看七個場上位置，**Then** 每個位置都顯示對應 item icon。
2. **Given** 任一玩家尚未持有某位置的 item card，**When** 玩家查看該角色卡，**Then** 該位置仍顯示 item icon。
3. **Given** 任一角色卡顯示 item icon，**When** 玩家查看 icon，**Then** icon 尺寸為 48px，且不顯示邊框或底色。
4. **Given** 任一角色卡顯示魅力值，**When** 玩家查看 item icon 右上角，**Then** 魅力值以紅底白字圓形數字 badge 呈現。

---

### User Story 4 - 移除角色區多餘指令圖示 (Priority: P4)

玩家查看角色分頁時，角色 coverflow 上方不應再顯示原本四個對手指令 icon，避免和資訊區 action status 或手牌區操作入口重複。

**Why this priority**: 013 已將 action status 集中到資訊區，015 將處理手牌區 action controls。角色分頁應專注於角色、位置道具與掌控狀態。

**Independent Test**: 展開 `角色` 分頁後，確認角色 coverflow 上方不再顯示四個指令 icon，且不影響資訊區與手牌區的既有 action 顯示或操作。

**Acceptance Scenarios**:

1. **Given** 玩家展開 `角色` 分頁，**When** 玩家查看角色 coverflow 上方區域，**Then** 不應看到原本四個對手指令 icon。
2. **Given** 角色區上方指令 icon 被移除，**When** 玩家切到 `資訊` 或 `手牌&指令`，**Then** 對應區塊既有 action status 或 action controls 仍依原本規則顯示。

## Requirements

### Functional Requirements

- **FR-001**: The character section MUST improve focused character card image visibility within the existing single viewport layout so the main character subject is less likely to be visibly cropped or hidden.
- **FR-001a**: Focused character card imagery MUST prioritize full image visibility; when the image ratio does not fill the card frame, the display MAY use intentional empty space or background fill instead of cropping the main subject.
- **FR-002**: The character card image and container behavior MUST preserve the existing playable room section layout without introducing whole-page horizontal scrolling.
- **FR-003**: The feature MUST preserve existing coverflow behavior, including left/right button navigation, manual drag or swipe, first-to-last and last-to-first looping, and partial overlap visibility for non-focused cards.
- **FR-003a**: Non-focused cards MUST prioritize coverflow depth, overlap, and side-card visibility over full image completeness.
- **FR-004**: Character card name text MUST render at 16px and use bold weight.
- **FR-005**: The top-left dark diagonal information area MUST be visually shortened from the right side by approximately 40% compared with the current treatment.
- **FR-006**: The previous `魅力 {value}` text badge MUST be removed from character cards.
- **FR-007**: Each field position MUST display its associated item icon whenever the character section is visible.
- **FR-008**: Position item icon visibility MUST NOT depend on whether either player currently owns the corresponding item card.
- **FR-008a**: Always-visible position item icons MUST be derived only from existing frontend-visible data; if that data is insufficient, implementation MUST stop and report the missing contract rather than changing server payloads or shared types in this feature.
- **FR-009**: Position item icons MUST be displayed at 48px.
- **FR-010**: Position item icons MUST NOT show an added border or background fill.
- **FR-011**: The charm value MUST appear as a number-only badge at the top-right of the associated item icon.
- **FR-012**: The charm value badge MUST be circular with a red background and white text.
- **FR-013**: The character section MUST remove only the previous top-row four command/action icons above the character coverflow.
- **FR-013a**: Removing the character-section command icons MUST NOT remove or alter the information panel action status icons or the hand/actions section controls.
- **FR-014**: Existing control-border rules MUST be preserved: ownership border color only appears for characters already controlled from a continued unresolved match state, and MUST NOT be added or changed mid-round merely because temporary control conditions are met.
- **FR-015**: The feature MUST preserve existing game rules, scoring, action legality, turn order, random character selection, item card generation, rematch behavior, hidden-information boundaries, and section tab behavior.
- **FR-016**: The feature MUST NOT expose opponent hand cards, secret cards, pending choices, or unrevealed selections through character card labels, icons, alt text, tooltips, or summaries.

### Non-Functional Requirements

- **NFR-001**: The character section MUST remain readable and operable on common mobile and desktop viewport sizes.
- **NFR-002**: Visual changes MUST support user-owned manual UI review while automated validation covers build/test and obvious layout regressions.
- **NFR-003**: The visual hierarchy MUST prioritize character artwork, then position item icon and charm number, then secondary state indicators.
- **NFR-004**: The feature MUST avoid adding new persistent data, new gameplay commands, new server-visible state, or shared type changes.
- **NFR-005**: Blocking overlays and modal/bottom-sheet interactions MUST remain visually and interactively above the character section.

### Key Entities

- **Character Card**: The visible card for one field position, including artwork, character name, item icon, charm number, and control border state.
- **Position Item Icon**: The icon associated with a fixed field position and charm value, independent of which randomized character occupies that position and independent of current item ownership.
- **Charm Number Badge**: A number-only badge shown on the position item icon to communicate the charm value for that field position.
- **Character Section**: The `角色` tab content containing the coverflow and character card interaction surface.

## Success Criteria

- **SC-001**: In 100% of tested playable room views, opening `角色` shows character cards without obvious whole-page horizontal overflow.
- **SC-002**: In one mobile-width and one desktop-width validation pass, the focused character card shows the main character subject more completely than before this feature while preserving the single viewport layout.
- **SC-003**: In 100% of tested character cards, the role name appears as 16px bold text.
- **SC-004**: In 100% of tested character cards, the old `魅力 {value}` text badge is absent.
- **SC-005**: In 100% of tested field positions, an item icon is visible even when neither player currently owns that position's item card.
- **SC-006**: In 100% of tested field positions, the charm value appears as a red circular number badge on the item icon.
- **SC-007**: During validation, coverflow left/right navigation, manual swipe/drag, looping, and partial side-card visibility continue to work.
- **SC-008**: During validation, no opponent hidden card identity is revealed through the character section.

## Implementation Notes

- 2026-05-03: `GameBoard` 已移除角色 coverflow 上方四個對手指令 icon，並保留資訊區 action status 與手牌區 controls。
- 2026-05-03: 角色區 item icon 改為位置綁定映射，不再透過目前已知卡牌/持有狀態推導，符合「未持有也要顯示」規則。
- 2026-05-03: 焦點卡圖片改為優先完整顯示（必要時保留留白/背景填補）；非焦點卡維持 coverflow 重疊深度與側邊露出。
- 2026-05-03: 角色卡左上遮罩縮短、名稱調整為 16px 粗體，移除舊 `魅力 {數值}` 文字 badge。
- 2026-05-03: item icon 調整為 48px 並移除邊框/底色，魅力值改為 icon 右上紅底白字圓形數字 badge。

## Validation Record

- 2026-05-03: `CI=1 npm test -- --watchAll=false`（pass，含既有 React Router / act deprecation warnings）
- 2026-05-03: `npm run build`（pass）
- 2026-05-03: Hidden-info focused check（對手存在未公開互動時，角色區不顯示對手手牌/密約/未公開選擇；pass）
- 2026-05-03: Manual UI visual validation（user-owned，待使用者最終確認）

## Assumptions

- 012 and 013 are already integrated before this spec is implemented.
- The current frontend-visible game data is expected to provide enough position-level item icon and charm information to render always-visible item icons. If planning proves this expectation wrong, 014 should stop for contract clarification instead of expanding its data-change scope.
- If full character image visibility conflicts with the 011 single viewport layout, this spec prioritizes the single viewport layout and improves visibility within the existing character section height.
- UI visual review remains user-owned; implementation should still run automated tests/build and avoid obvious layout regressions.
- Existing coverflow behavior is considered correct and should be preserved, not redesigned.

## Out of Scope

- Adding or changing character data.
- Changing random character selection, position assignment, item card generation, scoring, or match continuation rules.
- Changing hand/action controls, action payloads, Socket.IO events, server validation, server payloads, or shared type contracts.
- Redesigning the information panel action status from 013.
- Redesigning gift, competition, order, ready, draw, or end-game blocking interactions.
- Implementing the 015 hand/action controls carousel.
