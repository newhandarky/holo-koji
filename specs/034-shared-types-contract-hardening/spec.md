# Feature Specification: Shared Types 合約全面收斂

**Feature Branch**: `034-shared-types-contract-hardening`  
**Created**: 2026-05-28  
**Status**: Draft  
**Input**: User description: "將 `game-shared-types` 收斂成唯一合約來源，後端主線改成 TypeScript 並採編譯後執行，讓前端、後端、WebSocket 事件、payload、遊戲狀態都被同一份型別約束。"

## User Scenarios & Testing

### User Story 1 - 前後端使用同一份合約 (Priority: P1)

開發者修改房間、遊戲狀態或 WebSocket payload 時，只需要更新 `game-shared-types`，前端與後端都會在編譯時暴露不相容的使用點。

**Why this priority**: 這是目前 shared types 沒有徹底落實的核心問題。

**Independent Test**: `game-shared-types`、前端與後端 TypeScript 編譯都必須通過，且 server 不再依賴 GitHub 版 shared types。

**Acceptance Scenarios**:

1. **Given** server 與 root 都已安裝依賴，**When** 檢查 package metadata，**Then** server 與 root 都指向本地 `game-shared-types`。
2. **Given** 任一 WebSocket event payload 型別被改動，**When** 執行前後端編譯，**Then** 不相容的 send/on/handler 使用點會失敗。

---

### User Story 2 - 後端主線受 TypeScript 約束 (Priority: P1)

開發者執行後端 build 時，實際 production 入口會由 TypeScript source 編譯到 `dist/`，再由 Node.js 執行 compiled output。

**Why this priority**: 若後端仍以 `index.js` 為主線，shared types 只能作為提示，無法形成強制合約。

**Independent Test**: `cd server && npm run build && npm test` 通過，且 `npm start` 指向 `dist/index.js`。

**Acceptance Scenarios**:

1. **Given** 後端 source 已轉成 TypeScript，**When** 執行 `npm run build`，**Then** `dist/index.js` 會產生且無 TypeScript error。
2. **Given** 後端測試執行，**When** `npm test` 跑完，**Then** 測試使用 compiled output 或編譯後測試檔，不再依賴 runtime transpiler。

---

### User Story 3 - 移除過期與補丁式合約 (Priority: P2)

開發者閱讀專案時，不會再看到未使用的 Socket.IO server 或前端 module augmentation，避免誤判實際通訊架構。

**Why this priority**: 過期檔案與補丁型別會讓合約來源不清楚。

**Independent Test**: 搜尋不到 `src/types/game-shared-types.d.ts`、`server/sockets/gameSocket.ts`、`socket.io`、`socket.io-client` 的有效 runtime 使用。

**Acceptance Scenarios**:

1. **Given** 清理完成，**When** 搜尋 Socket.IO import，**Then** 只會在 lockfile 歷史或完全不存在，不會出現在 source。
2. **Given** 前端需要 shared type，**When** 搜尋 module augmentation，**Then** 不再依賴 `src/types/game-shared-types.d.ts` 補型別。

## Requirements

### Functional Requirements

- **FR-001**: The system MUST use local `game-shared-types` as the single dependency source for frontend and backend.
- **FR-002**: The system MUST define typed `ClientToServerEventMap` and `ServerToClientEventMap` in `game-shared-types`.
- **FR-003**: The frontend WebSocket wrapper MUST type `send` by `ClientToServerEventMap` and `on` by `ServerToClientEventMap`.
- **FR-004**: The backend message dispatch and outbound send/broadcast helpers MUST use shared event map types.
- **FR-005**: The backend production start path MUST execute compiled JavaScript from TypeScript source.
- **FR-006**: The unused `START_ORDER_DECISION` client-to-server command MUST be removed from the public active contract.
- **FR-007**: Existing wire shape MUST remain `{ type, payload }`.
- **FR-008**: Existing game rules, room lifecycle, UI behavior, and hidden-information boundaries MUST remain unchanged.
- **FR-009**: Unused Socket.IO source and dependencies MUST be removed.

### Non-Functional Requirements

- **NFR-001**: The refactor MUST be verifiable through automated TypeScript build and existing test commands.
- **NFR-002**: The refactor MUST avoid adding runtime schema libraries.
- **NFR-003**: The backend MUST keep explicit validation for room membership, turn order, action availability, pending interactions, and hidden-state visibility.

### Key Entities

- **ClientToServerEventMap**: Shared map from client-sent event names to payload shapes.
- **ServerToClientEventMap**: Shared map from server-sent event names to payload shapes.
- **TypedWebSocketMessage**: Discriminated `{ type, payload }` union derived from event maps.
- **Compiled Server Runtime**: `server/dist` output generated from TypeScript source.

## Success Criteria

- **SC-001**: `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json` passes.
- **SC-002**: `cd server && npm run build && npm test` passes.
- **SC-003**: `CI=1 npm test -- --watchAll=false` and `npm run build` pass.
- **SC-004**: Server no longer depends on GitHub `game-shared-types`.
- **SC-005**: Frontend no longer contains local module augmentation for shared types.

## Assumptions

- Backend TypeScript uses compile-to-`dist` production runtime.
- Tests may be converted to TypeScript and compiled before execution.
- No WebSocket event name is renamed unless it is currently unused and unhandled.

## Out of Scope

- Migrating from `ws` to Socket.IO or STOMP.
- Adding Zod or another runtime schema validation library.
- Changing gameplay rules, UI layout, scoring, or room flow.
