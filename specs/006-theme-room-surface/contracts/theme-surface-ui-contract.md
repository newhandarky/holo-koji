# UI Contract: Theme Surface

This contract defines the observable UI behavior for the 006 visual shell. It is not a network, Socket.IO, or shared-type contract.

## Scope

- Applies to all app pages.
- Requires the active game-room main surface to stop presenting a large solid white panel.
- Preserves readable local content panels.
- Does not change game state, player actions, room flow, or realtime payloads.

## Full-App Background Contract

Given any app route is loaded:

- The page background displays a Ginza v2 black-red-black diagonal theme.
- The theme direction reads from upper-left to lower-right.
- The background is visible behind page content.
- The background remains present during loading, waiting-room, and active gameplay states.

## Room Main Surface Contract

Given the active game-room view is rendered:

- The main gameplay surface does not appear as a large solid white card.
- The Ginza v2 background is clearly visible through or around the main gameplay surface.
- The board, player status, action tokens, hand area, pending interactions, and round summary remain in their existing flow.
- Mobile width does not introduce horizontal overflow for primary gameplay controls.

## Readability Contract

Given content appears over the Ginza v2 background:

- Lobby forms and room controls remain readable and usable.
- Dialogs, modals, popovers, summaries, and status panels may keep local readable backgrounds.
- Item cards and geisha cards retain their current readability treatments.
- Text, badges, and buttons remain visually distinguishable on desktop and mobile widths.

## Negative Contract

The implementation must not:

- Add or change Socket.IO events.
- Change server game state or shared type payloads.
- Change card ownership, hidden information boundaries, action legality, scoring, or win/loss behavior.
- Redesign character cards, item cards, hand layout, coverflow, or interaction modals.
