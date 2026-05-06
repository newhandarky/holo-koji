# Contract: 開局發牌動畫 Modal

## Scope

This contract defines how the frontend opening deal modal consumes safe opening progress and what it may display. It does not add a new server mutation and does not alter authoritative opening deal rules from 027.

Out of scope:

- `拿取手牌` button.
- Starting hand flip animation.
- Skip button behavior.
- Draw notification focus control.
- Settlement UI.

## Input: Safe Opening Progress

The modal may use `openingDeal` from viewer-safe game state:

```json
{
  "sequenceId": "opening-room-abc-round-1",
  "status": "completed",
  "completed": true,
  "replayable": true,
  "steps": [
    {
      "type": "BURN_HIDDEN_CARD",
      "order": 0,
      "targetZone": "hidden-reserve"
    },
    {
      "type": "DEAL_CARD_BACK",
      "order": 1,
      "targetPlayerId": "player1",
      "cardIndex": 1
    },
    {
      "type": "OPENING_DEAL_COMPLETE",
      "order": 13
    }
  ]
}
```

Rules:

- Modal must treat `openingDeal.steps` as display-only metadata.
- Modal must not send card choices or state mutations from opening progress.
- Modal may use `sequenceId` to determine whether a local presentation has already completed.
- Modal should play from the beginning on reconnect when `replayable === true`.
- Modal must not force full replay when `status === "not_replayable"` or `replayable === false`.

## Forbidden Display Data

Modal display, DOM text, accessibility labels, logs, and test ids must not include:

- removed card identity
- player hand card ids
- draw pile card ids
- `geishaId`
- `boardSlotId`
- `itemAssetName`
- `itemLabel`
- `itemImageUrl`
- `itemIconUrl`
- charm value
- full card objects

## Modal Behavior

Rules:

- Modal opens when new replayable safe opening progress is available.
- Modal displays:
  - central deck
  - hidden reserve destination
  - first-player direction
  - second-player direction
  - card-back movement for 1 burn step and 12 deal steps
  - completion state
- Modal blocks interaction with underlying gameplay UI while visible.
- Modal auto-closes after completion.
- Modal auto-close must not change server rule state.
- After auto-close, the page shows the current legal visible game state; own hand visibility follows existing legal flow until 029 changes it.

## Reduced Motion Behavior

Rules:

- Reduced motion must show the same conceptual sequence or completed state.
- Reduced motion must avoid large movement.
- Reduced motion presentation must complete within 2 seconds.
- Reduced motion must not reveal any additional card information.

## Legacy DEAL_ANIMATION Compatibility

Rules:

- If existing `DEAL_ANIMATION` data is still received, it must not become the source of card faces for the modal.
- The modal should prefer `openingDeal` safe summary when available.
- Any compatibility path must mask cards and obey the same forbidden display data rules.

## Card Back Theme

Initial theme:

```json
{
  "id": "default-ginza",
  "label": "Default Ginza Card Back",
  "style": "dark base with warm/gold line details"
}
```

Rules:

- Card back theme is reusable for central deck, reserve card, and dealt backs.
- Card back theme must be visually distinct from face-up character/item cards.
- Future theme replacement must not require changing opening deal payloads.

## Validation Contract

Minimum validation must cover:

- modal opens from replayable `openingDeal`
- burn step renders before deal steps
- deal steps alternate first/second player direction until six each
- all modal cards are backs
- behind-modal UI does not receive interaction
- modal auto-closes
- reduced motion path completes quickly
- replayable reconnect starts from beginning
- not-replayable state skips full modal replay
- no forbidden card identity appears in rendered modal output
