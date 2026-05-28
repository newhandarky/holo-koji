# Implementation Plan: Shared Types 合約全面收斂

**Branch**: `034-shared-types-contract-hardening`  
**Date**: 2026-05-28  
**Spec**: [spec.md](./spec.md)

## Summary

Use `game-shared-types` as the single source of truth for frontend/backend contracts, add typed WebSocket event maps, migrate the active backend runtime to TypeScript compiled into `server/dist`, and remove unused Socket.IO plus frontend ambient type patches.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js 20, Express, `ws`, TypeScript compiled to `dist`  
**Shared Types**: local `game-shared-types` package  
**Package Manager**: npm  
**Validation**: `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json`, `cd server && npm run build && npm test`, `CI=1 npm test -- --watchAll=false`, `npm run build`

## Constitution Check

- Game rule correctness: Pass - no gameplay behavior changes intended.
- Shared state integrity: Pass - typed event maps and local shared dependency harden state contracts.
- Explicit realtime contracts: Pass - WebSocket contract maps become authoritative.
- Mobile-first playability: Pass - no UI layout changes.
- Verifiable delivery: Pass - build and tests cover shared, server, and frontend.

## Project Structure

```text
src/
server/
game-shared-types/
specs/034-shared-types-contract-hardening/
```

## Phase 0 - Research

- The active server is `server/index.js` using `ws`; `server/sockets/gameSocket.ts` is unused Socket.IO residue.
- Frontend imports local `game-shared-types`; server currently imports GitHub `game-shared-types`, so the shared contract can drift.
- Frontend has `src/types/game-shared-types.d.ts` module augmentation because shared package output was not authoritative.
- Current WebSocket message type permits arbitrary strings, so event names are not fully checked.

## Phase 1 - Design

- Move all active shared fields from frontend augmentation into `game-shared-types/src/game.types.ts`.
- Add `ClientToServerEventMap`, `ServerToClientEventMap`, and derived discriminated message unions.
- Update frontend `GameWebSocket` with generic typed `send` and `on`.
- Convert active backend runtime and tests to TypeScript, compile to `server/dist`, and run production from compiled output. Legacy backend files use `@ts-nocheck` during this migration to avoid rewriting dynamic game logic in the same feature.
- Keep wire payload shape and existing validation behavior.

## Phase 2 - Task Planning

Tasks should proceed in this order: shared package contract, frontend typed wrapper, backend dependency/scripts, backend TypeScript migration, Socket.IO/augmentation cleanup, verification.

## Risks

- Backend conversion is broad; mitigate by preserving behavior and running server tests after each major migration step.
- Backend source is compiled from TypeScript, but legacy internals still need a follow-up strict typing pass after this contract migration.
- Event map may reveal dormant events; remove only unused unhandled client commands and keep existing emitted server events typed.
