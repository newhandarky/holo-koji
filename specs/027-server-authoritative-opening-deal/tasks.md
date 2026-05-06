# Tasks: 權威開局發牌

**Input**: Design documents from `specs/027-server-authoritative-opening-deal/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/opening-deal-contract.md`, `quickstart.md`

## Phase 1 - Setup

- [X] T001 Review the authoritative opening deal requirements in `specs/027-server-authoritative-opening-deal/spec.md`.
- [X] T002 Review implementation constraints and validation commands in `specs/027-server-authoritative-opening-deal/plan.md`.
- [X] T003 Review safe payload and logging boundaries in `specs/027-server-authoritative-opening-deal/contracts/opening-deal-contract.md`.
- [X] T004 Review current opening flow and state shaping in `server/index.js`.
- [X] T005 Review current deck, deal, and round helpers in `server/utils/gameUtils.js`.

## Phase 2 - Foundation

- [X] T006 [P] Add shared opening deal summary and step types in `game-shared-types/src/game.types.ts`.
- [X] T007 [P] Sync frontend local declarations for opening deal summary fields in `src/types/game-shared-types.d.ts`.
- [X] T008 [P] Add runtime logger redaction test cases for removed-card and opening-step identities in `server/utils/runtimeLogger.test.js`.
- [X] T009 [P] Add server utility tests for safe opening progress summary shape in `server/utils/gameUtils.test.js`.
- [X] T010 Implement opening progress summary builder helpers in `server/utils/gameUtils.js`.
- [X] T011 Implement runtime logger summary support for opening deal status without card identities in `server/utils/runtimeLogger.js`.

## Phase 3 - User Story 1: 安全完成開局牌務 (Priority: P1)

**Goal**: 雙方完成先後順序確認後，由 server 一次性移除 1 張隱藏牌並輪流分配雙方各 6 張起始手牌，且 active-play player-visible state 不洩漏移除牌或對手手牌。

**Independent Test**: 建立一局並完成雙方順序確認後，驗證 removed card 正好 1 張、雙方各 6 張、draw pile 8 張、active-play viewer state 隱藏移除牌與對手手牌。

- [X] T012 [US1] Add server tests for removed-card count, hand counts, draw pile count, and alternating deal order in `server/utils/gameUtils.test.js`.
- [X] T013 [US1] Add server tests for player-visible state masking of removed card and opponent starting hand in `server/utils/gameUtils.test.js`.
- [X] T014 [US1] Extend round setup state with one-time opening deal metadata and safe summary attachment in `server/index.js`.
- [X] T015 [US1] Ensure order-confirmation completion uses the confirmed player order without re-dealing on duplicate or late confirmations in `server/index.js`.
- [X] T016 [US1] Ensure per-viewer state shaping hides active-play removed card, draw pile contents, opponent hand faces, and opponent secret cards in `server/index.js`.
- [X] T017 [US1] Preserve removed-card identity in authoritative server state while excluding it from gameplay decisions in `server/index.js`.
- [X] T018 [US1] Update existing validation helpers or setup assertions to include opening deal metadata invariants in `server/index.js`.
- [X] T019 [US1] Run `npm --prefix server test` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix failures in touched server files.

## Phase 4 - User Story 2: 支援安全的開局發牌呈現 (Priority: P2)

**Goal**: 提供後續 UI 可使用的開局進度摘要，包含移除隱藏牌、輪流背面發牌與完成狀態，但不包含任何卡面身分。

**Independent Test**: 檢查 opening progress summary 有 1 個 hidden burn step、12 個 facedown deal steps、1 個 completion marker，且所有 step 都不含 card identity/image/charm fields。

- [X] T020 [P] [US2] Add contract-style tests for opening progress summary steps and forbidden card fields in `server/utils/gameUtils.test.js`.
- [X] T021 [P] [US2] Add frontend regression test for optional opening deal state consumption in `src/pages/GameRoom/index.test.tsx`.
- [X] T022 [US2] Attach safe opening progress summary to `GAME_STARTED` and `GAME_STATE_UPDATED` viewer-safe state in `server/index.js`.
- [X] T023 [US2] Ensure opening progress summary uses only metadata fields from `server/utils/gameUtils.js`.
- [X] T024 [US2] Update GameRoom state consumption to tolerate optional opening deal summary without changing current UI flow in `src/pages/GameRoom/index.tsx`.
- [X] T025 [US2] Update WebSocket game-state typing or sync path for opening deal summary in `src/hooks/useWebSocket.ts`.
- [X] T026 [US2] Run focused frontend test `CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix failures in touched frontend files.

## Phase 5 - User Story 3: 中斷或重連後恢復到安全狀態 (Priority: P3)

**Goal**: 開局期間或開局後重連時，玩家回到既有權威狀態；第一位玩家完成首次實際操作前可恢復安全開局進度，首次操作後可清除或標記不再重播。

**Independent Test**: 在開局前、中、後與首次操作後重送 viewer-safe state，確認不重新移除牌、不重新發牌、不提前揭露移除牌，且 opening progress retention 符合生命週期。

- [X] T027 [US3] Add server tests for reconnect/resend preserving removed card and starting hands in `server/utils/gameUtils.test.js`.
- [X] T028 [US3] Add server tests for opening progress replay retention until first actual player action in `server/utils/gameUtils.test.js`.
- [X] T029 [US3] Add server tests for ended settlement summary exposing removed card only after game end in `server/utils/gameUtils.test.js`.
- [X] T030 [US3] Add server timing test for opening-ready summary generated within the 2-second target in `server/utils/gameUtils.test.js`.
- [X] T031 [US3] Implement replayable-to-not-replayable transition when the first actual player action completes in `server/index.js`.
- [X] T032 [US3] Ensure reconnect and resend paths reuse existing opening deal state instead of regenerating it in `server/index.js`.
- [X] T033 [US3] Add ended settlement data boundary for removed card without changing settlement UI layout in `server/index.js`.
- [X] T034 [US3] Run `npm --prefix server test` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix failures in touched server files.

## Phase 6 - Polish & Cross-Cutting Concerns

- [X] T035 [P] Review contract wording against implemented payload fields in `specs/027-server-authoritative-opening-deal/contracts/opening-deal-contract.md`.
- [X] T036 Run `CI=1 npm test -- --watchAll=false` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix failures in touched frontend files.
- [X] T037 Run `npm run build` from `/Users/zhangzhipeng/MyProject/hanamikoji-game` and fix build/type errors in touched files.
- [X] T038 Update 027 quickstart notes with final validation results in `specs/027-server-authoritative-opening-deal/quickstart.md`.
- [X] T039 Verify `git status --short` only includes intended 027 files and approved `AGENTS.md` change from `/Users/zhangzhipeng/MyProject/hanamikoji-game`.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before any user story implementation.
- User Story 1 is the MVP and must complete before User Story 2 and User Story 3.
- User Story 2 depends on shared types and safe summary helpers from Phase 2 and authoritative state from User Story 1.
- User Story 3 depends on authoritative state from User Story 1 and summary lifecycle fields from User Story 2.
- Phase 6 validation after all implemented user stories.

## Parallel Execution Examples

### Setup / Foundation

- T006 and T007 can run in parallel because they update shared package types and frontend declaration mirror.
- T008 and T009 can run in parallel because they add tests in different files.

### User Story 1

- T012 and T013 should be sequential because both update `server/utils/gameUtils.test.js`.
- T014, T015, T016, and T017 should be done sequentially because they all modify `server/index.js` state flow.

### User Story 2

- T020 and T021 can run in parallel because they cover backend contract tests and frontend type/consumer tests.
- T022, T024, and T025 should be coordinated because they affect the same game-state payload moving through server and frontend sync.

### User Story 3

- T027, T028, T029, and T030 should be sequential because all update `server/utils/gameUtils.test.js`.
- T031, T032, and T033 should be sequential because they all update lifecycle behavior in `server/index.js`.

## Implementation Strategy

### MVP First

Complete Phase 1, Phase 2, and User Story 1. This establishes the core safety guarantee: exactly one hidden removed card, legal starting hands, and no active-play client-visible leak.

### Incremental Delivery

1. Deliver User Story 1 with server tests passing.
2. Add User Story 2 to expose safe opening progress for later animation specs.
3. Add User Story 3 to harden reconnect, replay retention, and end-state removed-card availability.
4. Run full frontend tests and build before handoff.

## Notes

- Keep 027 scoped to server-authoritative opening deal and safe contracts.
- Do not implement opening animation modal, card back assets, skip button, `拿取手牌`, draw notification focus changes, AI difficulty labels, or settlement screen redesign.
- Treat removed-card identity as hidden information until game end.
- Preserve existing mobile-first gameplay layout and bottom-sheet behavior.
