# Contract: Production Readiness And Online Binding Validation

This contract defines the 032 source-controlled checklist and safe diagnostics readiness summary. It does not define a new backend API, database table, WebSocket event, shared type export, monitoring system, or server-log record.

## Source-Controlled Checklist Contract

The checklist is maintained inside `specs/032-production-readiness-and-online-binding-validation/quickstart.md`.

### Status Values

| Status | Meaning |
|---|---|
| `Not Run` | The item has not been manually validated yet. Does not satisfy closeout readiness. |
| `Pass` | The item was validated in the target environment and matched the expected result. |
| `Fail` | The item was validated and failed. Does not satisfy closeout readiness. |
| `Deferred` | External dependency blocked validation. Requires full deferral details. |

### Manual Smoke Row Shape

| Field | Required | Notes |
|---|---|---|
| Item | Yes | Human-readable smoke scenario. |
| Environment | Yes | Target environment or client context. |
| Expected Result | Yes | Concrete passing condition. |
| Status | Yes | One of the allowed status values. |
| Notes | Optional | Non-secret notes only. |
| Deferred Reason | If Deferred | Why validation is blocked. |
| Blocking Dependency | If Deferred | External system or access required. |
| Follow-up Verifier | If Deferred | Person/role expected to retry. |
| Retest Condition | If Deferred | Concrete condition that makes retest possible. |

### Rules

- Checklist status is repo documentation, not runtime data.
- The checklist must never include LINE secrets, Redis URLs, tokens, raw provider payloads, private account data, or hidden game state.
- The checklist must cover Render `/health`, production WebSocket connection, browser LINE Login binding, LINE app/LIFF invite behavior, bound-account achievement persistence, two-player room start flow, and tie-to-next-round recovery.
- Automated validation rows may be updated by the agent after commands run.
- Manual production smoke rows are intended for the user/tester to update after real production validation.

## Safe Diagnostics Readiness Summary Contract

The existing `/diagnostics` page may show a production readiness group derived from existing safe local/app status signals.

### Allowed Signals

- WebSocket connection state.
- WebSocket URL and API URL already exposed by frontend config.
- Router mode and environment name.
- LIFF supported origin, initialization, LINE login state, LINE client state, Share Target Picker capability, and invite fallback availability.
- Account sync status.
- Account persistence mode and non-secret persistence message.
- Achievement readiness derived from account persistence mode and availability.
- Configuration presence labels for public frontend-visible config, such as whether LIFF ID and public URLs are present.

### Forbidden Signals

- LINE channel secret.
- Redis URL.
- Access tokens, ID tokens, authorization codes, or raw LINE profile payloads.
- Raw account payloads or private verification evidence.
- Hidden cards, opponent hand cards, pending secret choices, or full game state dumps.
- Live remote Render `/health` probes added by diagnostics.
- Frontend Redis connectivity probes.
- Historical monitoring, uptime tracking, alerting, or status-page records.
- Server-log-based readiness records.

### UI Rules

- `/diagnostics` remains a developer/tester page.
- Lobby must not add a technical readiness dashboard.
- Readiness cards should use concise labels and safe help text.
- Failure states should identify the category, not the secret value.

### Required Test Coverage

- Tests must verify readiness labels for connection targets, LINE/LIFF configuration presence, account persistence, and achievement readiness.
- Tests must verify durable account persistence produces an achievement-ready signal and temporary/unavailable persistence produces a warning or unavailable signal.
- Tests must verify diagnostics does not render Redis URLs, LINE secrets, access tokens, authorization codes, raw LINE profile payloads, raw account payloads, hidden game state, live remote probe labels, monitoring history, alerting labels, or status-page records.
- Tests must verify readiness summary content is available in `/diagnostics` only and does not require a new Lobby technical readiness panel.

## Closeout Contract

032 closeout is satisfied only when:

- Focused automated tests for touched diagnostics/checklist behavior pass.
- `CI=1 npm test -- --watchAll=false` passes.
- `npm run build` passes.
- `npm --prefix server test` passes when backend files are touched or as final production-readiness validation.
- Required manual smoke checklist rows are `Pass` or `Deferred` with full deferral details.
- Any `Deferred`, `Fail`, or `Not Run` item is reported in final handoff as residual risk.
