# Contract: Character Card UI

## Scope

This contract defines expected UI behavior for board character cards after migrating artwork to server-provided URLs.

## Required Card Content

Each board character card must display:

- Character artwork from `geisha.imageUrl`, or fallback state.
- Character name from `geisha.name`.
- Charm score from `geisha.charmPoints`.
- Current player's item count for that character.
- Opponent's item count for that character.
- Existing ownership/control indication.

## Visual Rules

- Artwork frame uses a 9:16 ratio.
- Artwork fills the frame.
- Non-9:16 artwork is center-cropped.
- Fallback state uses the same 9:16 footprint.
- Card frame remains readable on mobile and desktop.

## Interaction Rules

- Character card rendering must not change action availability.
- Character card rendering must not dispatch game actions.
- Image loading failure must not block the user from continuing the game.

## Out Of Scope

- Item icon replacement.
- Motion animation.
- New game interactions on the character card.
