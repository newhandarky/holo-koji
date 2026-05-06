# Tasks: LINE Friend Invite Polish

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/line-friend-invite-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review invite scope, out-of-scope boundaries, and no-new-server-contract assumption in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/spec.md`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/plan.md`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/contracts/line-friend-invite-contract.md`.
- [X] T002 Inspect current invite, waiting room, Lobby, and diagnostics surfaces in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/LobbyPlayControls.tsx`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.tsx`.

## Phase 2 - Foundation

- [X] T003 Add shared frontend invite result and capability types for `FriendInvite`, `InviteOutcome`, and safe invite diagnostics in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts`.
- [X] T004 [P] Add baseline invite utility tests for web URL, LIFF URL, `?roomId=`, and `liff.state` parsing in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.test.ts`.
- [X] T005 Normalize expected LINE capability failures into typed invite outcomes instead of raw thrown errors in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts`.
- [X] T006 [P] Add test helpers or mocks for LIFF SDK, clipboard, window location, and navigation state in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.test.ts` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`.

## Phase 3 - User Story 1: Send A Clear Friend Invite From Waiting Room (Priority: P1)

**Goal**: A host waiting in an online room can send or copy a clear LINE friend invite and receive distinct non-blocking feedback without losing waiting room state.

**Independent Test**: Create or render a waiting room, trigger the invite action, and verify sent/copied/cancelled/unavailable/failed feedback while invite content contains game context, room identity, and join action.

- [X] T007 [P] [US1] Add Share Target Picker success, unsupported capability fallback, clipboard-unavailable fallback, cancellation, and unexpected failure tests in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.test.ts`.
- [X] T008 [P] [US1] Add waiting room invite feedback tests for sent, copied, cancelled, unavailable, failed outcomes, and active-gameplay hidden invite controls in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.test.tsx`.
- [X] T009 [US1] Update LINE Flex/text/fallback invite content to include player-readable game invitation, room identity, and join action in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts`.
- [X] T010 [US1] Return typed `share`, `copy`, `cancelled`, `unavailable`, and `failed` outcomes from `shareRoomInvite` in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts`.
- [X] T011 [US1] Update waiting room invite action to display distinct non-blocking feedback for invite outcomes in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`.
- [X] T012 [US1] Keep room code copy, retry invite, leave room, waiting state, manual copyable invite URL fallback, and active-gameplay hidden invite controls in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`.

## Phase 4 - User Story 2: Join Smoothly From A Friend Invite (Priority: P1)

**Goal**: An invited friend opening an invite link reaches a clear join path for the intended room, with no automatic join until display name and join action are confirmed.

**Independent Test**: Open Lobby with `?roomId=` or LIFF `liff.state`, verify the room id is prefilled/highlighted, verify no `JOIN_ROOM` is sent on load, then confirm join sends the intended room id.

- [X] T013 [P] [US2] Add Lobby invite link tests for `?roomId=` and LIFF `liff.state` normalization in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`.
- [X] T014 [P] [US2] Add Lobby test proving invite page load never sends `JOIN_ROOM` before display name and join action are confirmed in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`.
- [X] T015 [US2] Add explicit invited room state and source tracking in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`.
- [X] T016 [US2] Surface the invited room id as a clear prefilled or highlighted join target in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T017 [US2] Ensure `JOIN_ROOM` is sent only from the confirmed join action with the invited room id and current display name in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`.
- [X] T018 [US2] Preserve guest and browser-only join behavior while reusing existing LINE profile/account display-name foundation when available in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`.

## Phase 5 - User Story 3: Provide Safe Fallbacks And Diagnostics For Invite Failures (Priority: P2)

**Goal**: Players and testers can understand unavailable, cancelled, failed, missing, full, or already-started invite states without exposing private LINE or hidden game data.

**Independent Test**: Simulate unsupported LINE capability and rejected invited-room joins, then verify safe fallback guidance, preserved room identity, recovery actions, and diagnostics without sensitive fields.

- [X] T019 [P] [US3] Add Lobby recovery tests for missing, full, already-started, invalid, and unknown invited-room join failures in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.test.tsx`.
- [X] T020 [P] [US3] Add safe invite diagnostics tests for capability summary fields and sensitive-field exclusion in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.test.tsx`.
- [X] T021 [US3] Audit existing server `JOIN_ROOM` error payloads for stable missing/full/already-started/invalid recovery signals; if messages are ambiguous, update `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/contracts/line-friend-invite-contract.md` and implement the smallest non-sensitive error code contract in `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`.
- [X] T022 [US3] Map stable `JOIN_ROOM` error codes or audited non-sensitive messages into invite recovery reasons while preserving the original invited room id in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`.
- [X] T023 [US3] Add invite recovery UI with copy-room/request-new-invite guidance and return-to-normal-join/create path in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T024 [US3] Add or update safe invite capability diagnostics without LINE tokens, raw profile payloads, recipient identities, account verification evidence, or hidden state in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/diagnosticsSummary.ts` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Diagnostics/index.tsx`.
- [X] T025 [US3] Ensure runtime invite logs contain only safe capability states, sanitized failure categories, and room identity in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/index.tsx`.

## Phase 6 - Polish & Cross-Cutting Concerns

- [X] T026 [P] Update shared CSS for compact mobile waiting room invite feedback and Lobby invite/recovery notices in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [X] T027 [P] Review invite copy for Traditional Chinese clarity and consistency in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/lineLiff.ts`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/Lobby/LobbyPlayControls.tsx`.
- [X] T028 Run focused invite utility tests with `CI=1 npm test -- --watchAll=false src/utils/lineLiff.test.ts` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T029 Run focused waiting room tests with `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T030 Run focused Lobby tests with `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T031 Run Diagnostics tests if diagnostics files changed with `CI=1 npm test -- --watchAll=false src/pages/Diagnostics/index.test.tsx` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T032 Run full frontend tests with `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T033 Run production build with `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [X] T034 Update `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/quickstart.md` if implementation discovers additional manual LINE/LIFF validation steps.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before any user story implementation because typed invite outcomes and LIFF/clipboard mocks are shared.
- US1 and US2 are both P1 and can start after Foundation; US1 should land first for MVP host invite value, while US2 can be implemented in parallel by a separate worker after T003-T006.
- US3 depends on US1 invite outcome states and US2 invited-room state because recovery and diagnostics summarize those behaviors.
- Polish and full validation run after user story phases.

## Parallel Execution Examples

- After T003, T004 and T006 can run in parallel because they touch separate test focus areas.
- For US1, T007 and T008 can run in parallel before T009-T012.
- For US2, T013 and T014 can run in parallel before T015-T018.
- For US3, T019 and T020 can run in parallel before T021-T024.
- In Polish, T025 and T026 can run in parallel after user story UI text and states stabilize.

## Implementation Strategy

### MVP First

Deliver US1 first: typed invite outcomes, clearer invite content, Share Target Picker fallback, and waiting room feedback. This makes host-side invites reliable without needing recipient recovery UI.

### Incremental Delivery

1. Complete Setup and Foundation.
2. Implement US1 and verify invite utility plus waiting room tests.
3. Implement US2 and verify recipient Lobby link behavior without automatic join.
4. Implement US3 and verify recovery/diagnostics privacy.
5. Run focused tests, full frontend tests, and build.

### Manual Review Handoff

Detailed UI visual review remains user-owned. After implementation, report manual review items for waiting room invite controls, recipient Lobby invite/recovery notices, and real LINE in-app Share Target Picker behavior if a configured LIFF channel is available.
