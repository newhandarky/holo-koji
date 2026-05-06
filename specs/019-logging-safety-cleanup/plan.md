# Implementation Plan: Logging And Production Safety Cleanup

**Branch**: `019-logging-safety-cleanup`  
**Date**: 2026-05-04  
**Spec**: [spec.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/019-logging-safety-cleanup/spec.md)

## Summary

Tighten frontend and backend runtime logging so default gameplay flows no longer emit noisy debug output or sensitive hidden-state data, while preserving concise lifecycle, warning, and error signals plus an explicit development-only redacted diagnostic path.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`, `cd server && npm test`  
**Primary Runtime Surfaces**: `src/config/environment.ts`, `src/services/websocket.ts`, `src/hooks/useWebSocket.ts`, `src/pages/Lobby/index.tsx`, `src/pages/GameRoom/index.tsx`, `server/index.js`, `server/utils/roomStore.js`  
**Secondary Audit Surfaces**: `server/sockets/gameSocket.ts`, `server/models/GameManager.ts`, `server/reducers/gameReducer.ts`, `src/reducers/gameReducer.ts`  
**Logging Goal**: Production-oriented runtime keeps concise lifecycle `info`, `warn`, and `error` messages, removes payload and full-state dumps, and never restores full hidden-payload logging even in diagnostic mode.

## Constitution Check

- Game rule correctness: Pass. This feature changes output policy only and must not alter scoring, turns, hidden-state rules, or pending-interaction resolution.
- Shared state integrity: Pass. The cleanup reduces exposure and keeps server-authoritative validation untouched.
- Explicit realtime contracts: Pass. No gameplay payload schema changes are planned; any helper-level diagnostic abstraction must not mutate Socket.IO message shape.
- Mobile-first playability: Pass. No gameplay layout change is included.
- Verifiable delivery: Pass. Plan includes focused server and frontend verification plus the repo-standard test/build commands.

## Project Structure

```text
src/
server/
game-shared-types/
specs/019-logging-safety-cleanup/
```

## Phase 0 - Research

- Confirm which logging surfaces are on the active runtime path versus legacy or dormant code paths.
- Decide the default production logging policy: concise lifecycle `info`, retained `warn`/`error`, no payload/full-state dumps.
- Decide the development diagnostic policy: explicit opt-in only, event-level summaries and redacted state summaries only.
- Decide cleanup treatment for commented fallback logging: delete rather than preserve ambiguous dormant paths.

## Phase 1 - Design

- Introduce a minimal logging policy model that distinguishes runtime audience (`production-oriented default` vs `development diagnostic`) and message sensitivity (`public context`, `redacted summary`, `forbidden hidden payload`).
- Map each active runtime surface to an allowed output level and identify which current log lines must be removed, condensed, gated, or retained.
- Define a logging-safety contract for protected fields so hidden hands, secret cards, pending gift cards, competition groups, and full room snapshots never appear in retained output.
- Design a narrow verification approach that checks both output quieting and zero gameplay-regression expectations.
- Treat secondary audit surfaces as cleanup targets only if they are still reachable or materially misleading for maintenance; otherwise document and defer them explicitly.

## Phase 2 - Task Planning

- Generate tasks in this order:
  1. audit and classify active vs legacy log surfaces
  2. add or standardize the logging gate/helper
  3. clean frontend runtime logs
  4. clean backend runtime logs
  5. remove commented fallback logging paths
  6. add focused tests for hidden-state-safe diagnostics and preserved failure tracing
  7. run frontend and server verification
- Keep shared types out of scope unless a logging helper truly requires a shared utility, which is not the default assumption.

## Risks

- Over-cleaning can remove too much context and make restore or transport failures harder to debug.
  Mitigation: preserve room/event/player context in retained warnings and errors, and add a redacted diagnostic mode.
- Some legacy files may not be on the active runtime path but still confuse maintenance if left noisy.
  Mitigation: classify them during audit and either clean them in this feature or explicitly document why they are deferred.
- Logging refactors can accidentally touch gameplay code paths.
  Mitigation: constrain edits to output behavior, then rerun room, restore, and pending-interaction verification.
