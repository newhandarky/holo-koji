# Quickstart: Icon Item Cards

## Goal

Show supported new item types as icons inside an explicit information area on character cards, while keeping current gameplay logic and non-character item-card surfaces unchanged.

## Implementation Outline

1. Audit actual `ItemCard.type` values used for the new items covered by this feature.
2. Create a centralized item-icon mapping that resolves those types into replaceable icon definitions.
3. Derive per-character supported item summaries from existing `playedCards` grouped by `geishaId` and item type.
4. Extend `GeishaCard` to receive or derive the icon summary and render an explicit icon area in the card frame.
5. Update card styling to keep the icon area readable on mobile and desktop.
6. Leave `PlayerHand`, `PendingInteractionModal`, `CompetitionGroupModal`, and `ActionTokens` on the current artwork-based item-card flow.

## Validation

Run:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Notes

- This feature is intentionally narrower than a full item-card icon migration.
- The first icon set may be generic or simple SVG-based, but the mapping must stay replaceable.
- Do not add new server events or gameplay fields for icon rendering in this feature.
- Current audited gameplay item identifiers are the existing `geisha-1` through `geisha-7` card types; hidden placeholder cards are out of scope for icon rendering.
- `PlayerHand`, `PendingInteractionModal`, `CompetitionGroupModal`, and `ActionTokens` intentionally remain on the existing artwork-based item-card flow in this feature.
