# Implementation Plan: Gift Competition Surface Polish

**Branch**: `009-gift-competition-surface`  
**Date**: 2026-05-02  
**Spec**: [spec.md](./spec.md)

## Summary

Polish the existing gift and competition bottom-sheet surfaces without changing gameplay rules, server behavior, shared types, Socket.IO contracts, or action payloads. The implementation will keep the current click-to-submit flows while redesigning the internal presentation for gift response, competition grouping, and competition response so card choices are easier to compare, group charm totals are visible for competition, mobile layouts can stack or wrap inside the sheet, and interaction states are clearer.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript, Bootstrap, global CSS in `src/index.css`  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Current Implementation Reality**:

- `src/components/game/PendingInteractionModal.tsx` renders gift response and competition response inside the existing bottom-sheet model.
- `src/components/game/CompetitionGroupModal.tsx` renders the active player's competition grouping sheet and currently shows three fixed group options.
- Card art and charm values already come from `getItemCardImage`, `getGeishaCharmById`, and optional server-first charm lookup callbacks.
- Gift and competition result motion cues already use `gift-result`, `competition-result`, `gift-selection-grid--motion-source`, `interaction-group--motion-source`, and `bottom-sheet__panel--motion-source`.
- Existing action submission and pending-interaction resolution are already wired through current callbacks and action payloads.

**Planned Scope Boundary**:

- Update only gift/competition bottom-sheet internals, option presentation, responsive layout, group total display, and interaction feedback.
- Keep the bottom-sheet container model and click-to-submit behavior.
- Keep card data, item images, selected-card semantics, action payloads, Socket.IO events, server validation, scoring, turn order, winner logic, and hidden-information boundaries unchanged.
- Treat detailed UI visual review as user-owned per `AGENTS.md`; implementation handoff should include automated checks and residual manual UI review notes.

**Validation**:

- `CI=1 npm test -- --watchAll=false`
- `npm run build`
- User manual UI review for gift response, competition grouping, and competition response on desktop/mobile.

## Constitution Check

- Game rule correctness: Pass. The plan changes only presentation and explicitly preserves card counts, legal options, scoring, ownership, turn flow, and win/loss behavior.
- Shared state integrity: Pass. No client UI state is introduced that bypasses server-side validation; submissions continue through existing callbacks.
- Explicit realtime contracts: Pass. No Socket.IO event names or payload shapes are changed.
- Mobile-first playability: Pass. The spec preserves bottom-sheet interaction and allows internal stacking/wrapping on mobile to avoid horizontal page scroll.
- Verifiable delivery: Pass. The plan includes the required frontend test/build checks and user-owned manual UI review notes.

## Project Structure

```text
src/components/game/PendingInteractionModal.tsx
src/components/game/CompetitionGroupModal.tsx
src/index.css
specs/009-gift-competition-surface/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See:

- [data-model.md](./data-model.md)
- [contracts/gift-competition-surface-ui-contract.md](./contracts/gift-competition-surface-ui-contract.md)
- [quickstart.md](./quickstart.md)

## Phase 2 - Task Planning

Generate tasks in these groups:

1. Foundation: identify existing gift/competition surfaces, card render helpers, motion classes, and click-to-submit callbacks.
2. Gift response polish: redesign the three-card choice surface while keeping immediate submit behavior.
3. Competition grouping polish: show three方案, two groups per方案, single-card charm values, and group charm totals.
4. Competition response polish: show two group choices with single-card charm values and group charm totals.
5. Responsive and interaction polish: mobile stacking/wrapping, no horizontal page scroll, hover/press/focus states, reduced-motion compatibility.
6. Validation: run frontend test/build and record user-owned manual UI review status.

## Risks

- **Rule drift risk**: UI totals must be display-only and must not change grouping legality, card ownership, scoring, or server validation.
- **Hidden-information risk**: Response surfaces must render only the pending interaction's already-public offered cards/groups, not opponent hands or secret cards.
- **Mobile readability risk**: Bottom-sheet internals can become dense; mobile tasks must prefer stacking/wrapping over shrinking cards until unreadable.
- **Immediate-submit risk**: Stronger visual affordances must not introduce an implied preview/confirmation state that contradicts the click-to-submit requirement.
- **Motion collision risk**: Existing gift/competition result hints must remain visible without hiding selectable options.
