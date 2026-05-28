# Implementation Plan: Backend Strict Typing

**Branch**: `035-backend-strict-typing`  
**Date**: 2026-05-28  
**Spec**: [spec.md](./spec.md)

## Summary

Remove backend `@ts-nocheck` comments, add the internal types needed to make the existing TypeScript migration strict, and enable `strict: true` without changing game behavior or WebSocket wire shape.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js 20, Express, `ws`, TypeScript compiled to `dist`  
**Shared Types**: local `game-shared-types` package with WebSocket event maps  
**Package Manager**: npm  
**Validation**: `cd server && npm run build && npm test`, `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json`, `CI=1 npm test -- --watchAll=false`, `npm run build`

## Constitution Check

- Game rule correctness: Pass - no behavior changes intended.
- Shared state integrity: Pass - strict backend typing closes the 034 migration gap.
- Explicit realtime contracts: Pass - existing shared event maps remain unchanged.
- Mobile-first playability: Pass - no UI changes.
- Verifiable delivery: Pass - build/test plus `@ts-nocheck` search.

## Project Structure

```text
server/
specs/035-backend-strict-typing/
```

## Phase 0 - Research

- There are 17 backend files with `@ts-nocheck`.
- `server/tsconfig.json` currently has `strict: false`.
- 034 already converted runtime/test files to `.ts` and compile-to-`dist`.

## Phase 1 - Design

- Remove `@ts-nocheck` in batches from low-risk utilities to high-risk runtime.
- Add explicit local types rather than weakening shared contracts.
- Keep limited `any` only at JSON/external/mock boundaries.
- Enable `strict: true` after the last file compiles.

## Phase 2 - Task Planning

Batch order: low-risk utilities, room/account helpers, game utility helpers, tests, then `index.ts`.

## Risks

- `server/index.ts` is large and dynamic; mitigate with local interfaces and no gameplay rewrites.
- Test mocks may require `unknown as Response` or local mock types; keep those casts inside tests.
