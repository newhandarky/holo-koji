# Tasks: Character Set Selection UI

**Input**: Design documents from `specs/017-character-set-selection-ui/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/character-set-selection-ui.md`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review the active spec, plan, research, data model, contract, and quickstart in `specs/017-character-set-selection-ui/`.
- [x] T002 [P] Audit current lobby room-creation and join-room set handling in `src/pages/Lobby/index.tsx`, `src/pages/GameRoom/index.tsx`, `server/index.js`, and `game-shared-types/src/game.types.ts`.

## Phase 2 - Foundation

- [x] T003 Add a shared lobby character-set option definition for `default`, `collaboration`, and `hololive` in `src/pages/Lobby/index.tsx` or a new `src/pages/Lobby/characterSetOptions.ts`.
- [x] T004 Add lobby state for `selectedGeishaSet` with untouched default `default` in `src/pages/Lobby/index.tsx`.
- [x] T005 Update the lobby room-creation UI to replace the hardcoded Ginza field with a simple text-based selector in `src/pages/Lobby/index.tsx`.
- [x] T006 Add disabled-option presentation rules for temporarily unavailable sets in `src/pages/Lobby/index.tsx` and supporting styles in `src/index.css` or the existing lobby stylesheet.

## Phase 3 - User Story 1: Select a character set before creating a match (P1)

**Goal**: Players can choose Ginza, 擅自合作系列, or Hololive before creating either an online room or an NPC room, and the selected value is sent with room creation.

**Independent Test**: From the lobby, create one online room and one NPC room with each available set and verify the `CREATE_ROOM` message carries the selected `geishaSet`.

- [x] T007 [US1] Keep the selector visible and usable for both online and NPC creation flows in `src/pages/Lobby/index.tsx`.
- [x] T008 [US1] Preserve the current `selectedGeishaSet` when switching between `online` and `npc` modes in `src/pages/Lobby/index.tsx`.
- [x] T009 [US1] Send `selectedGeishaSet` with every `CREATE_ROOM` submission while preserving existing NPC difficulty behavior in `src/pages/Lobby/index.tsx`.
- [x] T010 [US1] Ensure room-creation failure leaves the current selection intact for retry in `src/pages/Lobby/index.tsx`.
- [x] T011 [P] [US1] Add focused lobby tests for default selection, manual selection, mode-switch preservation, and `CREATE_ROOM` payload composition in `src/pages/Lobby/index.test.tsx` or a new `src/pages/Lobby/Lobby.test.tsx`.

## Phase 4 - User Story 2: Default safely to Ginza when no explicit choice is made (P1)

**Goal**: The existing quick-start room-creation flow still uses Ginza when the player does not actively change the selector.

**Independent Test**: Open the lobby, leave the selector untouched, create a room, and verify the submitted `geishaSet` is `default`.

- [x] T012 [US2] Keep Ginza as the untouched selector default without adding extra mandatory steps to room creation in `src/pages/Lobby/index.tsx`.
- [x] T013 [US2] Remove remaining hardcoded display or submission assumptions that would mask the untouched-default behavior in `src/pages/Lobby/index.tsx`.
- [x] T014 [P] [US2] Extend lobby tests to prove untouched room creation resolves to `default` for both online and NPC flows in `src/pages/Lobby/index.test.tsx` or `src/pages/Lobby/Lobby.test.tsx`.

## Phase 5 - User Story 3: See which character set the room is using through room content (P2)

**Goal**: After room creation, the room reflects the chosen set through the character board itself without adding a new dedicated set label.

**Independent Test**: Create rooms for non-default sets and verify no extra room-level set label is introduced while the room still consumes the selected set through existing game-state rendering.

- [x] T015 [US3] Ensure no new dedicated room-level character-set label is introduced in `src/pages/GameRoom/index.tsx` or `src/components/game/GameBoard.tsx`.
- [x] T016 [US3] Verify the lobby-side change does not reintroduce default-only narrowing before room rendering in `src/pages/GameRoom/index.tsx` and `src/components/game/GameBoard.tsx`.
- [x] T017 [P] [US3] Add or update focused rendering coverage to prove room entry continues to rely on game-state character presentation rather than a new metadata label in `src/pages/GameRoom/index.test.tsx` or an existing room rendering test file.

## Phase 6 - User Story 4: Lock the room to its selected character set after creation (P2)

**Goal**: Once a room exists, its set stays fixed for that room session, and joining players do not see or control a selector.

**Independent Test**: Create a room, join it from the existing join flow, and verify there is no in-room set switcher and no join-room selector.

- [x] T018 [US4] Keep the join-room area free of character-set selection UI in `src/pages/Lobby/index.tsx`.
- [x] T019 [US4] Ensure join-room submissions remain independent of `selectedGeishaSet` in `src/pages/Lobby/index.tsx`.
- [x] T020 [US4] Confirm no in-room control is added that can mutate `geishaSet` after room creation in `src/pages/GameRoom/index.tsx` and `src/components/game/GameBoard.tsx`.
- [x] T021 [P] [US4] Add focused lobby tests for join-room isolation from `selectedGeishaSet` in `src/pages/Lobby/index.test.tsx` or `src/pages/Lobby/Lobby.test.tsx`.

## Phase 7 - Polish & Cross-Cutting Concerns

- [x] T022 [P] Update 017 implementation notes and final behavior wording after implementation in `specs/017-character-set-selection-ui/spec.md`.
- [x] T023 [P] Update quickstart or contract notes if the implemented selector behavior differs from the planned disabled/default/join-room rules in `specs/017-character-set-selection-ui/quickstart.md` and `specs/017-character-set-selection-ui/contracts/character-set-selection-ui.md`.
- [x] T024 Run `CI=1 npm test -- --watchAll=false`.
- [x] T025 Run `npm run build`.
- [x] T026 Confirm no join-room selector or hardcoded `geishaSet: 'default'` remains in the lobby creation path using `rg -n "geishaSet: 'default'|預設（Ginza）|藝妓組合" src/pages/Lobby/index.tsx src/pages/GameRoom/index.tsx`.
- [x] T027 [P] Add joiner-focused room rendering coverage to prove a non-host player still receives the same room `geishaSet` through existing game-state character presentation in `src/pages/GameRoom/index.test.tsx`.
- [x] T028 Audit inherited server coverage for NPC selected-set persistence across initial setup, unresolved next-round continuation, and rematch in `server/utils/gameUtils.test.js`.
- [x] T029 Record manual selector-clarity review as a required handoff check for first-time users and mobile widths in `specs/017-character-set-selection-ui/quickstart.md`.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before all user story phases.
- US1 before US2 because explicit selection flow should be in place before validating untouched-default behavior.
- US1 before US4 because join-room isolation depends on the new selector existing only in room creation.
- US3 can proceed after US1 because it mainly confirms room-surface non-changes and continued consumption of selected set.
- US2, US3, and US4 can proceed in parallel after US1 if handled in separate tasks and test updates.
- Phase 7 after all user story phases.

## Parallel Execution Examples

- Setup: T002 can run while T001 review is being completed.
- Foundation: T006 can be prepared in parallel with T003-T005 once the selector shape is chosen.
- US1: T011 can be written in parallel with T007-T010 after the selector state and room-creation contract are settled.
- US2: T014 can be written in parallel with T012-T013 once the untouched-default rule is implemented.
- US3: T017 can be written in parallel with T015-T016 because it verifies the absence of extra room metadata.
- US4: T021 can be written in parallel with T018-T020 once join-room isolation behavior is defined.
- Polish: T022 and T023 can run in parallel before validation commands T024-T025.

## Implementation Strategy

1. MVP first: complete Foundation and US1 so players can explicitly select a set for online and NPC room creation.
2. Preserve backward compatibility: complete US2 so untouched lobby behavior still defaults to Ginza.
3. Protect room-flow boundaries: complete US3 and US4 so the room surface and join-room path stay aligned with the clarified spec.
4. Finish with focused frontend validation and documentation sync.
