# Data Model: Game Info Action Status Panel

This feature does not add persisted entities or shared type fields. It introduces UI-facing derived models based on existing client-visible game state.

## Information Panel

Represents the active `資訊` tab content.

Fields:

- `localPlayerIdentity`: visible local player name and optional avatar.
- `turnStatus`: local turn label such as `你的回合` or `等待對手`.
- `currentPlayerName`: display name for `state.players[state.currentPlayer]`.
- `playerSummaries`: two player summaries derived from `state.players`.
- `expandedReplayAction`: local UI state, one of `secret`, `trade-off`, or `null`.

Validation rules:

- Must only render when the playable room is active and `資訊` is the active section.
- Must not submit game actions.
- Must not reveal opponent hidden card identity.
- Must preserve `expandedReplayAction` when the user switches away from and back to `資訊`.

## Player Summary

Represents one player's public information inside the information panel.

Fields:

- `playerId`: existing player identifier.
- `displayName`: visible player name.
- `avatarUrl`: optional avatar URL.
- `score`: public charm/token score.
- `isCurrentPlayer`: whether this player is the current turn player.
- `isLocalPlayer`: whether this row belongs to the local player.
- `actionStatuses`: exactly four action status icons.

Validation rules:

- Must contain exactly one status for each action type: `secret`, `trade-off`, `gift`, `competition`.
- Opponent summary must not receive or render replay card content.
- Public scores and used/unused token state may be displayed.

## Action Status Icon

Represents one action token in the information panel.

Fields:

- `type`: one of `secret`, `trade-off`, `gift`, `competition`.
- `label`: user-facing action label (`密約`, `取捨`, `贈予`, `競爭`).
- `iconUrl`: existing action icon asset.
- `used`: derived from the matching `ActionToken.used`.
- `replayEligible`: true only when the row is the local player, `used` is true, and `type` is `secret` or `trade-off`.

Validation rules:

- Used and unused states must be visually distinct.
- Status-only icons must not be clickable and must not open empty content.
- Eligible replay icons must not submit gameplay actions.

## Local Action Replay

Represents the inline replay area shown under the local player's action icons.

Fields:

- `actionType`: `secret` or `trade-off`.
- `cards`: existing `ItemCard[]`.
- `displayTitle`: user-facing title for the replay content.

Relationships:

- `secret` replay cards come from local `Player.secretCards`.
- `trade-off` replay cards come from local `Player.discardedCards`.

Validation rules:

- `secret` replay must display exactly 1 card when available.
- `trade-off` replay must display exactly 2 cards when available.
- Replay must use readable card presentation on mobile and desktop.
- Replay must never use opponent `secretCards`, `discardedCards`, hand cards, pending choices, or unresolved interaction data.

## State Transitions

```text
No replay open
  -> select eligible local secret icon
  -> secret replay open

No replay open
  -> select eligible local trade-off icon
  -> trade-off replay open

secret replay open
  -> select eligible local trade-off icon
  -> trade-off replay open

trade-off replay open
  -> select eligible local secret icon
  -> secret replay open

any replay open
  -> switch away from Info tab
  -> replay state retained

replay state retained
  -> return to Info tab
  -> same replay visible
```

No transition may send gameplay actions, change room state, or reveal opponent hidden information.
