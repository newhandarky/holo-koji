# Contract: Item Icon Mapping

## Purpose

Define the frontend-only contract for resolving supported item types into replaceable icon definitions.

## Inputs

- Existing gameplay-visible item identifier:
  - Primary expected source: `ItemCard.type`
  - Supporting placement source: `ItemCard.geishaId`

## Mapping Rules

1. Each supported new item type must map to exactly one icon definition.
2. The mapping must be centralized in one frontend source of truth.
3. Mapping keys must rely on existing gameplay identifiers and must not require new server payload fields.
4. Mapping output must support a later swap from generic icons to custom SVGs without changing consumer call sites.
5. The current audited implementation scope resolves the existing gameplay item types `geisha-1` through `geisha-7`; unknown types must fall back safely.

## Output Shape

```ts
interface ItemIconDefinition {
  key: string;
  label: string;
  kind: 'library' | 'svg';
  iconRef: string;
  fallbackLabel: string;
}
```

## Consumer Expectations

- Character-card rendering can ask for an icon definition by item type.
- Unknown item types must not crash the board.
- Consumers must not treat icon definitions as game-rule data.
