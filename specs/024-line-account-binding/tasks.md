# Tasks: LINE Account Binding Foundation

**Input**: Design documents from `specs/024-line-account-binding/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/line-account-binding-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review 024 account binding requirements, clarification decisions, and validation scenarios in `specs/024-line-account-binding/spec.md`, `specs/024-line-account-binding/plan.md`, `specs/024-line-account-binding/research.md`, `specs/024-line-account-binding/data-model.md`, `specs/024-line-account-binding/contracts/line-account-binding-contract.md`, and `specs/024-line-account-binding/quickstart.md`.
- [X] T002 Confirm active branch and working tree hygiene with `git status --short` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and `git -C /Users/zhangzhipeng/MyProject/hanamikoji-game/server status --short`.
- [X] T003 Inspect existing LIFF profile, Lobby profile prefill, diagnostics, Redis room store, room creation/join metadata, and game completion flows in `src/utils/lineLiff.ts`, `src/pages/Lobby/index.tsx`, `src/pages/Diagnostics/diagnosticsSummary.ts`, `server/utils/roomStore.js`, `server/index.js`, and `server/utils/gameUtils.js`.

## Phase 2 - Foundation

- [X] T004 Extend shared account binding contract types for `VerifiedLineIdentity`, `LineAccountProfile`, `MinimalAccountCounters`, `AccountPersistenceStatus`, and `AccountSyncResult` in `game-shared-types/src/game.types.ts`.
- [X] T005 Mirror any required local ambient account binding declarations in `src/types/game-shared-types.d.ts`.
- [X] T006 Add account store test scaffolding for verified identity gating, profile create/update, duplicate prevention, temporary fallback, and persistence status in `server/utils/accountStore.test.js`.
- [X] T007 Implement account profile store skeleton, in-memory fallback, Redis key naming, persistence status reporting, and safe serialization helpers in `server/utils/accountStore.js`.
- [X] T008 Add runtime logging summary safeguards for account sync/status payloads in `server/utils/runtimeLogger.test.js` and `server/utils/runtimeLogger.js`.
- [X] T009 Add frontend account sync/status helper test scaffolding for success, sync failure, unverifiable response, verification-path delegation, and sensitive field stripping in `src/utils/lineAccount.test.ts`.
- [X] T010 Implement frontend account sync/status helper surface that does not hardcode LINE Channel ID and strips sensitive details in `src/utils/lineAccount.ts`.

## Phase 3 - User Story 1: Bind LINE identity for persistent player profile (Priority: P1)

**Goal**: Players with a server-verifiable LINE identity result can create or update one bound account profile, keep canonical LINE presentation separate from per-room names, and update minimal counters from server-confirmed match completion.

**Independent Test**: Simulate a server-verifiable LINE identity sync twice, confirm only one profile exists with refreshed canonical fields, then complete a server-confirmed bound-player match and confirm minimal counters update without achievement unlock state.

- [X] T011 [P] [US1] Add server tests for verified LINE identity create/update, `createdAt` preservation, `updatedAt` refresh, and duplicate prevention in `server/utils/accountStore.test.js`.
- [X] T012 [P] [US1] Add server tests for rejecting arbitrary room payload `lineUserId`, frontend profile fields, and missing/invalid `VerifiedLineIdentity` as account proof in `server/utils/accountStore.test.js`.
- [X] T013 [P] [US1] Add shared type contract coverage for verified identity, account profile, and sync result payloads in `game-shared-types/src/game.types.ts`.
- [X] T014 [US1] Implement verified identity upsert, canonical display name/avatar storage, and public-safe profile projection in `server/utils/accountStore.js`.
- [X] T015 [US1] Add account sync/status handling that only accepts server-verifiable LINE identity results and returns `AccountSyncResult` in `server/index.js`.
- [X] T016 [US1] Preserve per-room display name override without writing it back to account profile in `server/index.js`.
- [X] T017 [P] [US1] Add server tests for minimal counter validation and bound-account match completion updates in `server/utils/accountStore.test.js`.
- [X] T018 [US1] Wire server-confirmed game completion to update `gamesPlayed`, `wins`, and `lastPlayedAt` for bound accounts only in `server/index.js`.
- [X] T019 [US1] Ensure counter updates do not create achievement progress records or unlock state in `server/index.js` and `server/utils/accountStore.js`.
- [X] T020 [P] [US1] Add frontend tests for successful LINE profile sync, canonical account result handling, and room-name override behavior in `src/pages/Lobby/index.test.tsx`.
- [X] T021 [US1] Update `src/utils/lineLiff.ts` and `src/utils/lineAccount.ts` so successful LIFF profile retrieval triggers the account sync verification path without treating `getProfile()` output alone as proof and without storing token or raw profile payloads.
- [X] T022 [US1] Update Lobby account state to use sync result for bound account readiness while keeping existing player-name input behavior in `src/pages/Lobby/index.tsx`.

## Phase 4 - User Story 2: Preserve guest play without LINE identity (Priority: P1)

**Goal**: Players without LINE identity or with sync failures can still create rooms, join rooms, play NPC games, and complete matches without persistent account counters.

**Independent Test**: Run Lobby without LINE identity and with simulated account sync failure; confirm room creation, room joining, and NPC flow remain available, and completed guest matches do not update persistent counters.

- [X] T023 [P] [US2] Add server tests proving guest create/join metadata does not create bound account profiles or persistent counters in `server/utils/accountStore.test.js`.
- [X] T024 [P] [US2] Add Lobby tests for missing LINE profile and account sync failure guest fallback in `src/pages/Lobby/index.test.tsx`.
- [X] T025 [US2] Ensure account sync failure returns a safe guest result and does not block WebSocket connection, room creation, room joining, or NPC setup in `src/utils/lineAccount.ts` and `src/pages/Lobby/index.tsx`.
- [X] T026 [US2] Update room creation and join submission to keep existing guest player metadata behavior independent from account binding proof in `src/pages/Lobby/index.tsx`.
- [X] T027 [US2] Ensure guest match completion does not update persistent account counters in `server/index.js`.
- [X] T028 [US2] Add non-blocking guest-mode notice rendering for account sync failure without changing the main Lobby room controls in `src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T029 [P] [US2] Add mobile-safe, compact styles for the guest-mode notice in `src/index.css`.

## Phase 5 - User Story 3: Protect LINE account privacy in game state and diagnostics (Priority: P1)

**Goal**: Public room/game state, diagnostics, saved records, and logs expose only public presentation or safe status fields, never LINE tokens, raw profile responses, or private account payloads.

**Independent Test**: Synchronize a LINE profile, create/join rooms, inspect public state summaries, diagnostics data, saved records, and logging summaries; confirm no sensitive LINE or private account payload appears.

- [X] T030 [P] [US3] Add backend privacy tests for account sync result summaries, room/game state shaping, saved account projections, and runtime logging redaction in `server/utils/runtimeLogger.test.js` and `server/utils/accountStore.test.js`.
- [X] T031 [P] [US3] Add frontend diagnostics tests for account status visibility without raw LINE profile, token, or private account payload fields in `src/pages/Diagnostics/index.test.tsx`.
- [X] T032 [US3] Restrict account sync result and public player projections to public-safe fields in `server/index.js` and `server/utils/accountStore.js`.
- [X] T033 [US3] Update runtime log summarizers to report account status only and redact LINE/profile/private account details in `server/utils/runtimeLogger.js` and `src/utils/runtimeLogger.ts`.
- [X] T034 [US3] Update diagnostics summary to include account sync and persistence status without sensitive account data in `src/pages/Diagnostics/diagnosticsSummary.ts`.
- [X] T035 [US3] Ensure local storage usage remains limited to existing non-proof display convenience and is not treated as verified account binding in `src/pages/Lobby/index.tsx` and `src/utils/lineAccount.ts`.
- [X] T036 [P] [US3] Add frontend runtime logger tests for account sync/status redaction in `src/utils/runtimeLogger.test.ts`.

## Phase 6 - User Story 4: Report persistence capability clearly (Priority: P2)

**Goal**: Developers and testers can distinguish durable account persistence from temporary non-durable fallback, and temporary mode is not treated as achievement readiness.

**Independent Test**: Run account store with and without durable persistence configuration; confirm status returns `durable` or `temporary`, diagnostics displays that status, and temporary mode is clearly non-durable.

- [X] T037 [P] [US4] Add account store tests for durable mode, temporary mode, unavailable persistence handling, and non-sensitive status messages in `server/utils/accountStore.test.js`.
- [X] T038 [US4] Implement durable Redis-backed account profile read/write/update and explicit temporary fallback status in `server/utils/accountStore.js`.
- [X] T039 [US4] Expose account persistence status through the account status contract without storage credentials or private payloads in `server/index.js`.
- [X] T040 [P] [US4] Add diagnostics tests for durable vs temporary account persistence status labels in `src/pages/Diagnostics/index.test.tsx`.
- [X] T041 [US4] Render account persistence status in diagnostics as durable or temporary, and mark temporary mode as not suitable for persistent achievements in `src/pages/Diagnostics/diagnosticsSummary.ts`.
- [X] T042 [US4] Update quickstart validation notes with durable/temporary account persistence checks in `specs/024-line-account-binding/quickstart.md`.

## Phase 7 - Polish & Cross-Cutting Concerns

- [X] T043 [P] Update final contract notes for verified identity boundary, per-room display names, minimal counters, and avatar UI deferral in `specs/024-line-account-binding/contracts/line-account-binding-contract.md`.
- [X] T044 [P] Update data model notes for any final account store field names or persistence status values in `specs/024-line-account-binding/data-model.md`.
- [X] T045 [P] Update plan or quickstart with any environment variable handoff notes for LINE Login Channel ID without recording real secrets in `specs/024-line-account-binding/plan.md` and `specs/024-line-account-binding/quickstart.md`.
- [X] T046 Run shared type validation with `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and confirm checked-in `game-shared-types/dist/*` output is synchronized when source types change.
- [X] T047 Run focused server validation with `npm --prefix server test` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T048 Run focused frontend validation with `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx src/pages/Diagnostics/index.test.tsx src/utils/lineAccount.test.ts src/utils/runtimeLogger.test.ts` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T049 Run full frontend validation with `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T050 Run production build validation with `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T051 Record validation results, any residual LINE Channel ID handoff, and completed task checkboxes in `specs/024-line-account-binding/tasks.md`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before any user story implementation.
- User Story 1, User Story 2, and User Story 3 are all P1 and together form the MVP because binding, guest fallback, and privacy boundaries must ship together.
- User Story 2 depends on the account sync result and store semantics from Phase 2 but can be validated independently from successful binding.
- User Story 3 depends on the account sync/status payload shape from User Story 1 and guest fallback shape from User Story 2.
- User Story 4 depends on the account store shape from Phase 2 and can be completed after MVP without changing gameplay behavior.
- Polish and validation tasks run after all implemented stories.

## Parallel Execution Examples

### User Story 1

After Phase 2 completes, backend account store tests in `server/utils/accountStore.test.js`, shared type updates in `game-shared-types/src/game.types.ts`, and frontend Lobby sync tests in `src/pages/Lobby/index.test.tsx` can proceed in parallel. Server account sync wiring in `server/index.js` should integrate after account store upsert behavior is stable.

### User Story 2

Guest fallback server tests in `server/utils/accountStore.test.js`, Lobby failure tests in `src/pages/Lobby/index.test.tsx`, and guest notice styling in `src/index.css` can proceed in parallel. Final integration should confirm create/join/NPC submission remains independent from account proof.

### User Story 3

Backend privacy tests, frontend diagnostics tests, and frontend runtime logger tests can be written in parallel. Runtime redaction updates in `server/utils/runtimeLogger.js` and `src/utils/runtimeLogger.ts` should be reviewed together to keep terminology consistent.

### User Story 4

Durable/temporary account store tests and diagnostics UI tests can proceed in parallel. Contract exposure in `server/index.js` should integrate after account store status values are finalized.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, User Story 1, User Story 2, and User Story 3 first. This delivers verified account binding, guest fallback, and privacy boundaries without requiring durable account proof to be production-ready everywhere.

### Incremental Delivery

1. Build account types, store, safe serialization, and sync result semantics first.
2. Implement successful binding and minimal counters before wiring guest fallback UI.
3. Add privacy/diagnostics redaction before considering the feature closeable.
4. Add durable/temporary persistence status once account store behavior is stable.
5. Finish with shared type compilation, focused server tests, focused frontend tests, full frontend tests, build, and documented Channel ID handoff.

## Completion Record

Completed on 2026-05-05.

Validation passed:

- `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json`
- `npm --prefix server test` (48 tests)
- `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx src/pages/Diagnostics/index.test.tsx src/utils/lineAccount.test.ts src/utils/runtimeLogger.test.ts`
- `CI=1 npm test -- --watchAll=false`
- `npm run build`

Notes:

- Frontend test output includes existing React 18 `ReactDOMTestUtils.act` deprecation and Lobby `act(...)` warnings, but all tests passed.
- Real LINE Login Channel ID remains an environment handoff for actual LINE/LIFF verification and is not committed.
- Client-submitted `verifiedIdentity` remains untrusted; the WebSocket path stays unbound until a server-trusted LINE verification result is available.
- Redis operation failures report temporary unavailable account persistence instead of durable availability.
- LINE avatar placement remains intentionally deferred.
