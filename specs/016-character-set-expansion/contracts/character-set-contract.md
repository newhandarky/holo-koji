# Contract: Character Set Expansion

## Supported Character Sets

| Set Key | Display Name | Meaning |
|--------|--------------|---------|
| `default` | Ginza | Existing Ginza character set and default behavior |
| `collaboration` | 擅自合作系列 | Phase 3 collaboration character set |
| `hololive` | Hololive | Phase 3 Hololive character set |

## Room Creation Contract

Room creation may include a `geishaSet` value.

```json
{
  "type": "CREATE_ROOM",
  "payload": {
    "playerId": "player-name-or-id",
    "mode": "online-or-npc-mode",
    "aiDifficulty": "optional-npc-difficulty",
    "geishaSet": "default | collaboration | hololive"
  }
}
```

### Rules

- Missing `geishaSet` means `default`.
- Supported set keys are `default`, `collaboration`, and `hololive`.
- Unsupported set keys must be rejected.
- Character sets with fewer than seven valid characters must be rejected or treated as unavailable.
- Rejection must not create a room with fallback Ginza data.

## Game State Contract

Every game state sent to the client includes or preserves the selected set.

```json
{
  "geishaSet": "default | collaboration | hololive",
  "geishas": [
    {
      "id": 1,
      "characterId": "set-specific-character-id",
      "boardSlotId": 1,
      "name": "display name",
      "imageUrl": "https://...",
      "charmPoints": 2,
      "controlledBy": null
    }
  ]
}
```

### Rules

- `geishas` must contain exactly seven records.
- `characterId`, `name`, and `imageUrl` come from the selected character set.
- `id`, `boardSlotId`, `charmPoints`, item card copy counts, item image URLs, and item icon URLs remain board-position based.
- Client consumers must not normalize `collaboration` or `hololive` back to `default`.

## Next-Round Contract

When a round ends without a match winner:

- The next round keeps the same `geishaSet`.
- The next round keeps the same seven `characterId` values in the same board positions.
- Existing `controlledBy` values are preserved.
- Item deck generation remains based on board positions.

## Rematch Contract

When a user intentionally starts a rematch after a completed match:

- The rematch keeps the same `geishaSet`.
- The board is regenerated from that set.
- The rematch must not switch to Ginza unless the user starts a new flow that explicitly selects Ginza.

## Snapshot Restore Contract

When restoring a saved room snapshot:

- `snapshot.geishaSet` or `snapshot.gameState.geishaSet` must be supported and available.
- Unsupported, removed, unknown, or fewer-than-seven sets must be rejected.
- Restore must not silently fallback to Ginza.
- Restored room state and restored game state must preserve the same selected set.

## Error Contract

Unsupported or unavailable character-set errors should produce a user-facing recovery path equivalent to: create a new match.

Error messages should not expose hidden cards, pending choices, opponent hand details, or raw internal state.
