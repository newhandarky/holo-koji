# Quickstart: Remote Character Card UI

## Preconditions

- Work on branch `002-remote-character-card-ui`.
- Root repo and `server/` submodule should both start clean.
- Use Node.js compatible with root `package.json` engines: `>=20 <24`.

## Implementation Checklist

1. Update shared type:
   - Add display-only `imageUrl: string` to `Geisha` in `game-shared-types/src/game.types.ts`.
2. Confirm server data:
   - Ensure every geisha produced by `server/utils/gameUtils.js` includes `imageUrl`.
   - Normalize URL values with `WEB_APP_URL` or `REACT_APP_WEB_APP_URL` so the client can load them outside local bundled assets.
3. Update frontend card source:
   - Update `src/components/game/GeishaCard.tsx` to use `geisha.imageUrl`.
   - Stop using frontend `getGeishaImageById` as the primary character artwork source.
4. Preserve item image behavior:
   - Do not remove `getGeishaCardImageById` or item `cardUrl` mappings in this feature.
5. Update character card UI:
   - Add 9:16 card frame.
   - Add center-cropped artwork.
   - Add fallback state.
   - Show name, charm score, and item ownership/count summary.
6. Verify no game logic changes:
   - Do not change scoring, action validation, hidden-information filtering, or turn order.

## Manual Review Scenarios

- Create a room for each character set: default, akatsuki, onesan, collaboration.
- Confirm all seven character cards show artwork or fallback.
- Confirm cards keep 9:16 shape on mobile-width and desktop-width viewports.
- Play enough actions to place item cards and confirm item counts update on the frame.
- Finish a round and confirm control/score behavior remains unchanged.

## Automated Validation

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Submodule Note

If implementation changes files under `server/`, commit those changes inside `server/` first, then commit the updated submodule pointer in the root repository.
