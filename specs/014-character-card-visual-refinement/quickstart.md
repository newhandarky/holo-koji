# Quickstart: Character Card Visual Refinement

## Preconditions

- Branch: `014-character-card-visual-refinement`
- 012 game room section tabs are integrated.
- 013 game info action status panel is integrated.
- UI visual validation is performed by the user.

## Implementation Steps

1. Inspect the current `角色` section in `GameBoard`.
2. Confirm existing frontend-visible data can map seven field positions to item icons without server/shared type changes; if not, stop implementation and report contract gap instead of extending 014 scope.
3. Remove only the command/action icon row above the character coverflow.
4. Keep information panel action status icons and hand/action controls unchanged.
5. Replace ownership/known-card item icon inference with a position-based item icon mapping.
6. Pass the resolved position item icon and focused-card state into each character card.
7. Update character card markup so the old `魅力 {value}` text badge is removed.
8. Render charm value as a number badge on the top-right of the item icon.
9. Update CSS for focused image containment, background fill, 16px bold name, shortened diagonal overlay, 48px borderless item icon, and red circular charm badge.
10. Verify control-border styling still depends only on already controlled character state.
11. Verify coverflow navigation, drag/swipe, looping, and side-card overlap still work.
12. Verify the character section does not reveal hidden card identities.

## Automated Validation

Run from repository root:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual UI Validation

The user should check one mobile-width viewport and one desktop-width viewport:

- Opening `角色` shows no old four command/action icons above the coverflow.
- Focused character card artwork is more complete and does not crop the main subject just to fill the frame.
- Non-focused cards still overlap and remain partially visible as coverflow context.
- Left/right buttons still loop from first to last and last to first.
- Manual drag/swipe still switches cards.
- Character name appears as 16px bold.
- Top-left dark diagonal information area is shorter and blocks less image content.
- Old `魅力 {value}` text badge is absent.
- Each position shows a 48px item icon with no border or background fill.
- Charm number appears as a red circular badge on the top-right of the item icon.
- Item icon remains visible even when neither player owns that position's item card.
- Existing control borders are not added or changed during the current round based only on temporary counts.
- Information panel action status and hand/action controls remain available in their own tabs.

## Expected Non-Changes

- No `server/` changes.
- No `game-shared-types/` changes.
- No Socket.IO contract changes.
- No gameplay rule, scoring, rematch, random character, or item generation changes.
- No information panel action status redesign.
- No hand/action controls carousel work.
