# Contract: Hand Action Controls Carousel

This contract defines user-observable UI behavior for 015. It does not add or modify HTTP APIs, Socket.IO events, server payloads, shared types, persistence, or gameplay commands.

## 1. Bottom Action Control Contract

When the user opens the `手牌&指令` section, the UI MUST show exactly four action tokens for `密約`, `取捨`, `贈予`, and `競爭` at the bottom of the section.

The action row MUST:

- occupy the full available hand/actions section width
- divide the row into four equal columns
- remain a single row on tested mobile and desktop widths
- preserve existing available, used, disabled, and inspectable-used visual states
- remain visible when the player cannot act, with all tokens disabled
- use the existing action flow when a valid available token is clicked

The action row MUST NOT:

- change action payload meaning
- bypass server validation
- submit an action while disabled
- reveal hidden opponent information

## 2. Hand Fan Contract

The player hand MUST remain a fan layout.

The fan MUST:

- render only local player's visible hand cards
- avoid whole-page horizontal overflow
- preserve existing draw motion, hand motion cue, and reduced-motion behavior
- keep focused cards visually above neighboring cards
- keep selected-state affordances visible above card artwork

## 3. Hand Focus Carousel Contract

The hand/actions section MUST provide left and right focus controls.

The controls MUST:

- be real keyboard-focusable buttons
- provide clear aria labels
- change only the focused hand card
- not select or deselect cards
- wrap first-to-last and last-to-first

Focus initialization and preservation MUST follow this order:

- first load with cards focuses the middle card
- hand changes preserve the current focused card if it remains in hand
- if the focused card leaves hand, focus moves to the closest remaining card by previous position
- empty hand has no focused card

## 4. Card Click And Selection Contract

Clicking a hand card MUST:

- make that card the focused card
- preserve existing select/deselect toggle behavior
- update the selected card list used by the existing action flow

Clicking a hand card MUST NOT:

- submit an action by itself
- change action validation rules
- change selection count limits

## 5. Selected Check Icon Contract

Every selected hand card MUST show a green check icon at the top-right of the card.

The check icon MUST:

- be 48px
- remain visible when the card is also focused
- avoid obscuring card-critical information so much that the card becomes unidentifiable

## 6. Hidden Information Contract

The hand/actions section MUST NOT reveal:

- opponent hand cards
- opponent secret cards
- opponent pending choices
- unresolved gift or competition selections
- hidden card names, thumbnails, labels, alt text, tooltips, or summaries

## 7. Non-Contract Changes

The implementation MUST NOT change:

- game rules
- scoring
- turn order
- action legality
- Socket.IO events
- server validation
- shared type contracts
- information panel action status from 013
- character coverflow behavior from 014
- gift/competition modal behavior
