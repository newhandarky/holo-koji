# Quickstart: 抽牌通知與焦點控制

## Preconditions

- Work on branch `030-draw-notification-focus-control`.
- 027, 028, and 029 behavior remains unchanged.
- Existing draw events are server-authoritative and already synchronize legal visible game state.
- Keep 030 scoped to frontend draw notification, focus control, draw presentation, and hidden-info-safe output.
- Do not add server events, server persisted draw review state, shared payload fields, settlement UI changes, or lobby AI text changes.

## Implementation Checklist

1. Review current draw surfaces:
   - `src/pages/GameRoom/index.tsx`
   - `src/pages/GameRoom/index.test.tsx`
   - `src/components/game/gameMotion.ts`
   - `src/components/game/gameMotion.test.ts`
   - `src/components/game/PlayerHand.tsx`
   - `src/hooks/useWebSocket.ts`

2. Add local draw review model:
   - active draw event classification: self, opponent, hand section, non-hand section, deferred
   - decisions: pending, view now, dismissed, timeout dismissed, animated
   - 5-second timeout
   - queue ordering for multiple self draw events
   - necessary-flow deferral

3. Update GameRoom focus behavior:
   - self draw in `資訊` or `角色` does not auto-focus `手牌&指令`
   - `現在查看` focuses `手牌&指令`
   - `稍後確認` and timeout keep current section
   - already in `手牌&指令` runs presentation directly

4. Add safe notification UI:
   - message/card back only before hand-section flip
   - `稍後確認` and `現在查看`
   - pointer, touch, and keyboard activation
   - no card id, geisha, charm, label, image, icon, or full card object in non-hand notification

5. Add draw flip presentation:
   - card back first
   - flip to card face in `手牌&指令`
   - complete within 2 seconds normal, 1 second reduced
   - no replay after `稍後確認` or timeout

6. Add focused tests:
   - self draw keeps `資訊` focused and shows notification
   - self draw keeps `角色` focused and shows notification
   - notification actions and timeout behavior
   - `現在查看` focus and flip
   - `稍後確認` no replay on later manual hand entry
   - already hand section direct flip
   - multiple self draws queue
   - necessary-flow deferral
   - opponent draw redaction
   - reduced motion timing

## Validation Commands

Run focused frontend tests first:

```bash
CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx src/components/game/gameMotion.test.ts
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
- Automated validation completed on 2026-05-06:
  - `CI=1 npm test -- --watchAll=false src/components/game/drawNotificationModel.test.ts src/components/game/gameMotion.test.ts`
  - `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx`
  - `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx src/components/game/drawNotificationModel.test.ts src/components/game/gameMotion.test.ts`
  - `CI=1 npm test -- --watchAll=false`
  - `npm run build`
- Server, Socket.IO payload, and shared type files were not modified for 030.
- Detailed mobile/desktop visual review remains user-owned per project AGENTS.md.
- At minimum, manually confirm on mobile and desktop that:
  - draw notification does not cover primary game information
  - `稍後確認` and `現在查看` are reachable
  - card-back-to-flip presentation reads like drawing a physical card
  - reduced motion path remains clear
  - necessary modal or pending flows are not visually interrupted

## Expected Outcome

- Self draw no longer forces `手牌&指令` when the user is viewing `資訊` or `角色`.
- The user chooses whether to view now or later.
- Card face appears only after entering `手牌&指令` and flipping from card back.
- Opponent draw remains hidden-safe.
- Server state and draw rules remain unchanged.
