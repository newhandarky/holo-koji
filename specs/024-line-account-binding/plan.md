# Implementation Plan: LINE Account Binding Foundation

**Branch**: `024-line-account-binding`  
**Date**: 2026-05-05  
**Spec**: [spec.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/024-line-account-binding/spec.md)

## Summary

建立 LINE 帳號綁定的第一層基礎：前端只在 LINE profile flow 成功後啟動 account sync，後端只從 LINE 驗證流程產出的伺服器可驗證身分結果建立或更新 bound account profile。帳號 profile 保存 LINE user identity、canonical display name、avatar URL、created/updated timestamps，以及 025 成就系統可接續使用的最小 server-confirmed counters：`gamesPlayed`、`wins`、`lastPlayedAt`。

此 spec 不建立完整成就系統、不新增 LINE avatar 的明確 UI 位置，也不要求玩家綁定 LINE 才能遊玩。帳號同步失敗時 Lobby 顯示非阻塞 guest-mode 提示，詳細原因留在 diagnostics。Channel ID 與 LIFF/LINE Login 設定只在 implementation/deployment 驗證時透過環境設定提供，不寫死在 repo。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Primary Frontend Surface**: `src/utils/lineLiff.ts`, `src/pages/Lobby/`, `src/pages/Diagnostics/`  
**Primary Backend Surface**: `server/index.js`, `server/utils/roomStore.js`, new account profile store/helper module  
**Shared Contract Surface**: `game-shared-types/src/game.types.ts`, `src/types/game-shared-types.d.ts` if local ambient declarations remain needed  
**Persistence**: Reuse Redis when available; provide explicit non-durable in-memory fallback for development.  
**LINE Configuration**: Use environment-provided LIFF/LINE Login identifiers during implementation/deployment validation; no hardcoded Channel ID.  
**Validation**: `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json`, `npm --prefix server test`, `CI=1 npm test -- --watchAll=false`, `npm run build`

No unresolved technical clarifications remain.

## Constitution Check

- Game rule correctness: Pass. Account binding does not change game rules, scoring, turn order, card ownership, actions, or hidden-information behavior.
- Shared state integrity: Pass. Account counters are updated only from server-confirmed events; client identity claims are not accepted as proof of account binding.
- Explicit realtime contracts: Pass. New account sync/status contracts are documented before implementation; existing room/game state remains bounded to public presentation data.
- Mobile-first playability: Pass. Lobby adds only a non-blocking guest-mode notice for sync failure and preserves existing room creation/join flow.
- Verifiable delivery: Pass. Shared type compilation, server account tests, Lobby fallback tests, diagnostics/status tests, full frontend tests, and build are defined.

## Project Structure

```text
src/utils/lineLiff.ts
src/pages/Lobby/
src/pages/Diagnostics/
src/services/websocket.ts
server/index.js
server/utils/accountStore.js
server/utils/accountStore.test.js
server/utils/roomStore.js
server/utils/gameUtils.js
game-shared-types/src/game.types.ts
src/types/game-shared-types.d.ts
specs/024-line-account-binding/
```

## Phase 0 - Research

See [research.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/024-line-account-binding/research.md).

Key decisions:

- Treat server-verifiable LINE identity result as the only acceptable first-version proof for bound LINE identity.
- Treat LIFF profile display data as presentation input only unless the server verification flow has produced a verified identity result.
- Do not trust arbitrary `lineUserId` values sent with room creation/join payloads as account proof.
- Store minimal account counters in the account profile, not full achievement progress.
- Keep per-room display names independent from canonical LINE account presentation.
- Defer new avatar placement UI until LINE integration is proven and a focused UI spec exists.
- Reuse existing Redis availability for durable account profiles and expose temporary fallback status clearly.

## Phase 1 - Design

See [data-model.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/024-line-account-binding/data-model.md), [contracts/line-account-binding-contract.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/024-line-account-binding/contracts/line-account-binding-contract.md), and [quickstart.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/024-line-account-binding/quickstart.md).

Design notes:

- `LineAccountProfile` is keyed by server-verified LINE user identity and stores canonical display data plus minimal counters.
- `PerRoomDisplayName` is scoped to room/player presentation and never writes back to account profile.
- `AccountPersistenceStatus` must be visible to diagnostics/testers and must distinguish `durable` from `temporary`.
- Account sync failures return a non-sensitive status that lets Lobby show a guest-mode notice without blocking play.
- Public room/game state may continue to include public player presentation, but must not expose tokens, raw LINE login payloads, or private account payloads.

## Phase 2 - Task Planning

Generate tasks in dependency order:

1. Add account profile types, persistence status type, and sync result contracts.
2. Add account store tests for verified identity gating, create/update, duplicate prevention, durable/temporary status, and non-durable fallback.
3. Add server account sync/status contract handling and tests for verified identity result gating.
4. Add server-confirmed match completion counter updates for bound accounts only.
5. Update frontend LIFF profile flow to call account sync and surface guest-mode fallback notice.
6. Update diagnostics to report account persistence/sync status without exposing sensitive account payloads.
7. Verify no hidden game state or sensitive LINE data leaks through public state/logging.
8. Run shared type compilation, focused server tests, focused Lobby/Diagnostics tests, full frontend tests, and build.

## Risks

- Verifiable LINE identity can be weakened by trusting ordinary client payloads. Mitigation: account sync contract must reject arbitrary identity claims, require a server-verifiable identity result, and keep raw verification evidence out of stored/public payloads.
- Account persistence can look durable in local development while using temporary fallback. Mitigation: expose `temporary` status clearly and avoid claiming achievement readiness when non-durable.
- Minimal counters can drift into achievement rules. Mitigation: keep only `gamesPlayed`, `wins`, and `lastPlayedAt`; full achievement progress remains out of scope.
- Existing room display behavior can be confused with account canonical display. Mitigation: separate per-room display name from account profile in data model and tests.
- LINE avatar data can pull UI work into this foundation. Mitigation: store avatar when available but explicitly defer new avatar placement UI.

## Implementation Handoff Notes

- Real LINE Login Channel ID is only needed when validating against an actual LINE/LIFF channel in local, staging, or production environment. The value must be provided through environment configuration and must not be committed.
- The implemented foundation validates the account sync contract, server-side account profile lifecycle, guest fallback, privacy redaction, and diagnostics persistence status without requiring a real Channel ID.
- Server account persistence uses Redis-backed durable mode when available and clearly reports temporary in-memory fallback otherwise. Temporary mode is not achievement-ready persistence.
- 024 intentionally does not add a dedicated LINE avatar UI placement; that remains deferred until real LINE integration is proven and a focused UI spec is created.

## Post-Design Constitution Check

- Game rule correctness: Pass. Design does not modify match rules or card state transitions.
- Shared state integrity: Pass. Bound account updates are server-confirmed and guest play remains independent.
- Explicit realtime contracts: Pass. Account sync/status payloads and visibility boundaries are documented in the contract artifact.
- Mobile-first playability: Pass. Lobby fallback notice is non-blocking and does not redesign gameplay UI.
- Verifiable delivery: Pass. Quickstart defines shared type compilation, focused backend, frontend, diagnostics, privacy, full test, and build checks.
