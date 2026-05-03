# Quickstart: Game Room Focus Layout

## Preconditions

- Branch: `011-game-room-focus-layout`
- Prior Ginza data, theme, coverflow, fan hand, gift/competition, and legacy cleanup specs are already integrated in the working update branch.
- UI visual validation is performed by the user; implementation should still run automated checks and avoid obvious layout regressions.

## Implementation Steps

1. Inspect current `GameRoom` and `GameBoard` composition to identify where information, character board, and hand/actions are rendered.
2. Add a `FocusSection` UI state with values `info`, `characterBoard`, and `handActions`.
3. Wrap the three visual areas in focus-aware section containers.
4. Add collapsed summaries for non-focused sections using only safe status/count data.
5. Default playable room focus to `characterBoard`.
6. Add manual summary click behavior so selecting a section expands it and collapses the others.
7. Detect when the local player newly becomes actionable and auto-focus `handActions` when no blocking interaction is active.
8. Preserve previous focus when a blocking interaction opens; restore it when the interaction closes unless the player is newly actionable.
9. Keep modals and bottom sheets above the focus layout.
10. Add CSS for viewport-bounded layout, section-local overflow, compact collapsed summaries, transitions, and reduced-motion behavior.
11. Audit summary props to ensure hidden card identities, thumbnails, secret selections, and opponent hand details are not exposed.

## Automated Validation

Run from repository root:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

If backend files are changed unexpectedly, also run the narrowest useful server validation from `server/package.json` and document why backend changes were needed.

## Manual UI Validation

The user should check at least one desktop viewport and one mobile-width viewport:

- Room loads with character board expanded by default.
- Information and hand/actions summaries are visible and readable.
- Clicking each summary expands that section and collapses the others.
- Re-clicking the active section does not leave the room with no expanded section.
- Local actionable turn focuses hand/actions when no blocking interaction is active.
- Non-user turn does not repeatedly steal focus.
- Gift and competition responses remain usable above the layout.
- Blocking interaction closes back to previous focus unless the player becomes actionable.
- No horizontal scrolling is needed.
- Normal play does not rely on whole-page vertical scrolling.
- Expanded section overflow is contained inside that section.
- Reduced-motion preference remains usable.
- No hidden opponent hand card, secret card, or unresolved selection becomes visible in collapsed summaries.

## Expected Non-Changes

- No `server/` changes.
- No `game-shared-types/` changes.
- No Socket.IO contract changes.
- No gameplay rule or scoring changes.
