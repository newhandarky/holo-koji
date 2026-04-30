# Feature Specification: Icon Item Cards

**Feature Branch**: `003-icon-item-cards`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User description: "003-icon-item-cards"

## Clarifications

### Session 2026-04-30

- Q: 這次 `003-icon-item-cards` 要涵蓋哪些 item 顯示區域？ → A: 先聚焦新道具 icon 與角色卡上的對應顯示，不做全面 item card 畫面替換；其他區域後續再擴充。
- Q: 這次 `003` 應該用什麼作為 item icon 的對應基準？ → A: 依既有 item 類型或 item 識別值做 icon mapping，不新增規則欄位。
- Q: 在角色卡上，這次 item icon 要顯示到什麼程度？ → A: 做成明顯的 icon 區塊，直接成為角色卡資訊框的一部分。
- Q: `003` 第一版的 icon 素材策略要怎麼定？ → A: 先用可替換的通用 icon 或簡單自製 SVG，先把 mapping 與角色卡 icon 區塊做好。

## User Scenarios & Testing

### User Story 1 - Read Item-to-Character Icon Mapping (Priority: P1)

As a player, I want new items to be represented by icons on the related character card, so that I can quickly understand which item belongs to which character without relying on full item artwork.

**Why this priority**: The immediate user goal is to show new item meanings on character cards. Broader item-surface migration can be added later after the character-card mapping works.

**Independent Test**: Start or inspect a game state that includes the new items and confirm each affected character card shows the correct icon mapping without changing gameplay actions, ownership, scoring, or turn flow.

**Acceptance Scenarios**:

1. **Given** a character is associated with a supported new item, **When** the board renders that character card, **Then** the card shows the mapped icon for that item.
2. **Given** a player reviews the board state, **When** character cards are visible, **Then** the player can distinguish supported item-to-character relationships from an explicit icon area on the card plus labels or equivalent cues.
3. **Given** a player performs any existing action involving item ownership or scoring, **When** item icons are shown on character cards, **Then** the action flow, item ownership, scoring, and rule validation behave the same as before this feature.

---

### User Story 2 - Use a Consistent Item Icon System (Priority: P2)

As a player, I want item visuals to follow a consistent icon language, so that different item areas feel like part of the same game system instead of a mix of unrelated assets.

**Why this priority**: After item images are removed, consistency is what keeps the UI understandable across hands, pending actions, selections, and board summaries.

**Independent Test**: Inspect supported character-card icon placements and confirm icons follow a shared visual rule set for size, framing, labeling, and state cues inside a deliberate card information area.

**Acceptance Scenarios**:

1. **Given** the same supported item type appears on multiple character cards or states, **When** it is shown, **Then** the same icon identity is preserved.
2. **Given** a supported item icon is shown in owned or summary contexts, **When** the player sees it, **Then** icon styling remains consistent while existing state cues still differentiate context.
3. **Given** the game is viewed on mobile and desktop layouts, **When** supported item icons render on character cards, **Then** the icon area remains readable without breaking existing gameplay layouts.

---

### User Story 3 - Prepare Icons for Future Customization (Priority: P3)

As a maintainer, I want supported item icons to come from a centralized mapping or reusable icon source, so that future custom icon updates do not require reworking gameplay logic or every character-card surface independently.

**Why this priority**: The user explicitly wants the icon system to be customizable later. A centralized source prevents icon changes from turning into scattered UI maintenance.

**Independent Test**: Review the configured item icon source and confirm each supported item type is mapped through a centralized icon definition that can be updated without changing item rules or network contracts.

**Acceptance Scenarios**:

1. **Given** a supported item type needs a visual update in the future, **When** its icon source is changed in the centralized mapping, **Then** all supported character-card placements pick up the new icon identity without gameplay logic changes.
2. **Given** some items do not yet have bespoke custom icons, **When** the feature is delivered, **Then** the icon system still supports a clean default icon set with room for later replacement.
3. **Given** gameplay data syncs between server and client, **When** the icon system is in use, **Then** item icon rendering relies on existing item types or item identifiers rather than new rule-bearing fields.
4. **Given** the first version does not yet use final bespoke icon artwork, **When** the feature is delivered, **Then** a replaceable default icon set or simple custom SVG set still communicates supported item meaning clearly.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST support icon-based visuals for the new item types covered by this feature.
- **FR-002**: The system MUST preserve all existing gameplay rules, item ownership logic, scoring, turn order, pending interactions, hidden-information boundaries, and server-authoritative state behavior.
- **FR-003**: The system MUST allow players to distinguish supported item types using icon-based visuals and readable labels or equivalent supporting cues.
- **FR-004**: The system MUST use a centralized item-icon mapping or reusable icon source rather than scattered one-off icon definitions.
- **FR-005**: The system MUST keep the same supported item type visually consistent across character-card placements covered by this feature.
- **FR-006**: The system MUST keep item-related character-card UI readable on mobile and desktop layouts.
- **FR-012**: The system MUST present supported item icons inside an explicit character-card information area rather than as a barely visible decorative marker.
- **FR-007**: The system MUST continue using existing gameplay identifiers and flows for item rendering unless a later plan explicitly documents a contract change.
- **FR-011**: The system MUST derive supported item icons from existing item types or item identifiers rather than adding new rule-bearing gameplay fields.
- **FR-008**: The system MUST support a default icon set that can be replaced or extended with more customized icons later.
- **FR-009**: The system MUST keep item state cues such as ownership, summary status, or availability understandable after adding icons to character cards.
- **FR-010**: The system MUST limit this feature to supported new item icons and related character-card readability improvements, leaving broader item-card replacement, Motion animation, and character-card artwork work to separate features.
- **FR-013**: The system MUST allow the first delivered icon set to be replaced later without requiring gameplay logic changes.

### Non-Functional Requirements

- **NFR-001**: The feature MUST avoid changes to game rules and server validation beyond what is necessary to keep display behavior aligned.
- **NFR-002**: The feature MUST avoid introducing new Socket.IO events or rule-bearing payload fields unless explicitly documented in a later plan.
- **NFR-003**: The icon system MUST remain maintainable enough that future icon replacement can happen from a centralized definition.
- **NFR-004**: The icon-based presentation MUST remain readable without relying on color alone.
- **NFR-005**: The feature MUST remain compatible with the existing mobile-first gameplay layout.
- **NFR-006**: The first delivered icon set MUST be acceptable as an interim visual system and not depend on a final custom icon production pipeline.

### Key Entities

- **Item Icon**: The visual symbol used to represent a supported item type without relying on a unique artwork image.
- **Item Icon Mapping**: The centralized mapping between an item type or existing item identifier and the icon definition used across gameplay surfaces.
- **Item Identifier Source**: The existing item type or item identifier already present in gameplay data and used to select the correct icon without changing game rules.
- **Item Visual State Cue**: The non-rule-changing visual treatment that communicates states such as selectable, owned, pending, disabled, or highlighted.
- **Supported Character-Card Placements**: The character-card locations in this project where supported item icons are shown in this feature.
- **Character-Card Icon Area**: The explicit area on a character card that groups the supported item icon presentation and any supporting cues needed for readability.

## Success Criteria

- **SC-001**: 100% of supported new item types in this feature can be shown on character cards through icons and supporting cues.
- **SC-002**: Players can distinguish all supported item-to-character relationships in active gameplay without needing dedicated item artwork on the character card.
- **SC-003**: Existing automated tests relevant to gameplay UI still pass after the icon migration.
- **SC-004**: A production build completes successfully after the item icon migration.
- **SC-005**: Future item icon replacement can be done from a centralized icon definition without changing gameplay rules or network behavior.

## Assumptions

- The first version can use an existing icon library, project-local SVGs, or another centralized icon source, as long as supported new item visuals can be shown on character cards without per-item artwork images.
- A dedicated visual icon-authoring tool is desirable later, but selecting or building that tool is not required for this feature.
- Existing item identifiers already provide enough information for the client to choose the correct icon without changing gameplay logic.
- Existing item types or item identifiers are stable enough to drive the first version of icon mapping without adding new gameplay fields.
- Where needed for readability, text labels, badges, or framing may accompany icons inside the character-card icon area.
- The first shipped icon set may be a replaceable interim set rather than the final art-directed icon language.
- Character artwork, Motion animation, and broader board redesign are handled by separate specs.

## Out of Scope

- Changing Hanamikoji game rules, scoring, action validation, turn order, or server-side validation.
- Adding Motion or animation effects.
- Redesigning the remote character-artwork system from `002-remote-character-card-ui`.
- Replacing every existing item-card surface in the product with icons in this feature.
- Building a full icon management CMS, uploader, or drawing tool.
- Introducing a new multiplayer contract unless a later plan explicitly requires and documents it.
