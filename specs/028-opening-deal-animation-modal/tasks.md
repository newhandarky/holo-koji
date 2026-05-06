# Tasks: 開局發牌動畫 Modal

**Input**: Design documents from `specs/028-opening-deal-animation-modal/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/opening-deal-animation-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review 028 scope, clarifications, and out-of-scope boundaries in `specs/028-opening-deal-animation-modal/spec.md`.
- [X] T002 Review implementation constraints and validation commands in `specs/028-opening-deal-animation-modal/plan.md`.
- [X] T003 Review modal lifecycle, safe payload, and hidden-info rules in `specs/028-opening-deal-animation-modal/contracts/opening-deal-animation-contract.md`.
- [X] T004 Review existing opening deal state consumption in `src/pages/GameRoom/index.tsx`.
- [X] T005 Review existing motion helpers and opening deal cue behavior in `src/components/game/gameMotion.ts`.
- [X] T006 Review existing hand and board rendering surfaces in `src/components/game/GameBoard.tsx` and `src/components/game/PlayerHand.tsx`.

## Phase 2 - Foundation

- [X] T007 [P] Add opening deal modal test fixtures and safe forbidden-field assertions in `src/pages/GameRoom/index.test.tsx`.
- [X] T008 [P] Add reusable card back theme definition for `default-ginza` in `src/components/game/cardBackTheme.ts`.
- [X] T009 [P] Add opening deal modal state and step types in `src/components/game/OpeningDealModal.types.ts`.
- [X] T010 Create opening deal modal step derivation helper from safe `openingDeal` summary in `src/components/game/openingDealModalModel.ts`.
- [X] T011 Add unit tests for opening deal modal step derivation and forbidden card-field redaction in `src/components/game/openingDealModalModel.test.ts`.
- [X] T012 Add base modal component shell with inert card-back rendering in `src/components/game/OpeningDealModal.tsx`.
- [X] T013 Add modal styles with stable mobile-first layout constraints in `src/components/game/OpeningDealModal.css`.
- [X] T014 Export or import the modal styles through the existing frontend style entrypoint in `src/index.css`.

## Phase 3 - User Story 1: 觀看安全的開局發牌演出 (Priority: P1)

**Goal**: 新對局取得 replayable safe opening progress 時，顯示開局發牌 modal，依序呈現中央牌堆、1 張隱藏保留牌、雙方各 6 張背面發牌、完成狀態，播放期間阻擋後方 UI 並在完成後自動關閉。

**Independent Test**: 使用 replayable `openingDeal` 渲染 GameRoom，驗證 modal 出現、步驟順序正確、後方 UI 不接收操作、完成後自動關閉，且沒有卡面身分出現在畫面。

- [X] T015 [US1] Add GameRoom test for opening deal modal opening from replayable `openingDeal` in `src/pages/GameRoom/index.test.tsx`.
- [X] T016 [US1] Add GameRoom test for hidden burn before alternating first/second player card-back deal steps in `src/pages/GameRoom/index.test.tsx`.
- [X] T017 [US1] Add GameRoom test for behind-modal UI interaction blocking while the modal is visible in `src/pages/GameRoom/index.test.tsx`.
- [X] T018 [US1] Add GameRoom test for modal auto-close without changing existing own-hand visibility in `src/pages/GameRoom/index.test.tsx`.
- [X] T019 [US1] Add GameRoom test that rendered opening deal modal output contains no forbidden card identity fields in `src/pages/GameRoom/index.test.tsx`.
- [X] T020 [US1] Implement opening deal modal lifecycle state in `src/pages/GameRoom/index.tsx`.
- [X] T021 [US1] Render `OpeningDealModal` from GameRoom using safe `state.openingDeal` metadata in `src/pages/GameRoom/index.tsx`.
- [X] T022 [US1] Implement ordered burn/deal/completion presentation in `src/components/game/OpeningDealModal.tsx`.
- [X] T023 [US1] Implement local interaction blocking semantics for the modal overlay in `src/components/game/OpeningDealModal.tsx`.
- [X] T024 [US1] Implement auto-close completion callback and local sequence completion memory in `src/pages/GameRoom/index.tsx`.
- [X] T025 [US1] Ensure existing `DEAL_ANIMATION` hand-lane cue behavior does not duplicate or leak card faces when modal uses `openingDeal` in `src/pages/GameRoom/index.tsx`.
- [X] T026 [US1] Add fake-timer coverage that normal-motion opening deal modal completes and auto-closes within 6 seconds in `src/pages/GameRoom/index.test.tsx`.
- [X] T027 [US1] Run focused GameRoom tests `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx` and fix failures in touched frontend files.

## Phase 4 - User Story 2: 使用一致且可替換的卡背 (Priority: P2)

**Goal**: 所有 modal 牌面使用一致的 default Ginza card back，卡背與已揭露卡面可區分，且未來可集中替換主題。

**Independent Test**: 渲染開局 modal，確認中央牌堆、隱藏保留牌與所有發牌步驟都使用 default card back theme，且沒有任何 face-up asset、label 或 item metadata。

- [X] T028 [US2] Add tests that modal card backs use the default card back theme for deck, reserve, and dealt cards in `src/components/game/OpeningDealModal.test.tsx`.
- [X] T029 [US2] Add tests that card back theme output does not include face-up item or character metadata in `src/components/game/cardBackTheme.test.ts`.
- [X] T030 [US2] Wire `default-ginza` card back theme into `OpeningDealModal` in `src/components/game/OpeningDealModal.tsx`.
- [X] T031 [US2] Finalize default Ginza card back visual styling and reusable theme hooks in `src/components/game/OpeningDealModal.css`.
- [X] T032 [US2] Ensure card back theme can be swapped without changing opening deal modal step model in `src/components/game/openingDealModalModel.ts`.
- [X] T033 [US2] Run focused modal tests `CI=1 npm test -- --watchAll=false src/components/game/OpeningDealModal.test.tsx src/components/game/cardBackTheme.test.ts src/components/game/openingDealModalModel.test.ts` and fix failures in touched frontend files.

## Phase 5 - User Story 3: 在低動態或中斷情境下仍能理解流程 (Priority: P3)

**Goal**: Reduced motion 使用短版或完成狀態呈現；重連時 replayable progress 從頭播放，不可重播時直接顯示目前合法狀態。

**Independent Test**: 模擬 reduced motion、replayable reconnect 與 `not_replayable` opening deal，驗證 modal 呈現與 replay lifecycle 符合規格且不改變 server state。

- [X] T034 [US3] Add GameRoom reduced-motion test for short opening deal modal presentation in `src/pages/GameRoom/index.test.tsx`.
- [X] T035 [US3] Add GameRoom test for replayable reconnect restarting the opening deal modal from the beginning in `src/pages/GameRoom/index.test.tsx`.
- [X] T036 [US3] Add GameRoom test that `not_replayable` opening deal skips full modal replay in `src/pages/GameRoom/index.test.tsx`.
- [X] T037 [US3] Implement reduced-motion modal timing and completed-state behavior in `src/components/game/OpeningDealModal.tsx`.
- [X] T038 [US3] Implement replayable reconnect and not-replayable skip handling in `src/pages/GameRoom/index.tsx`.
- [X] T039 [US3] Ensure modal replay memory is page-local and does not send server mutations in `src/pages/GameRoom/index.tsx`.
- [X] T040 [US3] Run focused GameRoom tests `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx` and fix failures in touched frontend files.

## Phase 6 - Polish & Cross-Cutting Concerns

- [X] T041 [P] Review contract wording against implemented modal behavior in `specs/028-opening-deal-animation-modal/contracts/opening-deal-animation-contract.md`.
- [X] T042 [P] Update quickstart validation notes after final checks in `specs/028-opening-deal-animation-modal/quickstart.md`.
- [X] T043 Verify mobile and desktop viewport readability for deck, hidden reserve, first/second directions, and no major overlap; record automated or user-performed UI review result in `specs/028-opening-deal-animation-modal/quickstart.md`.
- [X] T044 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix failures in touched frontend files.
- [X] T045 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix build/type errors in touched files.
- [X] T046 Verify `git status --short` only includes intended 028 files from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before any user story implementation.
- User Story 1 is the MVP and must complete before User Story 2 and User Story 3.
- User Story 2 depends on the modal shell and lifecycle from User Story 1.
- User Story 3 depends on the modal lifecycle from User Story 1 and should preserve card back behavior from User Story 2.
- Phase 6 validation after all implemented user stories.

## Parallel Execution Examples

### Setup / Foundation

- T008 and T009 can run in parallel because they create different files.
- T010 and T012 should wait for T009 if shared modal types are referenced.
- T011 should wait for T010 because it tests the modal model helper.

### User Story 1

- T015, T016, T017, T018, and T019 should be sequential because they all update `src/pages/GameRoom/index.test.tsx`.
- T020, T021, T024, and T025 should be coordinated because they all modify `src/pages/GameRoom/index.tsx`.
- T022 and T023 can be implemented after T012 and can proceed separately from GameRoom wiring if props are stable.

### User Story 2

- T028 and T029 can run in parallel because they cover different test files.
- T030 and T031 should be coordinated because they connect component structure and CSS.
- T032 can proceed after T010 and T030 because it validates model/theme separation.

### User Story 3

- T034, T035, and T036 should be sequential because they all update `src/pages/GameRoom/index.test.tsx`.
- T037 can run in parallel with T038 because they modify `OpeningDealModal.tsx` and `GameRoom/index.tsx`.
- T039 should follow T038 because replay memory behavior belongs to the GameRoom lifecycle.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, and User Story 1. This delivers the core modal behavior: safe opening animation from `openingDeal`, behind-modal blocking, auto-close, and no hidden-info leakage.

### Incremental Delivery

1. Deliver User Story 1 with focused GameRoom tests passing.
2. Add User Story 2 for reusable card back theme and visual distinction.
3. Add User Story 3 for reduced motion and reconnect lifecycle.
4. Run full frontend tests and build before handoff.

## Notes

- Keep 028 scoped to modal presentation and card backs.
- Do not implement `拿取手牌`, hand flip, skip button, draw notification focus changes, settlement UI, server rule changes, or AI difficulty labels.
- Treat all opening modal steps as safe metadata only.
- Do not render card ids, geisha ids, labels, item images, charm values, or full card objects in modal output.
- Preserve existing own-hand visibility after modal auto-close until 029 changes that flow.
