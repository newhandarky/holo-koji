# Feature Specification: LINE Account Binding Foundation

**Feature Branch**: `024-line-account-binding`  
**Created**: 2026-05-05  
**Status**: Implemented  
**Input**: User description: "024-line-account-binding-foundation"

## Clarifications

### Session 2026-05-05

- Q: LINE 身分同步要採用哪一種信任邊界？ → A: 第一版必須只接受可驗證來源的 LINE 身分；不可用一般手動輸入或任意 payload 建立綁定帳號。
- Q: LINE account profile 的持久資料範圍要包含哪些統計基礎？ → A: 保存 profile 加最小 server-confirmed counters，例如 gamesPlayed、wins、lastPlayedAt，供 025 使用。
- Q: 帳號同步失敗時，玩家應該看到什麼程度的提示？ → A: Lobby 顯示非阻塞提示，說明目前以訪客繼續；詳細原因只在 diagnostics。
- Q: 綁定 LINE 後，公開玩家名稱應以哪個來源為準？ → A: LINE profile 是帳號 canonical presentation；玩家可用每場暱稱覆蓋房間顯示，但不回寫 account profile；目前不規劃 LINE avatar 的明確顯示位置，等串接成功後再補 UI。

## User Scenarios & Testing

### User Story 1 - Bind LINE identity for persistent player profile (Priority: P1)

A player who opens the game through LINE can let the game recognize their LINE identity, display name, and avatar as a stable player profile foundation when that LINE identity comes from a server-verifiable source. The player should not need to re-enter their name each time the LINE profile is available.

**Why this priority**: This is the foundation for later achievements and invitation polish. Without a stable account identity, the game cannot reliably attribute persistent progress to one player.

**Independent Test**: Open the game with an available LINE profile, enter the Lobby, and confirm the profile is synchronized as one stable player identity that can be reused by room creation and join flows.

**Acceptance Scenarios**:

1. **Given** a LINE profile is available, **When** the player reaches the Lobby, **Then** the game records a profile containing the LINE user identity, display name, and avatar when present.
2. **Given** the same LINE player opens the game again, **When** the profile is synchronized, **Then** the existing player profile is updated rather than creating a duplicate identity.
3. **Given** the LINE display name or avatar changes, **When** the player returns and synchronizes again, **Then** the stored profile reflects the latest non-sensitive profile information.
4. **Given** a player or client provides an unverifiable LINE identity claim, **When** profile synchronization is attempted, **Then** no bound account profile is created from that claim.
5. **Given** a bound player completes a server-confirmed match, **When** the account foundation records the event, **Then** the player's minimal account counters are updated without unlocking achievements in this spec.
6. **Given** a bound player enters a per-room nickname, **When** they create or join a room, **Then** that nickname may be used for the room display without changing the stored LINE account profile.

---

### User Story 2 - Preserve guest play without LINE identity (Priority: P1)

A player who does not have a LINE identity available can still create rooms, join rooms, and play matches as before. The absence of LINE binding should only prevent persistent account-based progress from being written.

**Why this priority**: LINE binding must not block the existing web play flow, invite flow, NPC flow, or local testing flow.

**Independent Test**: Use the Lobby without a LINE profile and confirm room creation, room joining, and gameplay remain available without creating persistent account progress.

**Acceptance Scenarios**:

1. **Given** no LINE profile is available, **When** the player creates an online room, **Then** room creation still succeeds with the existing guest identity behavior.
2. **Given** no LINE profile is available, **When** the player joins an existing room, **Then** joining still succeeds with the existing guest identity behavior.
3. **Given** no LINE profile is available, **When** a later achievement-capable event occurs, **Then** the system does not write persistent account progress for that guest.
4. **Given** no LINE profile is available, **When** a match is completed, **Then** the system does not write persistent account counters for that guest.
5. **Given** account synchronization fails, **When** the player reaches the Lobby, **Then** the Lobby shows a non-blocking guest-mode notice and still allows room creation and room joining.

---

### User Story 3 - Protect LINE account privacy in game state and diagnostics (Priority: P1)

A player can trust that LINE login secrets and sensitive account data are not exposed through game state, diagnostics, saved room records, public player state, or logs. Other players may see only ordinary public player presentation data needed for gameplay.

**Why this priority**: Account binding introduces identity data. Privacy boundaries must be defined before achievements or friend-invite features build on the account layer.

**Independent Test**: Synchronize a LINE profile, create and join rooms, inspect player-visible state and diagnostics, and confirm no login token or sensitive account payload is exposed.

**Acceptance Scenarios**:

1. **Given** a LINE profile is synchronized, **When** the game sends public room or game state to players, **Then** it includes only public presentation fields needed for gameplay.
2. **Given** a LINE profile is synchronized, **When** diagnostics or log summaries are viewed, **Then** they do not include login tokens, raw profile responses, or account secrets.
3. **Given** an account profile is stored, **When** another player joins the same room, **Then** that player cannot access hidden or sensitive account data beyond public name/avatar presentation.

---

### User Story 4 - Report persistence capability clearly (Priority: P2)

Developers and testers can tell whether account profiles are being persisted durably or only held temporarily for the current server lifetime. The system should avoid silently pretending temporary account data is durable.

**Why this priority**: Achievement work depends on durable identity storage. A clear capability signal prevents false confidence during development and testing.

**Independent Test**: Run the game in both durable-account and temporary-account modes and confirm diagnostics or account status clearly identifies whether profile data will survive restart.

**Acceptance Scenarios**:

1. **Given** durable account storage is available, **When** the account profile layer starts, **Then** the system reports that account profiles are persistent.
2. **Given** durable account storage is unavailable, **When** the account profile layer starts, **Then** the system reports that account profiles are temporary and not suitable for persistent achievements.
3. **Given** the system is in temporary account mode, **When** a LINE profile is synchronized, **Then** gameplay still works but persistent achievement readiness is not claimed.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST allow a player with an available LINE profile to synchronize a stable account profile before or during Lobby use.
- **FR-002**: The account profile MUST use the LINE user identity as the stable account key for this foundation.
- **FR-003**: The account profile MUST store only non-sensitive presentation fields required for player identification, including display name and avatar when available.
- **FR-003a**: The LINE account profile MUST remain the canonical account presentation source, while per-room display names MAY override room presentation without updating the account profile.
- **FR-003b**: This foundation MUST store avatar data when available, but MUST NOT require a new avatar display location in the ordinary gameplay UI.
- **FR-004**: Re-synchronizing the same LINE user identity MUST update the existing account profile instead of creating duplicate profiles.
- **FR-004a**: The system MUST create or update a bound account profile only from a server-verifiable LINE identity source, and MUST NOT accept ordinary manual input or arbitrary client-supplied identity claims as proof of LINE account binding.
- **FR-005**: The system MUST preserve room creation, room joining, NPC play, and normal gameplay for players without a LINE identity.
- **FR-006**: The system MUST NOT write persistent account progress for players who do not have a bound LINE identity.
- **FR-007**: The system MUST NOT store LINE login tokens, raw login credential payloads, or other sensitive authentication secrets in player-visible state.
- **FR-008**: Public room state, public game state, saved room records, diagnostics, and log summaries MUST NOT expose LINE tokens or raw private account payloads.
- **FR-009**: Other players MAY see public presentation data such as display name and avatar when that data is already used to represent the player in a room.
- **FR-010**: The system MUST provide a clear account capability status that distinguishes durable profile persistence from temporary profile storage.
- **FR-011**: Temporary profile storage MUST be explicitly marked as non-durable and unsuitable as proof that future achievement progress will persist.
- **FR-012**: Account profile synchronization failures MUST leave the player able to continue as a guest with a clear recovery path: continue guest play immediately, then retry LINE/LIFF entry or inspect diagnostics when validating the environment.
- **FR-012a**: Account profile synchronization failures MUST show a non-blocking Lobby notice that the player can continue as a guest, while detailed diagnostic reasons remain outside the ordinary Lobby flow.
- **FR-013**: Account profile synchronization MUST avoid changing game rules, turn order, scoring, card ownership, or hidden-information behavior.
- **FR-014**: The account foundation MUST provide enough stable identity data for a later achievement system to associate progress with a bound player.
- **FR-015**: The account profile MUST include minimal server-confirmed counters for later achievement work, including games played, wins, and last played time.
- **FR-016**: The system MUST update minimal counters only from server-confirmed game events, not from client-declared achievement or match results.
- **FR-017**: The system MUST NOT define achievement rules, achievement unlock state, achievement progress records, or achievement UI in this foundation spec.

### Non-Functional Requirements

- **NFR-001**: A player with an available LINE profile SHOULD be able to reach a bound Lobby-ready state without additional manual account setup.
- **NFR-002**: Guest players MUST be able to start or join a playable room without LINE binding.
- **NFR-003**: Account synchronization errors MUST be understandable to testers and must not reveal sensitive technical details to ordinary players.
- **NFR-003a**: Guest-mode fallback messaging MUST NOT block room creation, room joining, or NPC play.
- **NFR-004**: Privacy-sensitive data MUST be excluded from client-visible state, diagnostics, and logs by default.
- **NFR-005**: The account foundation MUST be maintainable for later achievement and invite attribution features without requiring changes to core match rules.
- **NFR-006**: Avatar presentation changes SHOULD be deferred until LINE integration is proven and a dedicated UI placement is specified.

### Key Entities

- **LINE Account Profile**: A stable player profile identified by LINE user identity, with display name, avatar, creation time, last update time, and minimal server-confirmed counters.
- **Minimal Account Counters**: Basic durable statistics for a bound player, limited to games played, wins, and last played time in this foundation.
- **Guest Player**: A player session without a bound LINE identity; can play normally but does not receive persistent account progress.
- **Account Persistence Status**: A visible capability state indicating whether account profile data is durable or temporary.
- **Public Player Presentation**: The non-sensitive name and avatar data other players may see during room and match interaction.
- **Per-Room Display Name**: A room-specific nickname chosen by the player for presentation in that room; it does not update the bound account profile.

## Success Criteria

- **SC-001**: 100% of successful LINE profile synchronizations create or update exactly one account profile for that LINE user identity.
- **SC-002**: 100% of guest room creation and join attempts that worked before this feature continue to work without requiring LINE binding.
- **SC-003**: 0 client-visible game state, diagnostics, saved room record, or log summary fields contain LINE login tokens or raw private login payloads.
- **SC-004**: 100% of account profile synchronization failures allow the player to continue as a guest.
- **SC-004a**: 100% of account profile synchronization failures surface a non-blocking guest-mode notice in the Lobby.
- **SC-005**: Testers can determine whether account profile data is durable or temporary from an explicit capability status.
- **SC-006**: Later achievement work can identify whether a completed game event belongs to a bound account or an unbound guest.
- **SC-007**: 100% of minimal counter updates are derived from server-confirmed game completion data for bound accounts.

## Assumptions

- LINE identity is available only when the existing LINE profile flow succeeds and the account sync verification path can produce a server-verifiable identity result; this spec does not require players to bind LINE outside that flow.
- A client-visible `lineUserId` value by itself is not proof of LINE account ownership.
- Display name and avatar are treated as public presentation data when a player uses them in a room.
- The first implementation may keep existing room-name behavior and defer any new avatar placement until a later UI-focused update.
- Guest play remains supported because this project is still playable outside the LINE client.
- Durable account storage may not be available in every development environment, so the feature must represent temporary storage honestly.
- Achievement unlock rules, achievement UI, and invite attribution are planned for later specs and only need identity readiness here.
- Minimal account counters are not achievement progress records and do not unlock achievements by themselves.

## Out of Scope

- Building the achievement catalog, progress rules, unlock notifications, or achievement UI.
- Storing full achievement progress records or achievement unlock state.
- Changing LINE friend invite content, Share Target Picker behavior, or invite tracking.
- Designing or adding a new LINE avatar display location in the gameplay UI.
- Adding non-LINE login providers.
- Requiring LINE binding before a player can create or join a room.
- Storing or processing LINE login tokens beyond what is necessary for the existing profile availability flow.
- Changing gameplay rules, scoring, card actions, turn order, or hidden-information contracts.
