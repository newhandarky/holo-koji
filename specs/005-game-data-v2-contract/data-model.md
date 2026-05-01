# Data Model: Game Data v2 Contract

## Existing Domain Entities To Refactor

### Geisha
- Source: `game-shared-types/src/game.types.ts`
- Current fields:
  - `id: number`
  - `name: string`
  - `charmPoints: number`
  - `imageUrl: string`
  - `controlledBy: PlayerId | null`
- Current problem:
  - `id` and array index are overloaded as character identity, board position, charm source, and item lookup key.
- Planned role after `005`:
  - Represent the seven active board slots visible to the game state, still carrying `controlledBy`.
  - Keep the rule-facing `id` used by existing scoring and card-placement logic.
  - Add explicit character display identity and board-slot identity so gameplay and display concerns are no longer inferred from one index.

### ItemCard
- Source: `game-shared-types/src/game.types.ts`
- Current fields:
  - `id: string`
  - `geishaId: number`
  - `type: string`
- Current problem:
  - `type` and `geishaId` are not sufficient to reconstruct position-bound item art once character selection is randomized independently from board slot.
- Planned role after `005`:
  - Preserve rule-bearing card identity and ownership behavior.
  - Carry complete display-only metadata for current and future UI surfaces.

## New Server-Owned Data Sources

### GinzaCharacterRecord
- Type: server setup data
- Proposed fields:
  - `characterId: string`
  - `name: string`
  - `imageUrl: string`
- Validation:
  - Pool size must be `>= 7`.
  - `characterId` must be stable and unique within the Ginza pool.
  - Records do not contain charm or item asset ownership.

### BoardSlotDefinition
- Type: server setup data
- Proposed fields:
  - `slotId: number`
  - `slotOrder: number`
  - `charmPoints: 2 | 3 | 4 | 5`
  - `itemAssetName: string`
  - `itemLabel: string`
  - `itemImageUrl: string`
  - `itemIconUrl: string`
- Validation:
  - Exactly seven definitions exist.
  - `slotOrder` maps left-to-right board order and is unique.
  - Charm distribution across all seven slots must be `2,2,2,3,3,4,5`.
  - `itemAssetName`, `itemLabel`, `itemImageUrl`, and `itemIconUrl` are all required.

## Runtime Entities

### ActiveBoardGeisha
- Type: synced `GameState.geishas[*]` record after setup
- Proposed fields:
  - `id: number`
  - `characterId: string`
  - `boardSlotId: number`
  - `name: string`
  - `imageUrl: string`
  - `charmPoints: number`
  - `controlledBy: PlayerId | null`
- Purpose:
  - Preserve current rule-facing geisha array usage while making character identity and board position explicit.
- Validation:
  - Exactly seven records exist per active match.
  - `id` remains unique within the active board.
  - `boardSlotId` is unique within the active board.
  - `charmPoints` comes from the board slot, not from the character record.

### ItemCardDisplayData
- Type: display-only fields embedded on `ItemCard`
- Proposed fields:
  - `boardSlotId: number`
  - `itemAssetName: string`
  - `itemLabel: string`
  - `itemImageUrl: string`
  - `itemIconUrl: string`
- Purpose:
  - Allow any client surface to render the correct item art and label directly from synced game state.
- Validation:
  - Must align with the board slot associated with `geishaId`.
  - Must not be used for scoring or legal-action checks.

### ItemCard
- Type: shared gameplay entity
- Proposed fields after extension:
  - `id: string`
  - `geishaId: number`
  - `type: string`
  - `boardSlotId: number`
  - `itemAssetName: string`
  - `itemLabel: string`
  - `itemImageUrl: string`
  - `itemIconUrl: string`
- Validation:
  - Number of generated cards for a given `boardSlotId` equals that slot's `charmPoints`.
  - `geishaId` points to the active board geisha occupying the same board slot at setup time.
  - Display fields are required for all Ginza-generated cards.

### DeterministicSetupRandomSource
- Type: server-only setup dependency
- Proposed interface:
  - `nextInt(maxExclusive: number): number`
  - or equivalent injectable shuffle/pick abstraction
- Purpose:
  - Make board selection reproducible in tests without changing production behavior.
- Validation:
  - Same deterministic input must yield the same selected seven characters and board assignment.
  - Absence of injection falls back to normal randomness.

## Relationships

- `GinzaCharacterRecord.characterId` -> `ActiveBoardGeisha.characterId`
- `BoardSlotDefinition.slotId` -> `ActiveBoardGeisha.boardSlotId`
- `ActiveBoardGeisha.id` -> `ItemCard.geishaId`
- `BoardSlotDefinition.slotId` -> `ItemCard.boardSlotId`
- `BoardSlotDefinition.itemAssetName / itemLabel / itemImageUrl / itemIconUrl` -> `ItemCard` display fields

## State / Lifecycle Rules

1. New match setup validates Ginza character pool and all seven board-slot item asset definitions.
2. Server selects seven unique characters from the Ginza pool.
3. Selected characters are assigned to the seven fixed board slots.
4. Active board geishas are created from character display data plus board-slot charm values.
5. Deck generation creates cards per board slot according to slot charm count.
6. Each generated card stores both rule-facing `geishaId` and display-only board-slot/item metadata.
7. If a round ends without a winner, the same active board geishas and `controlledBy` state continue into the next round.
8. If users start a rematch after match end, setup repeats from step 1 with a fresh random selection.

## Failure Handling

- Character pool size `< 7`: reject match setup with a data configuration error.
- Missing slot asset field: reject match setup with a data configuration error.
- Duplicate `characterId` or `slotId`: reject setup as invalid server data.
- Client surfaces still expecting legacy lookup behavior: treat as migration tasks; do not weaken server payload requirements.
