# Research: Production Readiness And Online Binding Validation

## Decision: Store smoke results only in source-controlled docs

Manual production smoke test status will be recorded in `specs/032-production-readiness-and-online-binding-validation/quickstart.md` or an equivalent checklist artifact inside this spec directory.

**Rationale**: These results are release/checklist data, not application runtime data. They do not need Redis, a database, backend APIs, server logs, or player-facing UI.

**Alternatives considered**:

- Database-backed smoke results: rejected because it adds unnecessary runtime persistence and admin UI scope.
- Backend server logs: rejected because logs are not a reliable checklist handoff and could mix operational noise with release status.
- Chat-only notes: rejected because future testers should not rely on conversation history.

## Decision: Extend existing `/diagnostics` with safe readiness summary

Production readiness status should appear in the existing diagnostics page, derived from existing safe app signals such as configured WebSocket/API URL, LIFF readiness, account persistence mode, and achievement readiness implication.

**Rationale**: The project already separates player Lobby from developer/tester diagnostics. Extending that surface keeps technical status out of the branded Lobby while giving testers a concrete place to inspect readiness.

**Alternatives considered**:

- Add a Lobby readiness panel: rejected because Lobby should remain player-facing and not feel like a deployment dashboard.
- Add a new status page: rejected because it duplicates diagnostics and expands scope.
- Documentation only: rejected because testers benefit from seeing live app-side configuration/status categories during validation.

## Decision: No live remote probing or monitoring

032 diagnostics will not perform live Render `/health` probes, WebSocket ping probes beyond existing connection state, frontend Redis tests, historical monitoring, alerting, or status-page behavior.

**Rationale**: 032 is a production readiness handoff, not an observability platform. The checklist can instruct the tester to manually verify Render `/health`; diagnostics should remain lightweight and safe.

**Alternatives considered**:

- Frontend fetch to Render `/health`: rejected for 032 because it introduces cross-origin/network failure modes and starts turning diagnostics into a monitoring surface.
- Server-side readiness API: rejected because this spec does not need new backend contracts.
- Historical status storage: rejected because manual checklist history is sufficient for release validation.

## Decision: Deferred smoke items require explicit rationale

Manual smoke items may be marked `Deferred` only when an external dependency prevents validation, with reason, blocking dependency, follow-up verifier, and retest condition.

**Rationale**: Some validation depends on user-owned LINE Developers, Render, Redis, or mobile LINE app access. Blocking all closeout on unavailable external systems can be impractical, but silently passing them would hide release risk.

**Alternatives considered**:

- Require all manual items to pass: rejected because external dependencies may be temporarily unavailable.
- Allow Not Run without details: rejected because it weakens closeout evidence.
- Ignore manual smoke if automated tests pass: rejected because LINE/LIFF production behavior cannot be fully automated locally.

## Decision: No runtime or shared type contract changes

032 should not add Socket.IO events, shared type payloads, or backend persistence contracts.

**Rationale**: Existing account, achievement, invite, and diagnostics surfaces already provide the safe signals needed for readiness. Adding realtime contracts would increase risk without improving the production-readiness goal.

**Alternatives considered**:

- New readiness WebSocket event: rejected as unnecessary.
- New shared type package exports: rejected because diagnostics can use local frontend types.
- Backend readiness endpoint: rejected because Render `/health` already exists and manual checklist can verify it externally.
