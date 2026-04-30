# Feature Specification: Remote Character Card UI

**Feature Branch**: `002-remote-character-card-ui`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User wants character artwork to use URL links instead of project-local images, keep game logic unchanged, display character artwork in a fixed 9:16 ratio, add CSS card-frame styling, and place character name, score, and item information on the frame.

## Clarifications

### Session 2026-04-30

- Q: 人物圖片 URL 應該放在哪裡，作為後續 plan/data model 的基準？ → A: 由 server/game data 來源提供圖片 URL，作為顯示資料，不參與遊戲規則判定。
- Q: 卡牌邊框上的物品資訊要顯示到什麼程度？ → A: 先顯示物品歸屬/數量摘要，不重做道具圖示；後續可在 item-icon spec 調整。
- Q: 當遠端人物圖片不是 9:16 時，卡牌應該怎麼顯示？ → A: 預期素材為 9:16；非 9:16 圖片以置中裁切填滿 9:16 卡面。

## User Scenarios & Testing

### User Story 1 - View URL-backed Character Cards (Priority: P1)

As a player, I want each character card to show artwork loaded from a URL, so that character visuals can be updated without bundling image files into the project.

**Why this priority**: This is the core asset-source change. The rest of the visual redesign depends on character cards having a stable remote-image display model.

**Independent Test**: Start or view a game using each available character set and confirm every character card displays remote artwork or a clear fallback without changing turn flow, card ownership, scoring, or action availability.

**Acceptance Scenarios**:

1. **Given** a character has a valid artwork URL from server-provided game data, **When** the character appears on the board, **Then** the card displays that URL-backed artwork.
2. **Given** a character artwork URL fails to load, **When** the character appears on the board, **Then** the card remains playable and shows a fallback state that still identifies the character.
3. **Given** the player performs any existing action, **When** character artwork is loaded from URLs, **Then** game state, scoring, and action validation behave the same as before this feature.
4. **Given** frontend and server currently both define character display data, **When** this feature is complete, **Then** character artwork display uses server-provided game data as the source of truth.

---

### User Story 2 - Preserve 9:16 Card Presentation (Priority: P2)

As a player, I want character cards to share a consistent 9:16 visual ratio, so that the board feels like a coherent card game layout across screen sizes.

**Why this priority**: The new remote artwork needs a predictable container before frame details and information placement can be reliable.

**Independent Test**: View the board on mobile and desktop widths and confirm character artwork remains visually framed in a 9:16 card area without stretching or breaking the board layout.

**Acceptance Scenarios**:

1. **Given** the board is shown on a narrow mobile screen, **When** character cards render, **Then** each character card keeps a 9:16 image area and remains usable.
2. **Given** the board is shown on a wider desktop screen, **When** character cards render, **Then** cards keep a consistent ratio and do not distort character artwork.
3. **Given** a remote image has a different original size, **When** it is displayed as card artwork, **Then** the image is center-cropped to fill the 9:16 card frame.

---

### User Story 3 - Read Card Frame Information (Priority: P3)

As a player, I want the character name, charm score, and related item information to appear on the card frame, so that I can understand the board state without relying only on image content.

**Why this priority**: Moving visual information into a deliberate frame improves clarity and prepares the board for later item-icon and motion work.

**Independent Test**: During an active game, inspect each character card and confirm name, score, and item ownership/count information are readable while existing card ownership indicators still reflect the correct player state.

**Acceptance Scenarios**:

1. **Given** a character has a name and charm score, **When** the card renders, **Then** both values appear on the card frame or frame information area.
2. **Given** item cards are assigned to either player for a character, **When** the board updates, **Then** the card frame communicates item ownership and count summary without altering ownership logic.
3. **Given** the board has multiple characters with different ownership states, **When** a player reviews the board, **Then** frame information remains readable and distinguishable.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST support character artwork defined as URL values rather than requiring bundled project-local image files.
- **FR-002**: The system MUST preserve all existing gameplay rules, scoring, turn order, action validation, hidden-information boundaries, and server-authoritative state behavior.
- **FR-003**: The system MUST display character artwork inside a consistent 9:16 card area.
- **FR-004**: The system MUST show a user-readable fallback when a character artwork URL is missing or fails to load.
- **FR-005**: The system MUST show character name and charm score on the card frame or frame information area.
- **FR-006**: The system MUST show item-related board information on or near the character card frame without changing item ownership rules.
- **FR-007**: The system MUST keep character cards usable and readable on mobile and desktop layouts.
- **FR-008**: The system MUST keep existing character set selection behavior functionally equivalent after artwork source changes.
- **FR-009**: The system MUST source character artwork URLs from server-provided game data or a server-owned character data source.
- **FR-010**: The system MUST treat character artwork URLs as display-only data that does not affect scoring, ownership, turn flow, action validation, or win conditions.
- **FR-011**: The system MUST remove frontend character artwork data duplication as the primary display source, keeping any frontend copy only as a documented fallback if needed.
- **FR-012**: The system MUST limit item information in this feature to ownership and count summary, leaving item icon redesign to a separate feature.
- **FR-013**: The system MUST center-crop non-9:16 character artwork to fill the 9:16 card frame.

### Non-Functional Requirements

- **NFR-001**: The feature MUST avoid changes to server game logic except to provide display-only character artwork URL data.
- **NFR-002**: The feature MUST avoid changing Socket.IO event contracts unless explicitly documented in a later plan.
- **NFR-003**: Broken or slow remote artwork MUST NOT block gameplay actions.
- **NFR-004**: The visual design MUST remain readable when images are still loading or unavailable.
- **NFR-005**: The feature MUST remain compatible with the existing mobile-first gameplay layout.

### Key Entities

- **Character Artwork URL**: A URL value provided by server-owned game data and used to display a character's main portrait artwork.
- **Server Character Display Data**: Server-owned character display data that includes artwork URLs without changing gameplay rule fields.
- **Character Card Frame**: The visible card container that holds artwork, character name, charm score, and related item information.
- **Fallback Character State**: The user-readable state shown when artwork is missing, loading, or failed.
- **Frame Information**: Non-rule-changing display information placed on the card frame, including name, charm score, and item ownership/count summary.

## Success Criteria

- **SC-001**: 100% of board character cards can be rendered from URL-backed artwork or a readable fallback state.
- **SC-002**: 100% of character cards preserve a 9:16 artwork presentation on both mobile and desktop review.
- **SC-003**: Players can identify each character's name and charm score from the card frame without opening another view.
- **SC-004**: Existing automated tests still pass after the visual asset change.
- **SC-005**: A production build completes successfully after the visual asset change.

## Assumptions

- Remote artwork URLs will be static public URLs provided through server-owned character display data.
- Character artwork assets are expected to be prepared in a 9:16 ratio before use.
- The first implementation should use existing server-side character data structures where possible and reduce frontend duplicate artwork mappings to avoid drift.
- A simple readable fallback using character name and charm score is acceptable when artwork fails.
- Later item-icon replacement and Motion animation work will be handled by separate specs.

## Out of Scope

- Changing Hanamikoji game rules, scoring, turn order, action availability, or server-side validation.
- Replacing item images with icons.
- Adding Motion or animation effects.
- Creating a new artwork upload or asset-management backend.
- Changing multiplayer networking behavior beyond display-data compatibility if required by the implementation plan.
