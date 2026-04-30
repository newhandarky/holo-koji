# Implementation Plan: Icon Item Cards

**Branch**: `003-icon-item-cards`  
**Date**: 2026-04-30  
**Spec**: [spec.md](./spec.md)

## Summary

Add a centralized item-icon mapping for the new item types used in this feature and render those icons inside an explicit information area on character cards. The first delivery stays frontend-only: it uses existing `ItemCard.type` or other existing item identifiers to determine icons, preserves current gameplay rules and Socket.IO contracts, and does not replace the existing artwork-based item-card surfaces in hand, pending interaction, or action previews.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript, CSS in `src/index.css`  
**Backend**: Node.js, Express, Socket.IO (no planned logic or contract changes)  
**Shared Types**: `game-shared-types` with existing `ItemCard.type` and `ItemCard.geishaId` fields  
**Package Manager**: npm  
**Current UI Reality**:

- Character cards already have a dedicated information frame from spec `002`, but no explicit item icon area yet.
- Existing item-card surfaces in `PlayerHand`, `PendingInteractionModal`, `CompetitionGroupModal`, and `ActionTokens` still render artwork images through `getGeishaCardImageById(card.geishaId, geishaSet)`.
- Current board summaries infer ownership counts from `playedCards`, but they do not expose item identity beyond counts.
- `ItemCard` already includes `type: string`, which is the preferred source for icon mapping in this feature.

**Planned Scope Boundary**:

- Add icon rendering to character cards only.
- Support new item types through a centralized icon mapping.
- Keep hand cards, modal cards, and other existing item-card image surfaces unchanged in this feature.

**Validation**:

- `CI=1 npm test -- --watchAll=false`
- `npm run build`

## Constitution Check

- Game rule correctness: Pass. Plan changes only display mapping and character-card UI.
- Shared state integrity: Pass. Server remains authoritative; client derives icons from existing synced item data.
- Explicit realtime contracts: Pass. No new events or rule-bearing payload fields are planned.
- Mobile-first playability: Pass. Icon area must fit the existing mobile card layout without replacing the bottom-sheet flow.
- Verifiable delivery: Pass. Tests and build are defined.

## Project Structure

```text
src/components/game/GeishaCard.tsx
src/components/game/GameBoard.tsx
src/utils/gameData.ts
src/index.css
game-shared-types/src/game.types.ts
specs/003-icon-item-cards/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See:

- [data-model.md](./data-model.md)
- [contracts/item-icon-mapping.md](./contracts/item-icon-mapping.md)
- [contracts/character-card-icon-area.md](./contracts/character-card-icon-area.md)
- [quickstart.md](./quickstart.md)

## Phase 2 - Task Planning

Generate tasks in these groups:

1. Item identity audit: confirm supported new item types and where `ItemCard.type` values are produced/consumed.
2. Centralized icon mapping: add a single source of truth for item type -> icon definition.
3. Character-card icon area: extend `GeishaCard` and related board data flow to render supported item icons per geisha.
4. Mobile-safe styling: update CSS so icon area remains explicit and readable on current card layouts.
5. Validation and docs: run tests/build and record the supported-item scope clearly.

## Risks

- **Identifier drift**: if `ItemCard.type` values are inconsistent or too free-form, icon mapping may become brittle; tasks must audit actual values before rendering.
- **Character-card crowding**: the card already contains artwork, score, control status, and count summaries; icon area layout must avoid visual overload on mobile.
- **Partial surface migration confusion**: because hand and modal item cards still use old artwork, docs and tasks must clearly state that `003` only upgrades the character-card relationship view.
- **Future customization mismatch**: a first-pass generic icon set could be mistaken for final art direction, so the mapping should be explicitly replaceable.
