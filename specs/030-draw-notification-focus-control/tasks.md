# Tasks: 抽牌通知與焦點控制

**Input**: Design documents from `specs/030-draw-notification-focus-control/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/draw-notification-focus-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review 030 scope, clarifications, and out-of-scope boundaries in `specs/030-draw-notification-focus-control/spec.md`.
- [X] T002 Review technical approach and validation requirements in `specs/030-draw-notification-focus-control/plan.md`.
- [X] T003 Review draw presentation contracts in `specs/030-draw-notification-focus-control/contracts/draw-notification-focus-contract.md`.
- [X] T004 Review existing drawQueue handling in `src/pages/GameRoom/index.tsx`.
- [X] T005 Review existing draw motion helpers in `src/components/game/gameMotion.ts`.
- [X] T006 Review existing hand rendering and draw cue usage in `src/components/game/PlayerHand.tsx`.
- [X] T007 Review current GameRoom tests around drawQueue in `src/pages/GameRoom/index.test.tsx`.
- [X] T008 Review whether existing `src/components/game/DrawCardModal.tsx` should be reused, adapted, or left unused for 030 without changing scope.

## Phase 2 - Foundation

- [X] T009 [P] Add local draw review model types and pure decision helpers in `src/components/game/drawNotificationModel.ts`.
- [X] T010 [P] Add unit tests for draw review decisions, 5-second timeout, queue ordering, necessary-flow deferral, and reduced timing in `src/components/game/drawNotificationModel.test.ts`.
- [X] T011 Implement self/opponent draw event classification and current-section routing helpers in `src/components/game/drawNotificationModel.ts`.
- [X] T012 Implement draw review decision transition helpers for `pending`, `view_now`, `dismissed`, `timeout_dismissed`, and `animated` in `src/components/game/drawNotificationModel.ts`.
- [X] T013 Implement draw presentation timing constants for 5-second notification timeout, <=2-second normal flip, and <=1-second reduced completion in `src/components/game/drawNotificationModel.ts`.
- [X] T014 [P] Add base draw notification and draw flip CSS classes in `src/components/game/DrawNotification.css`.
- [X] T015 Import or expose `src/components/game/DrawNotification.css` through the existing frontend style entrypoint in `src/index.css`.
- [X] T016 Add shared GameRoom test fixtures for self draw card identity, opponent hidden draw, queued draw events, and necessary-flow states in `src/pages/GameRoom/index.test.tsx`.
- [X] T017 Run model tests `CI=1 npm test -- --watchAll=false src/components/game/drawNotificationModel.test.ts` and fix failures in `src/components/game/drawNotificationModel.ts`.

## Phase 3 - User Story 1: 抽牌不打斷目前查看區塊 (Priority: P1)

**Goal**: 玩家在 `資訊` 或 `角色` 區收到自己的抽牌事件時不被強制切到 `手牌&指令`，而是看到安全抽牌通知、可選 `稍後確認` 或 `現在查看`，5 秒無回應則自動視為稍後確認。

**Independent Test**: 讓玩家停留在 `資訊` 或 `角色` 並觸發自己抽牌，確認 focus section 不變、通知出現、卡面資訊不外洩、5 秒後通知自動消失且不切換區塊。

- [X] T018 [US1] Add GameRoom test that self draw while focused on `角色` keeps `characterBoard` and shows `稍後確認` / `現在查看` in `src/pages/GameRoom/index.test.tsx`.
- [X] T019 [US1] Add GameRoom test that self draw while focused on `資訊` keeps `info` and does not expand or focus `handActions` in `src/pages/GameRoom/index.test.tsx`.
- [X] T020 [US1] Add GameRoom test that non-hand self draw notification hides card id, geisha id, charm value, label, image URL, icon URL, and full card content in `src/pages/GameRoom/index.test.tsx`.
- [X] T021 [US1] Add GameRoom test that `稍後確認` closes the notification, consumes the draw event, and keeps the current section in `src/pages/GameRoom/index.test.tsx`.
- [X] T022 [US1] Add GameRoom test that 5-second timeout closes the notification as `稍後確認` without focusing `handActions` in `src/pages/GameRoom/index.test.tsx`.
- [X] T022a [US1] Add GameRoom keyboard activation test that Enter/Space on `稍後確認` and `現在查看` trigger the same decisions as pointer activation in `src/pages/GameRoom/index.test.tsx`.
- [X] T023 [US1] Wire local draw review state into GameRoom from existing `drawQueue[0]`, current player, `focusSection`, and reduced-motion preference in `src/pages/GameRoom/index.tsx`.
- [X] T024 [US1] Replace immediate self draw consumption outside `handActions` with a pending notification decision in `src/pages/GameRoom/index.tsx`.
- [X] T025 [US1] Render safe self draw notification with card back, `稍後確認`, and `現在查看` controls in `src/pages/GameRoom/index.tsx`.
- [X] T026 [US1] Implement `稍後確認` handler and 5-second auto-dismiss behavior that consumes the active draw event in `src/pages/GameRoom/index.tsx`.
- [X] T027 [US1] Ensure non-hand self draw notification does not pass face-specific labels, image URLs, geisha ids, charm values, or full card objects into rendered output in `src/pages/GameRoom/index.tsx`.
- [X] T028 [US1] Run focused GameRoom draw notification tests `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx` and fix failures in touched frontend files.

## Phase 4 - User Story 2: 玩家可立即查看新抽手牌 (Priority: P2)

**Goal**: 玩家按下 `現在查看` 後切到 `手牌&指令`，先看到新抽牌牌背，再翻轉顯示卡牌內容並加入目前合法手牌；按 `稍後確認` 後之後手動進入手牌區不重播同一抽牌動畫。

**Independent Test**: 在非手牌區收到自己抽牌通知後按 `現在查看`，確認切到手牌區並完成牌背到翻面；按 `稍後確認` 後再手動切到手牌區，確認不補播同一動畫。

- [X] T029 [US2] Add GameRoom test that `現在查看` focuses `handActions` and starts draw flip presentation in `src/pages/GameRoom/index.test.tsx`.
- [X] T030 [US2] Add GameRoom test that draw flip presentation shows card back before card face content in `src/pages/GameRoom/index.test.tsx`.
- [X] T031 [US2] Add GameRoom test that draw flip completion shows current legal hand including the drawn card in `src/pages/GameRoom/index.test.tsx`.
- [X] T032 [US2] Add GameRoom test that `稍後確認` followed by manual `手牌&指令` navigation does not replay the same draw animation in `src/pages/GameRoom/index.test.tsx`.
- [X] T033 [US2] Extend GameRoom draw review handlers for `現在查看` transition and handActions focus in `src/pages/GameRoom/index.tsx`.
- [X] T034 [US2] Add or adapt hand-section draw flip presentation props from GameRoom to GameBoard and PlayerHand in `src/pages/GameRoom/index.tsx` and `src/components/game/GameBoard.tsx`.
- [X] T035 [US2] Render card-back-to-face draw flip states for the active self draw in `src/components/game/PlayerHand.tsx`.
- [X] T036 [US2] Add explicit draw flip helper functions while keeping normal duration <=2 seconds in `src/components/game/gameMotion.ts`.
- [X] T037 [US2] Ensure draw flip completion consumes the active draw event without submitting gameplay actions in `src/pages/GameRoom/index.tsx`.
- [X] T038 [US2] Run focused draw flip tests `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx src/components/game/gameMotion.test.ts` and fix failures in touched frontend files.

## Phase 5 - User Story 3: 已在手牌區時保留既有抽牌節奏 (Priority: P3)

**Goal**: 玩家已在 `手牌&指令` 時收到自己的抽牌事件，不顯示決策通知，直接在手牌區以牌背到翻面的方式呈現新抽牌，並支援 reduced motion。

**Independent Test**: 讓玩家停留在 `手牌&指令` 觸發自己抽牌，確認焦點不變、沒有 `稍後確認` / `現在查看` 通知、正常模式翻面在 2 秒內完成、reduced motion 在 1 秒內完成或直接完成。

- [X] T039 [US3] Add GameRoom test that self draw while already in `handActions` skips decision notification and starts draw flip presentation in `src/pages/GameRoom/index.test.tsx`.
- [X] T040 [US3] Add GameRoom test that handActions self draw does not switch to another section and does not block legal controls beyond the presentation budget in `src/pages/GameRoom/index.test.tsx`.
- [X] T041 [US3] Add motion test that normal draw flip presentation completes within 2 seconds in `src/components/game/gameMotion.test.ts`.
- [X] T042 [US3] Add model test that reduced motion draw presentation completes within 1 second or directly shows completed hand state in `src/components/game/drawNotificationModel.test.ts`.
- [X] T043 [US3] Implement direct handActions draw presentation routing in `src/pages/GameRoom/index.tsx`.
- [X] T044 [US3] Implement reduced-motion direct or shortened draw presentation path in `src/components/game/drawNotificationModel.ts` and `src/pages/GameRoom/index.tsx`.
- [X] T045 [US3] Ensure existing action availability rules resume unchanged after hand-section draw presentation in `src/pages/GameRoom/index.tsx`.
- [X] T046 [US3] Run focused hand-section draw tests `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx src/components/game/drawNotificationModel.test.ts src/components/game/gameMotion.test.ts` and fix failures in touched frontend files.

## Phase 6 - User Story 4: 對手抽牌與必要流程不洩漏或被打斷 (Priority: P3)

**Goal**: 對手抽牌只呈現安全摘要；必要流程期間到達的自己抽牌事件不覆蓋必要流程，排隊到流程結束後再依當下區塊顯示通知或翻牌。

**Independent Test**: 觸發對手抽牌與必要流程中的自己抽牌，確認對手卡面資訊不出現，必要流程不被蓋掉，流程結束後事件依當下區塊正確處理；多個自己抽牌事件依序處理。

- [X] T047 [US4] Add GameRoom test that opponent draw output contains only safe summary and no card id, geisha id, charm, label, image URL, or icon URL in `src/pages/GameRoom/index.test.tsx`.
- [X] T048 [US4] Add GameRoom test that self draw during order decision or opening deal modal defers notification until the necessary flow releases in `src/pages/GameRoom/index.test.tsx`.
- [X] T049 [US4] Add GameRoom test that self draw during pending interaction or opening hand reveal defers notification until the necessary flow releases in `src/pages/GameRoom/index.test.tsx`.
- [X] T050 [US4] Add GameRoom test that deferred self draw uses the focus section at release time, not the section at event arrival time in `src/pages/GameRoom/index.test.tsx`.
- [X] T051 [US4] Add GameRoom test that multiple self draw events are processed in arrival order without overwriting an unhandled notification in `src/pages/GameRoom/index.test.tsx`.
- [X] T052 [US4] Implement necessary-flow gate detection for draw notifications in `src/pages/GameRoom/index.tsx`.
- [X] T053 [US4] Implement deferred draw handling that re-evaluates current focus section when necessary flow releases in `src/pages/GameRoom/index.tsx`.
- [X] T054 [US4] Preserve opponent draw safe summary behavior while preventing card face identity from rendering in `src/pages/GameRoom/index.tsx`.
- [X] T055 [US4] Implement or verify draw event queue consumption remains one-at-a-time for self and opponent events in `src/pages/GameRoom/index.tsx`.
- [X] T056 [US4] Run focused queue/deferral/redaction tests `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx` and fix failures in touched frontend files.

## Phase 7 - Polish & Cross-Cutting Concerns

- [X] T057 [P] Review `specs/030-draw-notification-focus-control/contracts/draw-notification-focus-contract.md` against implemented behavior and update only if behavior intentionally changed.
- [X] T058 [P] Update validation notes in `specs/030-draw-notification-focus-control/quickstart.md` after final checks.
- [X] T059 Verify mobile and desktop readability for draw notification, two notification actions, card-back-to-flip presentation, and necessary-flow non-interruption; record automated or user-owned manual UI review result in `specs/030-draw-notification-focus-control/quickstart.md`.
- [X] T060 Run `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx src/components/game/drawNotificationModel.test.ts src/components/game/gameMotion.test.ts` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix failures in touched frontend files.
- [X] T061 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix failures in touched frontend files.
- [X] T062 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix build/type errors in touched files.
- [X] T063 Verify no server, Socket.IO payload, or shared type changes were introduced for 030 in `server/index.js`, `game-shared-types/src/game.types.ts`, and `src/types/game-shared-types.d.ts`.
- [X] T064 Verify `git status --short` only includes intended 030 files from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before any user story implementation.
- User Story 1 is the MVP and must complete before User Story 2 because `現在查看` depends on the pending notification state.
- User Story 2 should complete before User Story 3 because both share the hand-section draw flip presentation.
- User Story 4 can begin after Phase 2 but should integrate after US1/US2 state semantics are stable.
- Phase 7 validation after all implemented user stories.

## Parallel Execution Examples

### Setup / Foundation

- T009, T014, and T016 can run in parallel because they create or modify different files.
- T010 should follow T009 if shared model types are created there.
- T011 through T013 should be coordinated because they all modify `src/components/game/drawNotificationModel.ts`.

### User Story 1

- T018, T019, T020, T021, and T022 should be coordinated because they all modify `src/pages/GameRoom/index.test.tsx`.
- T023 through T027 should be sequential because draw review lifecycle and notification rendering are tightly coupled in `src/pages/GameRoom/index.tsx`.

### User Story 2

- T029 through T032 should be coordinated because they all modify `src/pages/GameRoom/index.test.tsx`.
- T033 and T037 should be coordinated in `src/pages/GameRoom/index.tsx`.
- T034 and T035 can be paired after prop shape stabilizes because they modify `src/components/game/GameBoard.tsx` and `src/components/game/PlayerHand.tsx`.
- T036 can run in parallel with T034/T035 if the helper interface is agreed first.

### User Story 3

- T041 and T042 can run in parallel if one targets `src/components/game/drawNotificationModel.test.ts` and the other targets `src/components/game/gameMotion.test.ts`.
- T043 through T045 should be coordinated because they share GameRoom presentation lifecycle.

### User Story 4

- T047, T048, T049, T050, and T051 should be coordinated because they all modify `src/pages/GameRoom/index.test.tsx`.
- T052 and T053 should be sequential because deferral depends on the necessary-flow gate.
- T054 and T055 can run in parallel only if they touch separate helper paths; otherwise coordinate in `src/pages/GameRoom/index.tsx`.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, and User Story 1. This delivers the core fix: self draw no longer steals focus from `資訊` or `角色`, notification is safe, and timeout/`稍後確認` work without changing game state.

### Incremental Delivery

1. Deliver User Story 1 with focused notification tests passing.
2. Add User Story 2 so `現在查看` runs the hand-section card-back-to-flip flow.
3. Add User Story 3 to preserve direct hand-section draw presentation and reduced motion.
4. Add User Story 4 to harden opponent redaction, queue ordering, and necessary-flow deferral.
5. Run full frontend tests and build before handoff.

## Notes

- Keep 030 presentation-only; do not add server state, Socket.IO events, shared type fields, or durable browser storage.
- Do not change 027 opening deal, 028 opening modal, 029 opening hand reveal, settlement UI, or lobby AI text.
- Treat the self draw notification outside `手牌&指令` as pre-flip: card face data must not render there.
- After draw presentation completes, existing server-authoritative rules still decide whether any action is legal.
