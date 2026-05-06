# Implementation Plan: 大廳 AI 難度標籤

**Branch**: `031-lobby-ai-difficulty-labels`  
**Date**: 2026-05-06  
**Spec**: [spec.md](./spec.md)

## Summary

調整大廳 NPC 模式的 AI 難度呈現，將目前以人物名稱為主的選項改為固定繁體中文難度標籤與短說明：`簡單 / 中等 / 偏強 / 超強 / 地獄`。實作應保留既有底層難度值 `easy / medium / hard / expert / hell`、NPC 預設 `easy`、線上模式不提交 AI 難度，以及既有房間建立與加入流程。此功能只影響 Lobby UI 與前端驗證，不改 server AI 行為、Socket.IO payload shape 或 shared types。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO/WebSocket server in `server/index.js`  
**Shared Types**: `game-shared-types` existing room creation payload typing  
**Package Manager**: npm  
**Primary Risk Surface**: AI difficulty option copy, selected value mapping, NPC/online mode visibility, invalid difficulty fallback, mobile lobby spacing, existing room creation tests  
**Validation**: focused Lobby tests, `CI=1 npm test -- --watchAll=false`, `npm run build`; server tests only if backend or shared contract behavior changes  
**Unknowns**: None. Clarify resolved label set, hidden/person-name policy, short description copy, and default NPC difficulty.

## Constitution Check

- Game rule correctness: Pass. 031 changes lobby labels only and must not alter Hanamikoji rules, AI decision logic, scoring, turn order, or action limits.
- Shared state integrity: Pass. Server remains authoritative; frontend labels must map to existing difficulty identities without creating client-only rule semantics.
- Explicit realtime contracts: Pass. No Socket.IO event or payload shape change is planned; contract documents that `CREATE_ROOM.aiDifficulty` values remain unchanged.
- Mobile-first playability: Pass. Lobby difficulty labels and descriptions must remain readable on mobile without overlapping adjacent controls.
- Verifiable delivery: Pass. Focused Lobby tests plus full frontend test/build validation are required before handoff.

## Project Structure

```text
src/
  pages/Lobby/
    LobbyPlayControls.tsx
    index.tsx
    index.test.tsx
server/
game-shared-types/
specs/031-lobby-ai-difficulty-labels/
  spec.md
  plan.md
  research.md
  data-model.md
  contracts/
  quickstart.md
```

## Phase 0 - Research

See [research.md](./research.md).

Key conclusions:
- Treat AI difficulty display data as a stable frontend option model with label, description, rank, and existing value.
- Do not display existing character/person names in the difficulty control.
- Keep `easy` as the NPC default and fallback for invalid values.
- Keep line/player-vs-player room creation free of AI difficulty requirements.
- Prefer focused Lobby tests over server tests unless implementation touches backend/shared contract code.

## Phase 1 - Design

See [data-model.md](./data-model.md), [contracts/lobby-ai-difficulty-labels-contract.md](./contracts/lobby-ai-difficulty-labels-contract.md), and [quickstart.md](./quickstart.md).

Design focus:
- Introduce or consolidate a canonical Lobby AI difficulty option list.
- Render NPC-mode difficulty choices with fixed label and fixed short description.
- Hide or make inactive the difficulty control outside NPC mode.
- Preserve valid selected difficulty when switching modes in a single lobby session.
- Ensure `CREATE_ROOM` sends unchanged difficulty values for NPC rooms and omits AI difficulty for online rooms.
- Add tests that verify labels, descriptions, absence of person names, ordering, default/fallback, and payload mapping.

## Phase 2 - Task Planning

Task generation should group work into these slices:

1. **Difficulty option model**
   - define canonical option data for `easy`, `medium`, `hard`, `expert`, `hell`
   - include label, short description, and rank
   - keep type compatibility with existing Lobby state and shared room creation typing

2. **Lobby control rendering**
   - replace person-name option text with fixed labels and descriptions
   - keep NPC-only visibility/inactive behavior
   - ensure current selection remains visible before room creation
   - preserve keyboard, pointer, and touch usability

3. **Lobby state and payload safety**
   - keep default `easy`
   - preserve selected valid difficulty across online/NPC toggles
   - guard invalid/stale values by falling back to `easy`
   - ensure online `CREATE_ROOM` does not submit `aiDifficulty`

4. **Tests and validation**
   - add or update `src/pages/Lobby/index.test.tsx`
   - verify labels/descriptions/order and forbidden person-name display
   - verify NPC payload mapping for all five values
   - verify online mode ignores AI difficulty
   - verify fallback to `easy`
   - run focused test, full frontend test suite, and build

## Risks

- **Risk**: UI label changes accidentally change the value sent to the server.  
  **Mitigation**: Keep existing value union and add mapping tests for every displayed option.

- **Risk**: Person names remain visible through option text, accessible name, or helper copy.  
  **Mitigation**: Add tests that assert the old person names are not rendered in NPC difficulty content.

- **Risk**: Short descriptions make the lobby control too tall or cramped on mobile.  
  **Mitigation**: Use compact stable layout and record manual mobile/desktop review as user-owned if not visually checked.

- **Risk**: Online room creation picks up stale NPC difficulty state.  
  **Mitigation**: Preserve existing `matchMode === 'npc' ? aiDifficulty : undefined` behavior and cover it in tests.

- **Risk**: Invalid state from future persistence or refactors blocks NPC room creation.  
  **Mitigation**: Normalize to `easy` at the Lobby option boundary before display/submission.

## Post-Design Constitution Check

- Game rule correctness: Pass. Design is presentation-only and does not touch AI logic or game rules.
- Shared state integrity: Pass. Existing server difficulty identities remain authoritative for behavior; UI copy only maps to those identities.
- Explicit realtime contracts: Pass. Contract states no new Socket.IO event and no payload shape change.
- Mobile-first playability: Pass. Quickstart includes mobile/desktop readability and overlap review expectations.
- Verifiable delivery: Pass. Plan defines focused Lobby tests, full frontend suite, and build validation.
