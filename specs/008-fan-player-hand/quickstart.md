# Quickstart: Fan Player Hand

## Prerequisites

- Use branch `008-fan-player-hand`.
- Ensure 006 Ginza room shell and 007 character-card coverflow changes are present in the branch history.
- Install dependencies with `npm install` if needed.

## Implementation Focus

1. Update `src/components/game/PlayerHand.tsx` so the main hand can track a local focused card id in addition to the existing selected-card list.
2. Keep the existing click behavior: each click toggles selection and makes that card the focused card.
3. Add fan presentation metadata per card without changing card ids, card data, or action payloads.
4. Update `src/index.css` so `.player-hand-row` and `.item-card--hand` render as a fan.
5. Use medium spread on desktop and denser fan overlap on mobile.
6. Preserve selected, draw-highlight, draw-motion, and reduced-motion behavior.

## Validation

Run:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual UI Review

Detailed UI review is user-owned per `AGENTS.md`. Record whether the user has checked:

- Desktop active game room fan spread.
- Mobile active game room dense fan layout.
- Click to select and focus the same card.
- Switching focus between cards.
- New draw highlight visibility.
- Action-token enablement for existing selection counts.
- Bottom-sheet coexistence.

If the user has not completed manual UI review at closeout, report it as a residual manual review item.

## Scope Check

Before handoff, confirm the diff does not modify:

- `server/`
- `game-shared-types/`
- Socket.IO event names or payload shapes
- Scoring, turn order, win/loss logic, or action legality
- Gift, competition, order decision, or pending-interaction modal structure
