# Contract: Character Pool Board Generation

## Scope

This contract documents the existing room setup and restore payload expectations for 022. It does not introduce a new Socket.IO event.

## Supported Character Sets

The only supported `geishaSet` values are:

- `default`
- `collaboration`
- `hololive`

Missing room creation input may normalize to `default`. Unknown, empty, undersized, duplicate, or incomplete sets must be rejected.

## New Match Or Rematch Generation

Input:

```json
{
  "geishaSet": "hololive"
}
```

Output in room/game state:

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

- `geishas` contains exactly seven records.
- `characterId` is unique within the generated board.
- `boardSlotId` is unique within the generated board.
- `characterId` belongs to the selected `geishaSet`.
- `charmPoints`, item card identity, item images, and item icons are derived from `boardSlotId`.
- With exactly seven available profiles, all profiles are selected and assigned to board slots through the randomized setup path.
- With more than seven available profiles, seven profiles are sampled without replacement.

## Next Round Continuation

Input:

```json
{
  "geishaSet": "hololive",
  "baseGeishas": ["existing selected board cast"]
}
```

Rules:

- Do not sample a new board cast for unresolved next rounds.
- Preserve the same seven `characterId` values.
- Preserve the same `boardSlotId` assignments.
- Preserve `controlledBy` state.

## Restore

Accepted snapshot shape:

```json
{
  "geishaSet": "hololive",
  "baseGeishas": ["valid selected board cast"],
  "gameState": {
    "geishaSet": "hololive",
    "geishas": ["valid selected board cast"]
  }
}
```

Rejection cases:

- Missing `geishaSet`.
- Unsupported `geishaSet`.
- Fewer or more than seven board records.
- Duplicate `characterId`.
- Duplicate or unknown `boardSlotId`.
- Character outside the selected set.
- `baseGeishas` and `gameState.geishas` contain different `characterId` to `boardSlotId` assignments when both are present.
- Incomplete profile-derived display data.

## Hidden Information Boundary

Generated board casts are public room state. This contract must not add opponent hand cards, removed cards, secret choices, pending choices, or unrevealed action details to any character-pool payload.
