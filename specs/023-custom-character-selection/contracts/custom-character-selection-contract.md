# Contract: Custom Character Selection

## Scope

This contract extends room creation and room snapshot setup data. It does not add a new Socket.IO event. Existing clients that omit custom setup fields continue to create rooms with random setup.

## CREATE_ROOM Payload

Random setup request:

```json
{
  "playerId": "host",
  "mode": "online",
  "geishaSet": "hololive",
  "setupMode": "random"
}
```

Custom setup request:

```json
{
  "playerId": "host",
  "mode": "online",
  "geishaSet": "hololive",
  "setupMode": "custom",
  "customSelection": {
    "characterIds": [
      "hololive-raden",
      "hololive-iroha",
      "hololive-miko",
      "hololive-fubuki",
      "hololive-ayame",
      "hololive-ina",
      "hololive-mio"
    ]
  }
}
```

Rules:

- Missing `setupMode` is treated as `random`.
- `customSelection` is used only when `setupMode` is `custom`.
- Custom mode requires exactly seven unique `characterIds`.
- Every selected ID must belong to `geishaSet` and be currently available.
- The payload must not include board slot assignments.
- The server generates the authoritative board and assigns board positions.

## ROOM_CREATED And Game State

`ROOM_CREATED` may keep the existing payload shape:

```json
{
  "roomId": "ABC123",
  "playerId": "host"
}
```

The authoritative generated board is delivered through the existing game-state sync path:

```json
{
  "geishaSet": "hololive",
  "geishas": [
    {
      "id": 1,
      "characterId": "hololive-raden",
      "boardSlotId": 1,
      "name": "らでん",
      "imageUrl": "https://example.test/character.png",
      "charmPoints": 2,
      "controlledBy": null
    }
  ]
}
```

Rules:

- Joiners receive the same room-generated board state as the creator.
- Board records remain public room state.
- No opponent hands, secret cards, removed card details, or pending-choice data are added to setup payloads.

## Rematch

Rules:

- Random setup rooms keep existing rematch behavior.
- Custom setup rooms reuse the stored seven selected character IDs.
- A rematch may reassign those seven characters to different board positions.
- The creator cannot assign board positions through rematch payloads.

## Room Snapshot

Custom snapshot setup fields:

```json
{
  "geishaSet": "hololive",
  "setupMode": "custom",
  "customSelection": {
    "characterIds": [
      "hololive-raden",
      "hololive-iroha",
      "hololive-miko",
      "hololive-fubuki",
      "hololive-ayame",
      "hololive-ina",
      "hololive-mio"
    ]
  },
  "baseGeishas": ["valid selected board cast"],
  "gameState": {
    "geishaSet": "hololive",
    "geishas": ["valid selected board cast"]
  }
}
```

Restore rejection cases:

- Unsupported or missing `geishaSet`.
- Unknown `setupMode`.
- Custom mode with missing, duplicate, fewer than seven, or more than seven selected IDs.
- Custom selected ID outside the selected set.
- Custom selected ID no longer available.
- Saved board records that do not match the selected set or saved custom setup.

## Lobby UI Contract

Rules:

- Random setup remains available and is the compatibility default.
- Custom setup shows available character profiles for the selected set.
- When the selected set has exactly seven profiles, custom mode preselects all seven.
- The creator sees selected count and room creation readiness.
- Room creation is disabled in custom mode until exactly seven valid profiles are selected.

## Implementation Notes

- Character profile pools are canonical in `game-shared-types`; server validation and frontend Lobby selection helpers consume the shared runtime data.
- Server validation is implemented through setup-mode and custom-selection helpers before room state is created.
- Random setup remains the default when `setupMode` is omitted or set to `random`; `customSelection` is ignored outside custom mode.
- Custom room snapshots store setup mode and selected character IDs at the room snapshot level, while public game state continues to expose only the generated board state.
- Runtime logging summarizes `setupMode` and `geishaSet` only; it does not log selected character ID arrays or hidden game data.
