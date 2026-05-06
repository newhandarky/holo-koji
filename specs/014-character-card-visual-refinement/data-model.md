# Data Model: Character Card Visual Refinement

This feature does not add persisted entities, server fields, Socket.IO payloads, or shared type fields. It refines UI-facing derived models for the character section.

## Character Section

Represents the active `角色` tab content.

Fields:

- `orderedGeishas`: existing visible `Geisha[]`, sorted by charm and board slot.
- `activeGeishaIndex`: local UI index for the focused coverflow card.
- `positionItemIcons`: derived item icon definitions keyed by field position.
- `coverflowState`: local UI state for active, adjacent, and distant slide presentation.

Validation rules:

- Must render only from client-visible game state and local UI state.
- Must not submit gameplay actions.
- Must not reveal opponent hidden card identity.
- Must not introduce whole-page horizontal overflow.

## Character Card

Represents one visible field position in the coverflow.

Fields:

- `geisha`: existing visible `Geisha`.
- `positionIndex`: resolved field position/order for icon lookup.
- `isFocused`: whether this card is the active coverflow card.
- `myCount`: visible count of local played cards on this geisha.
- `opponentCount`: visible count of opponent played cards on this geisha.
- `itemIcon`: always-visible position item icon definition.
- `charmValue`: existing position charm value from `Geisha.charmPoints`.
- `controlState`: none, local controlled, or opponent controlled, derived only from `Geisha.controlledBy`.

Validation rules:

- Focused card artwork must prioritize full image visibility.
- Non-focused cards must preserve coverflow depth, overlap, and side visibility.
- The old `魅力 {value}` text badge must not render.
- `controlState` must not be recalculated from temporary card counts.

## Position Item Icon

Represents the item identity tied to a field position, independent of current item ownership.

Fields:

- `positionIndex`: stable field position key.
- `definition`: existing frontend-visible item icon definition.
- `imageUrl`: existing icon URL when available.
- `fallbackGlyph`: existing fallback glyph when image is unavailable.
- `label`: icon label for accessible display.

Relationships:

- A `Character Card` has exactly one `Position Item Icon` while the character section is visible.
- The icon is position-bound, not character-bound and not ownership-bound.

Validation rules:

- Must be derived only from existing frontend-visible data.
- Must remain visible even if neither player currently owns the corresponding item card.
- Must render at 48px.
- Must not add a border or background fill.

## Charm Number Badge

Represents the charm value displayed on top of the position item icon.

Fields:

- `value`: existing `Geisha.charmPoints`.
- `position`: top-right of the associated item icon.

Validation rules:

- Must show number only.
- Must use a circular red background with white text.
- Must remain legible on mobile and desktop.

## Removed Character Command Icons

Represents the removed visual row that previously appeared above the character coverflow.

Validation rules:

- Only the character-section top command/action icons are removed.
- Information panel action status icons remain unchanged.
- Hand/action controls remain unchanged.

## State Transitions

```text
activeGeishaIndex = N
  -> next button / swipe left
  -> activeGeishaIndex = (N + 1) % total

activeGeishaIndex = N
  -> previous button / swipe right
  -> activeGeishaIndex = (N - 1 + total) % total

any activeGeishaIndex
  -> ordinary game state update
  -> preserve active index where possible; clamp only when visible geisha count changes
```

No transition may send gameplay actions, change room state, or reveal hidden information.
