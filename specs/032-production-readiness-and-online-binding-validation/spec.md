# Feature Specification: Production Readiness And Online Binding Validation

**Feature Branch**: `032-production-readiness-and-online-binding-validation`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "032 線上穩定化與 LINE 綁定驗證"

## Clarifications

### Session 2026-05-07

- Q: 032 的線上 smoke test 結果應該以哪一種形式記錄，才算這個 production readiness spec 完成？ → A: 在 spec/quickstart 內建立人工驗證 checklist；自動測試通過加上 checklist 全部勾選才算完成。
- Q: 032 是否要新增或調整「診斷畫面」來顯示 production readiness 狀態，還是只在 spec/quickstart checklist 記錄？ → A: 補強既有 `/diagnostics`，顯示安全的 production readiness 狀態摘要；Lobby 只維持玩家需要看的綁定/成就狀態。
- Q: 如果 production smoke test 有項目因外部環境限制暫時無法驗證，例如 LINE app、Render、Redis 或 LINE Developers 設定當下不可用，032 closeout 應該怎麼處理？ → A: 允許項目標記為 Deferred，但必須記錄原因、阻塞外部依賴、後續驗證人與預期重測條件。
- Q: 032 的 manual production smoke checklist 要預設由誰更新狀態？ → A: 使用者手動更新 checklist 狀態；agent 建立 checklist 格式、步驟、預期結果與 Deferred 欄位。
- Q: 032 的 `/diagnostics` readiness 摘要要做到哪個程度，避免 scope 變成監控系統或狀態頁？ → A: 只顯示安全狀態摘要與設定存在性，例如 URL、LIFF ID 是否存在、account persistence 是否 durable、achievement readiness。

## User Scenarios & Testing

### User Story 1 - Validate Production Account And Achievement Readiness (Priority: P1)

A developer or tester can verify that the deployed GitHub Pages frontend, Render backend, LINE Login settings, LIFF settings, and Redis-backed account persistence are correctly configured before treating the current feature set as production-ready.

**Why this priority**: LINE binding and achievements depend on external production services. If those services are misconfigured, the game may look playable locally while bound accounts or achievement progress fail online.

**Independent Test**: Deploy the current frontend and backend, run the documented production checklist, and confirm LINE binding, durable achievement readiness, and basic room connectivity are marked as passing in the source-controlled 032 quickstart/checklist document.

**Acceptance Scenarios**:

1. **Given** the production frontend and backend are deployed, **When** the tester opens the production Lobby, **Then** the app connects to the configured production WebSocket and displays a usable Lobby.
2. **Given** LINE Login is configured for production callback URLs, **When** the tester completes browser LINE binding, **Then** the Lobby returns to the account-bound state and shows the bound LINE account presentation.
3. **Given** Redis-backed durable account storage is configured in production, **When** a bound player opens achievements, **Then** the achievement surface is available instead of showing the temporary unavailable message.
4. **Given** Redis-backed durable account storage is unavailable or failing, **When** a bound player opens achievements, **Then** the UI honestly reports that achievement progress cannot currently be saved.
5. **Given** automated validation has passed, **When** the source-controlled production smoke checklist remains incomplete, **Then** the spec is not considered ready for closeout.

---

### User Story 2 - Validate LINE Invite And Online Room Flow (Priority: P1)

A tester can confirm that online room creation, room joining, LINE/LIFF invite behavior, and the start-of-game flow work in the deployed environment without relying on local-only configuration.

**Why this priority**: The project is an online two-player game. Production readiness requires proving that deployed clients can reach the same room and progress through the opening flow.

**Independent Test**: Use production URLs and two client sessions to create and join a room, validate invite behavior, confirm order decision, ready state, opening deal animation, and basic round progression.

**Acceptance Scenarios**:

1. **Given** a production room host is waiting for another player, **When** the host uses the LINE invite action in a supported LIFF environment, **Then** the invite can be sent through LINE or falls back to a safe copyable link when unsupported.
2. **Given** a second production client opens a valid invite or enters the room code, **When** they confirm the join action, **Then** both players enter the same room.
3. **Given** both production players are in the room, **When** they complete order confirmation and both are ready, **Then** the opening deal animation starts and the game reaches a playable state.
4. **Given** a match or round ends in a tie and continues, **When** the next round starts, **Then** the UI does not remain stuck in a waiting-for-opponent state.

---

### User Story 3 - Provide A Repeatable Release Verification Handoff (Priority: P2)

A developer can use one consolidated source-controlled checklist to verify the environment variables, LINE Developers settings, automated tests, and manual production smoke results without exposing secrets.

**Why this priority**: Deployment readiness depends on several external settings. A repeatable handoff reduces future regressions and avoids committing sensitive credentials.

**Independent Test**: Follow the generated handoff checklist from a clean deployment and confirm every required setting is represented by name, expected destination, and validation step without storing secret values or requiring database/runtime storage.

**Acceptance Scenarios**:

1. **Given** the production readiness checklist is reviewed, **When** it lists environment variables, **Then** it lists variable names and destinations without real secret values.
2. **Given** the tester needs to validate LINE Developers settings, **When** they read the checklist, **Then** it identifies the expected production callback URL and LIFF endpoint.
3. **Given** validation is complete, **When** the tester updates the source-controlled checklist document, **Then** the document records pass/fail status and notes for manual smoke items.
4. **Given** an external dependency blocks a smoke item, **When** the item cannot be completed during closeout, **Then** it may be marked Deferred only with the reason, blocking dependency, follow-up verifier, and expected retest condition recorded in the feature quickstart/checklist document.
5. **Given** the checklist exists, **When** smoke test results are updated, **Then** they are stored only in the repo document and not in a database, backend API, server log, or player-facing runtime feature.

---

### User Story 4 - Inspect Safe Readiness Status In Diagnostics (Priority: P2)

A developer or tester can open the existing diagnostics page to inspect safe production readiness signals without exposing secrets or cluttering the player-facing Lobby.

**Why this priority**: Environment validation should be visible during testing, but the branded Lobby should remain focused on play entry, account binding, and achievement status.

**Independent Test**: Open `/diagnostics` in production and confirm it summarizes safe readiness signals and configuration presence for connection targets, LINE/LIFF, account persistence, and achievement readiness without secret values, remote probing, history, or monitoring behavior.

**Acceptance Scenarios**:

1. **Given** a tester opens `/diagnostics`, **When** production readiness data is shown, **Then** it includes only safe status labels and configuration presence checks.
2. **Given** LINE, LIFF, Redis, or WebSocket readiness is incomplete, **When** diagnostics are viewed, **Then** the tester can identify the failing category without seeing secret values.
3. **Given** a player opens the ordinary Lobby, **When** production readiness diagnostics exist, **Then** the Lobby does not show a technical readiness panel beyond normal account and achievement states.
4. **Given** diagnostics are in scope for 032, **When** readiness is displayed, **Then** it does not perform live remote health probes, retain historical results, or act as a production monitoring/status page.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST provide a source-controlled production readiness checklist covering Render server variables, GitHub Pages frontend variables, LINE Developers callback settings, LIFF endpoint settings, Redis durable storage, automated tests, and manual smoke tests.
- **FR-002**: The checklist MUST record manual online smoke test results inside the feature quickstart/checklist document, with one explicit pass/fail/not-run/deferred state per smoke item.
- **FR-003**: The feature MUST require both automated validation and completed manual production smoke checklist items before closeout.
- **FR-003a**: A production smoke item MAY be marked Deferred only when an external dependency prevents validation, and the feature quickstart/checklist document MUST record the reason, blocking dependency, follow-up verifier, and expected retest condition.
- **FR-003b**: Manual smoke test results MUST NOT require database storage, a backend API, server logs, or any player-facing runtime recording feature.
- **FR-003c**: The checklist MUST be created with fields that the user can update manually, including status, non-secret notes, Deferred reason, blocking dependency, follow-up verifier, and expected retest condition.
- **FR-004**: The production readiness checklist MUST include Render server variables by name: `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `REDIS_URL`, `WEB_APP_URL`, and `NODE_ENV`.
- **FR-005**: The production readiness checklist MUST include GitHub Pages build variables by name: `REACT_APP_WEBSOCKET_URL`, `REACT_APP_API_URL`, `REACT_APP_WEB_APP_URL`, `REACT_APP_LIFF_ID`, and `REACT_APP_LINE_CHANNEL_ID`.
- **FR-006**: The production readiness checklist MUST include LINE Developers settings for the production callback URL `https://newhandarky.github.io/holo-koji/?lineCallback=1` and the production LIFF endpoint.
- **FR-007**: The Lobby MUST continue to show a clear bound LINE account state after successful production LINE binding.
- **FR-008**: The achievement surface MUST distinguish durable Redis-backed availability from temporary or unavailable persistence.
- **FR-009**: The feature MUST NOT store LINE secrets, Redis URLs, tokens, raw LINE payloads, or private account credentials in source-controlled files.
- **FR-010**: The production smoke checklist MUST cover Render `/health`, production WebSocket connection, browser LINE Login binding, LINE app/LIFF invite behavior, bound-account achievement persistence, two-player room start flow, and tie-to-next-round recovery.
- **FR-011**: The feature MUST NOT add new achievement conditions, new character data, new gameplay rules, or new LINE identity trust mechanisms.
- **FR-012**: The existing `/diagnostics` page MUST provide a safe production readiness summary for WebSocket/API targets, LINE/LIFF configuration presence, account persistence mode, and achievement readiness without exposing secret values.
- **FR-013**: The Lobby MUST NOT add a technical production readiness panel; it MAY continue showing normal player-facing LINE account and achievement availability states.
- **FR-014**: The diagnostics readiness summary MUST NOT implement live remote health probes, Redis probes from the frontend, historical monitoring, status-page history, alerting, or server-log-based readiness records.

### Non-Functional Requirements

- **NFR-001**: Production readiness documentation MUST be repeatable by a future tester without relying on chat history.
- **NFR-002**: Validation output MUST be concise enough to use as a release checklist and explicit enough to identify which external setting failed.
- **NFR-003**: Diagnostics and checklist content MUST avoid exposing sensitive values while still naming the required configuration keys.
- **NFR-004**: Existing guest play and non-LINE browser play MUST remain usable when LINE binding or Redis persistence is unavailable.
- **NFR-005**: Production readiness diagnostics MUST remain a developer/tester surface and MUST NOT make the ordinary Lobby feel like a deployment dashboard.
- **NFR-006**: Production readiness diagnostics MUST remain lightweight and derived from existing safe local/app status signals rather than introducing new monitoring infrastructure.

### Key Entities

- **Production Environment Checklist**: A source-controlled validation document, such as the 032 quickstart/checklist, that names required external settings, validation commands, manual smoke cases, and current pass/fail/not-run status without storing secrets or using runtime persistence.
- **Production Smoke Item**: One manual validation step with a target environment, expected result, status, date, and optional non-secret notes.
- **Readiness Gate**: The combined completion signal requiring automated tests/build plus completed manual smoke checklist items.
- **External Configuration Requirement**: A required Render, GitHub Pages, LINE Developers, LIFF, or Redis setting identified by name and expected destination.
- **Safe Diagnostics Readiness Summary**: A developer/tester-facing diagnostics summary that reports readiness categories and configuration presence from safe local/app status signals without exposing secret values, raw provider payloads, live remote probes, historical monitoring, or status-page behavior.

## Success Criteria

- **SC-001**: 100% of required production environment variable names are documented without secret values.
- **SC-002**: 100% of listed manual smoke items have a pass/fail/not-run/deferred state in the source-controlled 032 quickstart/checklist document.
- **SC-003**: The feature is not marked closeout-ready unless automated validation passes and all required manual smoke items are marked pass or explicitly deferred with rationale.
- **SC-004**: A tester can identify from the checklist whether LINE binding, LIFF invite, Redis-backed achievements, Render health, WebSocket connectivity, and online room flow have been verified.
- **SC-005**: 0 source-controlled files added by this feature contain LINE secrets, Redis URLs, tokens, or raw private account payloads.
- **SC-006**: `/diagnostics` lets a tester identify production readiness status for connection, LINE/LIFF, persistence, and achievement readiness without using the Lobby as a technical dashboard.
- **SC-007**: 0 new monitoring, alerting, historical status, frontend Redis probing, or server-log readiness mechanisms are introduced by 032.

## Assumptions

- Production frontend remains hosted at `https://newhandarky.github.io/holo-koji`.
- Production backend remains hosted at the configured Render service.
- Real secret values are managed in deployment provider settings or ignored local env files, not in repo-tracked files.
- Manual smoke test status is a development/release checklist maintained in repo documentation, not application data stored in Redis, a database, server logs, or browser-visible runtime state.
- Detailed UI visual review remains user-owned; this feature focuses on environment readiness, flow validation, and testable handoff.

## Out of Scope

- Adding new achievement conditions or changing the starter achievement catalog.
- Adding new character sets, character art, or random test character data.
- Changing game rules, scoring, turn order, card ownership, action availability, or hidden-information contracts.
- Replacing LINE Login, changing LINE identity trust policy, or adding non-LINE identity providers.
- Building a public status page, production monitoring dashboard, ranking system, or release version bump.
- Building database-backed smoke test result storage, backend smoke test APIs, server-log-based release records, or player-facing smoke test history UI.
- Adding live remote health probing, alerting, uptime tracking, historical readiness storage, or frontend Redis connectivity tests.
