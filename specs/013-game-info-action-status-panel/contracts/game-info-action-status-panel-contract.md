# Contract: Game Info Action Status Panel

This contract defines user-observable UI behavior for 013. This spec does not add or modify HTTP APIs, Socket.IO events, server payloads, shared types, or persistence contracts.

## 1. Information Panel Contract

When the user opens the `資訊` tab in a playable room, the information panel MUST show:

- local player identity
- local turn status
- current player name
- a clear `離開遊戲` button
- both player summaries
- each player's four action status icons

The panel MUST NOT replace the `角色` or `手牌&指令` tab content.

## 2. Status Row Contract

The information panel MUST include a full-width two-part status row:

- Left side: `當前玩家: {name}` as information only.
- Right side: a clearly identifiable `離開遊戲` button.

The left side MUST NOT be clickable.

The `離開遊戲` button MUST use the existing confirmation behavior. Until the user confirms, the player remains in the current room.

## 3. Action Status Contract

Each player summary MUST show exactly four action icons:

- `密約`
- `取捨`
- `贈予`
- `競爭`

Each icon MUST show whether the action has been used.

Used and unused icons MUST be visually distinguishable.

## 4. Replay Eligibility Contract

Only these icons are replay-eligible:

- local player's used `密約`
- local player's used `取捨`

All other icons MUST be status-only:

- local unused `密約`
- local unused `取捨`
- local `贈予`
- local `競爭`
- all opponent action icons

Status-only icons MUST NOT open empty replay content and MUST NOT submit gameplay actions.

## 5. Inline Replay Contract

When the local player's used `密約` icon is selected:

- The information panel shows an inline replay area below the local player's action icon row.
- The replay area shows the 1 card selected for `密約`.

When the local player's used `取捨` icon is selected:

- The information panel shows an inline replay area below the local player's action icon row.
- The replay area shows the 2 cards selected for `取捨`.

At most one replay area may be visible at a time. Selecting another eligible replay icon replaces the current replay content.

If the user switches away from `資訊` and later returns, the current replay content remains visible.

## 6. Hidden Information Contract

The information panel MUST NOT reveal:

- opponent hand cards
- opponent secret cards
- opponent discarded selections that are not already visible
- opponent pending choices
- unresolved gift or competition selections
- hidden card names, thumbnails, labels, alt text, tooltips, or summaries

Opponent action icons may only communicate used/unused status.

## 7. Non-Contract Changes

The implementation MUST NOT change:

- game rules
- scoring
- turn order
- action legality
- action payload meaning
- rematch behavior
- server validation
- Socket.IO event names or payloads
- shared game data schemas
- gift / competition modal data flow
- hand/action command behavior in `手牌&指令`
