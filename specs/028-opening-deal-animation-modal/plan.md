# Implementation Plan: 開局發牌動畫 Modal

**Branch**: `028-opening-deal-animation-modal`  
**Date**: 2026-05-06  
**Spec**: [spec.md](./spec.md)

## Summary

在 027 已提供的安全 `openingDeal` 進度摘要基礎上，新增玩家進入新對局時的開局發牌 modal。Modal 以背面牌呈現中央牌堆、1 張隱藏保留牌、先手與後手方向的 12 張起始發牌，完成後自動關閉並回到目前合法可見對局畫面。Modal 播放期間阻擋後方 UI 操作，但不要求 server 等待動畫完成；玩家自己的手牌仍依既有合法可見流程顯示，`拿取手牌`、翻面、skip 與抽牌通知控制留給後續 spec。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO/WebSocket server in `server/index.js`  
**Shared Types**: `game-shared-types` plus frontend local declarations in `src/types/`  
**Package Manager**: npm  
**Primary Risk Surface**: openingDeal replay lifecycle, modal gating, hidden-information redaction, reduced-motion presentation, mobile layout, existing `DEAL_ANIMATION` compatibility, GameRoom focus/interaction lock behavior  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`; server tests only if server or shared contract behavior changes  
**Unknowns**: None. Clarify resolved modal auto-close, behind-modal interaction blocking, replayable reconnect behavior, and own-hand visibility before 029.

## Constitution Check

- Game rule correctness: Pass. 028 is presentation-only and does not change dealing, scoring, turn order, or action legality.
- Shared state integrity: Pass. Modal consumes server-authoritative safe opening progress and must not mutate card ownership or rule state.
- Explicit realtime contracts: Pass. This plan produces a contract describing opening animation consumption of `openingDeal` and legacy `DEAL_ANIMATION` compatibility.
- Mobile-first playability: Pass. Modal must preserve mobile-oriented gameplay and avoid breaking bottom navigation after auto-close.
- Verifiable delivery: Pass. Frontend tests and production build are required before handoff.

## Project Structure

```text
src/
  pages/GameRoom/
  components/game/
  components/game/gameMotion.ts
  types/
server/
  index.js
game-shared-types/
  src/game.types.ts
specs/028-opening-deal-animation-modal/
  spec.md
  plan.md
  research.md
  data-model.md
  contracts/
  quickstart.md
```

## Phase 0 - Research

See [research.md](./research.md).

Key conclusions:
- Use 027 `openingDeal` safe summary as the primary modal source; keep legacy `DEAL_ANIMATION` only as compatibility if needed.
- Represent animation state locally in GameRoom, keyed by `sequenceId`, so reconnect and replay decisions do not mutate server state.
- Auto-close after completion and block behind-modal UI during playback, while leaving server rule state independent.
- Use a reusable default Ginza-style card back definition so future card-back themes can be replaced without touching hidden-info rules.
- Reduced motion should preserve step meaning with condensed timing or completed-state presentation.

## Phase 1 - Design

See [data-model.md](./data-model.md), [contracts/opening-deal-animation-contract.md](./contracts/opening-deal-animation-contract.md), and [quickstart.md](./quickstart.md).

Design focus:
- Add a modal-level UI state derived from `openingDeal.sequenceId`, `openingDeal.replayable`, and safe steps.
- Show one central deck, one hidden reserve destination, and two player-direction lanes.
- Ensure every displayed card in the modal is a card back; never render card face image, label, geisha, charm, or item metadata.
- Block pointer/keyboard interaction with the underlying gameplay UI while the modal is visible.
- Auto-close after completion and record local completion for that `sequenceId` during the current page session.
- If reconnect receives replayable progress, play from the beginning; if not replayable, skip the modal and show current legal state.

## Phase 2 - Task Planning

Task generation should group work into these slices:

1. **Modal state and lifecycle**
   - detect replayable `openingDeal`
   - open modal once per sequence unless reconnect replay applies
   - auto-close on completion
   - block behind-modal interactions during playback

2. **Animation presentation**
   - central deck
   - hidden reserve burn step
   - first/second player card-back lanes
   - completed state
   - reduced-motion mode

3. **Card back theme**
   - default Ginza-style card back
   - reusable card-back definition
   - visual distinction from face-up item/character cards

4. **Compatibility and tests**
   - consume existing safe `openingDeal` state
   - avoid card identity leakage
   - preserve current own-hand visibility before 029
   - frontend regression tests for auto-close, blocking, reconnect/replayable behavior, reduced motion, and mobile layout assumptions

5. **Validation**
   - focused GameRoom/modal tests
   - full frontend test suite
   - production build

## Risks

- **Risk**: Modal accidentally reuses full card objects from old deal animation paths and exposes card faces.  
  **Mitigation**: Build modal steps from safe opening summary metadata only; add tests that rendered modal text/attributes do not include card ids, labels, geisha ids, or image URLs.

- **Risk**: Blocking behind-modal UI is mistaken for server-side action lock.  
  **Mitigation**: Keep blocking local to modal overlay and document that server state remains playable.

- **Risk**: Auto-close conflicts with future `拿取手牌` flow.  
  **Mitigation**: 028 explicitly leaves own-hand visibility unchanged and does not introduce take-hand or flip mechanics; 029 will replace or extend the transition.

- **Risk**: Reconnect could replay stale animation after first action.  
  **Mitigation**: Respect `openingDeal.replayable`; if not replayable or marked `not_replayable`, skip modal.

- **Risk**: Mobile modal could obscure direction labels or controls.  
  **Mitigation**: Use stable modal layout constraints and require mobile/desktop validation in quickstart.

## Post-Design Constitution Check

- Game rule correctness: Pass. No changes to authoritative card movement or scoring.
- Shared state integrity: Pass. Client only displays safe server-provided progress and sends no opening-deal mutation.
- Explicit realtime contracts: Pass. Contract documents payload consumption and hidden-info boundaries.
- Mobile-first playability: Pass. Design preserves current layout and focuses validation on small viewports.
- Verifiable delivery: Pass. Quickstart defines focused frontend tests and build validation.
