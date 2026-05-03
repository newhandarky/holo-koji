# Quickstart: Game Info Action Status Panel

## Preconditions

- Branch: `013-game-info-action-status-panel`
- 012 game room section tabs are integrated.
- UI visual validation is performed by the user.

## Implementation Steps

1. Locate the existing `資訊` section content in the active game room.
2. Move local player identity and turn status into the top of the information panel.
3. Add the two-part status row:
   - left: `當前玩家: {name}` information only
   - right: clear `離開遊戲` button using existing confirmation behavior
4. Remove the old standalone bottom `離開遊戲` primary control from normal playable room display.
5. Add both player summaries with exactly four action status icons.
6. Render used and unused action states distinctly.
7. Make only local used `密約` and local used `取捨` icons replay-eligible.
8. Render local replay inline below the local player's action icons.
9. Keep at most one replay visible; selecting another eligible icon replaces the content.
10. Preserve the current replay selection when leaving and returning to `資訊`.
11. Verify opponent icons never reveal hidden card details.
12. Verify no server, shared type, Socket.IO, action payload, or game rule changes are required.

## Automated Validation

Run from repository root:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual UI Validation

The user should check one mobile-width viewport and one desktop-width viewport:

- Opening `資訊` shows local player identity and current turn status.
- The status row shows `當前玩家: {name}` on the left and `離開遊戲` as a button on the right.
- Clicking `離開遊戲` still shows the existing confirmation flow.
- The old standalone bottom `離開遊戲` control is no longer the main playable-room exit entry.
- Each player summary shows `密約`, `取捨`, `贈予`, `競爭`.
- Used icons are visually distinct from unused icons.
- Local used `密約` opens inline replay with 1 card.
- Local used `取捨` opens inline replay with 2 cards.
- Selecting another eligible replay icon replaces the current replay content.
- Switching away from and back to `資訊` preserves the current replay display.
- Status-only icons do not open empty content.
- Opponent icons do not reveal card names, thumbnails, secret selections, hand cards, or pending choices.
- Gift, competition, order, ready, draw, and end-game overlays remain usable above the information panel.

## Expected Non-Changes

- No `server/` changes.
- No `game-shared-types/` changes.
- No Socket.IO contract changes.
- No gameplay rule or scoring changes.
- No hand/action command redesign.
- No character card or coverflow redesign.
