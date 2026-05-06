# Quickstart: Game Room Section Tabs

## Preconditions

- Branch: `012-game-room-section-tabs`
- 011 game room focus layout is integrated.
- UI visual validation is performed by the user.

## Implementation Steps

1. Locate the active game room section focus state created in 011.
2. Add a top full-width three-option tab control for `資訊`, `角色`, and `手牌&指令`.
3. Bind tab active state to the same active section source of truth.
4. Make the tab control fixed/visible at the top of the active game room while section content scrolls internally.
5. Remove non-active section summary rows as clickable switching controls.
6. Ensure tabs display only labels and active state.
7. Preserve newly actionable auto-focus only for not-actionable to actionable transitions.
8. Preserve manual tab choice after the player switches away while already actionable.
9. Preserve blocking interaction restore behavior and keep overlays above tabs.
10. Add keyboard focus and Enter/Space activation.
11. Verify no server, shared type, Socket.IO, or gameplay rule changes are required.

## Automated Validation

Run from repository root:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual UI Validation

The user should check one mobile-width viewport and one desktop-width viewport:

- Tabs are visible at the top of the active game room.
- Tabs show exactly `資訊`, `角色`, `手牌&指令`.
- Tabs do not show badges, counts, summaries, or hints.
- `角色` is active by default on playable room load.
- Selecting each tab expands the corresponding section and collapses the others.
- Re-selecting the active tab does not collapse all sections.
- Tabs stay visible while section content scrolls internally.
- Newly actionable turn activates `手牌&指令`.
- Manual switch away while already actionable is preserved through ordinary state updates.
- Blocking interaction closes back to the expected tab.
- Gift, competition, order, ready, and end-round overlays remain usable above the tabs.
- Keyboard focus plus Enter/Space can switch tabs.
- No hidden card details or secret selections are visible in the tab control.

## Expected Non-Changes

- No `server/` changes.
- No `game-shared-types/` changes.
- No Socket.IO contract changes.
- No gameplay rule or scoring changes.
- No character card visual redesign.
- No hand fan/control redesign.
