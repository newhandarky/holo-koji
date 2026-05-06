# Tasks: Deal And Draw Motion Refresh

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/`  
**Prerequisites**: `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/spec.md`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/plan.md`

## Phase 1 - Setup

- [x] T001 Review the active spec, plan, research, data model, contracts, and quickstart in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/`.
- [x] T002 Audit the current opening-deal, draw-motion, and interaction-lock touchpoints in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/gameMotion.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/hooks/useWebSocket.ts`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`.

## Phase 2 - Foundational

- [x] T003 Define reusable opening-deal cue state helpers and timing constants in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/gameMotion.ts`.
- [x] T004 [P] Add shared CSS tokens and non-interactive motion surface rules for deal, draw, and removal cues in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T005 Add or update viewer-safe motion data plumbing for `DEAL_ANIMATION` and draw cue handling in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/hooks/useWebSocket.ts` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`.
- [x] T006 [P] Prepare focused test scaffolding for motion state and room interaction lock coverage in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.test.tsx`.

## Phase 3 - User Story 1

**Goal**: 開局發牌時，雙方都能看到上下 / 下上交替的逐張進場節奏，且主要提示完成前不可操作。  
**Independent Test**: 建立一場新對戰並進入開局，確認起始手牌不是整批瞬間出現，而是雙方都可感知交替發牌節奏，且完成前不能操作。

- [x] T007 [US1] Consume the existing `DEAL_ANIMATION.sequence` as an opening-deal cue source in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` without adding new socket event names.
- [x] T008 [US1] Implement short-lived opening-deal cue lifecycle and completion tracking in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`.
- [x] T009 [US1] Render viewer-oriented alternating opening-deal motion for local-bottom and opponent-top hand presentation in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T010 [US1] Keep player interaction locked until the opening-deal primary cue completes in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`.
- [x] T011 [US1] Ensure the same opening-deal cue path triggers on both initial game start and next-round redeal in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`.
- [x] T012 [P] [US1] Add focused tests for sequential opening-hand arrival, interaction locking, and next-round replay in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.test.tsx`.

## Phase 4 - User Story 2

**Goal**: 抽牌時只有實際持牌玩家看到非常短暫的新卡加入提示，其他玩家不看到完整新卡進場細節。  
**Independent Test**: 進行一個會觸發抽牌的回合，確認持牌玩家看到短暫新卡加入 cue，其他玩家只看到必要狀態變化。

- [x] T013 [US2] Shorten the draw-arrival lifecycle so the cue returns to normal hand presentation almost immediately in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/gameMotion.ts` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`.
- [x] T014 [US2] Update `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` so the draw cue remains readable without leaving a long-lived “new card” marker.
- [x] T015 [US2] Restrict full draw-to-hand cue rendering to the actual receiving player in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/hooks/useWebSocket.ts`.
- [x] T016 [P] [US2] Add focused tests for holder-only draw cues and immediate return to normal hand state in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.test.tsx`.

## Phase 5 - User Story 3

**Goal**: Reduced motion 模式下仍能辨識發牌與抽牌有發生，但不能依賴大幅位移。  
**Independent Test**: 啟用 reduced motion 後重進對戰並觸發抽牌，確認仍有可辨識提示，但整體動作顯著弱化。

- [x] T017 [US3] Implement reduced-motion variants for opening-deal and draw cues in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/gameMotion.ts` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T018 [US3] Update `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx` to use reduced-motion emphasis without large travel motion.
- [x] T019 [P] [US3] Add focused reduced-motion assertions for visible but low-intensity deal/draw feedback in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.test.tsx`.

## Phase 6 - User Story 4

**Goal**: 動畫只能改善狀態可讀性，不得改變規則、同步結果或暴露隱藏資訊；卡牌移除提示雙方都能感知。  
**Independent Test**: 在有開局發牌、抽牌與移除提示的情況下完成一段對戰流程，確認手牌內容、張數、可操作狀態與多人同步完全正確。

- [x] T020 [US4] Implement a public-safe card-removal cue that both players can perceive without revealing hidden card identity in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/gameMotion.ts`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T021 [US4] Verify that motion refresh leaves authoritative hand contents, counts, action availability, and turn flow unchanged in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`.
- [x] T022 [US4] Confirm no new socket events or hidden-state leaks are introduced while reusing `DEAL_ANIMATION` and `CARD_DRAWN` in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/hooks/useWebSocket.ts`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/game-shared-types/src/game.types.ts`.
- [x] T023 [P] [US4] Add focused regression tests for room synchronization, next-round redeal, and no hidden draw leak in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.test.tsx`.

## Phase 7 - Polish & Cross-Cutting Concerns

- [x] T024 [P] Refine motion timing, easing, and mobile readability for the existing hand fan layout in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T025 [P] Remove obsolete or conflicting deal/draw motion comments or dead code paths from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/gameMotion.ts`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`.
- [x] T026 Sync implementation notes and manual review expectations in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/spec.md` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/quickstart.md`.
- [x] T027 Sync the motion contract if implementation details changed in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/contracts/deal-and-draw-motion.md`.
- [x] T028 Run `CI=1 npm test -- --watchAll=false` and record the unrelated Lobby failure in Validation Notes.
- [x] T029 Run `npm run build`.
- [x] T030 Record user-owned manual motion review expectations from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/quickstart.md` in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/spec.md`.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before any user story work.
- User Story 1 (Phase 3) is the MVP and should land before draw-cue polish.
- User Story 2 (Phase 4) depends on the motion plumbing from Phase 2 and should build on the opening-deal infrastructure from User Story 1.
- User Story 3 (Phase 5) depends on User Story 1 and User Story 2, because reduced-motion variants wrap the same deal/draw cue paths.
- User Story 4 (Phase 6) depends on the earlier motion paths being in place so correctness and non-leak regression can be verified.
- Polish phase runs after all user story phases.

## Parallel Execution Examples

### User Story 1
- Run T009 and T012 in parallel after T007-T008, because visual surface work and focused tests touch different concerns.
- Run T010 in parallel with T011 after T008, because interaction lock timing and redeal reuse can be implemented independently.

### User Story 2
- Run T014 and T016 in parallel after T013, because draw-cue styling and focused tests use separate files.

### User Story 3
- Run T018 and T019 in parallel after T017, because reduced-motion rendering and reduced-motion assertions can progress independently.

### User Story 4
- Run T022 and T023 in parallel after T020-T021, because contract audit and regression tests cover different surfaces.

## Validation Notes

- `CI=1 npm test -- --watchAll=false src/components/game/gameMotion.test.ts src/pages/GameRoom/index.test.tsx --runInBand` passed for 021 focused coverage: 2 suites, 11 tests.
- `npx tsc --noEmit` passed.
- `npm run build` passed.
- `CI=1 npm test -- --watchAll=false` was executed and failed in `src/pages/Lobby/index.test.tsx`: 6 suites passed, 1 suite failed; 26 tests passed, 5 tests failed. The failure is because existing Lobby tests expect `藝妓組合` / unavailable-set copy while the current working tree renders `女公關組合` copy from the unrelated `src/pages/Lobby/LobbyPlayControls.tsx` user change. 021 touched no Lobby implementation files.
- Detailed UI motion review remains user-owned; residual manual review is recorded in `spec.md` and `quickstart.md`.

## Implementation Strategy

### MVP First
1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 to restore opening deal readability and correct interaction locking.
3. Validate new-round and next-round deal behavior before touching draw polish.

### Incremental Delivery
1. Add the short draw-arrival cue only for the receiving player.
2. Layer reduced-motion variants on top of the same cue paths.
3. Finish with public-safe removal feedback and regression validation.

### Scope Guardrails
- Do not add new socket event names or redesign the entire game-room animation system.
- Do not let motion state become a second source of truth for hand contents or action availability.
- Do not expose opponent hidden cards, pending choices, or extra card identity through deal, draw, or removal cues.
