# Data Model: Character Set Expansion

## CharacterSet

Represents a selectable group of character profiles used to populate the seven board positions for a match.

### Fields

- `key`: Stable set key. Allowed values for this spec are `default`, `collaboration`, and `hololive`.
- `displayName`: User-facing set name. Expected values are Ginza, 擅自合作系列, and Hololive.
- `characters`: Ordered pool of character profiles available for random board selection.
- `available`: Derived availability. A set is available only when it has at least seven valid character profiles.

### Validation Rules

- `key` must be unique.
- `key` must be one of the supported values.
- `characters` must contain at least seven entries before the set can be used to create or restore a match.
- Character sets with fewer than seven characters must not be selectable or usable for restoration.

## CharacterProfile

Represents a character identity that can be placed into a board position.

### Fields

- `characterId`: Stable identity unique within all supported character sets.
- `setKey`: Character set that owns the profile.
- `name`: Display name shown on the character card.
- `imageUrl`: Remote display image URL.

### Validation Rules

- `characterId`, `name`, and `imageUrl` are required.
- `characterId` must be unique across supported sets to avoid snapshot ambiguity.
- `name` should preserve planning data except for obvious formatting errors; `、マリン` is normalized to `マリン`.
- `imageUrl` must be a non-empty URL string.

## BoardPosition

Represents one of the seven fixed gameplay positions.

### Fields

- `slotId`: Stable position identifier.
- `slotOrder`: Position order on the board.
- `charmPoints`: Charm value for the position.
- `itemAssetName`: Stable item identity for cards generated from this position.
- `itemLabel`: Display label for the item.
- `itemImageUrl`: Display image for item cards.
- `itemIconUrl`: Compact icon used on character cards.

### Validation Rules

- There must be exactly seven board positions.
- Charm distribution remains `2,2,2,3,3,4,5`.
- Board positions remain independent of character set.

## MatchBoard

Represents the seven board positions populated with selected characters for a single match.

### Fields

- `geishaSet`: Selected character set key.
- `geishas`: Seven board-position records containing `id`, `characterId`, `boardSlotId`, `name`, `imageUrl`, `charmPoints`, and `controlledBy`.

### Validation Rules

- `geishas.length` must be exactly seven.
- Every `geisha.characterId` must belong to `geishaSet`.
- Every `boardSlotId` must be unique and map to one board position.
- Unresolved next rounds clone the same seven board records and preserve `controlledBy`.
- User-initiated rematches regenerate a fresh board from the same `geishaSet`.

## RoomSnapshot

Represents persisted room state that may be restored.

### Fields

- `roomId`: Stable room identifier.
- `geishaSet`: Selected character set key for the room.
- `baseGeishas`: Initial board for rematch regeneration context.
- `gameState.geishaSet`: Selected set stored in game state.
- `gameState.geishas`: Current board state.

### Validation Rules

- Snapshot set key must be supported and available.
- Snapshot boards referencing unsupported or unavailable sets must be rejected.
- Restoration must not silently fallback to Ginza.
- Restoration should preserve selected set on both room and game state.
