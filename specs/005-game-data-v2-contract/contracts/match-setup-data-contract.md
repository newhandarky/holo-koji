# Contract: Match Setup Data Contract

## Purpose

Define the authoritative server-side match setup shape for the Ginza-backed default mode and the synced display-only item data required by current and future UI surfaces.

## Setup Rules

1. The `default` match path resolves to Ginza data.
2. Setup validates the Ginza character pool and all seven board-slot definitions before creating a match.
3. Setup selects exactly seven unique characters from the Ginza pool.
4. Setup assigns the selected characters to seven fixed board slots with charm distribution `2,2,2,3,3,4,5` from left to right.
5. Setup generates item cards from board slots, not from character records.
6. Each item card count equals its board slot charm value.
7. Invalid Ginza data rejects match creation instead of falling back to legacy data.

## Synced GameState Shape

```ts
interface Geisha {
  id: number;
  characterId: string;
  boardSlotId: number;
  name: string;
  charmPoints: number;
  imageUrl: string;
  controlledBy: 'player1' | 'player2' | null;
}

interface ItemCard {
  id: string;
  geishaId: number;
  type: string;
  boardSlotId: number;
  itemAssetName: string;
  itemLabel: string;
  itemImageUrl: string;
  itemIconUrl: string;
}
```

## Consumer Expectations

- Clients may render character name, charm, portrait, item art, and item icon directly from synced state without local position-to-asset reconstruction.
- `geishaId` remains the rule-facing identifier used by existing gameplay flows.
- Display-only fields must not be used to determine legality, scoring, or turn flow.
- Existing Socket.IO event names remain unchanged; only the synced payload shape expands within the same feature scope.

## Validation Expectations

- New default match returns exactly seven geishas.
- Synced geishas expose charm order `2,2,2,3,3,4,5` by board slot.
- Total generated item cards equals the sum of board-slot charm values.
- Every Ginza item card includes `boardSlotId`, `itemAssetName`, `itemLabel`, `itemImageUrl`, and `itemIconUrl`.
