# Contract: Logging And Production Safety Cleanup

## Purpose
Define the runtime output contract for client and server flows after the 019 cleanup.

## Allowed Default Runtime Output

### Frontend
- Concise lifecycle information when it materially helps the user or operator trace room entry, reconnect, or failure states.
- Warnings and errors for malformed messages, missing required identifiers, or failed room actions.
- No raw WebSocket payload dumps.
- No full client game-state dumps.

### Backend
- Concise room lifecycle information for create, join, leave, reconnect, rematch, and restore rejection.
- Warnings and errors for invalid actions, invalid restore data, connection anomalies, and storage failures.
- No full outbound game-state dumps.
- No hidden hand or pending-choice content dumps.

## Diagnostic Mode Contract
- Diagnostic mode must be explicit opt-in.
- Frontend diagnostic gate: `REACT_APP_ENABLE_DIAGNOSTICS=true`
- Backend diagnostic gate: `GAME_DIAGNOSTICS=true`
- Diagnostic mode may emit event-level summaries or redacted state summaries.
- Diagnostic mode must not emit full hidden payloads, full pending gift card lists, full competition groups, full room snapshots, or full player hand contents.

## Protected Data Categories
The following categories are never allowed in retained runtime output:
- opponent hand contents
- secret cards
- unresolved pending gift card contents
- unresolved pending competition group contents
- full room snapshots
- full outbound or inbound room-state payloads when they include hidden information

## Safety Rules
- Room, player, and event identifiers may appear when needed for debugging.
- Counts, booleans, event types, and concise rejection reasons are allowed if they do not reconstruct hidden game state.
- Commented fallback logging that suggests restoring unsafe dumps must be deleted, not retained.

## Verification Targets
- Default runtime create/join/restore/rematch flows stay quiet enough for normal play.
- Invalid restore and invalid action paths still produce actionable warnings or errors.
- Existing gameplay and restore behavior remains unchanged from the player perspective.
