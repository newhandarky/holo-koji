# Research: Logging And Production Safety Cleanup

## Decision 1: Keep concise production lifecycle logs, remove payload and full-state dumps
- **Decision**: Default runtime output will keep concise lifecycle `info` plus `warn` and `error`, but remove raw payload logging, full room-state dumps, and repetitive connection spam.
- **Rationale**: This matches the clarified product decision and preserves operational traceability without leaking hidden game state or overwhelming logs during normal play.
- **Alternatives considered**:
  - Keep only `warn` and `error`: safer, but loses useful room lifecycle breadcrumbs for reconnects, restore failures, and rematch tracing.
  - Keep most existing `info` logs and delete only sensitive ones: lower effort, but still leaves noisy production sessions.

## Decision 2: Development diagnostics remain opt-in and redacted
- **Decision**: Any retained diagnostic mode will be explicitly opt-in and limited to event-level summaries or redacted state summaries.
- **Rationale**: This preserves developer debuggability while maintaining the same hidden-state safety model even during local troubleshooting.
- **Alternatives considered**:
  - Restore full payload dumps in development: easy for debugging, but too risky because hidden-state leakage becomes normalized and can be reintroduced into review or staging runs.
  - Remove all extra diagnostics: simplest policy, but too restrictive for room lifecycle debugging.

## Decision 3: Active cleanup targets are the current frontend and backend runtime entry surfaces
- **Decision**: Prioritize cleanup in `src/config/environment.ts`, `src/services/websocket.ts`, `src/hooks/useWebSocket.ts`, `src/pages/Lobby/index.tsx`, `src/pages/GameRoom/index.tsx`, `server/index.js`, and `server/utils/roomStore.js`.
- **Rationale**: These files sit on the current room creation, transport, restore, and gameplay paths and therefore dominate real production exposure.
- **Alternatives considered**:
  - Clean every historical logging surface first: broader, but risks turning 019 into a repo-wide refactor.
  - Touch only browser files: insufficient because the backend currently emits the highest-volume lifecycle output.

## Decision 4: Legacy commented fallback logging should be deleted
- **Decision**: Commented or dormant fallback logging that suggests restoring old verbose output should be removed instead of preserved.
- **Rationale**: The user explicitly chose deletion, and dormant log snippets create ambiguity about what is safe to re-enable.
- **Alternatives considered**:
  - Rewrite comments into safe guidance: still leaves dead branches and future ambiguity.
  - Keep original comments untouched: conflicts directly with the cleanup goal.

## Decision 5: Verification should focus on safety boundaries and regression-free behavior
- **Decision**: Verification will combine focused output-policy tests or assertions where practical with the repo-standard frontend and server commands.
- **Rationale**: 019 must prove two things at once: hidden-state-safe logging and no gameplay regression.
- **Alternatives considered**:
  - Manual-only console inspection: too weak for regression protection.
  - Full end-to-end browser inspection by default: contrary to repo guidance and too expensive for this cleanup scope.
