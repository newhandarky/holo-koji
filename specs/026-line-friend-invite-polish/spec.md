# Feature Specification: LINE Friend Invite Polish

**Feature Branch**: `026-line-friend-invite-polish`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "026-line-friend-invite-polish"

## Clarifications

### Session 2026-05-06

- Q: 026 的 LINE 好友邀請主要分享機制要採用哪一種？ → A: 主要使用 LIFF Share Target Picker；只有在 LINE/LIFF 環境且能力可用時開啟好友選擇，否則提供可複製分享連結。
- Q: 受邀玩家打開 invite link 後，系統應該在什麼時機自動嘗試加入房間？ → A: 先預填或醒目顯示 room id，等玩家確認顯示名稱與加入動作後才送出 join。
- Q: invite link 指向的房間不存在、已滿、或已開始對局時，接收端的主要恢復路徑要怎麼處理？ → A: 顯示明確原因，保留原 invite 房號資訊，提供「複製房號/請對方重送邀請」與「回到建立或加入房間」兩條路徑。

## User Scenarios & Testing

### User Story 1 - Send A Clear Friend Invite From Waiting Room (Priority: P1)

A room host waiting for another player can send a LINE friend invite that clearly tells the friend what the invitation is, which room it is for, and how to join. The host should understand whether the invite was sent through LINE or copied as a shareable link.

**Why this priority**: The invite flow is the main way two online players reach the same room. If the invitation content or result feedback is unclear, the match cannot start reliably.

**Independent Test**: Create an online room, use the friend invite action from the waiting room, and confirm the host sees clear feedback for the outcome while the shared invitation contains the room identity and a join action.

**Acceptance Scenarios**:

1. **Given** a host is waiting in an online room, **When** they use the LINE friend invite action, **Then** the invitation content clearly identifies the game, the room, and the join action.
2. **Given** the invite can be sent through LINE, **When** the send action completes, **Then** the host receives non-blocking confirmation that the invite was sent or that no additional action is needed.
3. **Given** the invite cannot be sent through LINE, **When** the host uses the invite action, **Then** the system provides a copyable fallback link and explains how to share it.
4. **Given** the host cancels the LINE friend selection flow, **When** control returns to the room, **Then** the host remains in the waiting room and can retry or use the fallback without losing room state.

---

### User Story 2 - Join Smoothly From A Friend Invite (Priority: P1)

An invited friend can open the invitation and arrive at a clear join path for the intended room, whether they open it inside LINE or through a regular browser. The friend should not need to manually decode the room id from the URL, and the system should not join the room until the friend confirms their display name and join action.

**Why this priority**: The invite is only useful if the recipient can enter the correct room with minimal confusion.

**Independent Test**: Open an invite link as a recipient and confirm the target room is prefilled or clearly presented, with a straightforward way to enter a display name and join.

**Acceptance Scenarios**:

1. **Given** a friend opens a valid invite link, **When** the Lobby loads, **Then** the intended room is prefilled or clearly selected for joining, and no join request is sent until the friend confirms their display name and join action.
2. **Given** the friend opens the invite outside LINE, **When** LINE-specific invite features are unavailable, **Then** the page still offers a normal browser join path.
3. **Given** the friend opens the invite inside LINE, **When** LINE profile information is available, **Then** the join flow can use the existing account/profile foundation without requiring extra manual setup.
4. **Given** the invite link references a room that no longer exists, is full, or has already started, **When** the friend attempts to join, **Then** they see a clear reason, the original invited room identity remains visible, and they can copy the room identity or ask for a new invite, or return to room creation or normal room joining.

---

### User Story 3 - Provide Safe Fallbacks And Diagnostics For Invite Failures (Priority: P2)

A player or tester can understand why a LINE friend invite path is unavailable without exposing private LINE data or blocking normal play. Ordinary players should get practical guidance, while diagnostics can show environment readiness at a high level.

**Why this priority**: LINE invite capability depends on the runtime environment. Clear fallback behavior prevents support confusion and keeps non-LINE play usable.

**Independent Test**: Use the invite flow in unsupported, cancelled, and error states, then confirm ordinary UI stays actionable and diagnostics summarize readiness without sensitive data.

**Acceptance Scenarios**:

1. **Given** LINE friend invite capability is unavailable, **When** the player opens the waiting room invite controls, **Then** they see an available fallback instead of a dead action.
2. **Given** an invite attempt fails, **When** the error is shown, **Then** the message avoids technical secrets and tells the player how to continue.
3. **Given** diagnostics are viewed, **When** invite readiness is summarized, **Then** the summary includes only safe status fields and no LINE tokens, raw profile payloads, or hidden game state.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST provide a clear friend invite action from the online waiting room before the second player joins.
- **FR-002**: The invitation content MUST include a player-readable game invitation, the intended room identity, and a join action or join link.
- **FR-003**: The host MUST receive clear non-blocking feedback for invite sent, copied, cancelled, and failed outcomes.
- **FR-004**: If LINE-specific friend selection is unavailable, the system MUST provide a fallback shareable link that can be copied and sent manually.
- **FR-004a**: The primary LINE friend invite mechanism MUST use LIFF Share Target Picker only when the app is running in a LINE/LIFF environment and that capability is available; all other environments MUST use the copyable share link fallback.
- **FR-005**: If the host cancels the invite selection flow, the system MUST keep the host in the waiting room and preserve the existing room state.
- **FR-006**: Invite links MUST route invited players toward the intended room without requiring them to manually retype the room id.
- **FR-006a**: Invite links MUST NOT automatically submit a room join request on page load; the invited player MUST confirm their display name and join action before the join request is sent.
- **FR-007**: Invite links opened outside LINE MUST still support ordinary browser-based joining.
- **FR-008**: Invite links opened inside LINE SHOULD reuse existing LINE profile/account foundation behavior when available, without adding a new binding requirement.
- **FR-009**: Invalid, expired, missing, full, or already-started rooms reached through an invite MUST show a clear recovery path instead of leaving the invited player stuck.
- **FR-009a**: Invite recovery UI MUST display the failure reason, preserve the original invited room identity, and provide both a path to copy the room identity or request a new invite and a path back to normal room creation or joining.
- **FR-010**: Invite UI and fallback messages MUST NOT require LINE login for guests who can otherwise join rooms normally.
- **FR-011**: Invite diagnostics and logs MUST NOT expose LINE tokens, raw LINE profile payloads, account verification evidence, invite recipient identities, or hidden game state.
- **FR-012**: The feature MUST NOT change Hanamikoji rules, scoring, turn order, card ownership, action availability, room membership validation, or hidden-information visibility.
- **FR-013**: The feature MUST NOT create invite attribution, referral rewards, achievements, leaderboards, or friend relationship records.
- **FR-014**: The invite surface MUST remain available only where it helps start or continue an online room, and MUST NOT clutter active gameplay decisions after the match has started.

### Non-Functional Requirements

- **NFR-001**: The invite flow MUST remain understandable to first-time players without requiring technical knowledge of LINE or URLs.
- **NFR-002**: Guest play and non-LINE browser play MUST remain fully usable.
- **NFR-003**: Invite feedback MUST be non-blocking and must not prevent the host from copying the room code, waiting, leaving, or retrying.
- **NFR-004**: The waiting room invite controls MUST remain compact and readable on mobile screens.
- **NFR-005**: Invite error and diagnostic surfaces MUST distinguish unavailable capability from user cancellation and ordinary failures.
- **NFR-006**: Invite content and diagnostics MUST use safe summaries only and avoid private account or recipient data.

### Key Entities

- **Friend Invite**: A player-facing invitation generated for one online room, containing clear game context and a join path.
- **Invite Link**: A shareable link that carries the intended room identity for the recipient join flow.
- **Invite Outcome**: The result shown to the host after attempting to invite, such as sent, copied, cancelled, unavailable, or failed.
- **Invited Friend Join State**: The recipient-side Lobby state that reflects an invite target room, preselects or prominently shows that room, and waits for the friend to confirm their display name and join action.
- **Invite Recovery State**: The recipient-side state shown when the invited room cannot be joined, preserving the original room identity and offering safe next actions.
- **Invite Capability Status**: A safe readiness state that describes whether LINE friend invite behavior is available, unavailable, or falling back to manual sharing.

## Success Criteria

- **SC-001**: 100% of generated friend invites include the room identity and a clear join action or link.
- **SC-002**: A first-time invited player can reach the intended room join path from a valid invite without manually copying the room id, while the actual join request occurs only after the player confirms their display name and join action.
- **SC-003**: 100% of unsupported LINE invite environments provide a fallback shareable link.
- **SC-004**: 100% of invite cancellation outcomes keep the host in the waiting room with room state preserved.
- **SC-005**: 0 invite UI, diagnostics, logs, or shared invite content expose LINE tokens, raw profile payloads, invite recipient identities, or hidden game state.
- **SC-006**: Guest and browser-only players can still join invited rooms without LINE binding.
- **SC-007**: The invite controls remain usable on mobile without blocking room code copy, room waiting, or room leaving actions.

## Assumptions

- Existing room creation and join behavior remains the source of truth for room membership and validation.
- Existing LINE account/profile foundation may be reused when available, but 026 does not add new account binding or verification behavior.
- Existing invite links already carry a room identifier; this spec focuses on making the invitation and recipient path clearer and more reliable.
- A manual shareable link is the default fallback whenever LINE friend selection is unavailable, cancelled, or fails.
- Detailed visual review of the waiting room invite surface remains user-owned under AGENTS.md.

## Out of Scope

- Adding invite attribution, referral tracking, friend relationship storage, rewards, or invite-based achievements.
- Adding or changing LINE Login Channel ID setup, LINE account binding verification, or identity trust behavior.
- Adding public leaderboards, social graphs, friend lists, seasons, or monetized progression.
- Changing active gameplay rules, scoring, turn order, action availability, or hidden-information visibility.
- Requiring LINE login before a guest can create or join a room.
- Redesigning the full Lobby or post-match result experience beyond invite entry and recipient join clarity.
