# Data Model: Motion Game Actions

## Existing Domain Entities

### GameState
- Source: `game-shared-types/src/game.types.ts`
- Relevant fields:
  - `players`
  - `geishas`
  - `pendingInteraction`
  - `lastAction`
  - `phase`
- Role in this feature:
  - Supplies the confirmed state before and after a gameplay change.

### ItemCard
- Source: `game-shared-types/src/game.types.ts`
- Relevant fields:
  - `id`
  - `geishaId`
  - `type`
- Role in this feature:
  - Used to infer whether a card was drawn, played, offered, grouped, or newly associated with a geisha area.

### PendingInteraction
- Source: `game-shared-types/src/game.types.ts`
- Variants:
  - `GIFT_SELECTION`
  - `COMPETITION_SELECTION`
- Role in this feature:
  - Defines the visible interaction zones that can participate in approximate motion paths.

## New Frontend-Only Display Models

### MotionCue
- Type: frontend-only derived model
- Proposed fields:
  - `id: string`
  - `kind: 'draw' | 'placement' | 'gift-result' | 'competition-result' | 'count-update'`
  - `sourceZone: MotionZone`
  - `targetZone: MotionZone`
  - `cardIds: string[]`
  - `geishaIds: number[]`
  - `reducedMode: boolean`
- Purpose:
  - Represents one motion effect derived from a confirmed state change.

### MotionZone
- Type: frontend-only derived model
- Proposed fields:
  - `key: string`
  - `kind: 'hand' | 'board-geisha' | 'gift-modal' | 'competition-modal' | 'summary'`
  - `playerSide?: 'self' | 'opponent'`
  - `geishaId?: number`
- Purpose:
  - Describes the semantic source or destination area for approximate motion.

### MotionSnapshot
- Type: frontend-only derived model
- Proposed fields:
  - `handCardIds: string[]`
  - `playedByGeisha: Record<number, string[]>`
  - `pendingInteractionType: string | null`
  - `phase: string`
- Purpose:
  - Captures a reduced view of prior confirmed state so the next state can be compared efficiently.

## Derivation Rules

1. Store the previous confirmed gameplay snapshot.
2. On each relevant confirmed update, compare previous and current snapshots.
3. Detect added/removed cards in the hand, board ownership summaries, and interaction zones.
4. Convert those changes into one or more `MotionCue` records.
5. Render motion cues with normal or reduced-motion behavior depending on user preference.

## Failure Handling

- Missing exact source coordinates: fall back to a semantic source zone.
- Multiple simultaneous changes: queue or batch motion cues in a deterministic order.
- Reduced motion enabled: convert travel into low-motion emphasis cues.
