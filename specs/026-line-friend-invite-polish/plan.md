# Implementation Plan: LINE Friend Invite Polish

**Branch**: `026-line-friend-invite-polish`  
**Date**: 2026-05-06  
**Spec**: [spec.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/spec.md)

## Summary

改善現有 LINE 好友邀請與受邀者進房體驗，範圍集中在前端等待房間、LIFF 分享工具、Lobby invite link 處理、可測試的錯誤/恢復狀態，以及安全診斷摘要。主要分享機制維持 `LIFF Share Target Picker`，僅在 LINE/LIFF 環境且能力可用時開啟好友選擇；其他環境一律使用可複製分享連結。受邀玩家打開 invite link 後只會預填或醒目顯示房號，不會在頁面載入時自動送出 `JOIN_ROOM`。

此 spec 不新增 invite attribution、好友關係、成就、帳號驗證、LINE Channel ID 設定，也不更動 Hanamikoji 規則或 Socket.IO room membership validation。server 仍是加入房間與房間狀態的權威來源；本計畫只把前端對 server 既有錯誤的呈現與恢復路徑補齊。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Primary Frontend Surface**: `src/utils/lineLiff.ts`, `src/pages/GameRoom/index.tsx`, `src/pages/Lobby/index.tsx`, `src/pages/Lobby/LobbyPlayControls.tsx`, `src/pages/Diagnostics/`  
**Primary Backend Surface**: existing `JOIN_ROOM`/room validation responses only; no new backend contract expected unless implementation discovers missing status detail  
**Shared Contract Surface**: no shared type change expected; document frontend invite contract under this spec  
**LINE Integration**: Use existing LIFF SDK checks, `config.liffId`, `config.webAppUrl`, `liff.isInClient()`, and `liff.isApiAvailable('shareTargetPicker')`; no hardcoded Channel ID  
**Invite Link Format**: Web fallback URL remains `?roomId=<ROOM_ID>`; LIFF URL remains `https://liff.line.me/<LIFF_ID>?roomId=<ROOM_ID>` when LIFF ID is configured  
**Privacy Boundary**: invite diagnostics/logs may include safe capability state and room identity, but must not include LINE tokens, raw profile payloads, recipient identities, account verification evidence, or hidden game state  
**Validation**: focused frontend tests for `lineLiff`, `Lobby`, `GameRoom`, and diagnostics behavior; then `CI=1 npm test -- --watchAll=false` and `npm run build`

No unresolved technical clarifications remain.

## Constitution Check

- Game rule correctness: Pass. The plan does not modify scoring, turn order, card ownership, action availability, or hidden-information handling.
- Shared state integrity: Pass. Room existence/full/started decisions remain server-authoritative through existing join validation; the client only improves presentation and recovery.
- Explicit realtime contracts: Pass. No Socket.IO event or payload change is planned. If implementation needs a new error code/status, it must update this plan/contracts before coding.
- Mobile-first playability: Pass. Waiting room and Lobby controls remain compact and non-blocking; detailed visual review remains user-owned.
- Verifiable delivery: Pass. Focused tests plus full frontend test/build checks are defined.

## Project Structure

```text
src/utils/lineLiff.ts
src/pages/GameRoom/
src/pages/Lobby/
src/pages/Diagnostics/
specs/026-line-friend-invite-polish/
```

## Phase 0 - Research

See [research.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/research.md).

Key decisions:

- Keep `LIFF Share Target Picker` as the only LINE friend selection mechanism and fallback to copyable share link outside supported LINE/LIFF contexts.
- Treat invite links as routing hints, not join authority. The user confirms display name and join action before any `JOIN_ROOM` is sent.
- Keep room recovery as frontend state driven by existing join errors, preserving the invited room identity and offering safe next actions.
- Avoid adding server-side invite records, recipient tracking, referral data, achievements, or friend storage.
- Keep diagnostics as safe capability summaries and never include sensitive LINE/account/recipient payloads.

## Phase 1 - Design

See [data-model.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/data-model.md), [contracts/line-friend-invite-contract.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/contracts/line-friend-invite-contract.md), and [quickstart.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/026-line-friend-invite-polish/quickstart.md).

Design notes:

- `FriendInvite` is generated from a waiting room room id and produces player-readable LINE/Flex/text content plus a join URL.
- `InviteCapabilityStatus` separates `available`, `unavailable`, `cancelled`, `copied`, and `failed` outcomes so UI can show distinct non-blocking feedback.
- `InvitedFriendJoinState` is a Lobby-only state that stores the normalized invited room id, source, and pending confirmation status.
- `InviteRecoveryState` preserves the original invited room id and reason after a failed join attempt, without creating a new server concept.
- `shareRoomInvite(roomId)` should avoid throwing expected unavailable-capability states to callers; expected fallback should return a typed copy/unavailable result where possible.

## Phase 2 - Task Planning

Generate tasks in dependency order:

1. Add or tighten frontend invite utility tests for URL generation, LIFF capability detection, Share Target Picker success, cancellation, fallback copy, and safe error modes.
2. Refine `lineLiff.ts` result shapes and invite content so LINE/Flex/text/fallback messages consistently include game context, room identity, and join action.
3. Update waiting room invite controls in `GameRoom` to show distinct sent/copied/cancelled/unavailable/failed feedback while preserving room state.
4. Add Lobby invite state tests for `?roomId=` and `liff.state`, ensuring room id is prefilled/highlighted and no automatic join occurs on page load.
5. Add Lobby recovery tests for missing/full/already-started invite join failures, preserving original room identity and offering copy/retry/navigation actions.
6. Add Diagnostics coverage for safe invite capability summaries if diagnostics surface changes are needed.
7. Run focused frontend tests, then full frontend tests and build.

## Risks

- Share Target Picker behavior differs between desktop browser, LINE in-app browser, and LIFF-supported origins. Mitigation: centralize capability detection and test supported/unavailable/cancelled/failure branches with mocks.
- Existing `shareRoomInvite` throws for disabled Share Target Picker, which can make an expected fallback look like an error. Mitigation: normalize expected unavailable capability into a copyable fallback result.
- Invite recovery can accidentally auto-join or lose the original room id after server errors. Mitigation: model invite join state explicitly and test that page load never sends `JOIN_ROOM`.
- UI copy can become too verbose on mobile waiting room controls. Mitigation: keep feedback non-blocking and compact; user performs detailed visual review.
- Diagnostics or logs can leak LINE profile data while debugging invite capability. Mitigation: only log safe capability/status fields and room identity, never tokens, raw profiles, or recipient identities.

## Implementation Handoff Notes

- Real LINE Channel ID is not needed for planning or mocked automated tests. It is only needed when manually validating actual LIFF Share Target Picker behavior in a LINE Developers environment.
- The implementation should not add server-side invite persistence or recipient identity tracking.
- Existing `JOIN_ROOM` server errors remain the source for room recovery reasons. If existing errors are too ambiguous for clear UI, document and implement the smallest explicit error-code contract in this feature before coding.
- The user owns detailed visual review. Automated delivery should cover behavior, fallback, privacy, and build correctness.

## Post-Design Constitution Check

- Game rule correctness: Pass. Design does not alter match rules or hidden state.
- Shared state integrity: Pass. Server remains authoritative for room join outcomes; invite links do not bypass validation.
- Explicit realtime contracts: Pass. Planned implementation avoids new Socket.IO payloads; any discovered need for explicit error codes must be documented in the contract first.
- Mobile-first playability: Pass. Controls stay in waiting room/Lobby surfaces and avoid active gameplay clutter.
- Verifiable delivery: Pass. Quickstart defines focused tests, full tests, and build.
