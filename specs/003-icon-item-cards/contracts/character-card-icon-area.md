# Contract: Character Card Icon Area

## Purpose

Define what the character card must receive and render for supported item icons in this feature.

## Inputs

- Character card identity:
  - `geisha.id`
  - `geisha.name`
- Existing ownership summaries already used by the card:
  - current player item counts
  - opponent item counts
- New derived display summary:
  - supported item icon entries associated with the character

## Rendering Rules

1. The icon area must be explicit and visibly part of the character-card information frame.
2. The icon area must represent supported item-to-character relationships, not generic decoration.
3. If multiple supported item entries exist for the same character, the area must show them in a consistent grouped layout.
4. The icon area must remain readable on current mobile card sizes.
5. The icon area must not replace or alter the existing gameplay ownership logic.

## Minimum Display Semantics

For each supported entry, the UI must communicate:
- item identity
- association with the current character
- enough supporting cue to distinguish entries when more than one icon is shown

## Empty / Fallback States

- If a character has no supported item icons, the card may show an empty state or reserve the space with no entries.
- If an icon definition is missing, the card must render a fallback treatment that preserves readability.
