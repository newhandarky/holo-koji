# Tasks: 大廳 AI 難度標籤

**Input**: Design documents from `specs/031-lobby-ai-difficulty-labels/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/lobby-ai-difficulty-labels-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review `specs/031-lobby-ai-difficulty-labels/spec.md`, `specs/031-lobby-ai-difficulty-labels/plan.md`, and `specs/031-lobby-ai-difficulty-labels/contracts/lobby-ai-difficulty-labels-contract.md` before editing.
- [X] T002 Inspect current Lobby AI difficulty rendering and room creation flow in `src/pages/Lobby/LobbyPlayControls.tsx`, `src/pages/Lobby/index.tsx`, and `src/pages/Lobby/index.test.tsx`.

## Phase 2 - Foundation

- [X] T003 Create canonical AI difficulty option data with value, label, description, and rank in `src/pages/Lobby/aiDifficultyOptions.ts`.
- [X] T004 Export or define the shared Lobby AI difficulty value type needed by option data and props in `src/pages/Lobby/aiDifficultyOptions.ts`.
- [X] T005 Add a normalization helper that falls back invalid or stale difficulty values to `easy` in `src/pages/Lobby/aiDifficultyOptions.ts`.

## Phase 3 - User Story 1: 開始前理解 NPC 難度 (Priority: P1)

**Goal**: NPC 模式中，玩家能看到由易到難排序的固定難度標籤與短說明，且難度控制不顯示人物名稱。

**Independent Test**: 開啟大廳、切換到 NPC 模式，確認顯示 `簡單 / 中等 / 偏強 / 超強 / 地獄` 與五段固定短說明，排序正確，且不出現舊人物名稱。

- [X] T006 [US1] Add a Lobby test for NPC difficulty labels, descriptions, canonical ordering, and absence of old person names in `src/pages/Lobby/index.test.tsx`.
- [X] T007 [US1] Replace the NPC difficulty select options with canonical option rendering in `src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T008 [US1] Render each NPC difficulty label with its fixed short description while keeping the selected difficulty identifiable in `src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T009 [US1] Update Lobby difficulty control markup/classes for compact readable label and description layout in `src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T010 [US1] Add a keyboard operability test for the NPC difficulty control in `src/pages/Lobby/index.test.tsx`.
- [X] T011 [US1] Add or adjust Lobby CSS for mobile-safe difficulty label and description spacing in `src/index.css`.

## Phase 4 - User Story 2: 線上模式不顯示 NPC 難度干擾 (Priority: P2)

**Goal**: 線上模式不把 NPC 難度呈現為有效必填控制，且切回 NPC 時保留有效選擇。

**Independent Test**: 在線上模式檢查不到 active NPC 難度控制；先在 NPC 選擇非預設難度，切到線上再切回 NPC，原本的有效選擇仍保留。

- [X] T012 [US2] Add a Lobby test that online mode does not render active AI difficulty content in `src/pages/Lobby/index.test.tsx`.
- [X] T013 [US2] Add a Lobby test that switching NPC to online and back preserves a valid selected AI difficulty in `src/pages/Lobby/index.test.tsx`.
- [X] T014 [US2] Ensure AI difficulty rendering remains NPC-only and inactive in online mode in `src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T015 [US2] Preserve selected valid AI difficulty across match mode toggles in `src/pages/Lobby/index.tsx`.

## Phase 5 - User Story 3: 保留既有 AI 對局行為 (Priority: P3)

**Goal**: 標籤改善不改變 AI 難度身分、預設值、fallback 或 `CREATE_ROOM` payload 語意。

**Independent Test**: 對五個顯示難度建立 NPC 房間時，各自送出原本的 `easy / medium / hard / expert / hell`；線上建立房間不送 `aiDifficulty`；無效值回退到 `easy`。

- [X] T016 [US3] Add table-driven Lobby tests for all five displayed difficulties mapping to expected NPC `CREATE_ROOM.aiDifficulty` values in `src/pages/Lobby/index.test.tsx`.
- [X] T017 [US3] Add a Lobby test that online room creation omits `aiDifficulty` after NPC difficulty changes in `src/pages/Lobby/index.test.tsx`.
- [X] T018 [US3] Add a focused fallback test for invalid AI difficulty normalization in `src/pages/Lobby/index.test.tsx`.
- [X] T019 [US3] Apply AI difficulty normalization before Lobby display and NPC room creation submission in `src/pages/Lobby/index.tsx`.
- [X] T020 [US3] Confirm NPC default difficulty remains `easy` and room creation still uses existing difficulty values in `src/pages/Lobby/index.tsx`.

## Phase 6 - Polish & Cross-Cutting Concerns

- [X] T021 Update any affected Lobby copy or accessibility labels to avoid person names and internal difficulty identifiers in `src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T022 Review `specs/031-lobby-ai-difficulty-labels/quickstart.md` and record residual manual mobile/desktop UI review risk if implementation changes visual review scope or no visual review is performed in `specs/031-lobby-ai-difficulty-labels/quickstart.md`.
- [X] T023 Run focused Lobby validation with `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T024 Run full frontend tests with `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T025 Run production build with `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before any user story implementation because all stories depend on the canonical option model and normalization helper.
- US1 is the MVP and should complete before US2/US3 because it establishes the UI contract and display copy.
- US2 can begin after Phase 2 and can run after or alongside late US1 CSS polish if it does not edit the same lines.
- US3 can begin after Phase 2 and after the canonical option model is stable.
- Phase 6 validation runs after all selected user stories are implemented.

## Parallel Execution Examples

- Parallelism is intentionally limited because the implementation and tests primarily touch `src/pages/Lobby/LobbyPlayControls.tsx`, `src/pages/Lobby/index.tsx`, and `src/pages/Lobby/index.test.tsx`.
- If multiple agents are used later, keep write scopes disjoint: one agent may work on `src/pages/Lobby/aiDifficultyOptions.ts` while another reviews `specs/031-lobby-ai-difficulty-labels/quickstart.md`.
- Test tasks in `src/pages/Lobby/index.test.tsx` should be sequenced to avoid merge conflicts.
- Keyboard operability is required by `NFR-002` and must be explicitly covered before implementation is considered complete.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, and US1. This delivers the primary user value: NPC players see clear difficulty labels, fixed short descriptions, correct ordering, and no person-name difficulty content.

### Incremental Delivery

1. Deliver US1 and verify the Lobby display contract.
2. Add US2 to ensure online mode remains uncluttered and mode switching preserves valid selections.
3. Add US3 to lock down default/fallback and payload compatibility.
4. Run Phase 6 validation before handoff.

### Notes

- Keep changes scoped to `src/pages/Lobby/` unless tests reveal an existing shared helper is a better local fit.
- Do not modify `server/` or `game-shared-types/` unless implementation uncovers an actual contract mismatch; if that happens, update plan/contracts before changing those areas.
- Detailed mobile/desktop visual review remains user-owned per project rules; report it as a residual manual review item unless the user explicitly asks for browser inspection.
