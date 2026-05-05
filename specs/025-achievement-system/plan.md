# Implementation Plan: Achievement System

**Branch**: `025-achievement-system`  
**Date**: 2026-05-05  
**Spec**: [spec.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/025-achievement-system/spec.md)

## Summary

建立 025 成就系統的第一版基礎：後端在 server-confirmed match completion 後，針對 durable bound account 評估固定 starter catalog 的四個成就：首場完成、首勝、完成 3 場、勝利 3 場。成就進度與 unlock records 獨立於 024 的 minimal account counters，但同一個 match completion flow 需要讓 counters 與 achievement progress 保持一致。

前端第一版只在 Lobby 提供成就入口、成就列表/狀態，以及「新解鎖」提示或標記；不改賽後結果畫面，不新增 leaderboard/reward 系統，不回溯 pre-025 counters 或歷史賽局。Guest 或 durable storage unavailable 時，成就 surface 必須清楚顯示不可持久化/暫時不可用，且不能產生 session-only progress。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Primary Frontend Surface**: `src/pages/Lobby/`, `src/utils/runtimeLogger.ts`, account sync state from `src/utils/lineAccount.ts`  
**Primary Backend Surface**: `server/index.js`, `server/utils/accountStore.js`, new achievement catalog/store/evaluator helper module  
**Shared Contract Surface**: `game-shared-types/src/game.types.ts`, `src/types/game-shared-types.d.ts` if local ambient declarations remain needed  
**Persistence**: Reuse 024 account persistence capability; achievement progress is durable-only and unavailable when account storage reports temporary/unavailable.  
**Realtime/API Contracts**: Add WebSocket request/result surfaces for achievement summary/status and optional new-unlock acknowledgement.  
**Validation**: `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json`, `npm --prefix server test`, focused Lobby/achievement frontend tests, `CI=1 npm test -- --watchAll=false`, `npm run build`

No unresolved technical clarifications remain.

## Constitution Check

- Game rule correctness: Pass. Achievement evaluation observes completed match outcomes only and does not change scoring, turn order, action availability, card ownership, or hidden-information visibility.
- Shared state integrity: Pass. Server remains authoritative; clients may request summaries/acknowledge markers but cannot declare match results, progress, unlocks, or account proof.
- Explicit realtime contracts: Pass. Achievement summary/status and marker acknowledgement contracts are documented before implementation and require client/server/shared type updates in one scope.
- Mobile-first playability: Pass. First UI surface is a compact Lobby entry/list and does not redesign gameplay or bottom-sheet match flows.
- Verifiable delivery: Pass. Shared type compilation, focused backend achievement tests, focused Lobby tests, full frontend tests, and build are defined.

## Project Structure

```text
src/pages/Lobby/
src/utils/lineAccount.ts
src/utils/runtimeLogger.ts
src/services/websocket.ts
server/index.js
server/utils/accountStore.js
server/utils/achievementStore.js
server/utils/achievementStore.test.js
game-shared-types/src/game.types.ts
src/types/game-shared-types.d.ts
specs/025-achievement-system/
```

## Phase 0 - Research

See [research.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/025-achievement-system/research.md).

Key decisions:

- Keep the starter catalog fixed to four server-confirmed completion/win milestones.
- Store achievement progress/unlocks separately from 024 minimal account counters.
- Evaluate achievements only for durable bound accounts during post-025 server-confirmed match completion.
- Do not initialize or unlock from pre-025 counters or historical matches.
- Surface achievement view and new-unlock marker only in Lobby for the first version.
- Treat temporary/unavailable persistence as achievement unavailable, with no session-only progress or later backfill.

## Phase 1 - Design

See [data-model.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/025-achievement-system/data-model.md), [contracts/achievement-system-contract.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/025-achievement-system/contracts/achievement-system-contract.md), and [quickstart.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/025-achievement-system/quickstart.md).

Design notes:

- `AchievementCatalogItem` is code-defined and bounded to the four starter achievements.
- `AchievementProgress` and `AchievementUnlock` are keyed by bound account and catalog item.
- Match completion processing should update minimal counters and achievements in one server-owned flow, using a stable server-owned `completionId` and durable processed-completion guard to preserve idempotency for repeated processing of the same completion.
- Achievement summary responses include catalog item presentation, progress, unlock state, and unavailable/guest state, but never expose LINE tokens, raw account payloads, or hidden game state.
- New-unlock feedback is a Lobby marker/list state that can be cleared after the player opens the achievement view or explicitly acknowledges it.

## Phase 2 - Task Planning

Generate tasks in dependency order:

1. Add shared achievement types and WebSocket payload contracts.
2. Add backend achievement catalog/evaluator/store tests for the four starter achievements, guest exclusion, durable-only behavior, `completionId` idempotency, no pre-025 backfill, and no client proof acceptance.
3. Implement backend achievement store/evaluator and integrate it into server-confirmed match completion after account counter updates.
4. Add WebSocket handlers for achievement status/summary and new-unlock acknowledgement.
5. Add frontend achievement API helpers/state wiring and Lobby achievement entry/list UI.
6. Add Lobby unavailable/guest states and new-unlock marker clearing behavior.
7. Add diagnostics/runtime summary coverage to ensure no private LINE/account/hidden game data leaks.
8. Run shared type compilation, focused server tests, focused frontend tests, full frontend tests, and build.

## Risks

- Achievement progress can be spoofed if the server accepts client-declared results or unlock claims. Mitigation: contract exposes summary/ack only; progress writes are server-owned and tied to match completion.
- Progress and 024 account counters can diverge if updated in separate flows. Mitigation: integrate achievement evaluation with the existing server-confirmed completion path and test both bound players.
- Durable storage failure can mislead players if temporary progress is shown. Mitigation: unavailable/temporary persistence returns achievement-unavailable state and never records session-only progress.
- Reprocessing a completion can duplicate progress and unlocks. Mitigation: achievement store must persist processed `completionId` guards, upsert per account/catalog item, and preserve first unlock time.
- Lobby UI can expand beyond scope. Mitigation: keep first-version UI to compact entry/list/marker; user owns detailed visual review.

## Implementation Handoff Notes

- 025 does not require real LINE Login Channel ID work. It consumes the bound account identity and persistence capability from 024.
- The implementation must not backfill from existing account counters. Pre-025 counters are account stats only, not achievement initialization data.
- Temporary account mode and Redis unavailable states are not achievement-ready and must not show session-only progress.
- Match result/rematch UI should remain unchanged unless a later spec explicitly moves unlock feedback into the game room.

## Post-Design Constitution Check

- Game rule correctness: Pass. Design reads match completion outcomes only and does not modify gameplay state transitions.
- Shared state integrity: Pass. Achievement mutation is server-owned and durable-bound-account-only.
- Explicit realtime contracts: Pass. Achievement WebSocket payloads and visibility boundaries are documented in the contract artifact.
- Mobile-first playability: Pass. UI is constrained to compact Lobby surfaces.
- Verifiable delivery: Pass. Quickstart defines shared type, backend, frontend, privacy, full test, and build checks.
