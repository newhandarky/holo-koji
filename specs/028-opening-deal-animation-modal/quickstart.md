# Quickstart: 開局發牌動畫 Modal

## Preconditions

- Work on branch `028-opening-deal-animation-modal`.
- 027 opening deal summary exists and is viewer-safe.
- Keep 028 scoped to opening deal modal, card backs, auto-close, interaction blocking, reduced motion, and reconnect presentation.
- Do not implement `拿取手牌`, hand flip, skip button, draw notification focus changes, settlement UI, or server rule changes.

## Implementation Checklist

1. Review existing opening deal and motion surfaces:
   - `src/pages/GameRoom/index.tsx`
   - `src/components/game/GameBoard.tsx`
   - `src/components/game/PlayerHand.tsx`
   - `src/components/game/gameMotion.ts`
   - `src/hooks/useWebSocket.ts`
   - `game-shared-types/src/game.types.ts`

2. Add modal lifecycle:
   - detect replayable `openingDeal`
   - open once for new replayable sequence
   - block behind-modal UI
   - auto-close after completion
   - skip full replay when not replayable

3. Add modal presentation:
   - central deck
   - hidden reserve card-back step
   - first/second player directions
   - 12 dealt card backs
   - completion state
   - reduced motion path

4. Add card back theme:
   - default Ginza-style card back
   - reusable theme definition
   - no card-face assets or labels

5. Add focused tests:
   - modal opens from replayable opening deal
   - auto-closes after completion
   - blocks behind-modal UI interaction
   - does not render forbidden card identity
   - reduced motion completes via short path
   - replayable reconnect can restart modal
   - not-replayable opening deal does not force modal
   - own hand remains governed by existing legal state after modal closes

## Validation Commands

Run focused frontend tests first:

```bash
CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx
```

Run full frontend checks before handoff:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

Run server tests only if server or shared backend contract behavior changes:

```bash
npm --prefix server test
```

## Manual Review Notes

- User performs detailed UI visual review manually.
- Report manual review as residual if not performed.
- At minimum, verify mobile and desktop layouts do not overlap central deck, hidden reserve, direction labels, or completion state.

## Validation Notes

- Focused GameRoom tests cover replayable modal opening, behind-UI blocking, normal-motion auto-close within 6 seconds, reduced-motion completion within 2 seconds, replayable reconnect restart, not-replayable skip, and forbidden hidden-info redaction.
- Focused modal/model tests cover default `default-ginza` card backs, card-back theme redaction, safe step derivation, and timing bounds.
- Modal CSS uses constrained viewport sizing, stable grid rows/columns, and wrapped player lanes for mobile and desktop readability.
- Detailed visual UI review remains a user-owned manual review item before final visual acceptance.

## Expected Outcome

- New replayable opening deal progress displays a modal animation.
- Modal shows only card backs and safe labels.
- Modal blocks behind-game UI while visible and auto-closes when complete.
- Reduced motion users still understand the opening sequence.
- Reconnect replay follows `openingDeal.replayable`.
- No server rule state or hidden card data is changed by the modal.
