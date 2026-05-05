# Feature Specification: Expanded Character Pools

**Feature Branch**: `022-expanded-character-pools`  
**Created**: 2026-05-05  
**Status**: Implemented  
**Input**: User description: "022-expanded-character-pools"

## Clarifications

### Session 2026-05-05

- Q: 022 是否必須等每個角色組合資料擴充到 7 位以上才能測試？ → A: 不必；目前每組剛好 7 位時，022 先要求從整組角色池隨機選 7 位，等於全選但隨機排列。未來資料超過 7 位時，同一規則會從完整池中隨機抽 7 位。

## User Scenarios & Testing

### User Story 1 - Start matches from whole character pools (Priority: P1)

A player creates a new online or NPC match with any currently supported character set. The room still shows exactly seven board characters, and those seven are selected from the whole available pool for that set. If the set currently contains exactly seven characters, all seven are used with randomized board placement; if the set later contains more than seven, seven are randomly selected from the larger pool.

**Why this priority**: The existing multi-set contract and lobby selector need one consistent selection rule before future larger pools and custom selection work build on top of it.

**Independent Test**: Create repeated new matches for Ginza, 擅自合作系列, and Hololive, and confirm each match shows exactly seven unique characters from the selected set while repeated starts can randomize board placement. When a set has more than seven available characters, repeated starts can also produce different seven-character casts.

**Acceptance Scenarios**:

1. **Given** a player creates a new Ginza match, **When** the board is generated, **Then** exactly seven unique Ginza characters appear from the available Ginza pool.
2. **Given** a player creates a new 擅自合作系列 match, **When** the board is generated, **Then** exactly seven unique 擅自合作系列 characters appear from the available 擅自合作系列 pool.
3. **Given** a player creates a new Hololive match, **When** the board is generated, **Then** exactly seven unique Hololive characters appear from the available Hololive pool.
4. **Given** a character set currently contains exactly seven available characters, **When** repeated new matches are created, **Then** all seven characters are used but their board placement can differ between matches.
5. **Given** a character set later contains more than seven available characters, **When** repeated new matches are created, **Then** players can encounter characters that were not present in earlier boards.

---

### User Story 2 - Preserve current game rules while randomizing cast setup (Priority: P1)

Players get randomized cast setup without needing to relearn scoring, item cards, charm values, actions, or room setup behavior. Pool selection only changes which character identities may occupy the seven board positions and where they appear.

**Why this priority**: The project already treats charm and item identity as board-position rules. Expanding pools must not accidentally turn character identity into a gameplay rule.

**Independent Test**: Start matches from expanded pools and verify that the seven board positions still use the existing charm distribution and item/icon associations regardless of which characters are selected.

**Acceptance Scenarios**:

1. **Given** any supported character set has at least seven available characters, **When** a match starts, **Then** the board still has exactly seven positions with the existing charm distribution.
2. **Given** a character appears in different board positions across separate matches, **When** item cards and icons are shown, **Then** the item and charm behavior follows the board position rather than the character identity.
3. **Given** players use actions, resolve a round, or determine control, **When** the expanded character pool is active, **Then** scoring and action legality remain unchanged from the existing game rules.

---

### User Story 3 - Keep round continuation stable within a match (Priority: P2)

When a match advances to another unresolved round, the selected seven characters remain the same. Expanded pools only affect new board generation for new matches or rematches, not mid-match continuation.

**Why this priority**: Preserving the same cast across unresolved rounds keeps the current strategy and control-state rules intact.

**Independent Test**: Start a match from an expanded pool, complete a round without a winner, and verify the next round keeps the same seven characters and control state.

**Acceptance Scenarios**:

1. **Given** a match was generated from the selected character pool, **When** the match advances to an unresolved next round, **Then** the same seven characters remain in the same board positions.
2. **Given** one or more board characters already have control state, **When** the next unresolved round starts, **Then** those control states remain attached to the same displayed characters.

---

### User Story 4 - Keep unsupported or incomplete pools unavailable (Priority: P2)

If a character set or future expanded pool does not have enough valid character records, players should not be able to start or restore a broken match from it.

**Why this priority**: Expanded data increases the chance of malformed or incomplete pool entries. The system must fail safely instead of mixing sets, duplicating characters, or falling back silently.

**Independent Test**: Attempt to use a character set with fewer than seven valid characters or invalid character records and verify it remains unavailable for room creation/restoration.

**Acceptance Scenarios**:

1. **Given** a supported set has fewer than seven valid characters, **When** a player tries to create a match with that set, **Then** the match is not created from duplicated or fallback characters.
2. **Given** a restored room references a board containing characters outside its selected set, **When** restoration is attempted, **Then** the restore is rejected with a recovery path.
3. **Given** a future pool contains duplicate character identities, **When** the pool is validated, **Then** the set is treated as invalid until the duplicates are resolved.

## Requirements

### Functional Requirements

- **FR-001**: Each currently supported character set MUST contain at least seven available character profiles.
- **FR-002**: A new match MUST still populate exactly seven board positions from the selected character set.
- **FR-003**: The seven selected board characters MUST be unique within a match.
- **FR-004**: Repeated new matches or rematches from the same selected character set MUST be able to produce different board placements when the set contains exactly seven available characters.
- **FR-015**: Repeated new matches or rematches from the same selected character set MUST be able to produce different seven-character casts when that set contains more than seven available characters.
- **FR-005**: Expanded character pools MUST NOT add, remove, or rename supported character set choices.
- **FR-006**: Expanded character pools MUST affect only character identity, display name, and character image.
- **FR-007**: Item cards, item icons, charm values, action rules, scoring, and win conditions MUST remain bound to existing board-position and gameplay rules.
- **FR-008**: Unresolved next-round continuation MUST preserve the same seven board characters, their board positions, and their control state.
- **FR-009**: User-initiated rematch and new match flows MUST regenerate a seven-character board from the same selected character set unless the player starts a different room creation flow.
- **FR-010**: Character sets with fewer than seven valid profiles MUST remain unavailable for room creation and restoration.
- **FR-011**: Invalid pool entries, duplicate character identities, or board characters outside the selected set MUST be rejected rather than repaired with fallback characters.
- **FR-012**: Existing room-join behavior MUST continue to use the room creator's selected character set and generated board.
- **FR-013**: Existing Ginza, 擅自合作系列, and Hololive room creation flows MUST remain recognizable to players after the pool expansion.
- **FR-014**: The feature MUST NOT introduce custom selection of the seven board characters.

### Non-Functional Requirements

- **NFR-001**: Match creation with expanded pools MUST remain fast enough that players do not perceive additional setup delay compared with the current room creation flow.
- **NFR-002**: Expanded pool validation errors MUST provide a clear recovery path without exposing technical data internals to players.
- **NFR-003**: Expanded pool behavior MUST preserve hidden-information boundaries, including opponent hands, secret choices, pending choices, and unrevealed action details.
- **NFR-004**: The feature MUST keep future character-data additions maintainable by requiring stable character identity, display name, and image data for each profile.

### Key Entities

- **Character Set**: A supported selectable group such as Ginza, 擅自合作系列, or Hololive.
- **Expanded Character Pool**: The complete list of available character profiles for one character set. It may currently contain exactly seven profiles and may grow beyond the seven visible board positions.
- **Character Profile**: A stable character identity with display name and image data.
- **Selected Board Cast**: The seven unique characters selected from a pool for one match.
- **Board Position**: One of the seven fixed gameplay positions that owns charm value and item/icon behavior independently of character identity.
- **Room Snapshot**: Saved room state containing the selected character set and current selected board cast.

## Success Criteria

- **SC-001**: 100% of supported character sets contain at least seven available character profiles.
- **SC-002**: 100% of new matches still show exactly seven unique board characters.
- **SC-003**: Across repeated match creation checks for each supported set, at least one generated board placement can differ from another board from the same set.
- **SC-004**: 100% of generated boards preserve the existing seven position-based charm values and item/icon associations.
- **SC-005**: 100% of unresolved next-round continuations preserve the selected seven characters and control state.
- **SC-006**: 100% of invalid, undersized, duplicate, or mismatched pools are rejected without fallback to another set.
- **SC-007**: Players can create online and NPC rooms with each supported set through the existing room creation flow without additional mandatory steps.

## Assumptions

- The feature expands the existing three supported sets: Ginza, 擅自合作系列, and Hololive.
- The current data set may still contain exactly seven available characters per supported set; that is enough to validate whole-pool random board placement.
- Additional character names and image assets can be added later without changing the selection rule defined here.
- Board position charm distribution and item/icon associations remain the existing source of truth.
- The next planned feature, `023-custom-character-selection`, will handle player-directed selection of the seven board characters; 022 only expands random pool variety.
- If an image asset for a new character is missing or invalid, that character profile is not considered available until corrected.

## Out of Scope

- Adding a new character set beyond Ginza, 擅自合作系列, and Hololive.
- Letting players manually choose which seven characters appear on the board.
- Changing Lobby selector design beyond preserving currently available set choices.
- Changing item card data, item icons, charm distribution, scoring, actions, turn order, or win conditions.
- Migrating or repairing unsupported legacy room snapshots.
- Building collection, account, achievement, or unlock systems for individual characters.
