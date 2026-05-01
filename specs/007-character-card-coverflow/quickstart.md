# Quickstart: Character Card Coverflow Redesign

## Prerequisites

- Use branch `007-character-card-coverflow`.
- Ensure 005 Ginza display data and 006 room shell changes are present in the working branch history.
- Install dependencies with `npm install` if needed.

## Implementation Focus

1. Replace the current static geisha row layout in `src/components/game/GameBoard.tsx` with one ordered coverflow surface.
2. Redesign `src/components/game/GeishaCard.tsx` so the top-left overlay carries name, charm, and item icon.
3. Remove the old `未掌控` block and standalone item-information area.
4. Move self/opponent counts into a non-wrapping bottom split band.
5. Render border color only from synced persisted control state.
6. Preserve existing room flow, bottom-sheet/modal behavior, and server-synced gameplay state.

## Manual Visual Review

Review at desktop width and mobile width:

1. Active game room with all seven character cards visible.
2. Focus changes by drag/swipe.
3. Focus changes by left/right navigation controls.
4. Card readability with portrait, top-left overlay, and bottom counter band.
5. Coexistence with an existing modal or bottom-sheet state when practical.
6. A carried-over unresolved match state with persisted control borders when practical.

Check:

- No autoplay occurs during a 10-second idle observation.
- Mobile shows one main center card plus partial neighbors.
- Desktop shows one main center card plus about two neighbors per side.
- Top-left overlay and bottom counters stay readable.
- The old `未掌控` block and standalone item section are gone.
- Border colors reflect only persisted authoritative control state.
- No horizontal overflow or broken interaction flow appears.

## Automated Validation

Run:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

If unresolved-round border validation cannot be reproduced locally, record that limitation during closeout.
