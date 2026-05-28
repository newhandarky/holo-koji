# Implementation Plan: Backend WebSocket Handler Decomposition

## Technical Approach

Extract the WebSocket connection lifecycle into `server/ws` modules. Use structural interfaces so the new modules can operate on `GameRoom` instances without importing `GameRoom` from `index.ts`.

## Implementation Phases

1. Create the 038 branch and spec artifacts in root and nested `server/`.
2. Add `server/ws/connectionContext.ts` for per-socket state.
3. Add `server/ws/accountHandlers.ts` for account and achievement events.
4. Add `server/ws/messageHandlers.ts` for room/game events.
5. Add `server/ws/messageRouter.ts` to parse `{ type, payload }`, dispatch events, and handle close cleanup.
6. Update `server/index.ts` to call `registerWebSocketHandlers(...)`.
7. Update `server/tsconfig.json` includes.
8. Run server, shared, frontend, and contract validation.

## Constraints

- Do not move `GameRoom` out of `server/index.ts`.
- Do not split NPC AI in this phase.
- Do not add dependencies or runtime schema libraries.
- Do not change production startup: `node dist/index.js`.
