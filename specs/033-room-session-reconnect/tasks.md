# Tasks: Room Session Reconnect Hardening

**Input**: `specs/033-room-session-reconnect/spec.md`

## Phase 1 - Failing Coverage

- [X] T001 Add backend WebSocket integration coverage for rejecting same-player joins without a valid session token.
- [X] T002 Add backend WebSocket integration coverage for reconnecting an active player after disconnect.
- [X] T003 Add backend restore coverage for rebuilding human player seats from room snapshots.

## Phase 2 - Server Session Model

- [X] T004 Add opaque session token generation and human seat metadata to `server/index.js`.
- [X] T005 Return session tokens only to the owning client on room creation and first join.
- [X] T006 Require matching session tokens before reattaching an existing seat.
- [X] T007 Detach active-game sockets on disconnect instead of removing seats.
- [X] T008 Persist and restore human seat metadata in room snapshots.

## Phase 3 - Frontend Reconnect

- [X] T009 Persist room session tokens from Lobby room responses.
- [X] T010 Send stored session tokens from `useWebSocket` `JOIN_ROOM` reconnects.

## Phase 4 - Validation

- [X] T011 Run focused backend session tests.
- [X] T012 Run `npm test` in `server/`.
- [X] T013 Run `CI=1 npm test -- --watchAll=false`.
- [X] T014 Run `npm run build`.
