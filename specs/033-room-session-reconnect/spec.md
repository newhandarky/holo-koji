# Feature Specification: Room Session Reconnect Hardening

**Feature Branch**: `codex/fix-room-session-reconnect`  
**Created**: 2026-05-15  
**Status**: Draft  
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

## Requirements

- **FR-001**: The server MUST issue an opaque room session token to every human player seat created through `CREATE_ROOM` or first-time `JOIN_ROOM`.
- **FR-002**: The server MUST return the session token only to the owning client in `ROOM_CREATED` or `PLAYER_JOINED` payloads.
- **FR-003**: The frontend MUST persist the room session token locally per room/player and include it on subsequent `JOIN_ROOM` attempts from the game room reconnect path.
- **FR-004**: When a player ID already exists in a room, the server MUST reject a join that does not present the matching room session token.
- **FR-005**: A WebSocket disconnect during an active game MUST detach the connection from the seat without removing the player from room membership or game state.
- **FR-006**: A reconnect with matching room ID, player ID, and session token MUST reattach the WebSocket and send the player's sanitized `GAME_STATE_UPDATED` snapshot.
- **FR-007**: Redis room snapshots MUST include human player seat metadata required for token-based reconnect, and restore MUST rebuild those seats with disconnected sockets.
- **FR-008**: Hidden information protections MUST remain intact: reconnect state sync must still use player-visible game state.

## Out of Scope

- Shared types dependency cleanup.
- Removing tracked nested `node_modules`.
- New authentication provider or LINE account trust policy changes.
- Public account/session management UI.
