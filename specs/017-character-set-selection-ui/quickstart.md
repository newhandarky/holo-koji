# Quickstart: Character Set Selection UI

## Scope

This feature adds lobby-side character-set selection for room creation. It does not redesign the lobby, add preview cards, modify join-room flow, or add a dedicated in-room label for the chosen set.

## Implementation Order

1. Add a single shared `selectedGeishaSet` state to the Lobby page and default it to `default`.
2. Replace the current hardcoded "預設（Ginza）" display with a simple selectable control in the room-creation area.
3. Keep the selector visible for both online and NPC creation paths.
4. Preserve `selectedGeishaSet` when switching between online and NPC modes.
5. Keep the join-room area unchanged and free of character-set controls.
6. Send `selectedGeishaSet` in every `CREATE_ROOM` submission.
7. Represent temporarily unavailable sets as visible but disabled options.
8. Verify the room still reflects the active set through the existing character board rather than through a new room-level label.
9. Add focused frontend tests and run standard validation commands.

## Focused Behavioral Checks

- Lobby defaults to Ginza when the player has not changed the selector.
- Online room creation sends the chosen `geishaSet`.
- NPC room creation sends the chosen `geishaSet`.
- Switching between online and NPC modes preserves the current selection.
- Join-room flow does not render or depend on the selector.
- Disabled character-set options remain visible but cannot be chosen for room creation.
- Room creation failure leaves the player able to retry with the same or a different selected set.
- Room flow still reflects the selected set through the character board content after successful room entry.

## Validation Commands

Run from repo root.

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual Review Notes

Detailed visual review remains user-owned. The important manual checks for this spec are:

- The selector is understandable inside the current Lobby without preview images.
- The control behaves correctly on both desktop and mobile widths.
- Disabled set presentation is clear enough that users understand the option exists but cannot be chosen.

## Test Coverage Notes

Preferred automated coverage for this feature is focused frontend behavior rather than deep integration:

- Lobby default selection state
- Lobby mode-switch preservation
- `CREATE_ROOM` message composition for online rooms
- `CREATE_ROOM` message composition for NPC rooms
- Untouched NPC room creation still resolving to `default`
- Join-room flow isolation from `selectedGeishaSet`
- Disabled-option prevention
- Room shell absence of selector / dedicated set label

End-to-end browser validation is not required by default because UI visual ownership remains with the user.
