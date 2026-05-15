# Feature Specification: Room Session Reconnect Hardening

**Feature Branches**: `codex/fix-room-session-reconnect`, `codex/room-session-contract`, `codex/room-session-recovery-ux`
**Created**: 2026-05-15
**Status**: Completed
**Input**: Code review finding: multiplayer room seats can be hijacked by reusing a player name, disconnected players are removed from active games, and restored room snapshots do not rebuild human seats.

## User Scenarios & Testing

### User Story 1 - Protect Existing Seats From Same-Name Joins (Priority: P1)

A player who already occupies a room seat cannot be replaced by another client that only knows the room code and player name.

**Independent Test**: Create a room, attempt to join with the same player ID from another WebSocket without the issued session token, and confirm the server rejects the join without replacing the original connection.

### User Story 2 - Allow Active Players To Reconnect (Priority: P1)

A player disconnected during an active game can reconnect to the same seat with the server-issued session token and receive their own player-visible game state.

**Independent Test**: Start a two-player room, close one player's socket, reconnect with the same player ID and session token, and confirm the player receives `GAME_STATE_UPDATED` instead of `ROOM_ALREADY_STARTED`.

### User Story 3 - Restore Reconnectable Seats From Snapshots (Priority: P1)

When a room snapshot is restored after server restart, human player seats are rebuilt so the original players can reconnect with their session tokens.

**Independent Test**: Restore a room snapshot with human players and session tokens, then join with the original player ID and token and confirm the restored room treats the player as existing.

### User Story 4 - Recover Cleanly From Stale Session Tokens (Priority: P2)

A player whose local room session token is stale receives a clear recovery path instead of being stuck on a generic reconnect failure.

**Independent Test**: Simulate a `PLAYER_ID_TAKEN` response during game-room reconnect, confirm the local token is cleared, then return to the lobby with the room code and previous player name prefilled for retry.

## Requirements

- **FR-001**: The server MUST issue an opaque room session token to every human player seat created through `CREATE_ROOM` or first-time `JOIN_ROOM`.
- **FR-002**: The server MUST return the session token only to the owning client in `ROOM_CREATED` or `PLAYER_JOINED` payloads.
- **FR-003**: The frontend MUST persist the room session token locally per room/player and include it on subsequent `JOIN_ROOM` attempts from the game room reconnect path.
- **FR-004**: When a player ID already exists in a room, the server MUST reject a join that does not present the matching room session token.
- **FR-005**: A WebSocket disconnect during an active game MUST detach the connection from the seat without removing the player from room membership or game state.
- **FR-006**: A reconnect with matching room ID, player ID, and session token MUST reattach the WebSocket and send the player's sanitized `GAME_STATE_UPDATED` snapshot.
- **FR-007**: Redis room snapshots MUST include human player seat metadata required for token-based reconnect, and restore MUST rebuild those seats with disconnected sockets.
- **FR-008**: Hidden information protections MUST remain intact: reconnect state sync must still use player-visible game state.
- **FR-009**: Shared WebSocket payload types MUST model room session token payloads and room ownership error codes used by the frontend/server boundary.
- **FR-010**: When the frontend receives `PLAYER_ID_TAKEN` during game-room reconnect, it MUST clear only the stale token for that room/player and show a recovery-oriented message.
- **FR-011**: Returning from a blocked game-room reconnect MUST preserve the room code in the lobby join flow and prefill the previous local player name when available.

## Out of Scope

- Shared types package dependency source cleanup.
- Removing tracked nested `node_modules`.
- New authentication provider or LINE account trust policy changes.
- Public account/session management UI.

## Validation Summary

- Backend focused session tests: `node --test utils/roomSession.test.js utils/roomSessionReconnect.test.js`
- Backend full tests: `npm test` in `server/`
- Backend build: `npm run build` in `server/`
- Frontend focused tests: `src/utils/roomSession.test.ts`, `src/hooks/useWebSocket.test.tsx`, `src/pages/Lobby/index.test.tsx`, `src/pages/GameRoom/index.test.tsx`
- Frontend full tests: `CI=1 npm test -- --watchAll=false`
- Frontend build: `npm run build`

## Residual Risks

- Snapshots created before room session metadata existed cannot provide token-based reconnect guarantees for those legacy rooms.
- React test output still includes existing `act(...)` and React Router future-flag warnings; they do not currently fail validation.
