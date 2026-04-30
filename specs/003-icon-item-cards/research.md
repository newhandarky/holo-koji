# Research: Icon Item Cards

## Decision 1: Use existing `ItemCard.type` / identifier data as the icon source
- Decision: Derive item icons from existing `ItemCard.type` values, with `geishaId` kept for placement on the correct character card.
- Rationale: This satisfies the clarified requirement to avoid adding new rule-bearing fields and keeps the feature display-only.
- Alternatives considered:
  - Add explicit `iconKey` fields to item data: rejected because it expands gameplay data for a display concern.
  - Create a separate server-provided display payload: rejected because spec `003` is intentionally scoped to current client-visible identifiers.

## Decision 2: Limit `003` to character-card icon areas
- Decision: Only render supported new item icons inside character-card information areas in this feature.
- Rationale: The user clarified that broader item-card replacement is not yet required and that the immediate goal is showing which item corresponds to which character.
- Alternatives considered:
  - Replace all item-card surfaces now: rejected because it would expand scope to hand cards, modals, and action previews.
  - Add only tiny decorative markers: rejected because the user wants a clearly visible icon block.

## Decision 3: Keep existing hand/modal item artwork flows unchanged
- Decision: Do not migrate `PlayerHand`, `PendingInteractionModal`, `CompetitionGroupModal`, or `ActionTokens` away from `getGeishaCardImageById` in this feature.
- Rationale: Those components currently encode a separate item-card presentation system; changing them would mix `003` with a larger item-surface redesign.
- Alternatives considered:
  - Migrate all item-card renderers to icons in parallel: rejected due to scope and validation cost.

## Decision 4: Use a replaceable default icon set for v1
- Decision: Start with a centralized, replaceable icon set based on generic icons or simple custom SVGs.
- Rationale: This delivers the mapping and layout system first while preserving a path to later art-directed icons or tooling.
- Alternatives considered:
  - Block implementation until final custom icon art exists: rejected because it would stall the feature for a non-blocking asset dependency.
  - Use placeholder boxes only: rejected because it weakens readability and the user asked for usable icons now.

## Decision 5: Compute character-card icon summaries from existing board card ownership
- Decision: Build the icon area from existing player `playedCards` grouped by `geishaId` and `type`.
- Rationale: The board already derives ownership counts from `playedCards`, so using the same source avoids new server requirements and keeps icon summaries aligned with scoring state.
- Alternatives considered:
  - Introduce a separate board summary model: rejected because it duplicates existing game state derivation.
