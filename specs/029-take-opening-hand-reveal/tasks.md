# Tasks: 拿取開局手牌與翻面揭示

**Input**: Design documents from `specs/029-take-opening-hand-reveal/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/opening-hand-reveal-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review 029 scope, clarifications, and out-of-scope boundaries in `specs/029-take-opening-hand-reveal/spec.md`.
- [X] T002 Review implementation constraints and validation commands in `specs/029-take-opening-hand-reveal/plan.md`.
- [X] T003 Review local-state, concealment, and interaction rules in `specs/029-take-opening-hand-reveal/contracts/opening-hand-reveal-contract.md`.
- [X] T004 Review existing opening deal modal lifecycle in `src/pages/GameRoom/index.tsx`.
- [X] T005 Review existing hand rendering and selection behavior in `src/components/game/PlayerHand.tsx`.
- [X] T006 Review existing board-to-hand wiring in `src/components/game/GameBoard.tsx`.
- [X] T007 Review existing motion timing helpers in `src/components/game/gameMotion.ts`.
- [X] T008 Review existing card back theme usage in `src/components/game/cardBackTheme.ts`.

## Phase 2 - Foundation

- [X] T009 [P] Add opening hand reveal state, eligibility, and reveal-step types or helper interfaces in `src/components/game/openingHandRevealModel.ts`.
- [X] T010 [P] Add unit tests for eligibility, local lifecycle, reveal order, and timing budgets in `src/components/game/openingHandRevealModel.test.ts`.
- [X] T011 Implement opening hand reveal eligibility helper using opening deal completion, `playing` phase, own 6-card hand, unused action markers, and no pending interaction in `src/components/game/openingHandRevealModel.ts`.
- [X] T012 Implement reveal step derivation helper for current hand order and reduced motion in `src/components/game/openingHandRevealModel.ts`.
- [X] T013 [P] Add base concealed hand and reveal CSS classes for stable mobile-first layout in `src/components/game/PlayerHand.css`.
- [X] T014 Import or expose `src/components/game/PlayerHand.css` through the existing frontend style entrypoint in `src/index.css`.
- [X] T015 Add shared GameRoom opening-hand test fixtures and forbidden own-card identity assertions in `src/pages/GameRoom/index.test.tsx`.
- [X] T016 Run model tests `CI=1 npm test -- --watchAll=false src/components/game/openingHandRevealModel.test.ts` and fix failures in `src/components/game/openingHandRevealModel.ts`.

## Phase 3 - User Story 1: 拿取並揭示自己的開局手牌 (Priority: P1)

**Goal**: 開局發牌演出完成且仍符合開局拿取條件時，玩家先看到「拿取手牌」與遮蔽手牌，啟用後依目前手牌排序逐張揭示，完成後一律切換或聚焦到 `手牌&指令`。

**Independent Test**: 建立含 replayable/completed opening deal 與自己起始 6 張手牌的 GameRoom 狀態，確認手牌正面在拿取前不可見；啟用 `拿取手牌` 後逐張揭示，最後顯示正確 6 張手牌並切到 `手牌&指令`。

- [X] T017 [US1] Add GameRoom test that eligible opening state shows `拿取手牌` before own hand faces in `src/pages/GameRoom/index.test.tsx`.
- [X] T018 [US1] Add GameRoom test that pre-take own hand output hides card ids, labels, geisha ids, charm values, and image URLs in `src/pages/GameRoom/index.test.tsx`.
- [X] T019 [US1] Add GameRoom test that activating `拿取手牌` reveals own hand in current order in `src/pages/GameRoom/index.test.tsx`.
- [X] T020 [US1] Add GameRoom test that Enter/Space keyboard activation on `拿取手牌` starts reveal in `src/pages/GameRoom/index.test.tsx`.
- [X] T021 [US1] Add GameRoom test that reveal completion switches or focuses to `手牌&指令` in `src/pages/GameRoom/index.test.tsx`.
- [X] T022 [US1] Wire local opening-hand reveal lifecycle state into GameRoom after opening deal modal completion in `src/pages/GameRoom/index.tsx`.
- [X] T023 [US1] Derive concealed own-hand display and take eligibility from current GameRoom state in `src/pages/GameRoom/index.tsx`.
- [X] T024 [US1] Pass concealed/reveal state and take handler from GameRoom to board/hand surfaces in `src/pages/GameRoom/index.tsx`.
- [X] T025 [US1] Extend GameBoard props to forward opening-hand concealment and reveal state to PlayerHand in `src/components/game/GameBoard.tsx`.
- [X] T026 [US1] Render `拿取手牌` control and concealed own-hand placeholders in `src/components/game/PlayerHand.tsx`.
- [X] T027 [US1] Render sequential own-hand reveal states while preserving current hand order in `src/components/game/PlayerHand.tsx`.
- [X] T028 [US1] Implement post-reveal `handActions` section switch or focus behavior in `src/pages/GameRoom/index.tsx`.
- [X] T029 [US1] Run focused GameRoom tests `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx` and fix failures in touched frontend files.

## Phase 4 - User Story 2: 揭示前保護資訊並阻擋過早操作 (Priority: P2)

**Goal**: 玩家尚未拿取或揭示期間，不得透過手牌選取、手牌指令、鍵盤操作或重複啟動觸發任何對局行動；非破壞性的 UI 區塊導覽仍可保留。

**Independent Test**: 在 pending take 與 revealing 狀態下嘗試點擊/鍵盤操作手牌與指令，確認不會選牌、不會送出行動、不會重複揭示；同時確認切換非破壞性區塊仍可運作。

- [X] T030 [US2] Add GameRoom test that pre-take hand card selection is blocked in `src/pages/GameRoom/index.test.tsx`.
- [X] T031 [US2] Add GameRoom test that hand/action commands are blocked while pending take or revealing in `src/pages/GameRoom/index.test.tsx`.
- [X] T032 [US2] Add GameRoom test that keyboard-focused hand/action controls cannot trigger gameplay during reveal in `src/pages/GameRoom/index.test.tsx`.
- [X] T033 [US2] Add GameRoom test that non-destructive section navigation remains available during reveal in `src/pages/GameRoom/index.test.tsx`.
- [X] T034 [US2] Add GameRoom test that repeated `拿取手牌` activation does not duplicate reveal or submit actions in `src/pages/GameRoom/index.test.tsx`.
- [X] T035 [US2] Add GameRoom test that pre-take/revealing output does not expose opponent, removed, draw pile, or pending hidden identity fixtures in `src/pages/GameRoom/index.test.tsx`.
- [X] T036 [US2] Gate hand selection handlers while opening-hand reveal status is pending or revealing in `src/components/game/PlayerHand.tsx`.
- [X] T037 [US2] Gate GameRoom hand/action command handlers while opening-hand reveal status is pending or revealing in `src/pages/GameRoom/index.tsx`.
- [X] T038 [US2] Preserve bottom-section navigation while preventing gameplay actions during reveal in `src/pages/GameRoom/index.tsx`.
- [X] T039 [US2] Ensure revealed state releases interaction gating and resumes existing legal action availability in `src/pages/GameRoom/index.tsx`.
- [X] T040 [US2] Run focused interaction tests `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx` and fix failures in touched frontend files.

## Phase 5 - User Story 3: 在中斷、低動態與非開局狀態下保持正確 (Priority: P3)

**Goal**: Reduced motion 直接完成或 1 秒內完成；重新整理或重連後若仍符合條件可重新呈現本地拿取流程；若已非開局起始狀態則跳過閘門並顯示目前合法對局。

**Independent Test**: 模擬 reduced motion、重新掛載 GameRoom、以及手牌不再是起始 6 張或已進行行動的狀態，確認不重發牌、不複製牌、不洩漏隱藏資訊，且 gate 顯示/跳過符合條件。

- [X] T041 [US3] Add model test that reduced motion reveal directly completes or stays within 1 second in `src/components/game/openingHandRevealModel.test.ts`.
- [X] T042 [US3] Add GameRoom test that reduced motion take flow reveals immediately and lands on `手牌&指令` in `src/pages/GameRoom/index.test.tsx`.
- [X] T043 [US3] Add GameRoom test that remount/reconnect-like rerender can re-present local gate when eligibility still holds in `src/pages/GameRoom/index.test.tsx`.
- [X] T044 [US3] Add GameRoom test that progressed or non-starting hand state skips `拿取手牌` gate in `src/pages/GameRoom/index.test.tsx`.
- [X] T045 [US3] Add GameRoom test that reconnect-like replay does not duplicate cards or change card ownership in `src/pages/GameRoom/index.test.tsx`.
- [X] T046 [US3] Implement reduced-motion direct reveal behavior in `src/components/game/openingHandRevealModel.ts`.
- [X] T047 [US3] Reset or skip local opening-hand reveal state when GameRoom state becomes non-eligible in `src/pages/GameRoom/index.tsx`.
- [X] T048 [US3] Ensure page-session reveal memory is local only and does not write browser durable storage or emit socket events in `src/pages/GameRoom/index.tsx`.
- [X] T049 [US3] Run focused reduced-motion and reconnect tests `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx src/components/game/openingHandRevealModel.test.ts` and fix failures in touched frontend files.

## Phase 6 - Polish & Cross-Cutting Concerns

- [X] T050 [P] Review contract wording against implemented behavior in `specs/029-take-opening-hand-reveal/contracts/opening-hand-reveal-contract.md`.
- [X] T051 [P] Update quickstart validation notes after final checks in `specs/029-take-opening-hand-reveal/quickstart.md`.
- [X] T052 Verify mobile and desktop readability for `拿取手牌`, concealed hand, reveal states, and `手牌&指令` focus; record automated or user-performed UI review result in `specs/029-take-opening-hand-reveal/quickstart.md`.
- [X] T053 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix failures in touched frontend files.
- [X] T054 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix build/type errors in touched files.
- [X] T055 Verify no server, Socket.IO payload, or shared type changes were introduced for 029 in `server/index.js`, `game-shared-types/src/game.types.ts`, and `src/types/game-shared-types.d.ts`.
- [X] T056 Verify `git status --short` only includes intended 029 files from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before any user story implementation.
- User Story 1 is the MVP and must complete before User Story 2 and User Story 3.
- User Story 2 depends on User Story 1 because interaction gating needs the take/reveal lifecycle.
- User Story 3 depends on User Story 1 because reduced motion and reconnect behavior reuse the reveal lifecycle and eligibility model.
- Phase 6 validation after all implemented user stories.

## Parallel Execution Examples

### Setup / Foundation

- T009 and T013 can run in parallel because they create different files.
- T010 should wait for T009 if shared model types are created there.
- T015 can run in parallel with T009 through T014 because it only updates GameRoom test fixtures.

### User Story 1

- T017, T018, T019, and T020 should be coordinated because they all update `src/pages/GameRoom/index.test.tsx`.
- T021, T022, T023, and T027 should be coordinated because they all modify `src/pages/GameRoom/index.tsx`.
- T024 can proceed after T023 stabilizes props because it only updates `src/components/game/GameBoard.tsx`.
- T025 and T026 should be coordinated because they both modify `src/components/game/PlayerHand.tsx`.

### User Story 2

- T029 through T033 should be sequential or carefully batched because they all update `src/pages/GameRoom/index.test.tsx`.
- T034 can run in parallel with T035 because they modify `src/components/game/PlayerHand.tsx` and `src/pages/GameRoom/index.tsx`, but integration requires matching gate props.
- T036 and T037 should follow T035 because they depend on the GameRoom gating semantics.

### User Story 3

- T039 and T044 can be paired in `src/components/game/openingHandRevealModel.test.ts` and `src/components/game/openingHandRevealModel.ts`.
- T040 through T043 should be coordinated because they all update `src/pages/GameRoom/index.test.tsx`.
- T045 and T046 should be coordinated because both manage GameRoom local lifecycle and persistence boundaries.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, and User Story 1. This delivers the core flow: eligible players see `拿取手牌`, own opening hand remains concealed, take activation reveals the current own hand in order, and completion lands on `手牌&指令`.

### Incremental Delivery

1. Deliver User Story 1 with focused GameRoom and model tests passing.
2. Add User Story 2 to harden hand/action blocking and hidden-info behavior.
3. Add User Story 3 for reduced motion, reconnect replay, and non-eligible skip behavior.
4. Run full frontend tests and build before handoff.

## Notes

- Keep 029 presentation-only; do not add server state, Socket.IO events, shared type fields, or durable browser storage.
- Do not change 028 opening deal modal, skip button behavior, draw notification focus, settlement UI, or AI difficulty labels.
- Treat the viewer's own legal hand as sensitive until take completes; concealed UI must not render card ids, labels, image URLs, geisha ids, charm values, or full card objects.
- After reveal, existing server-authoritative rules still decide whether any hand action is actually available.
