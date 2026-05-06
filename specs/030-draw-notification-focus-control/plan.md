# Implementation Plan: 抽牌通知與焦點控制

**Branch**: `030-draw-notification-focus-control`  
**Date**: 2026-05-06  
**Spec**: [spec.md](./spec.md)

## Summary

調整回合開始抽牌的前端呈現流程，避免自己抽牌事件在玩家查看 `資訊` 或 `角色` 時無條件切到 `手牌&指令`。030 將把「抽牌資料已同步」與「是否立即播放抽牌翻牌呈現」拆開：自己抽牌且不在手牌區時先顯示 5 秒通知，通知只呈現牌背/安全摘要並提供 `稍後確認`、`現在查看`；選擇 `現在查看` 或玩家本來就在 `手牌&指令` 時，才呈現牌背抽牌、翻轉顯示卡牌內容並加入手牌。必要流程期間到達的自己抽牌事件會排隊到流程結束後再依當下區塊處理。此功能不改 server 抽牌規則、Socket.IO payload、shared type 或任何權威 game state。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO/WebSocket server in `server/index.js`  
**Shared Types**: `game-shared-types` plus frontend local declarations in `src/types/`  
**Package Manager**: npm  
**Primary Risk Surface**: drawQueue consumption timing, `focusSection` auto-switch rules, own-card notification redaction before hand-area flip, queued draw events, necessary-flow deferral, reduced motion, mobile notification layout  
**Validation**: focused GameRoom/gameMotion tests, `CI=1 npm test -- --watchAll=false`, `npm run build`; server tests only if server or shared contract behavior changes  
**Unknowns**: None. Clarify resolved notification timeout, own-card visibility timing, queued self draws, and necessary-flow deferral.

## Constitution Check

- Game rule correctness: Pass. 030 is presentation-only and must not change draw rules, action legality, scoring, turn order, or win conditions.
- Shared state integrity: Pass. Server remains authoritative; client draw decisions cannot create, remove, reorder, or mutate cards.
- Explicit realtime contracts: Pass. No Socket.IO payload shape changes are planned; the contract documents consumption of the existing draw event queue.
- Mobile-first playability: Pass. Notification controls must preserve the existing three-section mobile gameplay layout and avoid overlap.
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
specs/030-draw-notification-focus-control/
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
- Keep draw review and animation decisions local to `GameRoom`; do not persist them or send socket acknowledgements.
- Consume each `drawQueue` item only after its local presentation decision is complete.
- Own draw notifications outside `手牌&指令` show only card back/safe text; card face appears only in the hand section during flip.
- Queue multiple self draw events and necessary-flow deferred events in arrival order.
- Reduced motion uses direct or shortened visible completion while preserving state and focus decisions.

## Phase 1 - Design

See [data-model.md](./data-model.md), [contracts/draw-notification-focus-contract.md](./contracts/draw-notification-focus-contract.md), and [quickstart.md](./quickstart.md).

Design focus:
- Derive a local draw presentation state from existing `drawQueue[0]`, current player, current `focusSection`, reduced-motion preference, and necessary-flow locks.
- Replace immediate own-card highlight consumption with a decision state:
  - non-hand sections: pending notification, `稍後確認`, `現在查看`, 5-second timeout
  - hand section: immediate card-back-to-flip presentation
  - necessary flow: deferred until the flow releases
- Keep opponent draw toast safe and face-free.
- Ensure hand flip presentation can target the current legal own card without leaking it in the notification DOM.
- Preserve existing server-authoritative action availability after presentation.

## Phase 2 - Task Planning

Task generation should group work into these slices:

1. **Local draw presentation model**
   - define draw review decisions and queue semantics
   - derive whether the active event is self/opponent, hand-section/non-hand, or deferred by necessary flow
   - define timing budgets: 5-second notification timeout, 2-second normal flip, 1-second reduced path

2. **GameRoom lifecycle and focus control**
   - prevent self draw from auto-switching focus when current section is `資訊` or `角色`
   - show notification with `稍後確認` and `現在查看`
   - consume draw events after decision/presentation completion
   - queue self events behind active notifications and necessary flows

3. **Hand reveal presentation**
   - add card-back draw cue before card face is shown in hand section
   - run face flip only after `現在查看` or when already in `手牌&指令`
   - skip replaying the same draw animation after `稍後確認` or timeout
   - support reduced motion

4. **Hidden information and necessary-flow safety**
   - ensure non-hand self notification does not render card id, label, image, geisha, charm, or full object
   - ensure opponent draw remains safe summary only
   - defer self draw UI during order decision, pending interaction, settlement, ready check, opening deal modal, and opening hand reveal

5. **Tests and validation**
   - focused model tests for decision state, queue ordering, timeout, reduced timing
   - GameRoom tests for focus retention, notification actions, hand flip, later manual entry, opponent redaction, necessary-flow deferral
   - full frontend tests and production build

## Risks

- **Risk**: Self draw notification leaks card identity before the player enters `手牌&指令`.  
  **Mitigation**: Render non-hand notifications from safe placeholder data only and add forbidden identity tests.

- **Risk**: Draw event is consumed before the player makes a decision, causing missed notifications.  
  **Mitigation**: Consume only after `現在查看` presentation starts/completes, `稍後確認`, timeout, or safe opponent toast completion.

- **Risk**: Necessary-flow deferral creates stale draw UI after the state has progressed.  
  **Mitigation**: Re-evaluate current legal state and current section when the necessary flow releases; stale events should degrade to current state display without replaying invalid animations.

- **Risk**: Focus management conflicts with 029 opening hand focus.  
  **Mitigation**: Treat opening hand pending/revealing as a necessary flow and queue draw presentation until it finishes.

- **Risk**: Mobile notification with two actions overlaps game controls.  
  **Mitigation**: Keep notification compact, stable, and record manual UI review as user-owned if not visually checked.

## Post-Design Constitution Check

- Game rule correctness: Pass. Design changes only client presentation and does not alter draw or action rules.
- Shared state integrity: Pass. Draw decisions are local and do not bypass server validation or mutate synchronized state.
- Explicit realtime contracts: Pass. Contract documents no new Socket.IO event or shared payload field.
- Mobile-first playability: Pass. Quickstart includes mobile/desktop notification reachability and overlap review expectations.
- Verifiable delivery: Pass. Plan defines focused tests, full frontend suite, and build validation.
