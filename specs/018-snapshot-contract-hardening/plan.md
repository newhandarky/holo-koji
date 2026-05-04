# Implementation Plan: Snapshot And Contract Hardening

**Branch**: `018-snapshot-contract-hardening`  
**Date**: 2026-05-04  
**Spec**: [spec.md](./spec.md)

## Summary

Harden the room snapshot and room lifecycle contract introduced by the multi-character-set work so valid rooms restore cleanly and invalid rooms are rejected deterministically. The core scope is server-authoritative validation: accept only supported `geishaSet` keys, verify that restored boards contain exactly seven characters belonging to the referenced set, preserve one consistent room-level set identity across waiting room, gameplay, unresolved next round, rematch, and valid restore, and keep hidden state private when room state is resent.

This feature should not add new room UI or selection controls. It should instead tighten existing restore boundaries, align shared producer/consumer contract usage, and keep user-facing failure handling simple: invalid room data leads to a new-room recovery path rather than partial repair or fallback.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, active room lifecycle handled through the `ws`-based server in `server/index.js`  
**Shared Types**: `game-shared-types` plus frontend local declarations consuming `geishaSet` in room and gameplay state  
**Package Manager**: npm  
**Primary Risk Surface**: snapshot restore path, room-state resend path, waiting-state creation, rematch reset, and any frontend default-normalization that can erase non-default set identity  
**Validation**: `cd server && npm test`, `CI=1 npm test -- --watchAll=false`, `npm run build`  
**Unknowns**: None requiring further clarification; 018 clarify already fixed restore failure behavior, board/set validation depth, messaging posture, and room-identity consistency scope

## Constitution Check

- Game rule correctness: Pass. The plan preserves existing unresolved-next-round and rematch rules, and does not alter charm, item, or scoring behavior.
- Shared state integrity: Pass. Snapshot acceptance and room lifecycle identity remain server-authoritative; frontend only consumes validated state.
- Explicit realtime contracts: Pass. This feature explicitly documents restore rejection rules, valid room lifecycle identity, and player-visible state boundaries.
- Mobile-first playability: Pass. No gameplay layout or bottom-sheet interaction changes are introduced.
- Verifiable delivery: Pass. Plan defines server-focused validation plus frontend test/build commands.

## Project Structure

```text
src/
  pages/GameRoom/
  reducers/
  types/
server/
  index.js
  utils/gameUtils.js
  utils/gameUtils.test.js
  utils/roomStore.js
game-shared-types/
specs/018-snapshot-contract-hardening/
```

## Phase 0 - Research

See [research.md](./research.md).

Key conclusions:
- restore 採嚴格 reject，不做 fallback 或部分修復
- snapshot 必須驗證 room-level set 與七位角色內容完全一致
- waiting room、active game、rematch、restore 都屬於同一份 room identity contract
- hidden-state hardening 必須與 restore contract 一起檢查，不能視為獨立後補項目

## Phase 1 - Design

See [data-model.md](./data-model.md), [contracts/snapshot-contract-hardening.md](./contracts/snapshot-contract-hardening.md), and [quickstart.md](./quickstart.md).

Design focus:
- Add or consolidate restore validation gates around supported set keys and board/set consistency.
- Ensure rejected restore attempts terminate into a new-room recovery path instead of keeping an invalid shell room.
- Audit room lifecycle state creation and resend paths so `geishaSet` remains consistent across host/joiner, waiting room, active game, unresolved next round, rematch, and valid restore.
- Audit player-visible state shaping to ensure no hidden information becomes exposed while rebuilding or resending room state.
- Keep shared type and runtime contract usage aligned so frontend consumers do not normalize valid non-default sets away.

## Phase 2 - Task Planning

Task generation should group work into four implementation slices:

1. **Restore validation gates**
   - supported set resolution
   - unavailable set rejection
   - seven-character board/set consistency validation
   - invalid snapshot hard stop behavior

2. **Room lifecycle contract alignment**
   - waiting room set identity
   - active gameplay set identity
   - unresolved next round preservation
   - rematch preservation
   - valid restore preservation

3. **Player-visible state hardening**
   - restore/resend output audit
   - host/joiner consistency checks
   - hidden hand / pending choice visibility protection

4. **Verification and docs sync**
   - server-focused tests for reject/accept paths
   - frontend regression checks for non-default set consumption
   - spec artifact sync and validation commands

## Risks

- **Risk**: restore 驗證只檢查 room-level `geishaSet`，未檢查實際 board 角色內容。  
  **Mitigation**: 將 board/set consistency 定義為 restore 成功必要條件，並補 server tests 覆蓋 mixed-set 與 incomplete board。

- **Risk**: invalid snapshot restore 失敗後仍留下部分可用 room shell，造成 host / joiner 狀態不一致。  
  **Mitigation**: 明確要求 restore failure 直接導向 new-room recovery path，不保留 partial room。

- **Risk**: room state resend 或 frontend consumer 對非 `default` 值做隱性 normalize，導致 waiting room / active room / restore 後 identity 漂移。  
  **Mitigation**: 檢查 server emit 與 frontend consume 兩側，補 host/joiner consistency tests。

- **Risk**: restore/rebuild path 為了方便直接重送完整 state，意外暴露 hidden hand 或 pending secret choices。  
  **Mitigation**: 針對 player-visible state shaping 補 focused review 與測試，確認 hidden information boundary 未被破壞。

## Post-Design Constitution Check

- Game rule correctness: Pass. 設計只強化 restore 與 contract，不改玩法規則。
- Shared state integrity: Pass. room identity 與 restore gate 均由 server 主導。
- Explicit realtime contracts: Pass. contract 文件已明確定義 supported keys、restore rejection、lifecycle identity、visibility boundaries。
- Mobile-first playability: Pass. 無新 UI 結構變更。
- Verifiable delivery: Pass. quickstart 已定義 server test、frontend test、build 驗證。
