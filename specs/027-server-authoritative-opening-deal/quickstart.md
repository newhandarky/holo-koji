# Quickstart: 權威開局發牌

## Preconditions

- Work on branch `027-server-authoritative-opening-deal`.
- Keep existing uncommitted user changes intact.
- Do not implement opening animation modal, `拿取手牌`, skip UI, or settlement screen redesign in this feature.

## Implementation Checklist

1. Review authoritative opening flow in:
   - `server/index.js`
   - `server/utils/gameUtils.js`
   - `game-shared-types/src/game.types.ts`
   - `src/types/game-shared-types.d.ts`

2. Add or formalize safe opening deal state:
   - one hidden-card burn step
   - alternating dealt-card-back steps
   - completion marker
   - replay retention until first actual player action

3. Harden player-visible state:
   - active play does not include removed-card identity
   - opponent hands stay masked
   - opening progress contains no card face data
   - ended settlement summary can include removed-card identity

4. Update shared contracts:
   - `game-shared-types`
   - frontend local type declarations
   - any event/payload consumers that expect game state shape

5. Add focused tests:
   - order confirmation completion creates one removed card
   - both players receive six cards
   - draw pile has eight cards after starting hands
   - opening summary alternates first/second player to six each
   - opening summary contains no card identity fields
   - reconnect/resend does not regenerate opening deal
   - duplicate or late confirmation does not mutate opening deal
   - active-play log/diagnostics redacts removed-card identity
   - ended state can provide removed card for settlement

## Validation Commands

Run backend checks first:

```bash
npm --prefix server test
```

Run frontend checks before handoff:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Validation Results

- `npm --prefix server test` - passed, 72 tests.
- `CI=1 npm test -- --watchAll=false` - passed, 9 suites / 80 tests. Existing React `act(...)` warnings and Lobby error-log coverage output remained non-blocking.
- `npm run build` - passed.

## Manual Review Notes

- Detailed UI visual review is not required for 027 unless implementation unexpectedly changes gameplay presentation.
- If UI review remains unperformed, report it as residual manual review only.

## Expected Outcome

- Server remains authoritative for hidden removed card and starting hands.
- No client-visible active-play state leaks removed-card identity.
- Opening progress is safe for future animation specs.
- Game can recover from reconnect without re-dealing.
- Settlement data can access removed card after game end, while settlement UI design remains deferred.
