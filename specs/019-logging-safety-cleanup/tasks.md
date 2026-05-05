# Tasks: Logging And Production Safety Cleanup

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/019-logging-safety-cleanup/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review the active spec, plan, research, data model, and contract files in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/019-logging-safety-cleanup/`.
- [x] T002 Capture the current active runtime logging surfaces and legacy audit surfaces in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/019-logging-safety-cleanup/plan.md` notes or implementation scratch notes before code changes.

## Phase 2 - Foundation

- [x] T003 Audit current frontend logging in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/config/environment.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/services/websocket.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/hooks/useWebSocket.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`.
- [x] T004 Audit current backend logging in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/roomStore.js`.
- [x] T005 Define or standardize a minimal logging policy/helper for frontend runtime surfaces in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/` that supports default-safe output and explicit diagnostic gating.
- [x] T006 [P] Define or standardize a minimal logging policy/helper for backend runtime surfaces in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/` that supports default-safe output and explicit diagnostic gating.

## Phase 3 - User Story 1

**Goal**: Stop default production-oriented client and server sessions from leaking hidden game state, raw payloads, or full room-state dumps during ordinary gameplay flows.

**Independent Test**: Exercise create, join, sync, restore rejection, and pending-interaction flows and verify that default runtime output no longer prints full room state, hidden hands, pending-choice contents, or raw transport payloads.

- [x] T007 [US1] Remove or condense environment boot logging so `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/config/environment.ts` no longer dumps full configuration details by default.
- [x] T008 [US1] Remove raw message and noisy handler diagnostics from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/services/websocket.ts` while preserving concise warning and error behavior.
- [x] T009 [US1] Clean room create/join success and request logging in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx` so default runtime output no longer prints payload objects or handler-registration spam.
- [x] T010 [US1] Clean state-dump style logging in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx` so default runtime output no longer prints full room or player-state details.
- [x] T011 [US1] Clean backend lifecycle and broadcast logging in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js` so default runtime output keeps concise room/event context without payload or hidden-state dumps.
- [x] T012 [US1] Ensure storage-related logging in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/roomStore.js` remains error-focused and does not expose full snapshot contents.
- [x] T013 [P] [US1] Add focused regression coverage for frontend-safe default logging behavior in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx` and/or `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.test.tsx`.
- [x] T014 [P] [US1] Add focused regression coverage for backend-safe default logging behavior in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js` or the most relevant backend test file.

## Phase 4 - User Story 2

**Goal**: Preserve actionable warning and error output so operators and developers can still diagnose invalid actions, restore failures, and transport issues without sensitive payload leakage.

**Independent Test**: Trigger representative invalid restore, invalid action, and connection-failure paths and verify that retained logs identify room, player, or event context without including hidden hands, pending card contents, or raw state objects.

- [x] T015 [US2] Review warning and error call sites in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/services/websocket.ts` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/hooks/useWebSocket.ts` to keep actionable context while removing unnecessary state details.
- [x] T016 [US2] Review warning and error call sites in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js` to keep room/event/player context while avoiding sensitive payload output.
- [x] T017 [P] [US2] Preserve concise reconnect, invalid-action, and restore-failure tracing in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/services/websocket.ts` under the new logging policy.
- [x] T018 [P] [US2] Add focused frontend tests or assertions for retained error/warning behavior in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.test.tsx` or the most relevant hook test surface.
- [x] T019 [P] [US2] Add focused backend tests or assertions for retained restore-failure and invalid-action tracing in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js` or another relevant backend test file.
- [x] T020 [US2] Verify that retained logs across `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/` never include hidden gift cards, competition groups, or opponent hand contents.

## Phase 5 - User Story 3

**Goal**: Keep any development diagnostics explicitly opt-in and limited to event-level or redacted-summary output instead of full hidden payload dumps.

**Independent Test**: Confirm that the default runtime path stays quiet and that any explicit diagnostic mode only emits allowed summary-level output.

- [x] T021 [US3] Implement or standardize frontend diagnostic gating in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/config/environment.ts` and related runtime surfaces so extra diagnostics are opt-in instead of always on.
- [x] T022 [P] [US3] Implement or standardize backend diagnostic gating in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js` and/or a dedicated backend logging helper under `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/`.
- [x] T023 [US3] Ensure any diagnostic summaries on the frontend use event-level or redacted-summary output rather than full hidden payload content in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/services/websocket.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`.
- [x] T024 [US3] Ensure any diagnostic summaries on the backend use room/event summary output rather than full hidden payload content in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`.
- [x] T025 [P] [US3] Add focused verification for diagnostic-mode gating behavior in the most relevant frontend and backend test files without introducing gameplay-contract changes.

## Phase 6 - User Story 4

**Goal**: Ensure logging cleanup does not change gameplay contracts, room flows, restore behavior, or pending-interaction handling.

**Independent Test**: Re-run focused room, restore, and pending-interaction verification after cleanup and confirm no contract or behavior regressions are introduced.

- [x] T026 [US4] Re-run and, if needed, update focused room and restore regression tests in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.test.tsx` to confirm the cleanup does not alter player-visible room behavior.
- [x] T027 [P] [US4] Re-run and, if needed, update focused backend regression coverage in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/gameUtils.test.js` to confirm restore and pending-interaction behavior remains unchanged.
- [x] T028 [US4] Confirm logging cleanup does not require shared-type or gameplay payload contract edits outside the intended logging-policy scope in `/Users/zhangzhipeng/MyProject/hanamikoji-game/game-shared-types/` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`.
- [x] T029 [US4] Perform a narrow manual smoke review of browser console and server output during room create/join/restore/pending flows and record the result in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/019-logging-safety-cleanup/quickstart.md` or implementation notes.

## Phase 7 - Polish & Cross-Cutting Concerns

- [x] T030 [P] Remove commented or dormant fallback logging paths from `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/sockets/gameSocket.ts`, and any other audited runtime-adjacent files that would leave ambiguous unsafe logging behavior.
- [x] T031 [P] Sync final logging-policy wording and implementation notes in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/019-logging-safety-cleanup/spec.md` after implementation.
- [x] T032 [P] Sync final verification guidance in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/019-logging-safety-cleanup/contracts/logging-safety-cleanup.md` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/019-logging-safety-cleanup/quickstart.md`.
- [x] T033 Run `cd /Users/zhangzhipeng/MyProject/hanamikoji-game/server && npm test`.
- [x] T034 Run `CI=1 npm test -- --watchAll=false`.
- [x] T035 Run `npm run build`.
- [x] T036 [P] Scan `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/` for lingering unsafe payload/full-state logging after cleanup.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before all user story phases.
- US1 before US2, because default-safe output boundaries should be in place before refining retained warnings and errors.
- US1 before US3, because diagnostic gating should build on the cleaned default runtime output.
- US2 and US3 before US4 verification.
- Polish phase after all user story phases.

## Parallel Execution Examples

- **US1**: T013 and T014 can run in parallel after T007-T012 are stable because frontend and backend regression coverage touch different files.
- **US2**: T017, T018, and T019 can run in parallel after the retained warning/error policy has been applied.
- **US3**: T022 and T025 can run in parallel with T021-T024 once the diagnostic-mode design is settled.
- **Polish**: T030, T031, T032, and T036 can run in parallel once implementation is complete.

## Implementation Strategy

- Start with MVP-safe runtime cleanup: Phase 1, Phase 2, and US1.
- Then preserve operational debuggability via US2.
- Add the explicit diagnostic gate in US3 only after default-safe output is working.
- Finish with US4 regression confirmation and the polish phase.
- Deliver in small slices so frontend and backend logging policy can be validated independently before full closeout.
