# Quickstart: Gift Competition Surface Polish

## Prerequisites

- Use branch `009-gift-competition-surface`.
- Ensure 006 Ginza room shell, 007 character-card coverflow, and 008 fan player hand changes are present in the branch history.
- Install dependencies with `npm install` if needed.

## Implementation Focus

1. Update gift response content in `src/components/game/PendingInteractionModal.tsx` while preserving bottom-sheet behavior and immediate gift resolution.
2. Update competition response content in `src/components/game/PendingInteractionModal.tsx` to show separated groups, single-card charm values, and display-only group charm totals.
3. Update competition grouping content in `src/components/game/CompetitionGroupModal.tsx` to show the three existing grouping方案 with separated groups and display-only group charm totals.
4. Update `src/index.css` to provide the polished surface styling, mobile stacking/wrapping, no main horizontal overflow, and hover/press/focus states.
5. Preserve existing motion source and reduced-motion classes.
6. Do not change server code, shared types, Socket.IO events, action payloads, card data, or game rules.

## Validation

Run:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual UI Review

Detailed UI review is user-owned per `AGENTS.md`. Record whether the user has checked:

- Gift response surface with three offered cards.
- Competition grouping surface with three grouping方案 and group charm totals.
- Competition response surface with two group choices and group charm totals.
- Desktop layout readability.
- Mobile stacking/wrapping without main horizontal scroll.
- Hover/press/focus feedback where practical.
- Existing gift/competition result motion hints.

If the user has not completed manual UI review at closeout, report it as a residual manual review item.

## Scope Check

Before handoff, confirm the diff does not modify:

- `server/`
- `game-shared-types/`
- Socket.IO event names or payload shapes
- Scoring, turn order, win/loss logic, or action legality
- Gift and competition card counts or legal option generation
- Main player hand fan layout, character coverflow, room background, action tokens, or round summary surfaces
