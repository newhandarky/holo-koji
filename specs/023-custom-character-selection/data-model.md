# Data Model: Custom Character Selection

## Character Set

Represents one selectable group for room creation.

Fields:

- `key`: Stable set key. Current values are `default`, `collaboration`, and `hololive`.
- `displayName`: Player-facing label.
- `availableProfiles`: Character profiles currently valid for room setup.

Validation rules:

- Unknown set keys are rejected.
- Custom selection cannot mix profiles from multiple sets.
- Supported set choices are not added, removed, or renamed by this feature.

## Character Profile

Represents one selectable display character.

Fields:

- `characterId`: Stable unique identity within a character set.
- `name`: Display name.
- `imageUrl`: Display image.

Validation rules:

- `characterId`, `name`, and `imageUrl` are required.
- Character IDs must be unique within a set.
- Unavailable or stale character IDs cannot be selected.

## Room Setup

Represents the creator's room creation choices.

Fields:

- `geishaSet`: Selected character set.
- `setupMode`: Either `random` or `custom`.
- `customSelection`: Present only when setup mode is `custom`.

Validation rules:

- `random` setup ignores custom selection input and uses the existing random seven-character rule.
- `custom` setup requires exactly seven valid unique character IDs from the selected set.
- Join-room payloads do not include or change room setup.

State transitions:

- Room creation: setup mode is validated and stored before initial board generation.
- Rematch: random rooms follow existing random setup; custom rooms reuse the stored seven selected IDs and may reassign board positions.
- New room setup flow: creator may choose a different set or selection.

## Custom Selection

Represents the creator-chosen roster for one custom room.

Fields:

- `characterIds`: Exactly seven stable character IDs from the selected set.

Validation rules:

- Exactly seven IDs.
- All IDs unique.
- Every ID belongs to the selected character set.
- The selection does not include board position assignment.
- If a set has exactly seven available profiles, all seven are preselected by default but still validated.

## Selected Board Cast

Represents the seven generated board records visible in the room state.

Fields:

- `id`: Board slot ID.
- `characterId`: Selected character identity.
- `boardSlotId`: Board position identity.
- `name`: Display name from selected profile.
- `imageUrl`: Display image from selected profile.
- `charmPoints`: Board-position charm value.
- `controlledBy`: Current control state or `null`.

Validation rules:

- Exactly seven records.
- Character IDs are unique.
- Board slot IDs are unique.
- Charm and item behavior are derived from board position, not character identity.

## Room Snapshot

Represents saved room setup and current room state for restore.

Fields:

- `geishaSet`: Selected character set.
- `setupMode`: `random` or `custom`.
- `customSelection`: Stored custom selected IDs when setup mode is `custom`.
- `baseGeishas`: Current match board base.
- `gameState.geishas`: Current round board state.

Validation rules:

- Custom snapshots must validate stored selected IDs against current set data.
- Stale or invalid custom selections reject restore with a recovery path.
- Public snapshot-derived room state must not include hidden hand, secret, removed-card, or pending-choice details beyond existing sanitized game state.
