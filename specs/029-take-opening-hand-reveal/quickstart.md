# Quickstart: 拿取開局手牌與翻面揭示

## Preconditions

- Work on branch `029-take-opening-hand-reveal`.
- 027 authoritative opening deal is complete and viewer-safe.
- 028 opening deal modal auto-closes and returns the player to current legal gameplay.
- Keep 029 scoped to client-side `拿取手牌`, own-hand concealment, own-hand reveal, interaction gating, reduced motion, and post-reveal `手牌&指令` focus.
- Do not add server events, server persisted taken state, shared payload fields, skip button, draw notification changes, or settlement UI changes.

## Implementation Checklist

1. Review current opening hand surfaces:
   - `src/pages/GameRoom/index.tsx`
   - `src/pages/GameRoom/index.test.tsx`
   - `src/components/game/GameBoard.tsx`
   - `src/components/game/PlayerHand.tsx`
   - `src/components/game/gameMotion.ts`
   - `src/components/game/cardBackTheme.ts`

2. Add local lifecycle and eligibility:
   - detect opening deal completion/modal close readiness
   - derive eligibility from own starting 6-card hand and no progressed hand/action state
   - store reveal completion only for current page session
   - skip gate when state is no longer eligible

3. Add concealed own-hand state:
   - show card backs/placeholders/count before take
   - hide card id, geisha, charm, label, image, icon, and full card content from rendered pre-take UI
   - preserve underlying legal own-hand data for post-reveal state and existing game rules

4. Add take and reveal flow:
   - render `拿取手牌` control
   - support mouse, touch, and keyboard activation
   - reveal cards one-by-one by current hand order
   - reduced motion completes directly or within 1 second
   - normal reveal completes within 3 seconds

5. Add interaction gating and focus:
   - block hand selection, hand commands, and gameplay actions while pending/revealing
   - allow non-destructive section navigation during reveal
   - switch or focus to `手牌&指令` after reveal completes
   - keep existing server-authoritative action availability after reveal

6. Add focused tests:
   - eligible opening state shows `拿取手牌`
   - own hand faces are concealed before take
   - forbidden identity fields do not appear pre-take
   - keyboard/pointer activation starts reveal
   - normal reveal follows current hand order and stays within timing budget
   - reduced motion directly completes within timing budget
   - pending/revealing blocks hand selection and hand commands
   - non-destructive section navigation remains possible during reveal
   - reveal completion switches/focuses to `手牌&指令`
   - reconnect/refresh-like rerender can re-present local gate when still eligible
   - progressed/non-eligible state skips gate

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
- Detailed manual UI review remains a residual user-owned item.
- At minimum, manually confirm on mobile and desktop that:
  - `拿取手牌` control is reachable
  - concealed hand does not overlap other controls
  - sequential reveal is understandable
  - completion lands on `手牌&指令`
  - reduced motion path remains clear

## Validation Notes

- Focused model tests cover opening take eligibility, non-eligible states, reveal ordering, normal timing within 3 seconds, and reduced motion completion within 1 second.
- Focused GameRoom tests cover eligible gate display, pre-take concealment, forbidden own-card identity redaction, keyboard activation via Enter/Space, reveal completion focus, interaction gating, non-destructive section navigation, hidden-info regression for opponent/removed/draw fixtures, reduced motion, local remount replay, and progressed/non-starting skip.
- Full frontend test suite passed with 110 tests.
- Production build passed.
- No server, Socket.IO payload, or shared type changes were introduced.
- Detailed mobile/desktop visual review remains user-owned manual review before final visual acceptance.

## Expected Outcome

- Eligible players see `拿取手牌` before own opening hand faces.
- Own opening hand remains concealed until take.
- Taking hand reveals current own hand in order without changing server state.
- Hand/action gameplay controls are unavailable until reveal completes.
- Non-destructive UI navigation can still work during reveal.
- Completion consistently lands on `手牌&指令`.
