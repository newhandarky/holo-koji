# Implementation Plan: 拿取開局手牌與翻面揭示

**Branch**: `029-take-opening-hand-reveal`  
**Date**: 2026-05-06  
**Spec**: [spec.md](./spec.md)

## Summary

在 028 開局發牌 modal 自動關閉後，新增玩家端的「拿取手牌」閘門與逐張翻面揭示流程。符合開局拿取條件時，玩家自己的起始 6 張手牌先以卡背或遮蔽狀態呈現，按下「拿取手牌」後依目前手牌排序逐張揭示；reduced motion 可直接完成。揭示完成後一律切換或聚焦到 `手牌&指令`。本功能不新增 server 狀態、Socket.IO event、shared type 欄位或牌務變更，只在前端用本地呈現狀態控制可見性與手牌相關互動。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO/WebSocket server in `server/index.js`  
**Shared Types**: `game-shared-types` plus frontend local declarations in `src/types/`  
**Package Manager**: npm  
**Primary Risk Surface**: own-hand face redaction before take, local opening-hand gate eligibility, interaction gating for hand/action controls, reveal timing, reduced-motion path, forced `手牌&指令` focus, refresh/reconnect presentation replay, mobile hand layout  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`; server tests only if server or shared contract behavior changes  
**Unknowns**: None. Clarify resolved persistence scope, interaction lock scope, eligibility definition, reveal sequence, and post-reveal focus.

## Constitution Check

- Game rule correctness: Pass. 029 is presentation-only and must not change dealing, scoring, turn order, action legality, or hidden reserve handling.
- Shared state integrity: Pass. Server remains authoritative; the client only masks/reveals the viewer's already legal own hand and sends no new take-hand mutation.
- Explicit realtime contracts: Pass. No Socket.IO payload shape changes are planned; the contract documents that 029 consumes current viewer-safe state only.
- Mobile-first playability: Pass. The hand gate and reveal must preserve the existing mobile gameplay layout and bottom-sheet section model.
- Verifiable delivery: Pass. Focused frontend tests plus full frontend test/build validation are required before handoff.

## Project Structure

```text
src/
  pages/GameRoom/
  components/game/
  components/game/gameMotion.ts
  types/
server/
game-shared-types/
specs/029-take-opening-hand-reveal/
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
- Keep take-hand completion as local page-session presentation state, not server state.
- Derive eligibility from current visible game state: opening deal completed, own hand has the starting 6 cards, and no action/hand-changing operation has already progressed the game.
- Mask only the current player's own opening hand before take; continue relying on existing viewer-safe state for opponent and hidden card redaction.
- During take/reveal, block hand selection, hand commands, and actual gameplay actions while allowing non-destructive UI section navigation.
- Use sequential reveal by current hand order in normal motion and direct completed state in reduced motion.

## Phase 1 - Design

See [data-model.md](./data-model.md), [contracts/opening-hand-reveal-contract.md](./contracts/opening-hand-reveal-contract.md), and [quickstart.md](./quickstart.md).

Design focus:
- Add a local opening-hand reveal state keyed by opening deal sequence/current room context.
- Derive a concealed own-hand view for eligible unopened state without exposing card identity through visible text, images, labels, test ids, or accessibility labels.
- Gate hand selection and hand-action commands while the take/reveal flow is pending or revealing.
- Preserve non-destructive UI navigation during reveal, but ensure no gameplay action can fire.
- On reveal completion, mark local completion for the current page session and switch/focus to `handActions`.
- Reset or skip the local gate when current state no longer satisfies opening take eligibility.

## Phase 2 - Task Planning

Task generation should group work into these slices:

1. **Eligibility and local lifecycle**
   - detect when 028 opening modal has completed/closed
   - derive opening take eligibility from own starting hand count and game/action state
   - track local taken/revealed state for the current page session
   - allow local replay after refresh/reconnect when eligibility still holds

2. **Concealed own-hand presentation**
   - mask viewer's own opening hand faces before take
   - reuse existing card-back theme where practical
   - avoid leaking card ids, labels, image URLs, geisha ids, charm values, or full card objects into rendered concealed UI

3. **Take-hand control and reveal**
   - add `拿取手牌` control
   - support mouse, touch, and keyboard activation
   - reveal own hand sequentially by current order
   - use direct completion for reduced motion
   - keep normal reveal within 3 seconds and reduced motion within 1 second

4. **Interaction gating and focus**
   - block hand selection, hand commands, and gameplay actions while pending/revealing
   - preserve non-destructive section navigation
   - after reveal, switch/focus to `手牌&指令`
   - ensure existing action availability rules remain authoritative after reveal

5. **Tests and validation**
   - focused GameRoom/hand tests for eligible gate, concealment, activation, sequential reveal, reduced motion, action blocking, reconnect replay, and post-reveal focus
   - hidden-info regression checks against rendered output
   - full frontend tests and production build

## Risks

- **Risk**: Concealed own hand still leaks card identity through hidden text, alt labels, test ids, or image URLs.  
  **Mitigation**: Render concealed cards from safe placeholders/card-back data and add tests that forbidden card identity fields do not appear before take.

- **Risk**: Eligibility logic blocks a game that already progressed beyond opening hand state.  
  **Mitigation**: Require own hand to still be the starting 6 cards and no hand/action-changing operation to have occurred; otherwise skip gate and show current legal state.

- **Risk**: Local replay after refresh feels like a second take.  
  **Mitigation**: Document as intentional page-session presentation behavior and ensure replay never mutates card ownership or server state.

- **Risk**: Interaction gating accidentally blocks all UI or misses keyboard-triggered hand actions.  
  **Mitigation**: Gate action handlers and selectable hand UI directly; add keyboard-focused regression tests for hand/action controls.

- **Risk**: Forced `手牌&指令` focus conflicts with user navigation during reveal.  
  **Mitigation**: Clarify requires post-reveal focus to hand actions; test that completion consistently switches/focuses there.

## Post-Design Constitution Check

- Game rule correctness: Pass. The design does not modify rules, server dealing, scoring, or turn/action validation.
- Shared state integrity: Pass. Client presentation state cannot advance or bypass server authoritative state.
- Explicit realtime contracts: Pass. Contract documents no new realtime event and no shared payload changes.
- Mobile-first playability: Pass. Quickstart includes mobile layout and section-focus review expectations.
- Verifiable delivery: Pass. Quickstart defines focused tests, full frontend test suite, and build validation.
