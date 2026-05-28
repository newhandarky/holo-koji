# Tasks: Shared Types 合約全面收斂

- [x] T001 Add authoritative WebSocket event maps and derived message unions to `game-shared-types/src/game.types.ts`.
- [x] T002 Add `build` script to `game-shared-types/package.json` and confirm declarations regenerate.
- [x] T003 Update frontend `GameWebSocket` to import shared message/event map types and type `send`/`on`.
- [x] T004 Remove unused frontend `startOrderDecision` sender and exclude `START_ORDER_DECISION` from client-to-server contract.
- [x] T005 Move remaining ambient declarations from `src/types/game-shared-types.d.ts` into shared types and delete the augmentation file.
- [x] T006 Update root dependency metadata to remove unused `socket.io-client`.
- [x] T007 Update server dependency metadata to use `file:../game-shared-types` and remove unused `socket.io`.
- [x] T008 Add `server/tsconfig.json` for Node 20 ESM compile-to-`dist`.
- [x] T009 Convert active server runtime modules from `.js` to `.ts` while preserving `.js` import specifiers for NodeNext output.
- [x] T010 Convert server tests to TypeScript and update `server/package.json` scripts to build before running compiled tests.
- [x] T011 Introduce shared backend event map contracts; legacy backend runtime compiles from TypeScript with `@ts-nocheck` as a behavior-preserving migration bridge.
- [x] T012 Remove unused Socket.IO source from `server/sockets/`.
- [x] T013 Run shared, server, and frontend validation commands.
- [x] T014 Run contract searches for GitHub shared dependency, frontend augmentation, Socket.IO imports, and untyped WebSocket send/on usage.
