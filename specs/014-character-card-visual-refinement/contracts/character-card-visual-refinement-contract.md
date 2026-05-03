# Contract: Character Card Visual Refinement

This contract defines user-observable UI behavior for 014. It does not add or modify HTTP APIs, Socket.IO events, server payloads, shared types, persistence, or gameplay commands.

## 1. Character Section Contract

When the user opens the `角色` tab in a playable room, the character section MUST show the character coverflow without the previous top-row four command/action icons above it.

The section MUST preserve:

- left/right coverflow buttons
- manual drag or swipe
- first-to-last and last-to-first looping
- partial side-card visibility
- existing section tab behavior
- blocking overlay priority

## 2. Focused Card Image Contract

The focused character card MUST prioritize full image visibility.

If the image ratio does not fill the card frame, the UI MAY use intentional empty space or background fill.

The focused card MUST NOT crop the main character subject merely to fill the frame.

## 3. Non-Focused Card Contract

Non-focused cards MUST prioritize coverflow depth, overlap, and side-card visibility.

Non-focused cards are not required to show the full artwork as completely as the focused card.

## 4. Card Chrome Contract

Each character card MUST:

- show the character name at 16px bold
- shorten the top-left dark diagonal information area from the right side by approximately 40%
- remove the old `魅力 {value}` text badge
- show the position item icon at 48px
- show no added item icon border or background fill
- show the charm value as a red circular number badge on the top-right of the item icon

## 5. Position Item Icon Contract

Each visible field position MUST show its associated item icon whenever the character section is visible.

The item icon MUST NOT depend on whether either player currently owns the corresponding item card.

The item icon MUST be derived only from existing frontend-visible data. If this cannot be satisfied, implementation MUST stop and report the missing contract instead of changing server payloads or shared types in 014.

## 6. Control Border Contract

Control border color MUST remain based on already controlled character state from visible game state.

The character section MUST NOT add or change a border mid-round merely because temporary card counts currently satisfy a control condition.

## 7. Hidden Information Contract

The character section MUST NOT reveal:

- opponent hand cards
- opponent secret cards
- opponent pending choices
- unresolved gift or competition selections
- hidden card names, thumbnails, labels, alt text, tooltips, or summaries

Position item icons and charm numbers may show only public position-level information.

## 8. Non-Contract Changes

The implementation MUST NOT change:

- game rules
- scoring
- turn order
- action legality
- random character selection
- item card generation
- rematch behavior
- server validation
- Socket.IO events or payloads
- shared game data schemas
- information panel action status
- hand/action controls
