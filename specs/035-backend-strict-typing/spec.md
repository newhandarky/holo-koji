# Feature Specification: Backend Strict Typing

**Feature Branch**: `035-backend-strict-typing`  
**Created**: 2026-05-28  
**Status**: Draft  
**Input**: User description: "移除 server 目前的 `@ts-nocheck`，讓後端內部也受 TypeScript strict 檢查。"

## User Scenarios & Testing

### User Story 1 - 後端 source 受 TypeScript 檢查 (Priority: P1)

開發者修改後端 runtime 或 utils 時，TypeScript 能在 build 階段檢查錯誤的物件欄位、函式參數與回傳型別。

**Why this priority**: 034 已完成編譯後執行，但 `@ts-nocheck` 仍讓後端內部型別無法真正防錯。

**Independent Test**: `rg "@ts-nocheck" server -g '!dist/**' -g '!node_modules/**'` 無結果，且 `cd server && npm run build` 通過。

**Acceptance Scenarios**:

1. **Given** 後端 source 已移除 `@ts-nocheck`，**When** 執行 server build，**Then** TypeScript 會檢查所有 active backend files。
2. **Given** 後端 runtime 仍使用既有 wire shape，**When** 執行 server tests，**Then** 既有遊戲、帳號、重連與安全邊界測試仍通過。

---

### User Story 2 - 型別收斂不改變遊戲行為 (Priority: P1)

玩家建立房間、加入房間、順序決定、準備確認、出牌、重連、結算與成就流程維持既有行為。

**Why this priority**: strict typing 是品質重構，不應混入規則或 UI 行為修改。

**Independent Test**: 現有 server/frontend tests 與 builds 通過。

**Acceptance Scenarios**:

1. **Given** 玩家進行既有 WebSocket flow，**When** 後端處理事件，**Then** event names 與 `{ type, payload }` wire shape 不變。
2. **Given** 隱藏資訊如對手手牌、密約卡或 pending choice，**When** 後端產生 player-visible state，**Then** 仍只傳送該玩家可見資訊。

## Requirements

### Functional Requirements

- **FR-001**: The backend MUST remove all `@ts-nocheck` comments from source and tests under `server/`, excluding generated `dist/` and dependencies.
- **FR-002**: The backend MUST enable `strict: true` in `server/tsconfig.json`.
- **FR-003**: The backend MUST define explicit internal types for room seats, room snapshots, room state, account store requests, achievement requests, and deterministic random sources where needed.
- **FR-004**: The backend MUST preserve existing WebSocket event names and payload wire shape.
- **FR-005**: The backend MUST not add runtime schema validation libraries.

### Non-Functional Requirements

- **NFR-001**: The refactor MUST keep existing automated tests passing.
- **NFR-002**: Any remaining `any` MUST be limited to unavoidable external boundaries or legacy JSON/mock boundaries with clear local containment.
- **NFR-003**: Runtime behavior changes are out of scope unless strict typing exposes a demonstrable bug; any such fix requires focused test coverage.

### Key Entities

- **RoomSeat**: Runtime room player seat with websocket/session/account metadata.
- **RoomSnapshot**: Persisted room data without live WebSocket handles.
- **GameRoom**: Authoritative room state and gameplay transition owner.
- **RandomSource**: Deterministic random provider used by game setup helpers.
- **Account/Achievement Store Inputs**: Explicit request objects for account sync, persistence status, match completion, and achievement acknowledgement.

## Success Criteria

- **SC-001**: `rg "@ts-nocheck" server -g '!dist/**' -g '!node_modules/**'` returns no matches.
- **SC-002**: `cd server && npm run build` passes with `strict: true`.
- **SC-003**: `cd server && npm test` passes.
- **SC-004**: Shared, frontend test, and frontend build commands continue to pass.

## Assumptions

- This feature starts after 034 is committed in root and nested server repo.
- The backend remains Node.js 20 ESM compiled with TypeScript.
- `skipLibCheck` remains enabled.

## Out of Scope

- Changing game rules, UI behavior, event names, or payload wire shape.
- Introducing Zod or equivalent runtime validation.
- Large architectural split of `server/index.ts` beyond small helper/type extraction.
