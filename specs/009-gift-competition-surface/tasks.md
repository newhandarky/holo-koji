# Tasks: Gift Competition Surface Polish

**Input**: Design documents from `specs/009-gift-competition-surface/`  
**Prerequisites**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/gift-competition-surface-ui-contract.md](./contracts/gift-competition-surface-ui-contract.md), [quickstart.md](./quickstart.md)

## Phase 1 - Setup

- [x] T001 Review clarified scope, assumptions, and out-of-scope constraints in `specs/009-gift-competition-surface/spec.md`.
- [x] T002 Review implementation boundaries and constitution check in `specs/009-gift-competition-surface/plan.md`.
- [x] T003 [P] Review UI behavior contract in `specs/009-gift-competition-surface/contracts/gift-competition-surface-ui-contract.md`.
- [x] T004 [P] Review manual UI review ownership and validation scope in `specs/009-gift-competition-surface/quickstart.md`.

## Phase 2 - Foundation

- [x] T005 Identify current gift-response rendering structure and click-to-submit callback flow in `src/components/game/PendingInteractionModal.tsx`.
- [x] T006 Identify current competition-response rendering structure and chosen-group submit callback flow in `src/components/game/PendingInteractionModal.tsx`.
- [x] T007 Identify current competition-grouping rendering structure and grouping submission output shape in `src/components/game/CompetitionGroupModal.tsx`.
- [x] T008 Identify reusable card rendering and charm lookup paths used by gift/competition surfaces in `src/components/game/PendingInteractionModal.tsx`.
- [x] T009 Identify existing interaction and motion CSS selectors for gift/competition surfaces in `src/index.css`.
- [x] T010 Confirm 009 remains frontend-only with no required edits in `server/` or `game-shared-types/` using `specs/009-gift-competition-surface/plan.md`.

## Phase 3 - User Story 1: 清楚回應贈予選擇 (Priority: P1)

**Goal**: 讓玩家在贈予回應畫面快速辨識三張可選卡，保持點擊即送出，並在手機寬度保留可讀與可點擊性。  
**Independent Test**: 觸發贈予回應時，確認三張卡片資訊清楚、點擊任一卡立即送出既有贈予回應、手機畫面不產生主要內容水平捲動。

- [x] T011 [US1] Refine gift-response body structure for clearer option grouping while preserving immediate submit action in `src/components/game/PendingInteractionModal.tsx`.
- [x] T012 [US1] Preserve existing gift-response payload semantics (`RESOLVE_GIFT` with `chosenCardId`) while enhancing option markup readability in `src/components/game/PendingInteractionModal.tsx`.
- [x] T013 [US1] Add/adjust gift option styling tokens for clearer selectable states in `src/index.css`.
- [x] T014 [P] [US1] Add keyboard focus-visible and press feedback styling for gift option controls in `src/index.css`.
- [x] T015 [US1] Add mobile gift-option stacking/wrapping rules inside bottom sheet to preserve readability without main horizontal overflow in `src/index.css`.
- [x] T016 [US1] Verify gift-response surface behavior against `specs/009-gift-competition-surface/contracts/gift-competition-surface-ui-contract.md`.

## Phase 4 - User Story 2: 清楚建立競爭分組 (Priority: P1)

**Goal**: 讓玩家在競爭分組畫面清楚比較三個方案，含單卡資訊與每組魅力合計，維持點擊即送出既有方案。  
**Independent Test**: 玩家選四張卡進入競爭分組時，可清楚比較三方案與兩組分界、每組魅力合計，點擊方案後沿用既有競爭送出流程。

- [x] T017 [US2] Add display-only group charm total computation for each competition grouping option in `src/components/game/CompetitionGroupModal.tsx`.
- [x] T018 [US2] Update competition grouping option markup to surface two-group boundaries, per-card charm, and group total labels in `src/components/game/CompetitionGroupModal.tsx`.
- [x] T019 [US2] Preserve existing grouping output shape (`string[][]`) and immediate submit callback behavior while refactoring option presentation in `src/components/game/CompetitionGroupModal.tsx`.
- [x] T020 [US2] Add/adjust grouping option surface styling for clear option boundaries and readable total labels in `src/index.css`.
- [x] T021 [P] [US2] Add responsive grouping layout rules so mobile can stack/wrap option internals while desktop keeps at-a-glance comparison in `src/index.css`.
- [x] T022 [US2] Verify competition grouping surface behavior against `specs/009-gift-competition-surface/contracts/gift-competition-surface-ui-contract.md`.

## Phase 5 - User Story 3: 清楚回應競爭選組 (Priority: P2)

**Goal**: 讓玩家在競爭回應畫面清楚比較兩組卡片與每組魅力合計，保持點擊即送出既有選組語意。  
**Independent Test**: 觸發競爭回應時，兩組卡片資訊與合計可辨識，點擊其中一組立即送出原有 `chosenGroupIndex` 流程。

- [x] T023 [US3] Add display-only group charm total computation for pending competition response groups in `src/components/game/PendingInteractionModal.tsx`.
- [x] T024 [US3] Refine competition-response group markup to clearly separate options and expose group total plus per-card charm in `src/components/game/PendingInteractionModal.tsx`.
- [x] T025 [US3] Preserve existing competition-response payload semantics (`RESOLVE_COMPETITION` with `chosenGroupIndex`) and immediate submit behavior in `src/components/game/PendingInteractionModal.tsx`.
- [x] T026 [US3] Add/adjust response-group styling and selectable-state feedback for competition response options in `src/index.css`.
- [x] T027 [P] [US3] Add mobile stacking/wrapping rules for competition response options inside bottom sheet without main horizontal overflow in `src/index.css`.
- [x] T028 [US3] Verify competition response surface behavior against `specs/009-gift-competition-surface/contracts/gift-competition-surface-ui-contract.md`.

## Phase 6 - User Story 4: 與 Ginza 視覺與手機操作一致 (Priority: P3)

**Goal**: 讓贈予/競爭表面與 Ginza v2、007、008 的視覺語言一致，並保留既有 motion 與可及性互動。  
**Independent Test**: 在桌機與手機寬度檢查三個表面，確認風格一致、hover/press/focus 明確、motion cue 可辨識且不遮蔽選項。

- [x] T029 [US4] Harmonize shared surface tokens (border, background, shadow, spacing) for gift/competition option containers in `src/index.css`.
- [x] T030 [US4] Ensure gift-result and competition-result motion-source classes remain compatible with polished option surfaces in `src/index.css`.
- [x] T031 [US4] Ensure reduced-motion class behavior remains intact for updated option and group surfaces in `src/index.css`.
- [x] T032 [US4] Verify polished visual language compatibility with current room surface and fan-hand context in `src/components/game/PendingInteractionModal.tsx`.
- [x] T033 [US4] Verify polished visual language compatibility with current room surface and fan-hand context in `src/components/game/CompetitionGroupModal.tsx`.

## Phase 7 - Polish & Cross-Cutting Concerns

- [x] T034 Confirm final diff scope does not modify `server/`, `game-shared-types/`, Socket.IO contracts, action payload shapes, or gameplay rules in `specs/009-gift-competition-surface/spec.md`.
- [x] T035 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [x] T036 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [x] T037 Record user-owned manual UI review status and residual visual-check risks in `specs/009-gift-competition-surface/tasks.md`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before all user story phases.
- User Story 1 and User Story 2 are both P1 and can proceed in parallel after Phase 2, but both should finish before User Story 4 consistency pass.
- User Story 3 depends on shared interaction styling patterns from User Story 1 and total-display conventions established in User Story 2.
- Phase 7 runs after all user stories are completed.

## Parallel Execution Examples

### User Story 1

- T014 can run in parallel with T013 after T011-T012 complete.
- T016 runs after T011-T015.

### User Story 2

- T021 can run in parallel with T020 after T017-T019 complete.
- T022 runs after T017-T021.

### User Story 3

- T027 can run in parallel with T026 after T023-T025 complete.
- T028 runs after T023-T027.

### User Story 4

- T032 and T033 can run in parallel after T029-T031 complete.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, then User Story 1 and User Story 2 first. This delivers the highest-value interaction polish for both gift response and competition grouping with immediate gameplay impact.

### Incremental Delivery

1. Deliver User Story 1: clearer gift response surface with immediate submit preserved.
2. Deliver User Story 2: clearer competition grouping with display-only group charm totals.
3. Deliver User Story 3: clearer competition response with display-only group charm totals.
4. Deliver User Story 4: cross-surface consistency, motion compatibility, and accessibility feedback polish.
5. Finish with Phase 7 validation and manual-review record.

### Scope Guardrails

- Do not add preview-selection or second-confirmation interaction states.
- Do not alter gift/competition legal option generation, payload semantics, or callback wiring contracts.
- Do not modify server-side validation, shared types, or Socket.IO contracts.
- Keep detailed visual acceptance as user-owned manual review per `AGENTS.md`.

## Manual UI Review Record (T037)

- Owner: User (per `AGENTS.md` policy)
- Status: Pending user confirmation
- Required checks:
- Gift response surface readability and immediate submit behavior
- Competition grouping surface (3 options + group totals) readability and immediate submit behavior
- Competition response surface (2 groups + group totals) readability and immediate submit behavior
- Mobile stacking/wrapping and no main horizontal scroll
- Hover/press/focus feedback and motion cue visibility
- Residual risk: Until user confirms manual review, cross-device visual acceptance remains unverified.

## Closeout Record

- Spec status: Completed.
- Speckit analyze: No blocking cross-artifact drift found across `spec.md`, `plan.md`, `tasks.md`, contract, and constitution checks. Remaining manual UI review is documented as residual by design.
- Code review: Previous findings for coverflow adjacent transform and competition response click target were fixed; focused re-review found no new findings.
- Validation: `CI=1 npm test -- --watchAll=false` passed on 2026-05-02. Existing warnings remain: React `act` deprecation and React Router v7 future flags.
- Validation: `npm run build` passed on 2026-05-02.
- Scope check: No `server/`, `game-shared-types/`, Socket.IO event, action payload, scoring, turn order, win/loss, or action legality changes were introduced for 009.
