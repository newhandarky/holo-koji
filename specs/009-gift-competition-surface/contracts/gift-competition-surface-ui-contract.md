# UI Contract: Gift Competition Surface Polish

This contract defines observable UI behavior for the 009 gift and competition surface polish. It is not a network, server, Socket.IO, or shared type contract.

## Scope

- Applies to gift response, competition grouping, and competition response surfaces.
- Keeps the existing bottom-sheet model.
- Preserves existing click-to-submit behavior.
- Preserves existing card data, action payloads, game rules, server validation, scoring, turn flow, and hidden-information boundaries.

## Gift Response Contract

Given a player must resolve a gift interaction:

- The bottom sheet presents the three offered cards as clear selectable options.
- Each option shows card image and charm value.
- The option has visible hover, press, and keyboard focus feedback.
- Clicking an offered card immediately submits the existing gift resolution for that card.
- No preview selection state or second confirmation step appears.

## Competition Grouping Contract

Given a player starts competition with four selected cards:

- The bottom sheet presents the three valid two-by-two grouping options.
- Each option clearly separates its two groups.
- Each card shows card image and single-card charm value.
- Each group shows a display-only charm total.
- Clicking a方案 submit operation immediately submits the existing competition initiation payload for that方案.
- No grouping option changes the legal card ids or available方案.

## Competition Response Contract

Given a player must resolve a competition interaction:

- The bottom sheet presents the two offered groups as clear selectable options.
- Each group shows card images, single-card charm values, and a display-only group charm total.
- Clicking a group immediately submits the existing competition resolution for that group index.
- No preview selection state or second confirmation step appears.

## Responsive Contract

On mobile-width screens:

- Gift and competition options may wrap or stack inside the bottom sheet.
- Card readability and tappable controls take priority over keeping all options on a single row.
- The main page must not gain horizontal scrolling from these surfaces.
- Internal bottom-sheet vertical scrolling is acceptable when needed.

On desktop-width screens:

- Options should remain easy to compare at a glance.
- Group boundaries and submit controls remain visually associated with their option.

## Compatibility Contract

The implementation must preserve:

- Existing bottom-sheet collapse/expand behavior where present.
- Existing gift-result and competition-result motion hints.
- Existing reduced-motion behavior.
- Existing action button enablement, submission callbacks, and pending-interaction resolution callbacks.
- Hidden-information boundaries for opponent hand cards, secret cards, and unrevealed choices.

## Negative Contract

The implementation must not:

- Add or change Socket.IO event names or payload shapes.
- Add shared type fields.
- Recompute or bypass server-side legality checks.
- Change gift or competition card counts.
- Add a second confirmation step or preview-selected state.
- Replace the bottom-sheet model with a centered modal or full-screen flow.
