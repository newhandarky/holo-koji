# Feature Specification: Character Set Expansion

**Feature Branch**: `016-character-set-expansion`  
**Created**: 2026-05-04  
**Status**: Complete  
**Input**: User description: "Expand the game character set contract so default remains Ginza, and add collaboration for 擅自合作系列 plus hololive for Hololive. New sets only change the character image/name pool; item cards, item icons, and charm values remain bound to the seven board positions. A match uses one selected set to randomly fill the seven positions. Unresolved next rounds keep the same seven characters and control state. User rematch/new match reshuffles within the same selected set. Unknown or removed set keys in room snapshots continue to be rejected."

## Clarifications

### Session 2026-05-04

- Q: 如果某個角色組合資料少於 7 位角色，系統應該怎麼處理？ → A: 低於 7 位角色時該分類不可選，且建立或恢復房間時不得用補位或重複角色湊滿。
- Q: Phase 3 文件中的角色顯示名稱是否要逐字保留，還是修正明顯格式問題？ → A: 修正明顯格式問題，例如 `、マリン` 改成 `マリン`，其他名稱照文件保留。

## User Scenarios & Testing

### User Story 1 - Create a match with an expanded character set (Priority: P1)

A player starts a new match using one supported character set. The game fills the seven board positions with characters from that set while keeping the existing position-based item, icon, and charm rules intact.

**Why this priority**: This is the foundation for all Phase 3 character-set work. Without a valid multi-set contract, later selection UI and snapshot hardening cannot be implemented safely.

**Independent Test**: Start a new match for each supported character set and verify that the board contains characters from the selected set while the seven positions retain their expected charm values and item/icon associations.

**Acceptance Scenarios**:

1. **Given** the player starts a new match with Ginza, **When** the board is created, **Then** the seven displayed characters come from Ginza and the position-based item/icon/charm setup remains unchanged.
2. **Given** the player starts a new match with 擅自合作系列, **When** the board is created, **Then** the seven displayed characters come from 擅自合作系列 and the position-based item/icon/charm setup remains unchanged.
3. **Given** the player starts a new match with Hololive, **When** the board is created, **Then** the seven displayed characters come from Hololive and the position-based item/icon/charm setup remains unchanged.

---

### User Story 2 - Preserve characters across unresolved next rounds (Priority: P1)

When a match does not produce a winner at the end of a round, players continue into the next round with the same seven characters and current control state.

**Why this priority**: This preserves the existing game rule and prevents character-set expansion from changing match strategy.

**Independent Test**: Complete a round without a winner and verify that the next round uses the same seven characters, the same selected set, and the carried control state.

**Acceptance Scenarios**:

1. **Given** a match has not produced a winner, **When** the next round starts, **Then** the same seven characters remain on the board.
2. **Given** some characters already have a controlling side, **When** the next unresolved round starts, **Then** those control states are preserved.

---

### User Story 3 - Rematch reshuffles within the same selected set (Priority: P2)

After a completed match, players can start a rematch that keeps the same selected character set but reshuffles which characters occupy the seven board positions.

**Why this priority**: Rematch behavior must stay predictable while still giving a fresh board arrangement.

**Independent Test**: Complete a match, start a rematch, and verify that the selected set is unchanged while the board is regenerated from that set.

**Acceptance Scenarios**:

1. **Given** a completed match used Hololive, **When** the player starts a rematch, **Then** the new match also uses Hololive.
2. **Given** a completed match used 擅自合作系列, **When** the player starts a rematch, **Then** the new match also uses 擅自合作系列 and generates a fresh board arrangement from that set.

---

### User Story 4 - Reject unsupported or removed character sets (Priority: P2)

When the game encounters a room snapshot or creation request with an unsupported character set, it rejects the data instead of silently falling back to another set.

**Why this priority**: Silent fallback can create mismatched board state, incorrect visuals, or invalid saved rooms.

**Independent Test**: Attempt to restore or create a room with an unsupported character set and verify that the request is rejected with a clear error state.

**Acceptance Scenarios**:

1. **Given** a saved room references an unsupported character set, **When** the room is restored, **Then** the restore is rejected and players are asked to create a new match.
2. **Given** a new room request contains an unsupported character set, **When** the room creation is processed, **Then** the room is not created with fallback data.

---

## Requirements

### Functional Requirements

- **FR-001**: The game MUST support three character sets: Ginza, 擅自合作系列, and Hololive.
- **FR-002**: Ginza MUST remain the default character set for new matches when no other set is selected.
- **FR-003**: The game MUST treat 擅自合作系列 and Hololive as distinct selectable character sets from Ginza.
- **FR-004**: Character sets MUST affect only character identity, display name, and character image.
- **FR-005**: Item cards, item icons, and charm values MUST remain bound to the seven board positions rather than to individual characters.
- **FR-006**: A new match MUST populate exactly seven board positions using characters from the selected character set.
- **FR-007**: If a character set later contains more than seven characters, a new match MUST randomly select seven characters from that set.
- **FR-008**: If a character set contains exactly seven characters, a new match MUST use all seven characters from that set.
- **FR-009**: Character sets with fewer than seven characters MUST be treated as unavailable and MUST NOT be used to create or restore a match.
- **FR-010**: The game MUST NOT fill missing character slots by mixing in characters from another set or by duplicating characters from the same set.
- **FR-011**: A round transition without a match winner MUST preserve the same seven characters, their board positions, and their current control state.
- **FR-012**: A user-initiated rematch or new match MUST regenerate the board from the same selected character set unless the user explicitly starts a different match flow.
- **FR-013**: Unsupported, removed, or unknown character set references MUST be rejected during room creation or room restoration.
- **FR-014**: Rejection of unsupported character sets MUST produce a clear user-facing recovery path to create a new match.
- **FR-015**: Character data for each supported set MUST include a stable character identity, display name, and image URL.
- **FR-016**: Character display names imported from planning data MUST preserve the provided names except for obvious formatting errors, such as stray punctuation before a name.
- **FR-017**: Existing Ginza matches MUST continue to behave as before this feature.

### Non-Functional Requirements

- **NFR-001**: Character-set expansion MUST NOT expose hidden cards, secret choices, pending choices, or opponent-only information to players.
- **NFR-002**: New match creation with any supported character set SHOULD complete within the same perceived time as the existing Ginza-only flow.
- **NFR-003**: Unsupported character-set errors MUST be understandable without requiring technical knowledge of saved-room internals.
- **NFR-004**: The feature MUST remain compatible with future character sets larger than seven characters.

### Key Entities

- **Character Set**: A named group of character profiles available for a match. Supported sets are Ginza, 擅自合作系列, and Hololive.
- **Character Profile**: A character identity within a character set, including display name and image URL.
- **Board Position**: One of the seven fixed gameplay positions. Each position owns its charm value and item/icon association independent of which character is placed there.
- **Match Board**: The seven board positions populated with characters from the selected character set for a specific match.
- **Room Snapshot**: A saved or restored room state that includes the selected character set and current match board.

## Success Criteria

- **SC-001**: 100% of supported character sets can create a valid new match with seven board positions populated.
- **SC-002**: 100% of character sets with fewer than seven available characters are unavailable for match creation and are rejected during restoration.
- **SC-003**: 100% of generated boards preserve the existing seven position-based charm values and item/icon associations.
- **SC-004**: 100% of unresolved next-round transitions preserve the same seven characters and control state.
- **SC-005**: 100% of rematches regenerate from the same selected character set.
- **SC-006**: 100% of unsupported character-set room creation or restoration attempts are rejected without fallback to Ginza.
- **SC-007**: Existing Ginza match flows remain functionally unchanged for new match, unresolved next round, rematch, and room restoration paths.

## Assumptions

- The two new character sets initially contain seven characters each, based on the Phase 3 planning document.
- Future character sets are expected to define at least seven characters before becoming selectable.
- The collaboration planning entry `、マリン` is treated as the display name `マリン` because the leading punctuation is an obvious formatting error.
- The current Ginza position definitions remain the source of truth for charm values, item cards, and item icons.
- Character-set selection UI is handled in a later spec; this feature only defines and validates the expanded character-set behavior.
- User-initiated rematch means a player intentionally starts a new match after a completed result, not an unresolved next-round continuation.

## Out of Scope

- Designing the character-set picker UI.
- Adding new item cards, item icons, or charm distributions for the new character sets.
- Changing scoring, control, or round-resolution rules.
- Migrating unsupported legacy room snapshots into new character sets.
- Adding more than the two Phase 3 character sets described here.


## Implementation Notes

- 2026-05-04: Implemented expanded server character-set contract for `default`, `collaboration`, and `hololive`.
- Character identity, display name, and image URL now come from the selected set, while item cards, icons, charm values, and deck copy counts remain bound to the existing seven board positions.
- Room creation, waiting state, next-round preservation, rematch setup, and snapshot restoration now preserve supported set keys and reject unsupported or unavailable set keys instead of falling back to Ginza.
- Frontend consumers now pass through server-supplied `geishaSet` values instead of narrowing active gameplay rendering back to `default`.
- Focused server utility tests cover the room-flow contract boundaries that are safe to exercise without starting the WebSocket server: missing room creation set defaults, explicit supported set preservation, empty/unknown set rejection, unavailable set rejection, snapshot set preservation, snapshot board/set consistency, board-slot validity, and unknown snapshot rejection. Full WebSocket room-flow integration remains a future test improvement.
- Automated verification completed: `cd server && npm test`, `CI=1 npm test -- --watchAll=false`, and `npm run build`.
