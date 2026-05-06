# Tasks: Lobby Brand Refresh And Diagnostics

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/`  
**Prerequisites**: `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/spec.md`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/plan.md`

## Phase 1 - Setup

- [x] T001 Review the active spec, plan, research, data model, contracts, and quickstart in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/`.
- [x] T002 Audit the current Lobby and routing surfaces in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/App.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/config/environment.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/services/websocket.ts`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts`.

## Phase 2 - Foundational

- [x] T003 Define a reusable diagnostics summary model and data extraction helpers in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/types.ts` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/diagnosticsSummary.ts`.
- [x] T004 [P] Add or update shared Lobby/diagnostics style tokens and base surface rules in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T005 Add route support for `/diagnostics` in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/App.tsx` while preserving the existing BrowserRouter/HashRouter strategy.
- [x] T006 [P] Create the diagnostics page folder scaffold in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.test.tsx`.

## Phase 3 - User Story 1

**Goal**: 把 Lobby 首頁重構成「銀座十字路」品牌入口，移除首頁常駐 diagnostics 資訊，同時保留現有建房、加房、模式與角色組合流程。  
**Independent Test**: 開啟首頁 `/`，確認第一屏只呈現銀座風格品牌與主要遊戲入口，不再出現環境/WebSocket/Router/handlers 診斷區塊，且建房與加房操作仍可用。

- [x] T007 [US1] Extract brand-oriented Lobby presentation sections from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx` into `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/LobbyBrandSurface.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/LobbyPlayControls.tsx`.
- [x] T008 [P] [US1] Implement the Ginza nightlife visual layout, hierarchy, and responsive composition in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` for the Lobby homepage surface.
- [x] T009 [US1] Update `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx` to replace the old 「花見小路 / 線上對戰版」 bootstrap-card presentation with the new 「銀座十字路」 homepage structure.
- [x] T010 [US1] Remove the homepage-visible diagnostics block from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx` while keeping the create/join/mode/AI/character-set logic intact.
- [x] T011 [US1] Add a low-interference diagnostics entry to `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx` without promoting it to primary CTA level.
- [x] T012 [P] [US1] Add or update Lobby focused tests for branded homepage rendering and diagnostics removal in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`.
- [x] T013 [US1] Verify that create room, join room, mode switching, AI difficulty, and character-set selection remain behaviorally unchanged in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`.

## Phase 4 - User Story 2

**Goal**: 建立獨立 `/diagnostics` 頁，集中顯示安全的環境與連線摘要，讓開發者可排查但不暴露隱藏遊戲資料。  
**Independent Test**: 直接進入 `/diagnostics`，確認頁面能顯示指定白名單欄位，且不顯示手牌、pending choice、competition groups、raw payload 或完整 game state。

- [x] T014 [US2] Implement the diagnostics summary page in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.tsx` using the allowlist fields from the contract.
- [x] T015 [P] [US2] Implement diagnostics summary item presentation and status tones in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` for `/diagnostics`.
- [x] T016 [US2] Wire diagnostics summary data from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/config/environment.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/services/websocket.ts`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts` into `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/diagnosticsSummary.ts`.
- [x] T017 [US2] Add Lobby-to-diagnostics and diagnostics-to-Lobby navigation in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.tsx`.
- [x] T018 [P] [US2] Add focused tests for diagnostics field visibility, route access, and back navigation in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.test.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/App.test.tsx`.
- [x] T019 [US2] Add explicit assertions that `/diagnostics` does not render hidden game data or runtime payload dumps in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.test.tsx`.

## Phase 5 - User Story 3

**Goal**: 清楚切開首頁與 diagnostics 的資訊邊界，讓一般玩家只看到品牌化入口，而診斷資訊只留在工具頁。  
**Independent Test**: 對照首頁與 `/diagnostics`，確認首頁只保留玩家需要的入口資訊，diagnostics 承接排查摘要，且部署/本地兩種 router 模式都可理解與可達。

- [x] T020 [US3] Refine Lobby/diagnostics information boundaries in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.tsx` so homepage no longer mixes in diagnostic copy.
- [x] T021 [P] [US3] Add route-level regression coverage for BrowserRouter/HashRouter diagnostics access in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/App.test.tsx`.
- [x] T022 [US3] Confirm diagnostics entry stays visually secondary on mobile and desktop in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`.
- [x] T023 [P] [US3] Add focused assertions that homepage no longer renders environment, WebSocket URL, Router mode, or handler-count diagnostics text in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`.
- [x] T024 [US3] Update LIFF error-surface handling in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/App.tsx` only if needed to keep diagnostics concerns out of the homepage while preserving actionable failure messaging.

## Phase 6 - Polish & Cross-Cutting Concerns

- [x] T025 [P] Review and tighten diagnostics allowlist wording and field labels in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/diagnosticsSummary.ts`.
- [x] T026 [P] Remove obsolete Lobby diagnostics-specific comments or dead UI branches from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`.
- [x] T027 Sync implementation notes and manual review expectations in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/spec.md` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/quickstart.md`.
- [x] T028 Sync the route/data boundary contract if implementation details changed in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/contracts/lobby-brand-refresh-and-diagnostics.md`.
- [x] T029 Run `CI=1 npm test -- --watchAll=false`.
- [x] T030 Run `npm run build`.
- [x] T031 Perform manual homepage and diagnostics review per `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/quickstart.md` and record any residual UI review item in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/020-lobby-brand-refresh/spec.md`.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before any user story work.
- User Story 1 (Phase 3) is the MVP and should land before diagnostics page polish.
- User Story 2 (Phase 4) depends on Phase 2 and can start after routing and diagnostics model scaffolding exist.
- User Story 3 (Phase 5) depends on User Story 1 and User Story 2, because it validates the final boundary between both surfaces.
- Polish phase runs after all user story phases.

## Parallel Execution Examples

### User Story 1
- Run T008 and T012 in parallel after T007, because styling and focused test scaffolding touch different concerns.
- Run T011 in parallel with T013 after T009-T010, because diagnostics-entry placement and behavior-regression assertions can proceed independently.

### User Story 2
- Run T015 and T018 in parallel after T014, because diagnostics styling and tests can move independently.
- Run T017 in parallel with T019 after T016, because navigation wiring and hidden-data assertions do not block one another.

### User Story 3
- Run T021 and T023 in parallel after T020, because route regression coverage and homepage-text assertions use separate test targets.

## Implementation Strategy

### MVP First
1. Complete Phase 1 and Phase 2.
2. Complete User Story 1 to deliver a branded Lobby without homepage diagnostics clutter.
3. Validate Lobby behavior before moving to `/diagnostics`.

### Incremental Delivery
1. Add `/diagnostics` with the strict allowlist and route coverage.
2. Then tighten cross-surface boundaries and router parity.
3. Finish with automated validation and user-owned manual review.

### Scope Guardrails
- Do not change `CREATE_ROOM` / `JOIN_ROOM` payloads in 020.
- Do not reintroduce 019-removed raw payload or full-state diagnostics.
- Do not fold unrelated gameplay or animation work into this branch.
