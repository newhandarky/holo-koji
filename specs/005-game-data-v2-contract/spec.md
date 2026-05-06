# Feature Specification: Game Data v2 Contract

**Feature Branch**: `005-game-data-v2-contract`  
**Created**: 2026-05-01  
**Status**: Implemented  
**Input**: User description: "005-game-data-v2-contract"

## Clarifications

### Session 2026-05-01

- Q: 七個位置綁定的 item assets 是否需要穩定內部名稱？ → A: 每個位置 item asset 都要有穩定內部名稱，例如 `sake_01` 到 `sake_07`。
- Q: `itemLabel` 這個顯示欄位在 005 data contract 階段要使用哪種命名？ → A: 使用中性內部顯示名，例如 `Sake 01` 到 `Sake 07`。
- Q: `rematch` 在 MVP 內是否應該固定重新抽七位角色？ → A: Rematch 指使用者在一場 match 結束後主動重新開一場，應重新抽七位角色；勝負未分的下一局不是 rematch，必須沿用同一批角色與掌控狀態。
- Q: 如果後端 Ginza 角色池設定錯誤，少於 7 位角色時，系統應該怎麼處理？ → A: 拒絕建立 match，回報資料設定錯誤。
- Q: 如果七個 board positions 的 item asset 設定不完整，例如缺少道具圖、icon、internal name 或 label，系統應該怎麼處理？ → A: 拒絕建立 match，回報資料設定錯誤。

## User Scenarios & Testing

### User Story 1 - Start a Match With Ginza Data (Priority: P1)

As a player, I want a new match to use the new Ginza cast and item data, so that the v2 game can be tested against the real planned content instead of the legacy default data.

**Why this priority**: All later v2 UI work depends on the game state containing the correct character, charm, item image, and item icon data. The data path must be stable before card layout and hand layout are redesigned.

**Independent Test**: Start a new default match and confirm that the seven visible characters come from the Ginza data set, use the fixed board charm values, and generate item cards with the expected position-bound artwork and icon data.

**Acceptance Scenarios**:

1. **Given** a player starts a new default match, **When** the game state is created, **Then** the match uses Ginza character data instead of the legacy default character data.
2. **Given** the Ginza character pool contains at least seven characters, **When** a new match starts, **Then** exactly seven characters are selected for the board.
3. **Given** seven characters have been selected, **When** they are assigned to board positions, **Then** the board positions carry charm values `2, 2, 2, 3, 3, 4, 5` from left to right.
4. **Given** a character is assigned to a board position, **When** item cards are generated, **Then** the item card count for that position equals the position charm value and uses that position's item image and item icon data.
5. **Given** the Ginza character pool contains fewer than seven characters, **When** a new match starts, **Then** match creation is rejected with a data configuration error instead of falling back to legacy data.
6. **Given** any board-position item asset is missing its internal name, item image, item icon, or label, **When** a new match starts, **Then** match creation is rejected with a data configuration error.

---

### User Story 2 - Continue an Unresolved Match Without Re-Randomizing (Priority: P2)

As a returning player in the same match, I want unresolved rounds to keep the same cast and existing control state, so that the match remains coherent until a winner is determined.

**Why this priority**: The game rules carry state across unresolved rounds. Randomizing the cast between rounds would break player understanding and make control state ambiguous.

**Independent Test**: Play a round that does not determine a winner and continue to the next round; confirm the same seven characters remain on the board and existing control ownership remains attached to those characters.

**Acceptance Scenarios**:

1. **Given** a match has not produced a winner, **When** the next round begins, **Then** the same seven selected characters remain in the same board positions.
2. **Given** one or more characters were already controlled before the next round, **When** the next round begins, **Then** those control states are preserved.
3. **Given** a user starts a rematch after the previous match has ended, **When** the new match state is created, **Then** the character selection is randomized again.

---

### User Story 3 - Keep Random Selection Testable (Priority: P3)

As a developer validating the game, I want random character selection to be reproducible in tests, so that automated checks can reliably verify deck size, charm values, and item mappings.

**Why this priority**: Random selection is correct for players, but unstable random output can make tests flaky. A reproducible test path protects future v2 UI work.

**Independent Test**: Run the match setup with a deterministic test random source and confirm repeated setup attempts produce the same selected characters, positions, and generated item cards.

**Acceptance Scenarios**:

1. **Given** a deterministic test random source is used, **When** match setup runs multiple times with the same inputs, **Then** the selected characters and board assignments are identical each time.
2. **Given** normal gameplay starts without a deterministic test random source, **When** match setup runs, **Then** the game can still use normal random selection.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST make `ginza` the data used by the default match path.
- **FR-002**: The system MUST keep legacy data available until a later cleanup feature removes it.
- **FR-003**: The system MUST store Ginza character data as server-owned game data with stable unique character identifiers, display names, and image URLs.
- **FR-004**: The system MUST support a Ginza character pool larger than seven characters, even if MVP data starts with exactly seven.
- **FR-005**: The system MUST select exactly seven characters from the Ginza character pool when creating a new match.
- **FR-006**: The system MUST reject match creation with a data configuration error when the Ginza character pool contains fewer than seven characters, and MUST NOT fall back to legacy data.
- **FR-007**: The system MUST assign selected characters to seven board positions with fixed charm values `2, 2, 2, 3, 3, 4, 5` from left to right.
- **FR-008**: The system MUST treat charm value as board-position data, not intrinsic character data.
- **FR-009**: The system MUST treat item image and item icon data as board-position data, not intrinsic character data.
- **FR-010**: The system MUST generate item cards for each selected board position using that position's charm value as the card count.
- **FR-011**: The system MUST define a stable unique internal item asset name for each board-position item group, such as `sake_01` through `sake_07`, independent from image URLs and display labels.
- **FR-012**: The system MUST provide item card display data sufficient for current and future UI surfaces to show the correct item image, icon, and neutral internal display label, such as `Sake 01` through `Sake 07`, without relying on legacy frontend-only mappings.
- **FR-013**: The system MUST reject match creation with a data configuration error when any board-position item asset lacks its internal name, item image URL, item icon URL, or neutral internal display label.
- **FR-014**: The system MUST preserve the current rule-bearing card identity and ownership model so score, control, turn flow, and legal actions continue to be validated by existing game state rules.
- **FR-015**: The system MUST preserve the same selected seven characters and existing control states when a match advances to another round without a winner.
- **FR-016**: The system MUST treat rematch as a user-started new match after the previous match has ended, and MUST select a new random seven-character board for rematch setup.
- **FR-017**: The system MUST provide a reproducible random-selection path for tests while keeping normal gameplay random.
- **FR-018**: The system MUST avoid changing Socket.IO event names or action payload semantics for this data migration.
- **FR-019**: The system MUST keep existing gameplay UI functional after the data contract changes, even before later visual redesign specs are implemented.

### Non-Functional Requirements

- **NFR-001**: The feature MUST keep game rule behavior, scoring, turn order, action validation, and hidden-information boundaries unchanged.
- **NFR-002**: The feature MUST make the new data path easy to verify through automated setup checks and a short playable match flow.
- **NFR-003**: The feature MUST keep display-only data separate from rule-bearing decisions.
- **NFR-004**: The feature MUST remain compatible with existing mobile gameplay surfaces until later UI redesign specs replace them.
- **NFR-005**: The feature MUST keep legacy data isolated so it can be removed later without changing Ginza behavior.

### Key Entities

- **Ginza Character**: A server-owned character record with a stable identifier, display name, and image URL. It does not own charm value or item icon data.
- **Board Position**: One of the seven active match slots. It owns fixed charm value and position-bound item asset data.
- **Position Item Asset**: The stable internal item asset name, item image, item icon, and neutral internal display label associated with a board position.
- **Selected Board Cast**: The seven Ginza characters selected for a match and assigned to board positions.
- **Display-Only Item Data**: Item card fields used by UI surfaces to render item image, icon, and label. These fields must not decide scoring or legal actions.
- **Deterministic Test Random Source**: A reproducible random-selection input used only for tests and validation.
- **Rematch**: A user-started new match after a previous match has ended. It is distinct from advancing to the next unresolved round.

## Success Criteria

- **SC-001**: A new default match shows exactly seven Ginza characters and no legacy default characters.
- **SC-002**: The seven active board positions always expose charm values in the order `2, 2, 2, 3, 3, 4, 5`.
- **SC-003**: The generated item card count matches the total charm value sum of the seven active positions.
- **SC-004**: Every generated item card has enough display data to render its item image, item icon, and label from game state.
- **SC-005**: Continuing an unresolved match preserves the same seven selected characters and any existing control state.
- **SC-006**: Automated validation can run match setup with reproducible character selection.
- **SC-007**: Existing test and build validation still pass after the data migration.

## Assumptions

- The first Ginza character pool contains the seven characters listed in `docs/plan/update-plan.md`.
- The first Ginza position item asset set contains the seven item/icon groups listed in `docs/plan/update-plan.md`.
- Position item labels use neutral internal display names during the data-contract phase; final localized display naming can be refined in a later UI polish spec.
- Rematch is treated as a new match for MVP and reshuffles characters.
- Later game modes may introduce different setup rules, but this feature only defines the MVP Ginza mode.

## Out of Scope

- Swiper coverflow character card presentation.
- Fan-shaped player hand presentation.
- Theme background redesign.
- Character card visual redesign.
- Gift and competition modal redesign.
- Removing legacy data.
- Changing Hanamikoji scoring, action limits, turn order, or win conditions.
- Adding new Socket.IO event names or changing rule-bearing payload semantics.
