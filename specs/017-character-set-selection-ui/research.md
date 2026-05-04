# Research: Character Set Selection UI

## Decision: Use a simple text-based selector in the existing Lobby creation area

**Rationale**: The spec explicitly limits this feature to adding selection capability without redesigning the overall lobby. A simple selector inside the current room-creation surface keeps implementation narrow, matches the existing match-mode choice pattern, and reduces layout risk on mobile.

**Alternatives considered**:

- Preview cards with images for each set. Rejected because the user chose a lightweight selector and the spec excludes a broader lobby redesign.
- A separate settings or mode screen. Rejected because the current lobby remains the single required entry point.

## Decision: Keep one shared character-set selection across online and NPC creation modes

**Rationale**: The user confirmed that switching between online and NPC should preserve the chosen set. One shared pre-room selection state avoids duplicated logic, avoids resetting user intent, and keeps both room-creation modes aligned.

**Alternatives considered**:

- Reset to Ginza on each mode switch. Rejected because it creates friction and can silently discard the user’s last choice.
- Maintain one separate selection per mode. Rejected because it increases state complexity without improving the core flow.

## Decision: Do not add a character-set selector to the join-room flow

**Rationale**: Joining players do not determine the room’s set. Showing a selector in the join-room area would either be misleading or purely decorative. Keeping join-room focused on room code and player identity preserves clarity.

**Alternatives considered**:

- Show a disabled selector in join-room. Rejected because it adds noise without influencing behavior.
- Show an active selector that is ignored. Rejected because it creates a false expectation.

## Decision: Do not add a new dedicated in-room label for the active character set

**Rationale**: The user explicitly decided that the room should not gain an extra set label because the character area itself already communicates the active set. This keeps 017 focused on pre-room choice rather than room-surface metadata.

**Alternatives considered**:

- Add a room-level badge or header label. Rejected because it duplicates information the user considers already visible in the room.
- Add a one-time toast after room creation. Rejected because it still adds scope without functional value.

## Decision: Keep unavailable sets visible but disabled

**Rationale**: A disabled option communicates that the set is a recognized part of the system but not currently selectable. This matches the clarified spec and is safer than hiding supported options, which can make UI behavior appear inconsistent with documentation or future expectations.

**Alternatives considered**:

- Hide unavailable sets entirely. Rejected because it obscures supported-but-temporarily-unavailable categories.
- Allow selection and fail only on submit. Rejected because it creates avoidable user error and weakens the lobby contract.
