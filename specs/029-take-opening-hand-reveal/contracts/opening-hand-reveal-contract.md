# Contract: 拿取開局手牌與翻面揭示

## Scope

This contract defines frontend presentation behavior for the viewer's own opening hand after the opening deal modal completes. It does not add server mutations or change authoritative game rules.

Out of scope:

- New Socket.IO event or acknowledgement.
- Server-persisted taken-hand state.
- Opening deal modal behavior from 028.
- Skip button behavior.
- Opponent hand reveal.
- Draw notification focus changes.
- Settlement screen design.

## Input: Current Viewer-Safe Game State

The feature consumes the already legal viewer-safe state:

```json
{
  "phase": "playing",
  "openingDeal": {
    "sequenceId": "opening-room-abc-round-1",
    "status": "completed",
    "completed": true,
    "replayable": true
  },
  "players": [
    {
      "id": "viewer",
      "hand": ["viewer own legal card objects"]
    },
    {
      "id": "opponent",
      "hand": [
        { "id": "hidden-opponent-hand-0", "type": "hidden" }
      ]
    }
  ]
}
```

Rules:

- The viewer's own legal hand may exist in state before the take presentation completes.
- Pre-take UI must render the viewer's own opening hand through safe placeholders/card backs only.
- Opponent hand, hidden reserve, removed card, draw pile, and pending hidden choices remain governed by viewer-safe game-state contracts.
- The feature must not send any take-hand completion event.

## Eligibility Contract

The `拿取手牌` gate may be shown only when all conditions are true:

- opening deal presentation/source state is completed enough for gameplay to be visible
- current game phase is `playing`
- viewer's own hand contains the starting 6 cards
- current player has not used any visible action marker
- no pending interaction exists for the current room/player
- local page-session state has not already completed reveal for the current eligible opening state

The gate must be skipped when any condition is false.

Reconnect/refresh rule:

- Local taken state is not persisted across refresh/reconnect.
- If eligibility is still true after refresh/reconnect, the take-hand flow may be shown again.
- Re-showing the flow must not re-deal, duplicate cards, change ownership, or reveal hidden information.

## Concealment Contract

Before the player activates `拿取手牌`, the viewer's own opening hand display, DOM text, accessibility labels, test ids, logs, and image references must not include:

- card id
- `geishaId`
- `boardSlotId`
- `itemAssetName`
- `itemLabel`
- `itemImageUrl`
- `itemIconUrl`
- charm value
- full card object content

Allowed pre-take display:

- card backs
- generic placeholders
- card count
- generic text indicating that opening hand is ready to take

## Take And Reveal Behavior

Rules:

- `拿取手牌` must be activatable by mouse, touch, and keyboard.
- Normal motion reveals the viewer's own hand one card at a time in current hand order.
- Reduced motion may directly show the completed revealed state.
- Reveal must preserve card count, order, identity, ownership, and existing action availability rules.
- Normal reveal should complete within 3 seconds.
- Reduced motion reveal must complete within 1 second or directly complete.

## Interaction Contract

While the flow is pending take or revealing:

- hand selection must not trigger
- hand commands must not trigger
- gameplay actions must not trigger
- repeated activation must not duplicate reveal or send actions
- non-destructive UI section navigation may remain available

After reveal completes:

- existing legal action availability applies unchanged
- the UI must switch or focus to `手牌&指令`
- no action is automatically submitted

## Forbidden State Changes

The feature must not:

- change server phase
- change turn order
- change player hand ownership
- change draw pile or removed card
- create a new hidden card
- mark opening deal replayability on the server
- change scoring or settlement
- mutate shared type payload shape

## Validation Contract

Minimum validation must cover:

- eligible state shows `拿取手牌` before own hand faces
- pre-take output does not contain forbidden own-card identity fields
- activation supports keyboard and pointer-equivalent user paths
- normal reveal follows current hand order
- reduced motion completes directly or within 1 second
- pending/revealing states block hand selection, hand commands, and gameplay actions
- non-destructive section navigation remains available during reveal
- reveal completion switches or focuses to `手牌&指令`
- refresh/reconnect can re-present the local gate without duplicating cards or changing state
- non-eligible current game state skips the gate
