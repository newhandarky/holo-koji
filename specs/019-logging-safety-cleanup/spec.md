# Feature Specification: Logging And Production Safety Cleanup

**Feature Branch**: `019-logging-safety-cleanup`  
**Created**: 2026-05-04  
**Status**: Complete
**Input**: User description: "019-logging-and-production-safety-cleanup"

## Clarifications

### Session 2026-05-04

- Q: 對於目前 repo 內已註解掉、但可能被未來重新打開的舊 logging / fallback logging 路徑，要怎麼處理？ → A: 直接刪除舊的註解式 fallback logging，避免未來被重新打開。
- Q: 開發診斷模式要允許看到哪一層級的資訊？ → A: 只允許事件級摘要與 redacted state summary，不允許完整 hidden payload。
- Q: production 預設要保留到什麼程度的非錯誤 log？ → A: 保留精簡 lifecycle info/warn/error，但移除 payload 與 full state dump。

## User Scenarios & Testing

### User Story 1 - Production sessions avoid leaking hidden game state (Priority: P1)

A player uses the game in a normal released environment without the browser console or server logs exposing hidden cards, pending secret choices, or raw room state that should stay private.

**Why this priority**: This is the core production-safety goal. If hidden state continues to appear in logs, the multi-player game can leak sensitive information even when gameplay rules are otherwise correct.

**Independent Test**: Run normal room creation, gameplay, restore, and pending-interaction flows and confirm that player-visible and server-side logs do not print full hidden game state or raw transport payloads.

**Acceptance Scenarios**:

1. **Given** a production-like client session, **When** a room starts or syncs game state, **Then** the console does not print full room state, player hands, pending-choice contents, or raw socket payloads.
2. **Given** a production-like server session, **When** room lifecycle events occur, **Then** server logs do not print full hidden hand data, pending interaction contents, or full outbound game-state payloads.
3. **Given** a pending gift or competition flow, **When** diagnostic output occurs, **Then** the logs do not reveal card contents that are hidden from one of the players.

---

### User Story 2 - Developers can still trace real failures (Priority: P1)

A developer or operator investigating a broken room, transport issue, or invalid action can still find enough warnings and errors to understand what failed without needing full secret game data in the logs.

**Why this priority**: Cleanup cannot make the system un-debuggable. Production safety must preserve meaningful operational signals.

**Independent Test**: Trigger representative connection failures, invalid actions, and restore errors and confirm that error or warning output remains actionable without including full sensitive payloads.

**Acceptance Scenarios**:

1. **Given** a connection or transport failure, **When** the system reports the problem, **Then** the log includes the event type and room or player context needed for debugging without dumping full payload contents.
2. **Given** an invalid restore or invalid action attempt, **When** the system rejects it, **Then** the log records a concise reason suitable for debugging without including hidden cards or pending secret choices.
3. **Given** a non-sensitive lifecycle milestone such as room create, join, leave, or rematch, **When** it is logged, **Then** the output remains concise and does not dump full game-state objects.

---

### User Story 3 - Development diagnostics remain intentionally controlled (Priority: P2)

A developer working locally can still enable targeted diagnostics when needed, but verbose logging is never the default behavior for released or review builds.

**Why this priority**: The project still needs debugging tools, but they must become deliberate rather than always-on.

**Independent Test**: Verify that the default run path is quiet, and that any retained diagnostic logging is clearly gated behind an explicit development-only control.

**Acceptance Scenarios**:

1. **Given** a default local or release-oriented run path, **When** the app and server start, **Then** verbose lifecycle and payload dumps are not emitted by default.
2. **Given** an explicit developer diagnostic mode, **When** targeted logging is enabled, **Then** the system emits only the intended diagnostic output rather than uncontrolled full-state dumps.

---

### User Story 4 - Cleanup does not change gameplay contracts (Priority: P2)

A player can still create rooms, join rooms, restore rooms, resolve pending interactions, and complete rounds with the same gameplay behavior after logging cleanup.

**Why this priority**: This spec is a safety cleanup, not a gameplay rewrite. The change must not alter room contracts or turn resolution.

**Independent Test**: Re-run focused client and server verification for room creation, gameplay sync, restore rejection, and pending interaction flows after logging cleanup.

**Acceptance Scenarios**:

1. **Given** existing supported room flows, **When** the cleanup is applied, **Then** gameplay, restore handling, and room synchronization still behave the same from the player perspective.
2. **Given** existing tests that cover room and restore behavior, **When** they are re-run after cleanup, **Then** they still pass without requiring contract changes unrelated to logging policy.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST stop emitting always-on debug output that prints full client game state, raw socket payloads, or full room snapshots during standard gameplay flows.
- **FR-002**: The system MUST prevent production-oriented browser console output from revealing hidden hands, secret cards, pending-choice contents, or other unauthorized game information.
- **FR-003**: The system MUST prevent production-oriented server logs from revealing hidden hands, secret cards, pending-choice contents, or full outbound room-state payloads.
- **FR-004**: The system MUST preserve concise room lifecycle logging for create, join, leave, reconnect, restore failure, and rematch events in production-oriented runtime output when that logging is still useful for operational tracing.
- **FR-005**: The system MUST preserve concise warning or error output for invalid actions, invalid restores, connection failures, and transport failures.
- **FR-006**: Any retained verbose diagnostics MUST require an intentional development-only control rather than being enabled by default, and that mode MUST remain opt-in.
- **FR-007**: Diagnostic output that remains available in development mode MUST use event-level summaries or redacted state summaries instead of full hidden payload contents whenever a smaller summary would communicate the same problem.
- **FR-008**: Logging cleanup MUST NOT change the room contract, event contract, or turn-resolution behavior observed by players.
- **FR-009**: Room creation, room restore, pending interaction, and rematch flows MUST continue to function after the cleanup without requiring players to learn a new interaction path.
- **FR-010**: The system MUST keep enough context in retained logs to identify the affected room, player, or event type when errors or warnings occur.
- **FR-011**: The cleanup MUST cover both frontend and backend runtime surfaces that currently participate in room state transport or lifecycle reporting.
- **FR-012**: The cleanup MUST remove legacy commented or dormant fallback logging paths that would make asset or payload safety expectations ambiguous for future maintenance.

### Non-Functional Requirements

- **NFR-001**: The default user-facing runtime experience MUST remain free from noisy debug spam during ordinary play sessions while still allowing concise lifecycle, warning, and error output.
- **NFR-002**: The cleanup MUST be reviewable through focused automated verification plus a narrow manual console inspection, without requiring full gameplay redesign.
- **NFR-003**: Production-safety behavior MUST remain consistent across supported character sets and across create, waiting-room, active-game, pending-interaction, restore, and rematch flows.
- **NFR-004**: Logging changes MUST remain narrowly scoped enough that unrelated gameplay files do not require churn or formatting-only edits.

### Key Entities

- **Runtime Log Event**: Any client-side or server-side informational, warning, or error output produced during room lifecycle, transport, restore, or gameplay flows.
- **Hidden Game State**: Any information that is not authorized for every participant to know at the same time, including hidden hands, secret cards, pending secret choices, or unresolved private card groups.
- **Operational Context**: Non-sensitive identifying context such as room ID, player ID, event type, connection state, or rejection reason that can support debugging without exposing hidden state.
- **Diagnostic Mode**: An explicit development-only state that allows targeted event-level or redacted-summary debugging output beyond the default quiet runtime behavior without restoring full hidden payload dumps.

## Success Criteria

- **SC-001**: 100% of standard production-oriented create, join, restore, rematch, and pending-interaction flows complete without printing full hidden game state to client or server logs.
- **SC-002**: 100% of invalid restore, invalid action, and connection failure scenarios still produce actionable warning or error output that identifies the affected room or event.
- **SC-003**: The default runtime path MUST NOT emit raw payload dumps or full state dumps, and a normal play session MUST only retain concise lifecycle, warning, and error output in browser and server logs.
- **SC-004**: 0 client-visible or server-visible retained logs expose full opponent hands, secret cards, or unresolved pending-choice contents during the flows covered by this feature.
- **SC-005**: Existing focused verification for gameplay sync, restore safety, and pending-interaction behavior continues to pass after the cleanup.

## Assumptions

- The current highest-risk log surfaces are browser-side room transport diagnostics and backend room lifecycle or transport logging.
- The project still needs a way to keep concise warnings and errors for operational debugging after verbose cleanup.
- This feature is allowed to introduce or standardize a lightweight development-only logging gate if that is the smallest safe way to control verbosity.
- Character-set behavior, room contracts, and restore rules defined in specs 016-018 remain unchanged by this cleanup.

## Out of Scope

- Redesigning the lobby, game room, or any gameplay UI surface.
- Changing room rules, turn order, restore contract semantics, or pending-interaction resolution rules.
- Rewriting the transport layer or replacing the current client/server communication model.
- Broad observability platform work such as external log aggregation, dashboards, or tracing infrastructure.

## Implementation Notes

- Frontend runtime logging is centralized through `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/runtimeLogger.ts`.
- Backend runtime logging is centralized through `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/utils/runtimeLogger.js`.
- Default runtime keeps concise lifecycle, warning, and error output while removing raw payload and full-state dumps.
- Game room session teardown no longer disconnects implicitly during component cleanup; the frontend now closes the socket only on explicit leave flows so development `React.StrictMode` remounts do not delete a newly created room before the follow-up join completes.
- The shared frontend socket service now reuses a single pending `CONNECTING` socket instead of creating overlapping connections, preventing reload-time `JOIN_ROOM` attempts from being sent through a replacement socket that has not reached `OPEN` yet.
- Gameplay-side broadcast events that intentionally rely on later state sync, such as `DEAL_ANIMATION` and `ACTION_EXECUTED`, are explicitly registered as no-op handlers so normal rounds do not emit false-positive `找不到處理器` warnings.
- Frontend runtime noise from framework and environment setup is reduced by opting into React Router future flags and skipping LIFF initialization on unsupported local origins.
- Diagnostic mode is explicit opt-in only:
  - frontend: `REACT_APP_ENABLE_DIAGNOSTICS=true`
  - backend: `GAME_DIAGNOSTICS=true`
- Diagnostic summaries are limited to event-level or redacted state summaries and must not include hidden hands, secret cards, pending gift contents, or pending competition groups.
