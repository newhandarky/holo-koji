# Implementation Plan: Backend Strict Subflags Hardening

## Technical Approach

Use the existing TypeScript server runtime and local `game-shared-types` contract. Remove the remaining strictness overrides in `server/tsconfig.json`, then address compiler findings in batches.

The implementation should prefer local interfaces, `unknown` input boundaries, shared event payload types, and guard helpers. Do not introduce `any`, module-wide suppressions, or runtime schema libraries.

## Implementation Phases

1. Establish the failing strict baseline by removing `noImplicitAny: false` and `strictNullChecks: false`.
2. Fix `noImplicitAny` errors in `server/index.ts` and backend test helpers.
3. Fix `strictNullChecks` errors with early returns, local assertions, and explicit nullable state handling.
4. Run backend, shared type, frontend test, frontend build, and contract searches.

## Constraints

- No WebSocket wire-shape changes.
- No gameplay, room flow, or UI changes.
- No broad `server/index.ts` module split unless needed for pure types or small helper guards.
- No `any` escape hatch.

