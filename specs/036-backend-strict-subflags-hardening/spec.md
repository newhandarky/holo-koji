# Feature Specification: Backend Strict Subflags Hardening

## Summary

Tighten backend TypeScript strictness by removing the remaining `noImplicitAny: false` and `strictNullChecks: false` overrides from `server/tsconfig.json`.

The work is type hardening only. It must not change WebSocket wire shape, game rules, UI behavior, room lifecycle, or runtime validation strategy.

## Requirements

- Backend TypeScript must compile with `strict: true` and without explicit `noImplicitAny` or `strictNullChecks` overrides.
- `server/index.ts`, backend utilities, and backend tests must not rely on implicit `any`.
- Nullable room/game/account state must be narrowed before use.
- Public WebSocket messages must continue using the existing `{ type, payload }` shape.
- Runtime validation must remain explicit; no schema library will be added.
- Existing hidden-information protections must remain intact.

## Acceptance Criteria

- `server/tsconfig.json` no longer contains `noImplicitAny: false` or `strictNullChecks: false`.
- `cd server && npm run build` passes.
- `cd server && npm test` passes.
- `rg "@ts-nocheck" server -g '!dist/**' -g '!node_modules/**'` returns no results.
- `rg "\bany\b" server/index.ts server/utils -g '!dist/**' -g '!node_modules/**'` returns no results.
- Shared types and frontend checks still pass.

