# Data Model: Production Readiness And Online Binding Validation

## ProductionEnvironmentChecklist

Represents the source-controlled readiness checklist maintained inside the 032 spec directory.

### Fields

- `section`: Checklist group, such as Render server, GitHub Pages build, LINE Developers, automated validation, or manual smoke.
- `item`: Specific setting or smoke scenario to validate.
- `expected`: Non-secret expected result.
- `status`: `Not Run`, `Pass`, `Fail`, or `Deferred`.
- `notes`: Optional non-secret notes.

### Validation Rules

- Must not contain real LINE secrets, Redis URLs, tokens, raw LINE payloads, or private account credentials.
- Must be editable as a repo document; no database, backend API, server log, or runtime persistence is required.
- Required manual smoke items must not be silently omitted.

## ProductionSmokeItem

Represents one manual production smoke test row.

### Fields

- `item`: Human-readable validation step.
- `environment`: Production target or client context, such as GitHub Pages, Render, browser, LINE app, or two-player clients.
- `expectedResult`: Concrete passing behavior.
- `status`: `Not Run`, `Pass`, `Fail`, or `Deferred`.
- `notes`: Optional non-secret execution notes.
- `deferredReason`: Required when `status` is `Deferred`.
- `blockingDependency`: Required when `status` is `Deferred`.
- `followUpVerifier`: Required when `status` is `Deferred`.
- `retestCondition`: Required when `status` is `Deferred`.

### Validation Rules

- `Pass` requires the tester to have performed the scenario in the target environment.
- `Deferred` is only valid for externally blocked validation and requires all Deferred fields.
- `Fail` should include a non-secret note describing the observed symptom.
- `Not Run` is allowed during planning/task execution but does not satisfy closeout readiness.

## ReadinessGate

Represents whether 032 is ready for closeout.

### Inputs

- Automated frontend tests.
- Production frontend build.
- Backend tests.
- Source-controlled manual smoke checklist status.

### Rules

- Automated validation must pass before closeout.
- Manual smoke items must be `Pass` or explicitly `Deferred` with rationale before closeout.
- If any required item is `Fail` or `Not Run`, closeout must report residual risk or remain incomplete.

## ExternalConfigurationRequirement

Represents one required external setting by name and destination.

### Fields

- `destination`: Render server, GitHub Pages build, LINE Developers, LIFF, or Redis provider.
- `name`: Environment variable or settings label.
- `expectedPresence`: Required/optional flag.
- `secret`: Boolean indicating whether the value is sensitive.
- `validationStep`: How a tester confirms it without recording the actual value.

### Validation Rules

- Secret values must never be written into repo-tracked files.
- Required Render server names include `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `REDIS_URL`, `WEB_APP_URL`, and `NODE_ENV`.
- Required GitHub Pages build names include `REACT_APP_WEBSOCKET_URL`, `REACT_APP_API_URL`, `REACT_APP_WEB_APP_URL`, `REACT_APP_LIFF_ID`, and `REACT_APP_LINE_CHANNEL_ID`.
- LINE Developers settings include production callback URL `https://newhandarky.github.io/holo-koji/?lineCallback=1` and the production LIFF endpoint.

## SafeDiagnosticsReadinessSummary

Represents the safe `/diagnostics` readiness summary.

### Fields

- `connectionTargets`: Safe WebSocket/API target labels or URLs already shown by diagnostics.
- `liffReadiness`: LIFF support, initialization, LINE client, login, and Share Target Picker capability summaries.
- `accountPersistence`: Account persistence mode and availability summary.
- `achievementReadiness`: Derived summary indicating whether durable persistence appears suitable for achievements.
- `configurationPresence`: Presence/status labels for required non-secret frontend-visible configuration such as LIFF ID or public target URLs.

### Validation Rules

- Must not expose secret values, raw LINE payloads, raw account payloads, Redis URL, tokens, hidden cards, opponent choices, or private credentials.
- Must not perform live remote probes, frontend Redis tests, historical monitoring, alerting, or status-page behavior.
- Must remain a developer/tester diagnostics surface and not alter Lobby gameplay UI.
