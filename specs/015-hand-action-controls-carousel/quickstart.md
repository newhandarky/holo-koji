# Quickstart: Hand Action Controls Carousel

## Preconditions

- Branch: `015-hand-action-controls-carousel`
- 011 game room focus layout is integrated.
- 012 game room section tabs are integrated.
- 013 game info action status panel is integrated.
- 014 character card visual refinement is integrated.
- UI visual validation is performed by the user.

## Implementation Steps

1. Inspect the current `手牌&指令` render path in `GameBoard`, `ActionTokens`, and `PlayerHand`.
2. Confirm implementation remains frontend-only; do not edit `server/` or `game-shared-types/` for 015.
3. Move/style `ActionTokens` so the four actions render as the bottom full-width four-column row inside `手牌&指令`.
4. Preserve existing action token used/available/disabled states and existing secret/trade-off replay inspection behavior.
5. Ensure action tokens remain visible but disabled when the player cannot act.
6. Add previous/next hand focus controls to the hand fan area using keyboard-focusable buttons with aria labels.
7. Implement focus wrapping from first-to-last and last-to-first.
8. Implement initial focus on the middle hand card.
9. Preserve focused card across hand changes when the card remains; otherwise focus nearest remaining card.
10. Keep card click behavior as select/deselect and also make the clicked card focused.
11. Add the 48px green selected check icon to selected hand cards.
12. Update CSS so the focused card stays visually above overlapping cards and selected check state remains visible.
13. Verify draw motion, hand motion cue classes, and reduced-motion behavior remain usable.
14. Verify no opponent hidden hand, secret, or pending interaction information is rendered through the hand/actions section.

## Automated Validation

Run from repository root:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual UI Validation

The user should check one mobile-width viewport and one desktop-width viewport:

- `手牌&指令` shows four action tokens at the bottom as one full-width four-column row.
- The action row remains visible but disabled while waiting for the opponent.
- Available action tokens still trigger the same existing action flow.
- Used token states remain visually identifiable.
- Left/right hand focus buttons are visible, keyboard-focusable, and have accessible labels.
- Keyboard check: using `Tab` reaches both focus buttons; `Enter`/`Space` triggers the same previous/next behavior as click.
- Pressing right on the last hand card wraps to the first card.
- Pressing left on the first hand card wraps to the last card.
- Left/right focus changes do not alter selected card count.
- First hand load focuses the middle card.
- Clicking a hand card focuses it and toggles selected state.
- Selected cards show a 48px green check icon at top-right.
- Focused and selected states are both visible when the same card has both states.
- The hand fan remains usable without whole-page horizontal overflow.
- Draw motion, hand motion cues, and reduced-motion presentation remain usable.
- Focus transition timing check (normal motion): previous/next focus change appears complete within approximately 250ms.

## Expected Non-Changes

- No `server/` changes.
- No `game-shared-types/` changes.
- No Socket.IO contract changes.
- No gameplay rule, scoring, turn order, action legality, or server validation changes.
- No information panel action status redesign.
- No character coverflow redesign.
- No gift/competition modal redesign.
