# Contract: 權威開局發牌

## Scope

This contract formalizes opening deal state and player-visible payload boundaries. It may extend existing game-state sync events instead of adding a new Socket.IO event. Any new event or payload field must remain safe for both online and NPC rooms.

Out of scope:

- Opening animation modal UI.
- Card back assets.
- `拿取手牌` UI.
- Skip button behavior.
- Settlement screen layout.

## Authoritative State Rules

Rules:

- Opening deal starts only after both players confirm the order decision.
- Server removes exactly one hidden card before assigning starting hands.
- Server deals exactly six cards to each player.
- Deal order alternates by confirmed player order:
  - first player card 1
  - second player card 1
  - repeat until both players have six cards
- Opening deal completion is one-time per round.
- Reconnect, resend, duplicate confirmation, or late confirmation must not regenerate removed card, draw pile, or starting hands.
- Server game rules may enter playable state after opening deal completes; UI animation, skip, or `拿取手牌` decisions do not block server rule state.

## Player-Visible Game State

During active play, a viewer-safe game state must not include:

- `removedCard` identity
- draw pile card identities
- opponent hand card identities
- opponent secret card identities
- pending gift or competition hidden details
- opening deal step card identities

Allowed during active play:

```json
{
  "phase": "playing",
  "players": [
    {
      "id": "viewer",
      "hand": ["viewer card objects"]
    },
    {
      "id": "opponent",
      "hand": [
        { "id": "hidden-opponent-hand-0", "type": "hidden" }
      ],
      "secretCards": []
    }
  ],
  "drawPile": [],
  "removedCard": null,
  "openingDeal": {
    "sequenceId": "opening-room-abc-1",
    "status": "completed",
    "completed": true,
    "replayable": true,
    "steps": ["safe opening steps only"]
  }
}
```

Rules:

- The current viewer may receive their own hand card faces after server state is legal for them.
- Opponent hands are represented by masked cards or count-equivalent placeholders.
- `removedCard` remains `null` or absent before the ended settlement summary.

## Opening Progress Summary

Safe summary example:

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
      "type": "DEAL_CARD_BACK",
      "order": 2,
      "targetPlayerId": "player2",
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

- Summary must include exactly one `BURN_HIDDEN_CARD` step.
- Summary must include twelve `DEAL_CARD_BACK` steps for two-player games.
- `DEAL_CARD_BACK` steps must alternate by confirmed player order.
- Summary must include an explicit completion marker or `completed: true`.
- Summary must not include:
  - `cardId`
  - `geishaId`
  - `boardSlotId`
  - `itemAssetName`
  - `itemLabel`
  - `itemImageUrl`
  - `itemIconUrl`
  - charm value
  - full card objects
- Summary remains replayable until the first actual player action completes; after that it may be removed or returned as `status: "not_replayable"`.

## GAME_STARTED / GAME_STATE_UPDATED Usage

Rules:

- Existing `GAME_STARTED` and `GAME_STATE_UPDATED` payloads may carry the viewer-safe game state with `openingDeal`.
- If a dedicated opening event is added, it must carry the same safe summary shape and no card identities.
- Client must treat all opening progress as display-only. It must not send card choices or state mutations based on opening progress.
- Server remains authoritative if client misses, skips, or replays the summary.

## Reconnect Contract

Rules:

- Before first actual player action completes, reconnecting players may receive replayable safe opening progress.
- After first actual player action completes, reconnecting players may receive only current legal visible state or a non-replayable opening marker.
- Reconnect must not:
  - re-run order decision
  - remove a different hidden card
  - re-deal starting hands
  - reveal removed card before game end

## Ended Settlement Summary

Ended game state or settlement summary may include the removed card:

```json
{
  "phase": "ended",
  "winner": "player1",
  "settlement": {
    "removedCard": {
      "id": "item-7-2",
      "geishaId": 7,
      "type": "item",
      "boardSlotId": 7,
      "itemAssetName": "sake_07",
      "itemLabel": "Sake 07",
      "itemImageUrl": "https://example.test/item.png",
      "itemIconUrl": "https://example.test/icon.png"
    }
  }
}
```

Rules:

- Removed card identity is allowed only after game phase is ended.
- This contract provides data availability only; settlement screen design is out of scope.
- Runtime log and diagnostics should still avoid logging full card identity unless a future audit-specific spec explicitly allows it.

## Runtime Logging And Diagnostics

Allowed active-play log context:

```json
{
  "roomId": "ABC123",
  "openingDealStatus": "completed",
  "removedCardPresent": true,
  "openingDealStepCount": 14,
  "openingDealReplayable": true
}
```

Forbidden active-play log context:

```json
{
  "removedCard": {
    "id": "item-7-2"
  },
  "steps": [
    {
      "card": {
        "id": "item-1-1"
      }
    }
  ]
}
```
