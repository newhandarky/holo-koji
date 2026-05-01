# Data Model: Fan Player Hand

This feature does not add persistent data, server state, shared types, or network payload fields. The entities below are UI projections of existing client-visible game state.

## Player Hand Card View

Represents one existing card in the current player's visible hand.

**Source fields**:

- `id`: Existing unique hand card id.
- `geishaId`: Existing target position used for charm lookup.
- `itemImageUrl` / fallback item image: Existing card face image.
- `selected`: Existing local UI state derived from the selected-card list.
- `isFocused`: New local UI-only focus state, set by the last clicked card.
- `isNew`: Existing draw highlight state.
- `motionCue`: Existing optional draw motion cue.

**Validation rules**:

- `isFocused` must not be sent to the server.
- Clicking a card toggles `selected` through the existing selection flow and sets `isFocused` to that card.
- When the hand card list changes, selected cards and focus must reset consistently.
- The card image and charm indicator must remain visible enough to identify the card.

## Fan Hand Surface

Represents the active game-room hand area that arranges visible hand cards in a fan.

**Fields**:

- `cardCount`: Number of current player hand cards.
- `focusedCardId`: Local id of the focused card, or absent when no focus is active.
- `layoutMode`: Desktop medium spread or mobile dense spread.
- `fanPositions`: UI-only presentation values per card, such as relative index, angle, offset, and stacking order.

**Validation rules**:

- Must render only the current player's visible hand.
- Must not cause main page horizontal scrolling.
- Must preserve a clickable region for each card.
- Must coexist with action tokens, 007 coverflow, and bottom sheets.

## Focused Hand Card

Represents the one card currently lifted and enlarged inside the fan.

**Fields**:

- `cardId`: Existing hand card id.
- `selected`: Whether the same card is selected for an action.
- `visualPriority`: Higher stacking priority than non-focused cards.

**State transitions**:

- No focus -> card clicked: clicked card becomes focused and toggles selection.
- Card A focused -> card B clicked: focus moves to card B and card B toggles selection.
- Hand changes or selection resets: focus clears or moves to a consistent neutral state.

## Existing State Not Changed

- Card ownership and hand membership.
- Action token state.
- Pending interactions.
- Hidden opponent hand and secret cards.
- Draw pile, discard pile, scoring, round, winner, and turn order.
