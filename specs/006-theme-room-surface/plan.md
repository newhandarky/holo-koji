# Implementation Plan: Theme And Room Surface

**Branch**: `006-theme-room-surface`  
**Date**: 2026-05-01  
**Spec**: [spec.md](./spec.md)

## Summary

Apply the Ginza v2 black-red-black diagonal visual shell across the entire app while preserving the current gameplay layout and all game behavior. The implementation should centralize the app-level theme background, align the existing lobby and game-room background surfaces with that theme, and adjust the game-room main container so it no longer presents a large solid white panel. Non-room content cards, forms, dialogs, and local gameplay surfaces may keep readable panel backgrounds.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript, Bootstrap, global CSS in `src/index.css`  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Current Implementation Reality**:

- `src/index.css` defines `.game-background` and `.lobby-background` with separate existing gradients.
- `src/pages/Lobby/index.tsx` uses `.lobby-background` for the lobby route and Bootstrap `.card` panels for lobby forms and room status.
- `src/pages/GameRoom/index.tsx` uses `.game-background` for loading, waiting-room, and active game states.
- Active gameplay wraps the board inside `.container-fluid` and `.card.game-card.p-3`; `.game-card` currently removes the border but relies on Bootstrap card background behavior.
- Existing card, modal, round-summary, player-card, item-card, and geisha-card surfaces already carry their own readability backgrounds and should not be redesigned in this feature.

**Planned Scope Boundary**:

- Replace app page backgrounds with a shared Ginza v2 black-red-black diagonal theme across all app pages.
- Make the game-room main gameplay card appear transparent, translucent, or otherwise non-white while clearly exposing the theme background.
- Preserve local readable backgrounds for lobby cards, forms, dialogs, modals, item cards, geisha cards, round summaries, and other information panels.
- Do not change gameplay data, server state, Socket.IO events, shared types, card rules, or win/loss logic.
- Do not implement coverflow, fan hand, character-card redesign, item-card redesign, or interaction-modal redesign.

**Validation**:

- Manual desktop and mobile-width visual review for lobby, game-room loading, waiting-room, active gameplay, and at least one interaction/modal state when practical.
- `CI=1 npm test -- --watchAll=false`
- `npm run build`

## Constitution Check

- Game rule correctness: Pass. The plan is visual-only and does not alter scoring, actions, turn order, hidden information, or win/loss behavior.
- Shared state integrity: Pass. No server-authoritative state, client action dispatch, pending interaction, or room membership validation changes are planned.
- Explicit realtime contracts: Pass. No Socket.IO event names or payload shapes are changed; no realtime contract file is required beyond documenting no-change scope.
- Mobile-first playability: Pass. The plan explicitly preserves the current mobile gameplay layout and bottom-sheet interaction model.
- Verifiable delivery: Pass. Repo-standard frontend test/build plus manual desktop/mobile visual checks are defined.

## Project Structure

```text
src/index.css
src/pages/Lobby/index.tsx
src/pages/GameRoom/index.tsx
src/components/game/
specs/006-theme-room-surface/
```

## Phase 0 - Research

See [research.md](./research.md).

## Phase 1 - Design

See:

- [data-model.md](./data-model.md)
- [contracts/theme-surface-ui-contract.md](./contracts/theme-surface-ui-contract.md)
- [quickstart.md](./quickstart.md)

## Phase 2 - Task Planning

Generate tasks in these groups:

1. Theme foundation: define a shared Ginza v2 theme background and apply it to all app page background surfaces.
2. Route surface alignment: update lobby, game-room loading, waiting-room, and active gameplay wrappers so they use the shared background consistently.
3. Room main surface: adjust the active game-room main card/container so the large white panel is removed and the theme is clearly visible.
4. Readability guardrails: preserve readable local backgrounds for forms, cards, dialogs, item/geisha cards, summaries, and action surfaces.
5. Responsive verification: check mobile-width and desktop layouts for text contrast, clipping, and horizontal overflow.
6. Regression validation: run the repo-standard frontend test/build commands and record any manual visual review limitations.

## Risks

- **Bootstrap card inheritance risk**: `.card.game-card` may inherit white backgrounds from Bootstrap even if `.game-card` only removes borders; implementation must override the specific room surface without breaking other readable cards.
- **Over-broad transparency risk**: applying transparency to all cards would reduce readability in lobby forms and modal/dialog surfaces; tasks must target the room main surface separately from content panels.
- **Mobile contrast risk**: dark/red backgrounds can reduce readability near transparent areas; manual mobile-width review must verify controls and text remain usable.
- **Visual scope creep risk**: this feature can easily drift into card, hand, or modal redesign; tasks must preserve current structures and defer those changes to later specs.
