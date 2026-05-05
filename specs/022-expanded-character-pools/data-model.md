# Data Model: Expanded Character Pools

## Character Set

Represents one selectable room creation identity.

Fields:

- `key`: Stable set key. Current allowed values are `default`, `collaboration`, and `hololive`.
- `label`: Player-facing display label.
- `available`: Derived from pool validity; true only when the set has at least seven valid profiles.

Validation rules:

- Unknown keys are unsupported.
- Supported set choices must not be renamed or expanded by this feature.

## Character Profile

Represents one display character in a set-specific pool.

Fields:

- `characterId`: Stable unique profile ID within the selected set.
- `name`: Display name.
- `imageUrl`: Character image URL or resolvable asset path.

Validation rules:

- `characterId`, `name`, and `imageUrl` are required.
- `characterId` values must be unique within the pool.
- Invalid or incomplete profiles are unavailable.

## Expanded Character Pool

Represents the complete available profile list for a character set.

Fields:

- `setKey`: Character set key.
- `profiles`: Ordered or unordered list of character profiles.

Validation rules:

- Must contain at least seven valid profiles.
- May contain exactly seven profiles in current data.
- May grow beyond seven profiles without changing match setup rules.

## Board Position

Represents one of the seven fixed gameplay slots.

Fields:

- `slotId`: Stable board slot ID.
- `slotOrder`: Display/deck setup order.
- `charmPoints`: Rule-owned charm value.
- `itemAssetName`: Stable item identity.
- `itemLabel`: Player-facing item label.
- `itemImageUrl`: Item card image.
- `itemIconUrl`: Item icon image.

Validation rules:

- Exactly seven board positions must exist.
- Slot IDs and slot orders must be unique.
- Charm distribution must remain `2,2,2,3,3,4,5`.

## Selected Board Cast

Represents one match's seven selected characters assigned to the seven board positions.

Fields:

- `id`: Existing board slot identifier exposed as `Geisha.id`.
- `characterId`: Selected character profile identity.
- `boardSlotId`: Board position identity.
- `name`: Selected character display name.
- `imageUrl`: Selected character image URL.
- `charmPoints`: Board-position charm value.
- `controlledBy`: Player control state or `null`.

Validation rules:

- Exactly seven records.
- Character IDs must be unique.
- Board slot IDs must be unique and known.
- Every character ID must belong to the selected set's pool.
- Charm and item behavior follow `boardSlotId`, not `characterId`.

State transitions:

- New match/rematch: sample seven profiles from the full set pool, assign them to the seven board positions, and reset control state.
- Unresolved next round: clone the existing selected board and preserve control state.
- Restore: accept only snapshots whose selected board validates against the stored selected set.

## Room Snapshot

Represents saved room state for reconnect or restoration.

Fields:

- `geishaSet`: Selected character set key.
- `baseGeishas`: Authoritative selected board cast for the match.
- `gameState.geishas`: Current round board state.

Validation rules:

- `geishaSet` is required for restore.
- `baseGeishas` or `gameState.geishas` must contain a valid selected board cast.
- If both are present, both must validate against the selected set.
