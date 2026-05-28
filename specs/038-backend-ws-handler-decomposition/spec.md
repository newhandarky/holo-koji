# Feature Specification: Backend WebSocket Handler Decomposition

## Summary

Move WebSocket connection routing and message handlers out of `server/index.ts` while leaving `GameRoom` and gameplay logic in place.

This phase is structural only. It must not change the WebSocket `{ type, payload }` wire shape, game rules, room lifecycle, account behavior, achievement behavior, NPC behavior, or deployment entrypoint.

## Requirements

- `server/index.ts` must no longer directly contain the `wss.on('connection')` handler body or per-message handler functions.
- WebSocket connection state must be represented explicitly as a typed context object.
- Account and achievement handlers must be separated from room/game message handlers.
- WebSocket modules must use dependency injection for `GameRoom` creation, room registry access, account store, snapshot restore, and cleanup.
- `GameRoom` remains in `server/index.ts` for this phase.
- TypeScript strict compilation must remain clean.

## Acceptance Criteria

- `cd server && npm run build` passes.
- `cd server && npm test` passes.
- Shared types and frontend regression checks still pass.
- Contract searches for `@ts-nocheck`, explicit `any`, and strict subflag exceptions return no results.
- `server/index.ts` wires `registerWebSocketHandlers(...)` instead of directly owning WebSocket routing logic.
