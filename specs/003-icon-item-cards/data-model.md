# Data Model: Icon Item Cards

## Existing Domain Entities

### ItemCard
- Source: `game-shared-types/src/game.types.ts`
- Fields used by this feature:
  - `id: string`
  - `geishaId: number`
  - `type: string`
- Role in this feature:
  - `type` or the existing item identifier selects the icon.
  - `geishaId` determines which character card receives the icon.
- Validation notes:
  - Supported new item types must have stable string values that can be mapped consistently.
  - Unknown item types must degrade gracefully rather than breaking rendering.

### Geisha
- Source: `game-shared-types/src/game.types.ts`
- Fields used by this feature:
  - `id: number`
  - `name: string`
  - `charmPoints: number`
  - `imageUrl: string`
  - `controlledBy: PlayerId | null`
- Role in this feature:
  - Hosts the new icon area and receives icon summaries based on related item cards.

### Player
- Source: `game-shared-types/src/game.types.ts`
- Fields used by this feature:
  - `playedCards: ItemCard[]`
- Role in this feature:
  - Provides the existing board-resolved item ownership data used to derive which icons appear for each character.

## New Display Entities

### ItemIconDefinition
- Type: frontend-only display model
- Proposed fields:
  - `key: string`
  - `label: string`
  - `kind: 'library' | 'svg'`
  - `iconRef: string`
  - `fallbackLabel: string`
- Purpose:
  - Centralize the icon metadata for each supported item type.
- Validation notes:
  - Every supported new item type must resolve to exactly one definition.
  - The definition must remain replaceable without rule or contract changes.

### GeishaItemIconSummary
- Type: derived frontend-only view model
- Proposed fields:
  - `geishaId: number`
  - `entries: GeishaItemIconEntry[]`

### GeishaItemIconEntry
- Type: derived frontend-only view model
- Proposed fields:
  - `itemType: string`
  - `definitionKey: string`
  - `owner: 'self' | 'opponent' | 'shared-summary'`
  - `count: number`
- Purpose:
  - Represent the icon entries shown inside a character-card icon area.
- Validation notes:
  - Entries are grouped from existing `playedCards` by `geishaId` and item identity.
  - If the same supported item appears multiple times, the UI must show a count or repeated icon treatment consistently.

## Relationships

- `Player.playedCards[*].geishaId` -> `Geisha.id`
- `Player.playedCards[*].type` -> `ItemIconDefinition.key` or mapping lookup source
- `Geisha.id` -> `GeishaItemIconSummary.geishaId`

## State / Derivation Rules

1. Start from current board-visible item ownership data (`playedCards`).
2. Filter or group only the supported item types covered by this spec.
3. Group entries by `geishaId`.
4. Within each character, group by existing item identity (`type` or selected identifier).
5. Resolve each group through the centralized icon mapping.
6. Render the resulting entries in the character-card icon area.

## Failure Handling

- Unsupported item type: show a generic fallback icon/label or omit from the explicit icon area according to final design choice in tasks.
- Empty supported items for a character: character card may show an empty icon area state or no entries, but layout should remain stable.
- Duplicate or inconsistent type values: treat as mapping-audit issues to resolve in implementation tasks rather than changing game rules.
