# Data Model: 權威開局發牌

## Opening Deal State

Represents the one-time authoritative opening deal result for a round.

Fields:

- `status`: Opening deal lifecycle. Values: `pending`, `completed`.
- `sequenceId`: Stable identifier for the generated opening progress summary.
- `completedAt`: Timestamp or monotonic marker for when opening deal became complete.
- `replayableUntil`: Lifecycle boundary. For this feature, replayable until first actual player action completes.
- `replayable`: Boolean or derived flag indicating whether UI should still replay opening progress.

Validation rules:

- Opening deal can move from `pending` to `completed` only once per round.
- Once completed, reconnect and resend paths must reuse the existing state.
- Duplicate or late order confirmations must not reset this state.
- `replayable` may become false after the first actual player action completes, but that must not alter hands, draw pile, or removed card.

## Hidden Removed Card

Represents the single card excluded from the current game before starting hands are assigned.

Fields:

- `card`: The authoritative card object stored only in server-owned game state.
- `visibility`: Hidden before `phase === 'ended'`; available to settlement after game end.
- `excludedFromGameplay`: Always true for the current round.

Validation rules:

- Exactly one removed card exists for each newly started game.
- Removed card is excluded before starting hands are assigned.
- Removed card does not appear in any player's hand, draw pile, played cards, discarded cards, or secret cards.
- Player-visible active state must not include the card identity.
- Runtime log and diagnostics during active play must not include the card identity.

## Starting Hand

Represents the six private cards assigned to each player at game start.

Fields:

- `playerId`: Player receiving the hand.
- `cards`: Six authoritative item cards.
- `dealOrder`: The per-player deal order indexes from opening progress.

Validation rules:

- Each player receives exactly six cards.
- Cards are assigned in alternating order: first player card 1, second player card 1, repeated until both have six.
- A viewer may see only their own hand faces and opponent hand count.
- Reconnect must not change any starting hand.

## Opening Progress Summary

Represents the safe player-visible progress description for opening deal display and reconnect recovery.

Fields:

- `sequenceId`: Stable sequence identifier.
- `status`: `pending`, `completed`, or `not_replayable`.
- `steps`: Ordered safe steps.
- `completed`: Whether all opening deal steps have been generated.
- `replayable`: Whether UI may replay the opening progress.

Validation rules:

- Summary must contain one hidden-card removal step.
- Summary must contain twelve dealt-card-back steps.
- Summary must contain one completion step or equivalent completed marker.
- Summary must not include `cardId`, `geishaId`, `boardSlotId`, `itemAssetName`, charm value, image URL, or card object references.
- Summary must remain available until the first actual player action completes.

## Opening Progress Step

Represents one safe step in the opening progress summary.

Fields:

- `type`: `BURN_HIDDEN_CARD`, `DEAL_CARD_BACK`, or `OPENING_DEAL_COMPLETE`.
- `order`: Numeric order in the summary.
- `targetZone`: Present for hidden-card removal; value `hidden-reserve`.
- `targetPlayerId`: Present for dealt-card-back steps.
- `cardIndex`: Present for dealt-card-back steps; 1 through 6 for each player.

Validation rules:

- `BURN_HIDDEN_CARD` appears before all deal steps.
- `DEAL_CARD_BACK` steps alternate by confirmed player order.
- `OPENING_DEAL_COMPLETE` appears after both players have six card-back steps.
- No step includes card-face identity or image data.

## Player-Visible Game State

Represents the game state shaped for a specific viewer.

Fields:

- `players`: Viewer sees own hand faces; opponent hands and hidden zones are masked by count or placeholder.
- `drawPile`: Empty or count-only player-visible representation.
- `removedCard`: Hidden during active play; available only through ended settlement summary.
- `openingDeal`: Safe opening progress summary.
- `pendingInteraction`: Existing per-viewer sanitized pending interaction.

Validation rules:

- Viewer-specific state must be generated from authoritative server state.
- Opponent hand faces, secret cards, pending choice details, draw pile contents, and removed-card identity remain hidden during active play.
- Ended settlement summary may include removed-card identity without making active-play state unsafe.

## Ended Settlement Summary

Represents end-of-game data available to the settlement screen.

Fields:

- `removedCard`: The previously hidden removed card identity.
- `winner`: Existing winner information.
- `scores`: Existing scoring summary.

Validation rules:

- `removedCard` is available only after game phase is ended.
- This feature only provides the data boundary; settlement screen design and layout are out of scope.
