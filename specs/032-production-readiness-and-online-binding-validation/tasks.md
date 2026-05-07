# Tasks: Production Readiness And Online Binding Validation

**Input**: Design documents from `specs/032-production-readiness-and-online-binding-validation/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/production-readiness-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review active 032 requirements, no-runtime-storage boundary, and diagnostics scope in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/spec.md`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/plan.md`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/contracts/production-readiness-contract.md`.
- [X] T002 [P] Inspect existing diagnostics snapshot, summary, page, and tests in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/diagnosticsSummary.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/types.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.tsx`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.test.tsx`.
- [X] T003 [P] Inspect existing LINE/LIFF/account/achievement readiness inputs in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/config/environment.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineAccount.ts`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/achievementAccount.ts`.

## Phase 2 - Foundation

- [X] T004 Add a source-controlled production readiness status table section with status/deferred fields and no secret values in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`.
- [X] T005 Add focused diagnostics contract coverage notes for safe readiness summary fields and forbidden signals in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/contracts/production-readiness-contract.md`.

## Phase 3 - User Story 1: Validate Production Account And Achievement Readiness (Priority: P1)

**Goal**: Developers/testers can validate production LINE binding and Redis-backed achievement readiness using source-controlled checklist evidence and existing player-facing Lobby states.

**Independent Test**: Open the 032 quickstart checklist and confirm it contains production binding, Redis durable achievement, and Redis unavailable honesty rows with expected results and user-editable status/deferred fields.

- [X] T006 [P] [US1] Add checklist rows for browser LINE Login binding, bound Lobby account state, achievement durable readiness, and Redis unavailable honesty in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`.
- [X] T007 [P] [US1] Add implementation notes that Lobby must remain player-facing and must not show technical readiness panels in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`.
- [X] T008 [US1] Verify existing Lobby tests cover bound LINE account and achievement unavailable/available states, and add focused coverage if missing in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`.

## Phase 4 - User Story 2: Validate LINE Invite And Online Room Flow (Priority: P1)

**Goal**: Testers can validate production invite, room join, order confirmation, ready state, opening deal animation, and tie-to-next-round recovery without local-only assumptions.

**Independent Test**: Use the 032 quickstart manual smoke checklist to run or defer the LINE app/LIFF invite, two-player room start, and tie-to-next-round recovery scenarios with clear expected results.

- [X] T009 [P] [US2] Add or refine manual smoke rows for Render health, production WebSocket connection, LINE app/LIFF invite, two-player room start, and tie-to-next-round recovery in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`.
- [X] T010 [P] [US2] Add checklist guidance that real LINE/LIFF and two-client validation is user-owned manual smoke testing and may be marked Deferred only with full deferral details in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`.

## Phase 5 - User Story 3: Provide A Repeatable Release Verification Handoff (Priority: P2)

**Goal**: A future tester can validate required external configuration and automated commands without chat history, secrets, database storage, backend APIs, or server logs.

**Independent Test**: Read the 032 quickstart and confirm every required Render, GitHub Pages, LINE Developers, automated validation, and Deferred field is present without real secret values.

- [X] T011 [P] [US3] Add Render server, GitHub Pages build, and LINE Developers configuration checklist entries with secret/non-secret labels in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`.
- [X] T012 [P] [US3] Add explicit security checklist language forbidding LINE secrets, Redis URLs, tokens, raw LINE payloads, private account data, and hidden game state in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`.
- [X] T013 [US3] Add automated validation command status rows for `CI=1 npm test -- --watchAll=false`, `npm run build`, and `npm --prefix server test` in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`.

## Phase 6 - User Story 4: Inspect Safe Readiness Status In Diagnostics (Priority: P2)

**Goal**: `/diagnostics` shows safe production readiness categories for connection, LINE/LIFF, account persistence, and achievement readiness without secrets, raw payloads, live probes, history, or monitoring behavior.

**Independent Test**: Render Diagnostics and confirm readiness cards show safe labels for configured targets, LIFF/account/persistence/achievement readiness while tests assert no secret values, raw payloads, live probes, or monitoring/history labels.

- [X] T014 [P] [US4] Add diagnostics type fields for safe production readiness summary categories in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/types.ts`.
- [X] T015 [P] [US4] Add tests for safe production readiness summary labels, achievement readiness derived from account persistence, and configuration presence in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.test.tsx`.
- [X] T016 [P] [US4] Add tests proving diagnostics does not render Redis URLs, LINE secrets, tokens, raw provider payloads, live remote probe labels, history, alerting, or status-page records in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.test.tsx`.
- [X] T017 [US4] Implement safe readiness summary fields derived from existing config, LIFF diagnostics, and account persistence state in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/diagnosticsSummary.ts`.
- [X] T018 [US4] Render the safe production readiness summary through existing diagnostics cards without adding technical readiness UI to Lobby in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.tsx`.

## Phase 7 - Polish & Cross-Cutting Concerns

- [X] T019 [P] Run focused diagnostics validation with `CI=1 npm test -- --watchAll=false src/pages/Diagnostics/index.test.tsx`.
- [X] T020 [P] Run focused Lobby validation with `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx`.
- [X] T021 Run full frontend test suite with `CI=1 npm test -- --watchAll=false`.
- [X] T022 Run production build with `npm run build`.
- [X] T023 Run backend validation with `npm --prefix server test`.
- [X] T024 Review 032 artifacts for secrets, placeholders, runtime-storage drift, and monitoring-scope drift in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/spec.md`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/plan.md`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/contracts/production-readiness-contract.md`.
- [X] T025 Record automated validation results, evaluate the 032 readiness gate, and report any manual smoke items left `Not Run`, `Fail`, or `Deferred` as incomplete or residual risk in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/quickstart.md`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before user story phases.
- US1 and US2 can proceed after Phase 2 and are both P1; they are documentation/checklist-focused and can run in parallel if files are coordinated.
- US3 depends on Phase 2 and can proceed in parallel with US1/US2 checklist edits if edits are merged carefully.
- US4 depends on Phase 2 and can proceed independently of checklist documentation.
- Phase 7 validation runs after all implemented story phases.

## Parallel Execution Examples

```text
Setup parallel inspection:
- T002 Inspect Diagnostics files
- T003 Inspect config, LINE, account, and achievement helpers
```

```text
Checklist/documentation split:
- T006 Add account/achievement smoke rows
- T009 Add invite/room/tie smoke rows
- T011 Add external configuration checklist entries
- T012 Add security checklist language
```

```text
Diagnostics test split:
- T015 Add positive readiness summary tests
- T016 Add forbidden-signal tests
- T014 Add type fields after tests define expected shape
```

## Implementation Strategy

### MVP First

Deliver US1 and US2 first by making the 032 quickstart checklist complete enough to guide production LINE binding, Redis-backed achievement readiness, invite, two-player room, and tie recovery validation.

### Incremental Delivery

1. Complete setup and foundation review.
2. Complete checklist rows for US1 and US2.
3. Complete repeatable handoff/security checklist work in US3.
4. Complete `/diagnostics` readiness summary in US4.
5. Run focused checks, full frontend tests, build, and backend tests.
6. Record validation results and residual manual smoke status.

### Notes

- Do not add backend APIs, database tables, server-log result records, shared types, Socket.IO events, monitoring, alerting, or live remote probes.
- Do not commit `.env.local` or any real LINE secret, Redis URL, token, raw LINE payload, account ID, hidden card, or private provider payload.
- Manual smoke status is repo documentation maintained in 032 quickstart/checklist, not runtime application data.
