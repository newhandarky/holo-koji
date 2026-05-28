# Tasks: Backend WebSocket Handler Decomposition

- [x] T001 Create 038 root/server branches and spec artifacts.
- [x] T002 Add typed WebSocket connection context module.
- [x] T003 Extract account and achievement handlers to `server/ws/accountHandlers.ts`.
- [x] T004 Extract room and game message handlers to `server/ws/messageHandlers.ts`.
- [x] T005 Extract routing and connection lifecycle to `server/ws/messageRouter.ts`.
- [x] T006 Update `server/index.ts` to wire `registerWebSocketHandlers(...)`.
- [x] T007 Update `server/tsconfig.json` include paths for `ws/**/*.ts`.
- [x] T008 Run server build/test, full regression checks, and contract searches.
