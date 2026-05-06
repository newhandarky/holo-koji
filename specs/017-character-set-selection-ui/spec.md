# Feature Specification: Character Set Selection UI

**Feature Branch**: `017-character-set-selection-ui`  
**Created**: 2026-05-04  
**Status**: Complete  
**Input**: User description: "017-character-set-selection-ui"

## Clarifications

### Session 2026-05-04

- Q: 角色組合選擇 UI 要用哪種形式？ → A: 在現有 Lobby 建房區塊中加入簡單選擇控制，例如 radio 或 select，不加圖片預覽。
- Q: 房間建立後，要把目前角色組合顯示在哪裡？ → A: 不用額外顯示，遊戲本身就有角色區塊可供辨識。
- Q: 加入房間區塊要怎麼處理角色組合選擇？ → A: 只在建立房間流程顯示，加入房間區塊完全不顯示角色組合選擇。
- Q: 如果未來某個角色組合不可用，Lobby 應該怎麼呈現？ → A: 顯示該角色組合，但標示為不可用且不可選。
- Q: 使用者切換線上玩家與對戰 NPC 時，角色組合選擇要怎麼處理？ → A: 切換對戰模式時保留目前角色組合選擇。

## User Scenarios & Testing

### User Story 1 - Select a character set before creating a match (Priority: P1)

A player chooses which character set to use before creating a room. The same choice flow works for both online matches and NPC matches, and the selected set is carried into the new room. Players joining an existing room do not choose the room’s character set, and switching between online and NPC creation does not clear the current selection.

**Why this priority**: The expanded character-set contract from the previous feature has no practical value until players can select a set when starting a match.

**Independent Test**: From the lobby, create one online room and one NPC room with each available character set and verify that the created room uses the selected set.

**Acceptance Scenarios**:

1. **Given** the player is on the lobby screen, **When** the player selects Ginza and creates an online room, **Then** the new room uses Ginza.
2. **Given** the player is on the lobby screen, **When** the player selects 擅自合作系列 and creates an online room, **Then** the new room uses 擅自合作系列.
3. **Given** the player is on the lobby screen, **When** the player selects Hololive and creates an NPC room, **Then** the new room uses Hololive.
4. **Given** one supported character set is currently unavailable, **When** the player opens the character-set selector, **Then** that option is visible but cannot be selected for room creation.
5. **Given** the player has already selected a character set, **When** the player switches between online and NPC match modes, **Then** the selected character set remains unchanged unless the player explicitly changes it.

---

### User Story 2 - Default safely to Ginza when no explicit choice is made (Priority: P1)

If a player does not actively change the character-set choice, the lobby still creates the match with Ginza so the existing quick-start flow remains intact.

**Why this priority**: Preserving the current default behavior prevents regressions in the main room-creation path and keeps the feature backward-compatible.

**Independent Test**: Enter the lobby, do not change the character-set option, create a room, and verify that the new room uses Ginza.

**Acceptance Scenarios**:

1. **Given** the player has not changed the character-set option, **When** the player creates a room, **Then** the room uses Ginza.
2. **Given** the player returns to the lobby after a prior match, **When** the lobby is shown again, **Then** Ginza is still the default unless the user changes it during that visit.

---

### User Story 3 - See which character set the room is using (Priority: P2)

After room creation, players can identify which character set the room is using from the character presentation that is already part of the room experience, without needing an additional dedicated room label.

**Why this priority**: Once multiple themed character sets exist, the room still needs to remain understandable without introducing extra duplicated room metadata.

**Independent Test**: Create rooms with each supported character set and verify that the room content itself reflects the selected set without requiring an additional dedicated set label.

**Acceptance Scenarios**:

1. **Given** a room was created with 擅自合作系列, **When** players enter the room, **Then** the characters shown in the room match 擅自合作系列 without requiring an extra room-level set label.
2. **Given** a room was created with Hololive, **When** players enter the room, **Then** the characters shown in the room match Hololive without requiring an extra room-level set label.

---

### User Story 4 - Lock the room to its selected character set after creation (Priority: P2)

Once a room exists, its character set remains fixed for that room session. Players cannot switch the room to a different set mid-room or mid-match.

**Why this priority**: Changing the character set after room creation would conflict with the saved room state, rematch rules, and the established board-generation rules introduced in the previous feature.

**Independent Test**: Create a room, enter it, and verify that the character-set choice is no longer available as an in-room switch for either online or NPC matches.

**Acceptance Scenarios**:

1. **Given** a room already exists, **When** the player is inside that room, **Then** the player cannot switch the room to another character set from that session.
2. **Given** a room was created with Ginza, **When** the match advances through round flow or rematch flow, **Then** the room remains tied to Ginza for that room session unless the player leaves and starts a different room creation flow.

## Requirements

### Functional Requirements

- **FR-001**: The lobby MUST let the player choose a character set before creating a room.
- **FR-002**: The selectable character sets MUST include Ginza, 擅自合作系列, and Hololive.
- **FR-003**: The same character-set selection flow MUST apply to both online room creation and NPC room creation.
- **FR-004**: The room creation request MUST carry the player’s selected character set.
- **FR-005**: If the player does not change the selection, the lobby MUST create the room with Ginza.
- **FR-006**: The lobby MUST show the active character-set choice clearly enough that the player can confirm it before creating a room.
- **FR-014**: The pre-room character-set choice MUST be presented as a simple selection control within the existing lobby room-creation area and MUST NOT require image previews to understand or use.
- **FR-007**: After room creation succeeds, the room content MUST reflect the selected character set through the characters shown in play, without requiring an additional dedicated room-level set label.
- **FR-008**: The room’s active character set MUST remain fixed after room creation and MUST NOT be switchable from inside the room.
- **FR-009**: Joining players MUST see the same room character-set identity as the room creator.
- **FR-010**: NPC rooms MUST use the same selected character set for initial board generation, unresolved next-round continuation, and rematch behavior already defined by the active room.
- **FR-011**: If a character set is unavailable for room creation, the lobby MUST prevent the player from starting a room with that set.
- **FR-016**: If a supported character set is temporarily unavailable, the lobby MUST continue to show that set in the selector while clearly marking it unavailable and preventing selection.
- **FR-017**: Switching between online room creation and NPC room creation MUST preserve the currently selected character set unless the player explicitly chooses a different one.
- **FR-012**: If the room creation attempt fails, the player MUST remain able to review or change the character-set choice before trying again.
- **FR-013**: Existing room-join flows that do not create a room MUST continue to work without requiring a character-set selection.
- **FR-015**: The join-room flow MUST NOT show a separate character-set selector, because joining players do not determine the room’s character set.

### Non-Functional Requirements

- **NFR-001**: The room-creation flow with character-set selection MUST remain understandable to a first-time player without needing to inspect character images in advance.
- **NFR-002**: Adding the selection UI MUST NOT make the default Ginza room-creation path materially slower or require extra mandatory steps beyond the selection itself.
- **NFR-003**: The lobby selection and in-room character presentation MUST remain consistent so hosts and joiners do not receive conflicting signals about which set is active.
- **NFR-004**: The feature MUST remain compatible with future supported character sets without redefining the overall selection concept.

### Key Entities

- **Character Set Option**: A user-facing selectable choice that maps to one supported character set for room creation.
- **Room Creation Request**: The player’s request to start an online room or NPC room, including the selected character set.
- **Room Character Set**: The fixed character-set identity assigned to a room after successful creation.
- **Lobby Creation Flow**: The pre-room flow where the player chooses match mode, optional NPC settings, and the character set before creating a room.

## Success Criteria

- **SC-001**: 100% of supported character sets can be selected during both online room creation and NPC room creation.
- **SC-002**: 100% of room creations started without an explicit set change use Ginza.
- **SC-003**: 100% of successfully created rooms display the active character set to players after entry.
- **SC-004**: 100% of rooms remain locked to the selected character set for the full room session.
- **SC-005**: Players can complete room creation with a chosen character set in the same interaction flow they already use for match mode selection.

## Assumptions

- The current lobby remains the only required entry point for this feature; no separate mode hub or settings screen is introduced here.
- The pre-room selection UI should be added inside the existing lobby creation surface as a simple text-based selector rather than a preview-card experience.
- All three supported character sets from the previous feature are available for selection.
- Joining an existing room should remain focused on room code and player identity, without additional character-set choice UI.
- The lobby should treat character-set choice as one shared pre-room preference across the online and NPC creation modes during the same visit.
- If a future character set becomes unavailable because its character pool is incomplete, it should remain visible in the selector as unavailable and should not be selectable for room creation.
- Character-set naming shown to the player should match the planning document labels Ginza, 擅自合作系列, and Hololive.

## Out of Scope

- Redesigning the overall lobby layout beyond what is required to add character-set selection and active-set display.
- Allowing players to switch character sets after a room has already been created.
- Changing rematch rules, unresolved next-round rules, item rules, or charm-position rules.
- Adding more character sets beyond Ginza, 擅自合作系列, and Hololive.
- Hardening snapshot restore rules or production logging beyond what is already covered by other Phase 3 specs.

## Implementation Notes

- Lobby 以共享 `CHARACTER_SET_OPTIONS` 定義 `default`、`collaboration`、`hololive` 三個可見選項。
- 角色組合 selector 僅出現在建房流程，online / NPC 共用同一份 `selectedGeishaSet` 狀態，切換模式時不重置。
- Join-room 流程未加入角色組合控制，房內也未新增額外的角色組合標籤或切換器。
