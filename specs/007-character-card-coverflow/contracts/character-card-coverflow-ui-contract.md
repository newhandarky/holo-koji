# UI Contract: Character Card Coverflow

This contract defines the observable room-UI behavior for the 007 character-card redesign. It is not a network or Socket.IO contract.

## Scope

- Applies only to the active game-room character-card browsing surface.
- Replaces the old static character-card rows with one ordered coverflow strip.
- Redesigns the character-card face while preserving synced gameplay meaning.
- Does not change hand layout, action payloads, modals, scoring, or win/loss logic.

## Coverflow Contract

Given the active game room is visible:

- Exactly seven character cards are rendered in one coverflow browsing surface.
- The coverflow is manual only and never auto-plays.
- The user can change focus by drag/swipe and by left/right navigation controls.
- Drag/swipe and left/right navigation controls wrap between first and last cards.
- Navigation controls are placed at the left and right sides of the character-card browsing surface.
- Mobile view shows one primary center card with partial neighboring cards visible.
- Desktop view shows one primary center card with about two neighboring cards visible on each side.
- Card order follows charm value ascending and preserves stable order for ties.

## Card Face Contract

Given a character card is rendered:

- The old `未掌控` display block is absent.
- The old standalone item-information block is absent.
- A dark translucent top-left overlay shows character name, charm value, and board-slot item icon.
- A bottom split band shows self count on the left in blue and opponent count on the right in red.
- Bottom counter text does not wrap.

## Border State Contract

Given a character card has a synced persisted control owner from a carried-over unresolved match:

- Self-controlled cards show a 3px blue border.
- Opponent-controlled cards show a 3px red border.
- Cards without persisted authoritative control do not show a camp border.
- Temporary in-round conditions do not change border color before round resolution updates synced control state.

## Negative Contract

The implementation must not:

- Add or change Socket.IO event names or payload shapes.
- Recompute authoritative control state locally in a way that bypasses synced server meaning.
- Redesign player hand, gift modal, competition modal, or action-token flow.
- Change game rule legality, scoring, turn order, or hidden-information boundaries.
