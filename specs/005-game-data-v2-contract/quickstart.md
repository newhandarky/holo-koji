# Quickstart: Game Data v2 Contract

## Goal

Verify that the default match path now uses Ginza-backed server data, emits complete display-only item payloads, preserves unresolved-round continuity, and reshuffles on rematch without changing gameplay rules.

## Preparation

1. Install dependencies if the workspace is not already prepared.
2. Ensure both root app and server can run with the current branch.
3. Use the existing lobby `default` option; this feature changes the backing data, not the visible selector.

## Suggested Validation Flow

1. Run focused automated coverage for Ginza setup logic.
2. Start a local game and create a default match.
3. Confirm the board contains seven Ginza characters with charm order `2,2,2,3,3,4,5`.
4. Inspect one or more synced `ItemCard` objects and confirm they contain:
   - `geishaId`
   - `boardSlotId`
   - `itemAssetName`
   - `itemLabel`
   - `itemImageUrl`
   - `itemIconUrl`
5. Play or simulate an unresolved round transition and confirm the same seven characters remain in the same board slots.
6. Trigger rematch after match end and confirm setup runs again with a fresh random selection.

## Required Checks

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Focused Regression Areas

- No fallback to legacy default data when Ginza setup is active.
- Existing card action flows still work because `geishaId` remains the rule-facing identifier.
- Current UI still renders names, images, and card surfaces without requiring the future `007` / `008` redesigns.
