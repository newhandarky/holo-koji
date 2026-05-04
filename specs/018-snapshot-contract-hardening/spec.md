# Feature Specification: Snapshot And Contract Hardening

**Feature Branch**: `018-snapshot-contract-hardening`  
**Created**: 2026-05-04  
**Status**: Complete  
**Input**: User description: "018-snapshot-and-contract-hardening"

## Clarifications

### Session 2026-05-04

- Q: 如果 room snapshot restore 因為 `geishaSet` 或 board/set 不一致而失敗，系統應該怎麼處理這個房間？ → A: 拒絕恢復，使用者回到 Lobby 或重建房流程，原失敗房間不再繼續使用。
- Q: snapshot 裡的角色資料一致性，要檢查到什麼程度？ → A: 檢查 7 位角色都屬於該 `geishaSet`，且不得混入其他 set 或缺少角色。
- Q: restore 失敗時，前端對使用者顯示的訊息應該偏向哪種程度？ → A: 顯示簡單使用者訊息，不透露技術原因，只引導重新建立對戰。
- Q: 這個 spec 要不要把 waiting room / active game / restore 後所有玩家看到的 room-level set identity 必須一致寫成明確驗收範圍？ → A: 要，host、joiner、waiting room、active game、restore 後都必須看到同一個 room-level set identity。

## User Scenarios & Testing

### User Story 1 - Restore a valid room with the correct character set (Priority: P1)

A player re-enters or restores a saved room, and the game resumes only when the saved room references a supported character set with board data that is consistent with that set.

**Why this priority**: Room restoration is the highest-risk boundary after adding multiple character sets. If valid rooms cannot be restored reliably, the expanded set feature becomes unstable.

**Independent Test**: Restore saved rooms for each supported character set and verify that the room resumes with the same set identity, board characters, and room state.

**Acceptance Scenarios**:

1. **Given** a saved room uses Ginza and contains valid board data, **When** the room is restored, **Then** the room resumes with Ginza and the saved board state.
2. **Given** a saved room uses 擅自合作系列 and contains valid board data, **When** the room is restored, **Then** the room resumes with 擅自合作系列 and the saved board state.
3. **Given** a saved room uses Hololive and contains valid board data, **When** the room is restored, **Then** the room resumes with Hololive and the saved board state.

---

### User Story 2 - Reject invalid or obsolete saved room data (Priority: P1)

When a saved room contains an unknown, removed, unavailable, or internally inconsistent character-set reference, the system rejects restoration instead of silently repairing or falling back to another set.

**Why this priority**: Silent fallback would create mismatched visuals, invalid board state, and hard-to-debug multiplayer desync.

**Independent Test**: Attempt to restore rooms with unsupported set keys, unavailable sets, or mismatched board/set content and verify that restoration is rejected with a clear recovery path.

**Acceptance Scenarios**:

1. **Given** a saved room references an unknown or removed character set, **When** restoration is attempted, **Then** restoration is rejected and the player is returned to Lobby or a new-room flow.
2. **Given** a saved room references a supported set but the saved board contains character data that does not belong to that set, **When** restoration is attempted, **Then** restoration is rejected.
3. **Given** a character set is currently unavailable because it no longer has enough valid characters, **When** a saved room using that set is restored, **Then** restoration is rejected instead of being auto-repaired.
4. **Given** restoration is rejected, **When** the player sees the failure message, **Then** the message only tells the player that the room data is invalid and to create a new match, without exposing technical snapshot details.

---

### User Story 3 - Keep room contracts aligned across creation, waiting, rematch, and restore (Priority: P2)

A room keeps one consistent character-set identity across all room lifecycle boundaries, so players do not see conflicting set information between creation, waiting, gameplay, rematch, and restore paths.

**Why this priority**: The feature is not only about rejecting bad data. It must also guarantee that valid room flows preserve one shared contract across all states.

**Independent Test**: Start rooms for each supported set, progress them through waiting state, gameplay, unresolved next round, rematch, and restoration, and verify that the same selected set is preserved through each allowed transition for both host and joiner.

**Acceptance Scenarios**:

1. **Given** a room is created with Hololive, **When** players view the waiting room and enter gameplay, **Then** the room remains identified as Hololive throughout the transition.
2. **Given** a room is created with 擅自合作系列, **When** the match ends and players start a rematch, **Then** the room lifecycle continues to use 擅自合作系列 unless a new room is created through a different selection flow.
3. **Given** a room remains unresolved and continues into the next round, **When** the room state advances, **Then** the room keeps the same selected character set and same seven characters already bound to that room.
4. **Given** the same room is viewed by host and joiner during waiting room, active game, or after restore, **When** room state is delivered, **Then** both players see the same room-level character-set identity.

---

### User Story 4 - Prevent hidden state leakage while hardening contracts (Priority: P2)

Players only receive the room and gameplay information they are allowed to see, even after adding more character sets and stricter room validation.

**Why this priority**: Snapshot and contract hardening must not accidentally expose hidden cards, pending choices, or opponent-only information while reshaping room state handling.

**Independent Test**: Inspect player-visible room and gameplay state across create, restore, and rematch flows and verify that hidden hands, secret cards, and pending choices are not exposed to unauthorized players.

**Acceptance Scenarios**:

1. **Given** a room is created or restored successfully, **When** a player receives room state, **Then** the payload does not reveal opponent hidden hand contents.
2. **Given** a room contains unresolved secret or pending interactions, **When** room state is restored or resent, **Then** only the authorized player receives the necessary hidden information.
3. **Given** the same room is viewed by host and non-host participants, **When** room state is delivered, **Then** both players share the same room-level character-set identity without receiving each other's hidden data.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST recognize `default`, `collaboration`, and `hololive` as the only supported character-set keys for room lifecycle operations covered by this feature.
- **FR-002**: Room restoration MUST succeed only when the saved room references a supported character set.
- **FR-003**: Room restoration MUST succeed only when the saved board data is internally consistent with the referenced character set.
- **FR-004**: Room restoration MUST reject unknown, removed, or unsupported character-set keys.
- **FR-005**: Room restoration MUST reject saved rooms whose referenced set is currently unavailable for valid match generation.
- **FR-006**: The system MUST NOT silently replace an invalid saved character set with another supported set.
- **FR-007**: The system MUST NOT silently repair mismatched saved board/set combinations by substituting characters from a different set.
- **FR-008**: When restoration is rejected, the player MUST receive a clear recovery path that leads to creating a new room instead of resuming the invalid one.
- **FR-009**: A room created with a selected character set MUST preserve that same set identity through waiting-room, active-match, unresolved-next-round, rematch, and valid-restore flows.
- **FR-010**: Valid room creation, waiting-room, active-match, rematch, and restore flows MUST use one consistent room-level character-set identity without contradictory values between states.
- **FR-011**: Player-visible room state MUST expose the active room character-set identity consistently to all participants who are allowed to enter the room.
- **FR-012**: Hidden cards, secret cards, pending choices, and opponent-only information MUST remain unavailable to unauthorized players during create, restore, resend, and rematch flows.
- **FR-013**: The system MUST reject room lifecycle data that would require mixing character identities from multiple sets inside one active room.
- **FR-014**: The system MUST preserve the existing rule that unresolved next rounds keep the same selected set and the same seven room characters.
- **FR-015**: The system MUST preserve the existing rule that rematch regenerates from the room's selected set rather than switching to another set implicitly.
- **FR-016**: Shared contract definitions used by room producers and consumers MUST represent the same set of supported character-set keys for this feature's covered flows.
- **FR-017**: Existing valid Ginza rooms MUST continue to restore and progress without requiring migration to a new set key.
- **FR-018**: Snapshot character-set consistency checks MUST verify that all seven room characters belong to the referenced `geishaSet` and that no character is missing or mixed from another set.
- **FR-019**: If room restoration is rejected, the invalid room MUST NOT remain usable as a partial waiting room, partial game room, or recoverable shell.
- **FR-020**: Restore-failure messages MUST use simple user-facing wording and MUST NOT expose raw snapshot, schema, or set-validation internals.
- **FR-021**: Host and joiner MUST see the same room-level character-set identity during waiting room, active gameplay, and valid post-restore room entry.

### Non-Functional Requirements

- **NFR-001**: Snapshot rejection messages MUST be understandable without requiring users to interpret technical snapshot or schema details.
- **NFR-002**: Contract hardening MUST NOT make valid room creation, restoration, or rematch flows materially slower from the player's perspective.
- **NFR-003**: Character-set validation outcomes MUST be deterministic so the same saved room data always produces the same accept-or-reject result.
- **NFR-004**: Hardening this contract MUST NOT introduce new hidden-state leaks to unauthorized players.
- **NFR-005**: The contract model MUST remain extensible so future supported character sets can be added without redefining the meaning of a room-level set identity.

### Key Entities

- **Room Character Set Identity**: The single supported character-set key assigned to a room and preserved across the room lifecycle.
- **Room Snapshot**: Saved room data used for restoration, including room-level set identity and board state.
- **Board Character Assignment**: The seven character identities currently occupying the room's fixed board positions.
- **Room Lifecycle Contract**: The shared agreement that room creation, waiting state, gameplay, rematch, and restore flows all reference the same active character set.
- **Player-Visible Room State**: The subset of room information delivered to a participant, including allowed room identity and public board data but excluding hidden information.

## Success Criteria

- **SC-001**: 100% of valid saved rooms using supported character sets restore successfully with the same room character-set identity.
- **SC-002**: 100% of restore attempts using unknown, removed, or unavailable set keys are rejected without fallback.
- **SC-003**: 100% of restore attempts using mismatched, incomplete, duplicate, or otherwise invalid board/set data are rejected without silent repair.
- **SC-004**: 100% of valid room lifecycle transitions keep one consistent room character-set identity across creation, waiting, gameplay, rematch, and restore.
- **SC-005**: 100% of valid unresolved next-round transitions preserve the same seven room characters already tied to the room.
- **SC-006**: 0 unauthorized hidden hand contents or pending secret choices are exposed in player-visible room state during the flows covered by this feature.
- **SC-007**: Existing valid Ginza rooms continue to restore and play successfully without user-facing regression.
- **SC-008**: 100% of valid room snapshots either contain seven characters fully belonging to the referenced set or are rejected.
- **SC-009**: 100% of rejected restore attempts end in a new-room recovery path rather than a partially usable broken room shell.

## Assumptions

- `default` continues to represent the current Ginza set, while `collaboration` and `hololive` remain the only additional supported sets in this phase.
- Supported room snapshots are expected to retain enough public board information to verify whether the saved characters belong to the referenced set.
- If a character set later drops below the minimum valid roster size, rooms depending on that set should be rejected rather than partially repaired.
- The user-facing recovery action for rejected rooms is to create a new room, not to migrate saved data automatically.
- Logging cleanup and production console safety are handled separately in the following Phase 3 spec rather than in this feature.

## Implementation Notes

- `resolveRestorableGeishaSet` no longer defaults an empty snapshot to Ginza; missing `geishaSet` is now rejected as invalid restore data.
- Restore now requires an explicit seven-character board from `snapshot.baseGeishas` or `snapshot.gameState.geishas`; missing-board restore no longer falls back to regenerated room data.
- `validateMatchBoardForSet` now rejects duplicate `characterId` values in addition to mixed sets and duplicate board slots.
- Waiting-room and active-game state builders were consolidated into reusable utility functions so `geishaSet` preservation can be tested without booting the full server.
- Player-visible `pendingInteraction` data is now redacted for non-target participants; they may know an interaction is waiting, but not see offered card contents or competition groups.

## Out of Scope

- Redesigning room UI or adding new in-room character-set labels.
- Adding new character sets beyond `default`, `collaboration`, and `hololive`.
- Cleaning up debug logging or production log verbosity.
- Changing gameplay rules for charm positions, item icons, control scoring, or round resolution.
- Building the lobby-side selector UI for choosing character sets before room creation.
