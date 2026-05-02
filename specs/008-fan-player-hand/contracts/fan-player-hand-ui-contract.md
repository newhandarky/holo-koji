# UI Contract: Fan Player Hand

This contract defines observable active game-room UI behavior for the 008 player-hand redesign. It is not a network, server, or Socket.IO contract.

## Scope

- Applies only to the current player's main hand in active game room.
- Keeps interaction-modal card grids and bottom-sheet structures unchanged.
- Preserves existing card selection semantics and action submission behavior.
- Does not change card data, game rules, shared types, or realtime events.

## Fan Layout Contract

Given the active game room is visible and the current player has hand cards:

- The main hand area renders the current player's hand as a fan.
- Desktop layout uses medium spread: cards overlap but each card has a clear clickable region.
- Mobile layout keeps the fan form with denser overlap.
- Hand cards keep a 9:16 card ratio.
- The hand row stays within its parent width; increased spread is achieved through fan spacing, rotation, and overlap rather than a row wider than 100%.
- The hand surface does not cause main page horizontal scrolling.
- Card face image and charm indicator remain identifiable.

## Click And Focus Contract

Given a player clicks a hand card:

- The existing selection state toggles for that card.
- The same clicked card becomes the focused card.
- The focused card lifts and enlarges in its original fan position.
- No separate preview card or new modal appears.
- Clicking another hand card moves focus to that card and toggles that card's selection state.
- When the hand changes or selection resets, focus returns to a consistent neutral state.

## Compatibility Contract

The implementation must preserve:

- Existing selection counts required for secret, trade-off, gift, and competition actions.
- Existing action button enablement and submission behavior.
- Existing draw highlight and draw motion visibility.
- Existing bottom-sheet behavior for draw, gift, competition, pending interaction, and order decision flows.
- Hidden-information boundaries for opponent hand cards, secret cards, and unrevealed choices.

## Negative Contract

The implementation must not:

- Add or change Socket.IO event names or payload shapes.
- Add shared type fields.
- Recompute or bypass server-side legality checks.
- Redesign 007 character-card coverflow.
- Redesign gift, competition, order decision, or pending-interaction modals.
