# Feature Specification: Game Info Action Status Panel

**Feature Branch**: `013-game-info-action-status-panel`  
**Created**: 2026-05-03  
**Status**: Completed  
**Input**: User description: "013-game-info-action-status-panel"

## Clarifications

### Session 2026-05-03

- Q: 我方 `密約 / 取捨` 回看內容顯示位置？ → A: 在資訊區內、該玩家 action icon 下方展開回看卡牌。
- Q: 不可回看的 action icon 要怎麼互動？ → A: 只有我方已使用的 `密約` / `取捨` 可點擊，其他 action icon 僅顯示狀態且不可點擊。
- Q: 同時回看 `密約` 與 `取捨` 時的展開規則？ → A: 同一時間只展開一個回看區；點另一個可回看的 action 會切換內容。
- Q: `離開遊戲` 在資訊區的呈現方式？ → A: 狀態列左側是純資訊，右側是明確的 `離開遊戲` 按鈕。
- Q: 回看區在切換分頁後是否保留展開狀態？ → A: 保留目前展開的回看內容，回到 `資訊` 時仍顯示。

## User Scenarios & Testing

### User Story 1 - 集中顯示房間與回合資訊 (Priority: P1)

玩家展開 `資訊` 分頁後，應能在同一個資訊區上方看到自己的身份、目前回合狀態、當前玩家，以及離開遊戲入口，不需要再到畫面最上方或最下方尋找這些資訊。

**Why this priority**: 012 已將房間切換入口固定為 `資訊 / 角色 / 手牌&指令` 三個分頁。資訊分頁需要承接原本分散在畫面上下的房間狀態與離開操作，讓角色區與手牌區可以專注於對戰內容。

**Independent Test**: 進入 playable room，切到 `資訊` 分頁，確認玩家身份、回合狀態、當前玩家與離開遊戲都出現在資訊區，且離開遊戲仍使用既有確認流程。

**Acceptance Scenarios**:

1. **Given** 玩家位於 playable room，**When** 玩家切換到 `資訊` 分頁，**Then** 資訊區最上方顯示玩家身份與目前狀態，例如玩家名稱與 `你的回合` 或 `等待對手`。
2. **Given** 玩家正在查看資訊區，**When** 房間進入任一對戰回合，**Then** 資訊區顯示當前玩家名稱，且該資訊不提供出牌或切換回合互動。
3. **Given** 玩家正在查看資訊區，**When** 玩家選擇狀態列右側的 `離開遊戲` 按鈕，**Then** 系統使用既有離開確認流程，未確認前玩家仍留在目前房間。
4. **Given** 玩家切換到 `角色` 或 `手牌&指令` 分頁，**When** 資訊區不在 active 狀態，**Then** 資訊區內容不應在其他分頁重複佔用主要視覺空間。

---

### User Story 2 - 顯示雙方 action token 使用狀態 (Priority: P2)

玩家查看資訊區時，應能快速理解自己與對手四種行動是否已經用過，包括 `密約`、`取捨`、`贈予`、`競爭`。已用過的 action icon 應明顯區分，未用過的 action icon 應保持可辨識。

**Why this priority**: 行動 token 使用狀態是判斷局勢的重要資訊。將雙方 action 狀態集中在資訊區可以減少玩家來回切換手牌區或記憶對手已行動項目的成本。

**Independent Test**: 在一局遊戲中讓雙方各執行至少一個 action，切到 `資訊` 分頁，確認雙方 action icon 狀態正確反映已使用與未使用。

**Acceptance Scenarios**:

1. **Given** 對戰正在進行，**When** 玩家查看資訊區，**Then** 我方與對手各自顯示四個 action icon：`密約`、`取捨`、`贈予`、`競爭`。
2. **Given** 某個 action 尚未使用，**When** 玩家查看該 action icon，**Then** icon 以未使用狀態呈現且仍可清楚辨識 action 類型。
3. **Given** 某個 action 已經使用，**When** 玩家查看該 action icon，**Then** icon 以已使用狀態呈現，且與未使用狀態有明顯視覺差異。
4. **Given** 對手已使用任一 action，**When** 玩家查看對手 action icon，**Then** 資訊區只顯示該 action 是否已使用，不顯示對手手牌、密約牌或未公開選擇。

---

### User Story 3 - 回看我方已執行的密約與取捨 (Priority: P3)

玩家已經執行過 `密約` 或 `取捨` 後，應能在資訊區回看自己當時選擇的卡牌，方便確認策略與後續判斷。這個回看只適用於我方已公開給自己的選擇，不應揭露對手隱藏資訊。

**Why this priority**: `密約` 與 `取捨` 會把卡牌從手牌移到其他區域。玩家需要能重新確認自己已藏或已棄的卡，否則資訊區只顯示 action 已使用仍不足以支援決策。

**Independent Test**: 我方完成一次 `密約` 與一次 `取捨` 後，切到 `資訊` 分頁並選擇對應已使用 action icon，確認能看到自己選過的卡牌；對手同類 icon 不可揭露卡牌內容。

**Acceptance Scenarios**:

1. **Given** 我方尚未使用 `密約`，**When** 玩家查看我方 `密約` icon，**Then** 該 icon 不提供卡牌回看內容。
2. **Given** 我方已使用 `密約`，**When** 玩家選擇我方 `密約` icon，**Then** 資訊區在我方 action icon 下方展開並顯示我方本局執行密約時選擇的 1 張卡。
3. **Given** 我方已使用 `取捨`，**When** 玩家選擇我方 `取捨` icon，**Then** 資訊區在我方 action icon 下方展開並顯示我方本局執行取捨時選擇的 2 張卡。
4. **Given** 對手已使用 `密約` 或 `取捨`，**When** 玩家選擇或查看對手對應 icon，**Then** 資訊區不顯示對手選擇的卡牌內容。
5. **Given** 玩家已展開一個我方 action 回看區，**When** 玩家選擇另一個可回看的我方 action icon，**Then** 資訊區切換為新的回看內容，且同一時間只保留一個回看區展開。
6. **Given** 玩家查看任一不可回看的 action icon，**When** 玩家嘗試點擊或操作該 icon，**Then** icon 不開啟回看內容、不顯示空狀態提示、不送出任何 action。
7. **Given** 玩家正在查看我方已使用 action 的卡牌回看，**When** 玩家切換到其他分頁再回到資訊分頁，**Then** 資訊區保留目前展開的回看內容，不重置遊戲流程、不送出任何 action。

## Requirements

### Functional Requirements

- **FR-001**: The information section MUST include the local player's display identity and current turn status when the `資訊` tab is active.
- **FR-002**: The local player identity display MUST include the player's visible name and, when available, the existing avatar presentation.
- **FR-003**: The information section MUST include a full-width two-part status row where the left side shows `當前玩家: {name}` and the right side contains a clearly identifiable `離開遊戲` button.
- **FR-004**: The `當前玩家` side of the status row MUST be informational only, MUST NOT be clickable, and MUST NOT submit gameplay actions or change room state.
- **FR-005**: The `離開遊戲` button in the status row MUST preserve the existing leave-game confirmation behavior.
- **FR-006**: The previous bottom-positioned `離開遊戲` control MUST no longer appear as a separate primary control outside the information section during normal playable room display.
- **FR-007**: Each player summary inside the information section MUST show exactly four action status icons: `密約`, `取捨`, `贈予`, and `競爭`.
- **FR-008**: Each action status icon MUST clearly communicate whether that action has already been used by its player.
- **FR-009**: Used action icons MUST be visually distinct from unused action icons.
- **FR-010**: The local player's used `密約` icon MUST be selectable and reveal the card selected for that local player's secret action in an inline replay area below that player's action icons.
- **FR-011**: The local player's used `取捨` icon MUST be selectable and reveal the two cards selected for that local player's trade-off action in an inline replay area below that player's action icons.
- **FR-012**: The local player's unused `密約` and `取捨` icons MUST NOT show card reveal content.
- **FR-013**: The local player's `贈予` and `競爭` icons are status-only in this feature.
- **FR-013a**: Only the local player's used `密約` and used `取捨` icons MUST be selectable for replay; all other action icons MUST be status-only and MUST NOT open empty replay content.
- **FR-013b**: The information panel MUST show at most one local action replay area at a time; selecting another eligible replay icon MUST replace the current replay content.
- **FR-013c**: When the player switches away from `資訊` and later returns, the information panel MUST preserve the currently expanded local action replay content.
- **FR-014**: Opponent action icons MUST NOT reveal opponent hand cards, secret cards, discarded selections, unresolved choices, or any card identity not already visible to the local player.
- **FR-015**: Action status display MUST reflect the current room state after ordinary game updates, round transitions, and blocking interactions.
- **FR-016**: The feature MUST preserve existing game rules, turn order, scoring, action legality, rematch behavior, hidden-information boundaries, and section tab behavior.
- **FR-017**: The feature MUST NOT add new gameplay commands, change action payload meaning, or create a new way to submit actions from the information panel.
- **FR-018**: Card replay content for local `密約` and `取捨` MUST remain readable on common mobile and desktop viewport sizes.
- **FR-019**: The information panel MUST remain usable when blocking interactions such as gift, competition, order confirmation, ready checks, draw display, or end-game flows are present.

### Non-Functional Requirements

- **NFR-001**: The information panel MUST preserve mobile-first playability without introducing horizontal page scrolling in tested mobile and desktop viewports.
- **NFR-002**: Action status and replay content MUST be visually understandable without requiring players to inspect raw card identifiers.
- **NFR-003**: The panel MUST avoid exposing hidden information through labels, thumbnails, alt text, tooltips, summaries, or selected action state.
- **NFR-004**: The `離開遊戲` interaction MUST remain deliberate and must not be triggered by accidental status-row navigation.
- **NFR-005**: The feature MUST keep modal and bottom-sheet interactions visually and interactively above the information panel.

### Key Entities

- **Information Panel**: The active content of the `資訊` tab that consolidates player identity, turn status, current-player status, leave-game control, player summaries, and action status.
- **Action Status Icon**: A visual indicator for one of the four Hanamikoji action tokens, including used/unused state and optional local replay behavior for eligible actions.
- **Local Action Replay**: The local player's view-only display of cards previously selected for `密約` or `取捨`.
- **Player Summary**: The information panel row or card representing one player, including public player identity, current score/status, and action token state.

## Success Criteria

- **SC-001**: In 100% of tested playable room views, opening `資訊` shows local player identity, current turn status, current player, and leave-game control within the information section.
- **SC-002**: In 100% of tested playable room views, the standalone bottom `離開遊戲` control is no longer the primary leave-game entry point.
- **SC-003**: In validation games where actions have been used, both players show four action icons and used icons are distinguishable from unused icons without reading hidden card data.
- **SC-004**: After local `密約` is used, the player can reveal and identify the 1 card they selected from the information panel.
- **SC-005**: After local `取捨` is used, the player can reveal and identify the 2 cards they selected from the information panel.
- **SC-006**: During validation, opponent used `密約` or `取捨` never reveals opponent card identity through the information panel.
- **SC-007**: In one mobile-width and one desktop-width validation pass, the information panel remains readable and does not introduce horizontal page scrolling.

## Assumptions

- 012 `game-room-section-tabs` is already complete, and this feature modifies the content shown when `資訊` is active.
- Existing game state already contains enough local information to display the local player's used `密約` and `取捨` card choices.
- UI visual review remains user-owned; automated validation should cover build/test and obvious hidden-information or layout regressions.
- Action status icons can reuse the existing action vocabulary and public used/unused token state.
- Card replay presentation can use an existing readable card display pattern; the exact visual treatment can be refined during clarification or planning.

## Out of Scope

- Moving or redesigning action token controls in the `手牌&指令` section.
- Changing action payloads, Socket.IO event names, server validation, shared types, or persistence contracts.
- Revealing opponent action card choices, opponent hand cards, or opponent secret cards.
- Redesigning character cards, coverflow behavior, item icon placement, or hand fan controls.
- Redesigning gift / competition pending interaction modals.
- Adding new actions, new game modes, new scoring rules, or release/versioning work.

## Implementation Notes

- 2026-05-03: 將 playable room 的身份與回合狀態移入 `資訊` 分頁，並新增「左側當前玩家資訊 + 右側離開遊戲按鈕」狀態列。
- 2026-05-03: 移除內容區底部獨立 `離開遊戲` 主要按鈕，改以資訊分頁狀態列右側按鈕承接既有離開確認流程。
- 2026-05-03: 新增雙方四個 action status icons（`密約`、`取捨`、`贈予`、`競爭`）的 used/unused 顯示，且僅我方已使用 `密約/取捨` 可開啟回看。
- 2026-05-03: 新增資訊分頁 inline replay（同時僅展開一個回看區），並保留跨分頁切換後的回看展開狀態。
- 2026-05-03: 封鎖對手隱藏資訊路徑，對手 action icons 只顯示狀態，不揭露對手卡牌內容。

## Validation Record

- 2026-05-03: `CI=1 npm test -- --watchAll=false`（pass）
- 2026-05-03: `npm run build`（pass）
