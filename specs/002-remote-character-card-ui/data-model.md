# Data Model: Remote Character Card UI

## Entity: Geisha

Represents a board character used for both gameplay state and display.

### Existing Fields

- `id: number`: Gameplay identifier used by item cards and scoring.
- `name: string`: Character display name.
- `charmPoints: number`: Score value and deck-copy count.
- `controlledBy: PlayerId | null`: Current controlling player.

### Added / Formalized Display Field

- `imageUrl: string`: Display-only artwork URL provided by server-owned character data.

### Validation Rules

- `imageUrl` must be present for every geisha created by server character data.
- `imageUrl` must be treated as display-only.
- Missing, empty, or failed `imageUrl` must render a readable fallback using `name` and `charmPoints`.
- `imageUrl` must not be used for scoring, action validation, item ownership, or win-condition logic.

## Entity: Character Card Frame

Represents the client-side visual card container for a geisha.

### Display Fields

- `artworkUrl`: sourced from `Geisha.imageUrl`.
- `name`: sourced from `Geisha.name`.
- `charmPoints`: sourced from `Geisha.charmPoints`.
- `myItemCount`: count of current player's played item cards for this geisha.
- `opponentItemCount`: count of opponent's played item cards for this geisha.
- `controlledBy`: sourced from `Geisha.controlledBy`.

### Validation Rules

- Artwork area preserves 9:16 ratio.
- Non-9:16 source images are center-cropped.
- Item information is limited to ownership/count summary.
- The frame must remain readable on mobile and desktop.

## Entity: Fallback Character State

Represents the UI state shown when artwork is missing, still loading, or failed.

### Display Fields

- `name`
- `charmPoints`
- Optional neutral visual placeholder

### Validation Rules

- Fallback state must keep the card identifiable.
- Fallback state must not block gameplay actions.
- Fallback state must preserve the same 9:16 frame footprint.

## Relationships

- `GameState.geishas[]` contains `Geisha` records.
- `ItemCard.geishaId` links item cards to `Geisha.id`.
- `Character Card Frame` derives display-only item counts from player `playedCards`.
- `Fallback Character State` derives identity from the same `Geisha` record.

## State Transitions

No gameplay state transition changes are introduced.

- `controlledBy` continues to change only during existing round scoring.
- Item counts continue to derive from existing player card collections.
- `imageUrl` is static for a geisha within a selected character set.
