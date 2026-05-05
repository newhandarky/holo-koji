# Research: Custom Character Selection

## Decision: Represent setup mode explicitly

**Rationale**: Room creation needs to distinguish random setup from custom setup even when a set has exactly seven available profiles and both modes yield the same roster. A `random` or `custom` setup mode keeps room snapshots, rematches, and validation understandable.

**Alternatives considered**: Inferring custom setup from the presence of selected character IDs was rejected because exactly-seven sets may preselect all profiles and would otherwise be ambiguous. Adding separate room types was rejected because the feature should preserve existing room creation flows.

## Decision: Submit custom selection as character IDs only

**Rationale**: The clarified spec says the room creator chooses the seven characters but does not choose board positions. Stable `characterId` values express display identity without letting the client bind a character to charm or item strength.

**Alternatives considered**: Submitting full character records was rejected because the server already owns canonical character data. Submitting board slot assignments was rejected because it would turn character identity into a gameplay rule.

## Decision: Keep board-position assignment server-owned

**Rationale**: Existing rules bind charm values and item/icon identity to board positions. The server can build a board from the selected seven characters by assigning them to the existing ordered board slots through the same setup path used by random generation.

**Alternatives considered**: Preserving client selection order as board order was rejected because it gives the creator implicit control over charm and item placement. Fixed alphabetical ordering was rejected because it would make custom boards predictable and unrelated to room setup intent.

## Decision: Persist custom setup for rematch and restore

**Rationale**: Rematches in custom rooms must reuse the same seven selected characters, and restored rooms must validate stale selections. Persisting setup mode and selected character IDs in room snapshots makes this behavior explicit and recoverable.

**Alternatives considered**: Persisting only the generated board was rejected because rematches need the custom pool separate from one match's current board-position assignment. Requiring users to recreate custom selections after reconnect was rejected because it breaks room continuity.

## Decision: Preselect all profiles for exactly-seven pools

**Rationale**: Current supported sets may have exactly seven profiles. Requiring seven manual clicks adds work without giving a real choice. Preselection keeps custom mode testable today and naturally becomes selective when pools exceed seven profiles.

**Alternatives considered**: Hiding custom mode for exactly-seven pools was rejected because it makes the feature unavailable in current data. Requiring manual selection was rejected because it creates unnecessary friction.
