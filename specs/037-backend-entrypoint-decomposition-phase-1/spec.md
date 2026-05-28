# Feature Specification: Backend Entrypoint Decomposition Phase 1

## Summary

Reduce the maintenance risk of the oversized backend entrypoint by moving low-risk outer responsibilities out of `server/index.ts`.

This phase is structural only. It must not change WebSocket wire shape, game rules, room flow, account behavior, achievement behavior, NPC behavior, or deployment entrypoint.

## Requirements

- `server/index.ts` must no longer directly define the Express app, CORS middleware, `/health`, or Redis snapshot restore helper.
- HTTP app setup must be exposed through `createHttpApp()`.
- Room restore must be extracted without importing `GameRoom` from the restore module.
- Room error message constants must be centralized outside `index.ts`.
- Room registry creation must avoid a bare `new Map<string, GameRoom>()` in `index.ts`.
- `GameRoom` remains in `server/index.ts` for this phase.
- TypeScript strict compilation must remain clean.

## Acceptance Criteria

- `cd server && npm run build` passes.
- `cd server && npm test` passes.
- Shared types and frontend regression checks still pass.
- Contract searches for `@ts-nocheck`, explicit `any`, and strict subflag exceptions return no results.
- `server/index.ts` keeps startup, WebSocket wiring, `GameRoom`, and handlers, while HTTP app and room restore logic live in dedicated modules.
