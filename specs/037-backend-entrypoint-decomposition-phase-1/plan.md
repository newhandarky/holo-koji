# Implementation Plan: Backend Entrypoint Decomposition Phase 1

## Technical Approach

Extract low-risk entrypoint responsibilities into small TypeScript modules while preserving runtime behavior. Use dependency injection for room restore so the restore module can hydrate a `GameRoom`-compatible object without importing `GameRoom`.

## Implementation Phases

1. Create the 037 branch and spec artifacts in root and nested `server/`.
2. Move Express app setup into `server/http/app.ts`.
3. Move shared room error messages into `server/rooms/roomErrors.ts`.
4. Move room registry creation into `server/rooms/roomRegistry.ts`.
5. Move snapshot restore into `server/rooms/roomRestore.ts` with injected `createRoom`.
6. Update `server/index.ts` wiring and `server/tsconfig.json` includes.
7. Run server, shared, frontend, and contract validation.

## Constraints

- Do not move `GameRoom` out of `server/index.ts`.
- Do not split NPC AI or WebSocket handlers in this phase.
- Do not add dependencies or runtime schema libraries.
- Do not change production startup: `node dist/index.js`.
