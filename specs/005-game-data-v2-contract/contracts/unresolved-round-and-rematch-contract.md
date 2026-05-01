# Contract: Unresolved Round And Rematch Contract

## Purpose

Define the lifecycle difference between continuing an unresolved match and starting a rematch after match end.

## Rules

1. If a round ends without a winner, the same seven active geishas continue into the next round.
2. When unresolved rounds continue, each geisha keeps its current `id`, `characterId`, `boardSlotId`, and `controlledBy` state.
3. Continuing an unresolved round must not reshuffle characters, reassign board slots, or regenerate a different item-asset mapping.
4. `rematch` means a user-started new match after the previous match has ended.
5. Rematch runs full setup again and selects a new random seven-character board.
6. Deterministic setup injection may be used in tests for both initial setup and rematch validation.

## Consumer Expectations

- UI may preserve color ownership and board continuity across unresolved rounds because the synced board identity remains stable.
- UI must treat rematch as a fresh game-state reset even when players stay in the same room.
- No new Socket.IO lifecycle event names are required for this distinction; current game-state sync and room flow remain the source of truth.

## Validation Expectations

- An unresolved-round continuation keeps the same ordered `geishas[*].id`, `characterId`, and `boardSlotId` values.
- A rematch produces a fresh setup path and may return a different ordered seven-character board.
- Existing control state survives unresolved continuation but resets through normal new-match setup on rematch.
