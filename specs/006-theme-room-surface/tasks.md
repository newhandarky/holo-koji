# Tasks: Theme And Room Surface

**Input**: Design documents from `specs/006-theme-room-surface/`  
**Prerequisites**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/theme-surface-ui-contract.md](./contracts/theme-surface-ui-contract.md), [quickstart.md](./quickstart.md)

## Phase 1 - Setup

- [X] T001 Review visual scope and out-of-scope rules in `specs/006-theme-room-surface/spec.md`.
- [X] T002 Review implementation plan and risks in `specs/006-theme-room-surface/plan.md`.
- [X] T003 [P] Review UI contract acceptance rules in `specs/006-theme-room-surface/contracts/theme-surface-ui-contract.md`.
- [X] T004 [P] Review manual validation checklist in `specs/006-theme-room-surface/quickstart.md`.

## Phase 2 - Foundation

- [X] T005 Identify current app background selectors `.game-background` and `.lobby-background` in `src/index.css`.
- [X] T006 Identify current lobby page wrapper and readable lobby panels in `src/pages/Lobby/index.tsx`.
- [X] T007 Identify current game-room loading, waiting-room, and active gameplay wrappers in `src/pages/GameRoom/index.tsx`.
- [X] T008 Confirm no backend, shared-type, or Socket.IO files are needed for this visual-only scope in `specs/006-theme-room-surface/plan.md`.

## Phase 3 - User Story 1: 套用 Ginza v2 主題背景 (Priority: P1)

**Goal**: App 任一頁面都顯示 Ginza v2 黑、紅、黑斜向主題背景。  
**Independent Test**: 在桌機與手機寬度開啟 lobby `/` 與 game room `/game/:roomId` 主要狀態，確認背景一致、方向為左上到右下、不是單一平面色。

- [X] T009 [US1] Define shared Ginza v2 theme background tokens or reusable background rule in `src/index.css`.
- [X] T010 [US1] Replace `.game-background` and `.lobby-background` gradients with the shared Ginza v2 app background in `src/index.css`.
- [X] T011 [US1] Ensure `body`, `#root`, and app page backgrounds do not expose default white page bleed in `src/index.css`.
- [X] T012 [P] [US1] Verify the lobby route continues using the themed outer wrapper without changing form flow in `src/pages/Lobby/index.tsx`.
- [X] T013 [P] [US1] Verify all GameRoom outer states use the themed outer wrapper without changing room flow in `src/pages/GameRoom/index.tsx`.
- [X] T014 [US1] Manually review full-app theme visibility using `specs/006-theme-room-surface/quickstart.md`.

## Phase 4 - User Story 2: 移除遊戲房間主區塊白底 (Priority: P2)

**Goal**: active game-room main gameplay surface no longer appears as a large solid white panel while still keeping the board and controls readable.  
**Independent Test**: 進入 active game room，確認主 gameplay 容器可半透明或無白底並明顯露出背景，但卡牌、按鈕、提示與互動視窗仍可讀。

- [X] T015 [US2] Add or confirm a dedicated active room main surface class on the `.card.game-card` wrapper in `src/pages/GameRoom/index.tsx`.
- [X] T016 [US2] Override the active room main surface background so it is not large solid white and clearly exposes the theme in `src/index.css`.
- [X] T017 [US2] Preserve readable local backgrounds for turn banners, player cards, action popovers, item cards, geisha cards, modals, and round summaries in `src/index.css`.
- [X] T018 [P] [US2] Confirm waiting-room cards remain readable and are not globally forced transparent in `src/pages/GameRoom/index.tsx`.
- [X] T019 [US2] Manually review active room main surface behavior against `specs/006-theme-room-surface/contracts/theme-surface-ui-contract.md`.

## Phase 5 - User Story 3: 維持既有遊戲操作與手機可玩性 (Priority: P3)

**Goal**: 新版背景與主表層調整不改變既有遊戲操作、手機排版與主要控制項可用性。  
**Independent Test**: 在桌機與手機寬度完成基本 NPC 或多人房間操作流程，確認控制項不裁切、不需要水平捲動，且操作位置與順序維持一致。

- [X] T020 [US3] Review and adjust mobile-width spacing, overflow, and contrast for themed page wrappers in `src/index.css`.
- [X] T021 [US3] Review and adjust mobile-width active room main surface spacing without moving gameplay sections in `src/index.css`.
- [X] T022 [P] [US3] Confirm GameRoom component structure still renders board, player status, hand, action tokens, and dialogs in the existing order in `src/pages/GameRoom/index.tsx`.
- [X] T023 [US3] Manually review mobile-width lobby and game-room states for clipping, horizontal overflow, and readable controls using `specs/006-theme-room-surface/quickstart.md`.
- [X] T024 [US3] Manually run a short playable flow and confirm no gameplay behavior changed against `specs/006-theme-room-surface/spec.md`.

## Phase 6 - Polish & Cross-Cutting Concerns

- [X] T025 Verify the final diff does not modify `server/`, `game-shared-types/`, Socket.IO events, game data, or rule logic against `specs/006-theme-room-surface/plan.md`.
- [X] T026 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T027 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T028 Record any browser/manual visual review limitations in `specs/006-theme-room-surface/tasks.md`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before any user story implementation.
- User Story 1 is the MVP and should complete before User Story 2 because the room surface needs the final app background underneath it.
- User Story 2 should complete before User Story 3 because mobile usability depends on the final room surface treatment.
- Phase 6 validation runs after all implemented user stories.

## Parallel Execution Examples

### User Story 1

- T012 can run in parallel with T013 after T009-T011 define the shared background rule.
- T014 runs after T010-T013.

### User Story 2

- T018 can run in parallel with T016-T017 because it verifies the waiting-room path and avoids active room CSS side effects.
- T019 runs after T015-T018.

### User Story 3

- T022 can run in parallel with T020-T021 because it verifies component order while CSS refinements proceed.
- T023 and T024 run after T020-T022.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, and User Story 1. This delivers the app-wide Ginza v2 background and can be independently reviewed on lobby and game-room routes.

### Incremental Delivery

1. Deliver User Story 1: full-app theme background.
2. Deliver User Story 2: active game-room main surface no longer reads as a white panel.
3. Deliver User Story 3: responsive/playability verification and any narrow CSS corrections.
4. Finish with Phase 6 regression validation and manual review notes.

### Scope Guardrails

- Do not redesign character cards, item cards, hand layout, coverflow, or interaction modals.
- Do not edit backend, shared types, Socket.IO contracts, game data, scoring, turn order, or win/loss logic.
- Do not make all Bootstrap cards transparent; only the active game-room main surface has the white-panel removal requirement.

## Validation Notes

- `CI=1 npm test -- --watchAll=false` passed on 2026-05-01. Existing console warnings: React `act` deprecation and React Router v7 future flags.
- `npm run build` passed on 2026-05-01.
- Browser visual review completed on 2026-05-01 at `http://localhost:3000`.
- Desktop review covered lobby, NPC room creation, waiting-room state, active game-room state, and order confirmation bottom-sheet state.
- Mobile-width review used a narrowed Chrome window and covered active game-room with bottom sheet collapsed; no horizontal overflow or clipped primary controls were observed.
