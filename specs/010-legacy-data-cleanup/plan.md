# Implementation Plan: Legacy Data Cleanup

**Branch**: `010-legacy-data-cleanup` | **Date**: 2026-05-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-legacy-data-cleanup/spec.md`

## Summary

Remove legacy non-Ginza gameplay data paths from active runtime while keeping `default` as the stable external mode key that resolves to Ginza v2. The cleanup must remove obsolete mode selection, old data mappings, and legacy fallback setup branches without deleting physical image assets. Old room snapshots or requests that reference removed legacy data are rejected explicitly instead of being migrated or silently mapped.

## Technical Context

**Language/Version**: TypeScript 4.7, React 18, Node.js 20 ESM  
**Primary Dependencies**: Create React App, Bootstrap, Express, Socket.IO, local `game-shared-types`  
**Storage**: In-memory room/match state in the server runtime  
**Testing**: `CI=1 npm test -- --watchAll=false`, `npm run build`, `cd server && npm test`  
**Target Platform**: Browser client plus Node.js authoritative multiplayer server  
**Project Type**: Web app with frontend `src/`, backend `server/`, shared types `game-shared-types/`  
**Performance Goals**: No extra runtime data branching for removed legacy modes; no measurable gameplay latency change  
**Constraints**: Preserve server authority, hidden-information safety, Socket.IO compatibility unless explicitly documented, mobile-first gameplay layout  
**Scale/Scope**: Single active Ginza/default data mode, seven board slots per match, future modes deferred to separate specs

## Current Implementation Reality

- `server/utils/gameUtils.js` 已移除 legacy set arrays / `geishaSetMap` / `createLegacyGeishas()` 與舊 `geisha-*` deck fallback，僅保留 Ginza/default setup。
- `server/index.js` 已加入 legacy `geishaSet` 與舊 snapshot 明確拒絕策略，並固定 active set 為 `default`。
- `src/utils/gameData.ts` 已移除舊角色組與舊 mapping，僅保留 default/Ginza 與通用 unknown fallback。
- `game-shared-types/src/game.types.ts` 與 `src/types/game-shared-types.d.ts` 已將 `GeishaSet` 收斂為 `default`。
- `src/pages/Lobby/index.tsx` 已移除 non-Ginza 可選入口，建立房間固定送出 `geishaSet: 'default'`。
- `src/components/game/*` 與 `src/pages/GameRoom/index.tsx` 採單點 normalize：呼叫端可接受過渡型別，但實際傳遞一律使用 `'default'`。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Game rule preservation**: PASS. Scope is data-path cleanup only; scoring, action limits, turn order, pending interactions, and win logic are unchanged.
- **Server authoritative state**: PASS. Default/Ginza setup remains server-owned; removed modes are rejected server-side rather than trusted from client UI.
- **Client/server contract discipline**: PASS. Any `GeishaSet` narrowing must update shared types and all consumers together; no new Socket.IO payload is planned.
- **Mobile-first UI continuity**: PASS. Lobby option removal and generic fallback preservation do not redesign gameplay layout.
- **Validation-first delivery**: PASS. Plan requires frontend tests/build, server tests, and static reference audit for removed legacy keys.

## Project Structure

### Documentation (this feature)

```text
specs/010-legacy-data-cleanup/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── legacy-data-cleanup-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (repository)

```text
src/
├── pages/Lobby/
├── types/
└── utils/

server/
└── utils/

game-shared-types/
└── src/
```

**Structure Decision**: Keep existing frontend/backend/shared-types layout. This feature only removes or narrows legacy data paths and does not introduce new modules unless needed for clearer rejection handling.

## Phase 0: Research

Resolved in [research.md](./research.md):

- How `default` maps to Ginza after legacy cleanup.
- How old room snapshots and stale client requests should be handled.
- Whether physical asset files are removed.
- Which UI fallback behavior must remain.
- Which checks prove legacy active paths are removed without changing gameplay behavior.

## Phase 1: Design

Generated artifacts:

- [data-model.md](./data-model.md): Active default mode, removed legacy data, retained assets, unsupported legacy states, generic fallback.
- [contracts/legacy-data-cleanup-contract.md](./contracts/legacy-data-cleanup-contract.md): Observable behavior contract for default mode, removed legacy modes, old snapshots, asset retention, and fallback behavior.
- [quickstart.md](./quickstart.md): Implementation and verification workflow for this cleanup.

## Phase 1 Constitution Re-check

- **Game rule preservation**: PASS. Design explicitly treats gameplay state transitions as out of scope.
- **Server authoritative state**: PASS. Unsupported legacy mode/state rejection is enforced by server setup/state handling, not only by UI hiding.
- **Client/server contract discipline**: PASS. Shared type narrowing and consumer updates are included in the implementation scope.
- **Mobile-first UI continuity**: PASS. No gameplay surface layout changes are introduced.
- **Validation-first delivery**: PASS. Quickstart includes automated checks and static legacy-reference audit.

## Phase 2: Task Planning Approach

Tasks should be generated in this order:

1. Shared type narrowing so consumers cannot keep using removed legacy set keys.
2. Server cleanup and rejection handling for non-Ginza data paths.
3. Frontend data utility cleanup and generic fallback preservation.
4. Lobby/UI entrypoint removal for non-Ginza options.
5. Focused tests for default Ginza setup and legacy rejection.
6. Static reference audit and full validation.

## Risk Log

| Risk | Impact | Mitigation |
|------|--------|------------|
| Removing old fallback accidentally breaks Ginza default setup | New rooms fail to start | Preserve and extend Ginza default setup tests before cleanup |
| Stale clients or old room snapshots reference removed set keys | Confusing runtime errors | Add explicit unsupported old room/state handling |
| Removing code references while assets remain creates false-positive dead files | Future cleanup confusion | Document that physical asset deletion is intentionally out of scope |
| Narrowing shared types misses a frontend augmentation | Type mismatch or build failure | Run `npm run build` and audit `GeishaSet` references |
