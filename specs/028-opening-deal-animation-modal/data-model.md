# Data Model: 開局發牌動畫 Modal

## Opening Deal Modal State

Represents local UI state for whether the opening deal modal should be shown for a safe opening sequence.

Fields:

- `sequenceId`: Stable identifier from server-provided safe opening progress.
- `status`: `idle`, `playing`, `completed`, or `skipped_not_replayable`.
- `startedAt`: Local timestamp when modal presentation begins.
- `completedAt`: Local timestamp when auto-close completes.
- `replayable`: Whether the current safe opening progress may be replayed.
- `reducedMotion`: Whether condensed presentation should be used.

Validation rules:

- Modal opens only when `openingDeal.replayable === true` and safe steps are present.
- Modal must not send completion or mutation events to the server.
- Modal auto-closes after completion.
- Modal blocks underlying UI interaction while `status === 'playing'`.
- If `openingDeal.status === 'not_replayable'` or `replayable === false`, modal must not force replay.

## Opening Deal Modal Step

Represents one display step derived from safe opening progress metadata.

Fields:

- `type`: `BURN_HIDDEN_CARD`, `DEAL_CARD_BACK`, or `OPENING_DEAL_COMPLETE`.
- `order`: Numeric step order.
- `targetZone`: `hidden-reserve` for hidden burn.
- `targetPlayerId`: Player receiving a card back for deal steps.
- `cardIndex`: 1 through 6 for each player on deal steps.
- `viewerRole`: `self`, `opponent`, or `neutral`, derived only for layout labels/direction.
- `delayMs`: Local presentation delay.
- `durationMs`: Local presentation duration.

Validation rules:

- Steps must preserve server-provided order.
- Steps must not include card ids, geisha ids, charm values, image URLs, labels, or full card objects.
- Deal steps must render as card backs only.
- Hidden burn step must render as a card back moving to a reserve position.

## Card Back Theme

Represents the visual definition for card backs used by opening deal modal.

Fields:

- `id`: Stable theme id, initially `default-ginza`.
- `label`: Human-readable internal label.
- `visualStyle`: Theme descriptor or asset reference for the card back.
- `geishaSet`: Optional supported set key for future theme mapping.

Validation rules:

- First theme must visually fit the Ginza nighttime style.
- Theme must not reference face-up item or character card content.
- Theme must be reusable for central deck, hidden reserve, and dealt card backs.
- Replacing the theme must not require changing opening deal rules.

## Modal Interaction Boundary

Represents the local interaction lock created by the modal overlay.

Fields:

- `isBlocking`: Boolean indicating whether underlying UI interaction is blocked.
- `blockedScope`: `gameplay-ui`.
- `releaseCondition`: `modal-auto-close`.

Validation rules:

- Blocking affects only local UI interaction behind the modal.
- Blocking must not change server turn, action availability, or game phase.
- Blocking ends when the modal auto-closes.

## Replay Memory

Represents local page-session memory used to avoid repeated playback for the same sequence unless reconnect supplies replayable progress.

Fields:

- `sequenceId`: Opening deal sequence id.
- `completed`: Whether this page session completed the modal for the sequence.
- `completedAt`: Local completion timestamp.

Validation rules:

- Replay memory is local presentation state only.
- Reconnect with replayable progress may play from the beginning.
- Not-replayable progress must bypass full modal playback.
