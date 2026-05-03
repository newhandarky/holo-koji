# Data Model: Hand Action Controls Carousel

This feature does not add persisted entities, server fields, Socket.IO payloads, or shared type fields. It refines UI-facing local state and derived presentation models for the `手牌&指令` section.

## Hand/Actions Section

Represents the active `手牌&指令` tab content.

Fields:

- `handCards`: existing visible local player's `ItemCard[]`.
- `actionTokens`: existing local player's `ActionToken[]`.
- `canAct`: existing UI capability flag derived from turn and blocking interaction state.
- `selectedCards`: local UI list of cards selected for the pending action submission.
- `focusedCardId`: local UI card ID currently emphasized in the fan carousel.
- `motionCues`: existing draw/hand motion cues passed into the hand display.
- `prefersReducedMotion`: existing user motion preference.

Validation rules:

- Must render only local player's hand cards.
- Must not reveal opponent hand cards, secret cards, pending choices, or unrevealed selections.
- Must not change action payloads, server validation, or shared types.
- Must not introduce whole-page horizontal overflow.

## Hand Focus State

Represents the carousel focus inside the fan hand.

Fields:

- `focusedCardId`: `string | null`, local only.
- `focusedIndex`: derived from `focusedCardId` and current `handCards`.
- `previousFocusedIndex`: transient reference used to choose nearest fallback when the focused card leaves the hand.

State transitions:

- First load with cards: focus the middle card.
- Previous control: focus previous card and wrap first-to-last.
- Next control: focus next card and wrap last-to-first.
- Card click: focus clicked card and toggle selected state.
- Hand change while focused card remains: preserve focus.
- Hand change after focused card leaves: focus nearest remaining card by previous index.
- Empty hand: focused state becomes null.

Validation rules:

- Focus controls must not select or deselect cards.
- Focused card must visually appear above overlapping cards.
- Focus updates should complete within the spec's normal-motion target.

## Selected Hand Card

Represents a card selected for the next action.

Fields:

- `card`: existing `ItemCard`.
- `isSelected`: derived from `selectedCards` membership.
- `isFocused`: derived from `focusedCardId`.

Validation rules:

- Clicking a card toggles selected state and makes it focused.
- Left/right focus controls preserve selected membership.
- Selected card displays a 48px green check icon at top-right.
- Check icon must not make card identity, charm value, or key text unidentifiable.

## Bottom Action Control Row

Represents the bottom row of four action tokens.

Fields:

- `tokens`: existing `ActionToken[]` for `密約`, `取捨`, `贈予`, `競爭`.
- `disabled`: true when the player cannot act.
- `usedCards`: existing replay/inspection cards for eligible used actions.
- `status`: available, used, disabled, or inspectable-used.

Validation rules:

- Always render as one full-width row split into four equal columns.
- Remain visible when disabled.
- Preserve existing used/available/disabled cues.
- Clicking available tokens uses existing action flow.
- Disabled tokens must not submit actions.
- Must not change server payload meaning.
