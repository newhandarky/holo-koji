# Tasks: Backend Entrypoint Decomposition Phase 1

- [x] T001 Create 037 root/server branches and spec artifacts.
- [x] T002 Extract HTTP app setup to `server/http/app.ts`.
- [x] T003 Extract room error constants to `server/rooms/roomErrors.ts`.
- [x] T004 Extract room registry creation to `server/rooms/roomRegistry.ts`.
- [x] T005 Extract snapshot restore to `server/rooms/roomRestore.ts` using dependency injection.
- [x] T006 Update `server/index.ts` imports and wiring without moving `GameRoom`.
- [x] T007 Update `server/tsconfig.json` include paths for new module directories.
- [x] T008 Run server build/test, full regression checks, and contract searches.
