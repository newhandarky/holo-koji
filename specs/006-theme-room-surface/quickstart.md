# Quickstart: Theme And Room Surface

## Prerequisites

- Use branch `006-theme-room-surface`.
- Install dependencies if needed with `npm install`.

## Implementation Focus

1. Inspect the current background classes in `src/index.css`.
2. Apply one Ginza v2 black-red-black diagonal background across all app page surfaces.
3. Update lobby and game-room wrappers so they use the shared app theme consistently.
4. Adjust only the active game-room main container so it no longer appears as a large solid white card.
5. Preserve readable backgrounds for cards, forms, modals, popovers, geisha cards, item cards, round summaries, and other content panels.
6. Do not change server, shared types, Socket.IO events, game rules, or gameplay data.

## Manual Visual Review

Review at desktop width and mobile width:

1. Lobby route `/`.
2. Game-room loading state, if reachable.
3. Game-room waiting-room state.
4. Active game-room state.
5. At least one interaction/modal state when practical.

Check:

- Black-red-black diagonal theme is visible across the app.
- Active room main surface no longer reads as a large white panel.
- Content panels remain readable.
- Mobile width has no horizontal overflow or clipped primary controls.
- Existing game actions remain in the same flow.

## Automated Validation

Run:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

If browser review is blocked by environment or setup constraints, record the reason during closeout.
