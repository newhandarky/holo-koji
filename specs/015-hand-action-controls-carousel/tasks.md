# Tasks: Hand Action Controls Carousel

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/015-hand-action-controls-carousel/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review 015 scope, clarifications, and contract boundaries in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/015-hand-action-controls-carousel/spec.md` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/015-hand-action-controls-carousel/contracts/hand-action-controls-carousel-contract.md`.
- [x] T002 Confirm the only planned code-touch files are `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/ActionTokens.tsx`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.

## Phase 2 - Foundational

- [x] T003 Identify current `手牌&指令` render order and insertion points for bottom action row and hand focus controls in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`.
- [x] T004 Add/adjust shared hand-focus state flow contract comments and prop expectations between `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`.
- [x] T005 Define responsive CSS variable baselines for fan overlap, focus elevation, and bottom action row width behavior in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.

## Phase 3 - User Story 1 (P1)

**Goal**: 讓四個 action token 固定在 `手牌&指令` 區塊底部，滿版四等分，並保留既有行動流程與狀態語意。  
**Independent Test**: 在可操作與不可操作時各檢查一次 `手牌&指令`，確認四個 token 皆固定底部單列顯示；可用 token 仍走既有流程、不可操作時全部停用但狀態仍可辨識。

- [x] T006 [US1] Refactor hand/actions section layout to keep action controls anchored at the bottom of the section in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`.
- [x] T007 [US1] Keep action tokens visible during non-actionable turns while preserving existing disabled behavior in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/ActionTokens.tsx`.
- [x] T008 [US1] Update action row and token wrapper styles to full-width four-column single-row presentation in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T009 [US1] Preserve used/available/disabled/inspectable visual cues and click routing semantics in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/ActionTokens.tsx`.

## Phase 4 - User Story 2 (P2)

**Goal**: 在扇形手牌中加入左右焦點 carousel，支援首尾循環、鍵盤可操作與 aria label，且不影響選牌數量。  
**Independent Test**: 手牌至少兩張時，用左右控制切換焦點，確認首尾循環、生效速度、焦點牌層級、鍵盤可操作與 aria label；切換焦點不改變已選牌數。

- [x] T010 [US2] Implement hand focus carousel state transitions (prev/next wrap, first-load middle, preserve-or-nearest fallback) in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`.
- [x] T011 [US2] Add left/right hand focus controls with keyboard-focusable button semantics and aria labels in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`.
- [x] T012 [US2] Ensure focus-control actions never mutate selected-card membership in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`.
- [x] T013 [US2] Update fan-layer stacking and focus emphasis styles so focused card stays visually above neighbors in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.

## Phase 5 - User Story 3 (P3)

**Goal**: 保留既有點擊選牌行為，並在選取卡右上顯示 48px 綠色 check icon，同時確保焦點與選取雙狀態共存可辨識。  
**Independent Test**: 點擊卡牌可選取/取消且同時聚焦；已選卡必有 48px 綠色 check icon；圖面、魅力或關鍵文字仍可辨識。

- [x] T014 [US3] Keep click-to-select/deselect behavior while enforcing click-to-focus on the same interaction path in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`.
- [x] T015 [US3] Render selected-card 48px green check indicator in hand card markup and state classes in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`.
- [x] T016 [US3] Style selected check indicator position, size, and overlap safety for focused/non-focused cards in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T017 [US3] Guard card readability by tuning overlay/stacking interactions for selected + focused combinations in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.

## Phase 6 - User Story 4 (P4)

**Goal**: 維持手機/桌機可操作性與既有動態效果，避免手牌區造成整頁水平溢出。  
**Independent Test**: 在手機寬度與桌機寬度檢查 `手牌&指令`，確認不跑版、不水平溢出，draw/hand motion cue 與 reduced-motion 行為可用。

- [x] T018 [US4] Reconcile responsive fan spacing/overlap variables for mobile and desktop to prevent horizontal overflow in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T019 [US4] Keep draw motion and hand motion cue classes compatible with new focus/selection layering in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T020 [US4] Ensure reduced-motion mode remains readable and non-essential movement stays minimized in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`.
- [x] T021 [US4] Verify hand/actions section does not expose opponent hidden information while applying new controls in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`.

## Phase 7 - Polish & Cross-Cutting

- [x] T022 [P] Align 015 documentation wording with final implementation decisions in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/015-hand-action-controls-carousel/spec.md` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/015-hand-action-controls-carousel/quickstart.md`.
- [x] T023 Run `CI=1 npm test -- --watchAll=false` in `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [x] T024 Run `npm run build` in `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [x] T025 Record completion status and user-owned UI verification notes in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/015-hand-action-controls-carousel/tasks.md` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/015-hand-action-controls-carousel/spec.md`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before user story phases.
- US1 (Phase 3) should complete before US2 (Phase 4) to stabilize hand/actions layout anchor points.
- US2 (Phase 4) should complete before US3 (Phase 5) because selected+focused composition depends on finalized focus state transitions.
- US4 (Phase 6) runs after US1-US3 behavior is stable.
- Phase 7 runs after all user story phases.

## Parallel Execution Examples

- US1: T008 and T009 can run in parallel after T006-T007 confirm the render placement and behavior constraints.
- US2: T011 and T013 can run in parallel after T010 defines focus-state transitions.
- US3: T016 and T017 can run in parallel after T014-T015 stabilize selected/focused markup classes.
- US4: T019 and T020 can run in parallel after T018 sets responsive spacing baselines.
- Polish: T022 can run in parallel with T023/T024 once implementation tasks are complete.

## Implementation Strategy

- MVP first: deliver US1 only to stabilize action-token layout and preserve core action flow.
- Next increment: deliver US2 to make hand focus navigation deterministic and accessible.
- Third increment: deliver US3 to complete selected-card visual affordance requirements.
- Final increment: deliver US4 responsive/motion hardening and hidden-information safety checks.
- Close with Phase 7 validation and documentation sync.
