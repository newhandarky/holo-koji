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

## Phase 4 - Shared Contract And Stale Token Handling

- [X] T011 Add shared WebSocket payload types for room session token flow and room ownership errors.
- [X] T012 Replace Lobby and game-room reconnect room payload `any` usage with typed payload boundaries.
- [X] T013 Add room session token clearing utility and focused tests.
- [X] T014 Clear stale room/player token and show recovery-oriented error on `PLAYER_ID_TAKEN`.

## Phase 5 - Recovery UX

- [X] T015 Return from blocked GameRoom reconnect to Lobby with the room code preserved.
- [X] T016 Prefill Lobby player name from the previous local player ID when returning through a room link.
- [X] T017 Show invite recovery guidance for `PLAYER_ID_TAKEN`.

## Phase 6 - Validation

- [X] T018 Run focused backend session tests.
- [X] T019 Run `npm test` in `server/`.
- [X] T020 Run `npm run build` in `server/`.
- [X] T021 Run focused frontend reconnect/session/recovery tests.
- [X] T022 Run `CI=1 npm test -- --watchAll=false`.
- [X] T023 Run `npm run build`.
