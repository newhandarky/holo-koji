# Data Model: Character Card Coverflow Redesign

This feature does not introduce new backend entities or shared-type contracts. It defines UI-facing projections built from existing synced `GameState.geishas` and played-card data.

## Character Card View

**Represents**: One rendered character card in the coverflow strip.

**Source Inputs**:

- `Geisha.id`
- `Geisha.name`
- `Geisha.imageUrl`
- `Geisha.charmPoints`
- `Geisha.boardSlotId`
- `Geisha.controlledBy`
- Aggregated self/opponent played-card counts for that geisha
- The board-slot-bound item icon derived from synced item-card display data

**Derived Display Fields**:

- `positionOrder`: stable order derived from `charmPoints` ascending, then board-slot order for ties
- `overlayName`
- `overlayCharmValue`
- `overlayItemIcon`
- `selfCount`
- `opponentCount`
- `persistedControlCamp`: none / self / opponent, based only on synced authoritative control state

**Validation Rules**:

- Exactly seven views render in active game room.
- Views preserve stable ordering for tie charm values.
- The card must not display the old standalone control label block or standalone item section.
- Border state must not be inferred from temporary in-round counts alone.

## Coverflow Strip

**Represents**: The interactive browsing surface containing the seven character cards.

**Attributes**:

- Manual interaction only
- Supports drag/swipe
- Supports left/right navigation controls
- Mobile density: one main center card plus partial neighboring cards
- Desktop density: one main center card plus about two neighboring cards per side

**Validation Rules**:

- No autoplay or automatic focus change
- Current focus card remains readable during navigation
- The strip coexists with existing room scrolling and bottom-sheet/modal interactions

## Top-Left Overlay

**Represents**: The dark translucent triangular overlay in the top-left region of the character card.

**Fields**:

- Character name
- Charm value number
- Board-slot item icon

**Validation Rules**:

- Overlay remains readable on desktop and mobile
- Overlay content comes from synced match display data
- Overlay replaces the old separate item-information surface

## Bottom Counter Band

**Represents**: The full-width split footer on the character card.

**Fields**:

- Left side: self count, blue
- Right side: opponent count, red

**Validation Rules**:

- Each side occupies 50% width
- Combined height is roughly 10% of card height
- Text does not wrap

## State Transitions

No gameplay state transitions change in this feature.

- Browsing between cards changes focus only in the UI layer.
- Active round play remains governed by existing server-synced state.
- Persisted border display changes only when synced authoritative control state changes between rounds.
