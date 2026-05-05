# Feature Specification: Achievement System

**Feature Branch**: `025-achievement-system`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "025-achievement-system"

## Clarifications

### Session 2026-05-05

- Q: 025 第一版 starter achievement catalog 要固定到哪個範圍？ → A: 做 4 個成就：首場完成、首勝、完成 3 場、勝利 3 場。
- Q: 第一版 player-visible achievement view 的主要入口要放在哪裡？ → A: 在 Lobby 提供成就入口與成就列表/狀態。
- Q: 第一版新成就解鎖提示要做到哪個程度？ → A: 在 Lobby 的成就入口/列表顯示「新解鎖」提示或標記。
- Q: 當 bound account 存在，但 durable account storage 暫時不可用時，第一版成就系統要怎麼處理？ → A: 成就功能顯示「暫時不可用/無法保存」，不記錄也不顯示 session-only 進度。
- Q: 025 上線後，已經存在的 bound account 計數要不要回溯解鎖 starter achievements？ → A: 不回溯；只從 025 啟用後、server-confirmed 的新完成賽局開始累積成就。

## User Scenarios & Testing

### User Story 1 - Earn Achievements From Completed Matches (Priority: P1)

A bound player can earn achievements when they complete matches and meet achievement conditions based on server-confirmed account activity. The player should never receive progress from abandoned games, client-declared results, or guest-only play.

**Why this priority**: This is the core value of the achievement system. Without trustworthy earning and unlock behavior, later profile, sharing, or invitation polish has no reliable foundation.

**Independent Test**: Use a bound account profile, complete matches that meet starter achievement conditions, and confirm achievements unlock exactly once from completed match results.

**Acceptance Scenarios**:

1. **Given** a bound player has no achievements, **When** they complete their first server-confirmed match, **Then** the system records progress toward match-completion achievements for that bound account.
2. **Given** a bound player wins a server-confirmed match, **When** the match ends, **Then** win-based achievement progress updates for that bound account.
3. **Given** an achievement condition is met, **When** progress is evaluated, **Then** the achievement unlocks once and stores the unlock time.
4. **Given** an achievement is already unlocked, **When** the player later meets the same condition again, **Then** the system keeps one unlock record and does not duplicate rewards.
5. **Given** a match result is sent by a client without server-confirmed completion, **When** achievement progress is evaluated, **Then** no achievement progress is written from that claim.
6. **Given** the same server-confirmed completion is processed more than once with the same server-owned completion identity, **When** achievement progress is evaluated, **Then** progress is incremented only once and unlock times remain unchanged.
7. **Given** a bound account already has pre-025 match counters, **When** the achievement system is enabled, **Then** those existing counters do not retroactively unlock or initialize starter achievement progress.

---

### User Story 2 - Preserve Guest Play Without Persistent Achievements (Priority: P1)

A guest player can keep playing normally without being forced into account binding. Guest matches may show ordinary game results, but they must not create durable achievement progress or unlocks.

**Why this priority**: Existing gameplay must remain playable outside LINE and during account sync failures. Achievement work must not turn account binding into a hard requirement.

**Independent Test**: Complete guest matches and confirm no persistent achievement progress, unlock record, or achievement-ready status is written.

**Acceptance Scenarios**:

1. **Given** a player has no bound account identity, **When** they complete a match, **Then** no persistent achievement progress is stored for that guest.
2. **Given** account synchronization failed and the player continued as guest, **When** they win a match, **Then** the win does not unlock persistent achievements.
3. **Given** a guest player opens achievement surfaces, **When** no bound account is available, **Then** the system shows a clear guest-state message instead of implying durable progress.
4. **Given** a bound account exists but durable account storage is temporarily unavailable, **When** the player opens achievement surfaces or completes a match, **Then** the system shows achievements as temporarily unavailable and does not record or display session-only progress.

---

### User Story 3 - View Achievement Progress And Unlocks In Lobby (Priority: P1)

A bound player can open achievements from the Lobby and view their unlocked achievements and current progress in a clear, compact surface. The player should understand which achievements are completed, which are in progress, and which require more completed games or wins.

**Why this priority**: Achievements are only useful if players can see and understand them. A minimal, readable view is needed before more achievement categories are added.

**Independent Test**: Seed a bound account with a mix of locked, in-progress, and unlocked achievements, open the Lobby achievement entry, then confirm the achievement view shows correct names, progress, and unlock status without private account data.

**Acceptance Scenarios**:

1. **Given** a bound player is in the Lobby, **When** they use the achievement entry, **Then** the achievement view opens without requiring them to enter a room.
2. **Given** a bound player has unlocked achievements, **When** they open the Lobby achievement view, **Then** unlocked achievements are clearly marked as completed.
3. **Given** a bound player has partial progress, **When** they open the Lobby achievement view, **Then** progress is shown as a measurable current value toward the requirement.
4. **Given** a bound player has no progress, **When** they open the Lobby achievement view, **Then** available starter achievements are still visible with zero progress where appropriate.
5. **Given** achievement data is shown in diagnostics or logs, **When** those summaries are viewed, **Then** they do not expose LINE tokens, raw account payloads, or hidden game state.

---

### User Story 4 - Surface New Unlocks In Lobby (Priority: P2)

A player can notice newly unlocked achievements from the Lobby achievement entry or achievement list after returning from a completed match, without interrupting the core game flow or requiring a new gameplay decision.

**Why this priority**: Unlock feedback improves player motivation, but it is secondary to trustworthy progress and a readable achievement view.

**Independent Test**: Complete a match that unlocks a new achievement, return to the Lobby, and confirm the Lobby achievement entry or achievement list surfaces the newly unlocked achievement once.

**Acceptance Scenarios**:

1. **Given** a bound player unlocks one or more achievements at match end, **When** they return to the Lobby, **Then** the Lobby achievement entry or achievement list surfaces the newly unlocked achievements as non-blocking feedback.
2. **Given** no new achievements unlock at match end, **When** the player returns to the Lobby, **Then** no new-unlock marker is shown.
3. **Given** a player opens the achievement view after seeing the new-unlock marker, **When** they inspect unlocked achievements, **Then** the previously surfaced unlocks remain recorded and the marker can be cleared.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST define a starter achievement catalog for bound players with exactly four achievements: first completed match, first win, complete 3 matches, and win 3 matches.
- **FR-002**: The system MUST record achievement progress only for players with a bound account identity.
- **FR-003**: The system MUST NOT write persistent achievement progress or unlocks for guest players.
- **FR-004**: The system MUST update achievement progress only from server-confirmed match completion data.
- **FR-005**: The system MUST NOT accept client-declared match results, achievement progress, or unlock claims as proof for achievements.
- **FR-006**: The system MUST store achievement progress separately from the minimal account counters created by the account binding foundation.
- **FR-007**: The system MUST keep minimal account counters and achievement progress consistent after each completed bound-account match.
- **FR-008**: The system MUST unlock an achievement when its defined condition is met.
- **FR-009**: The system MUST store each unlocked achievement at most once per bound account.
- **FR-010**: The system MUST preserve the first unlock time for each unlocked achievement.
- **FR-011**: The system MUST provide a player-visible achievement entry and achievement view in the Lobby for bound players.
- **FR-012**: The achievement view MUST show locked, in-progress, and unlocked states for starter achievements.
- **FR-013**: The achievement view MUST show progress in a measurable form for progress-based achievements.
- **FR-014**: The system MUST show a clear guest-state message when achievement progress is unavailable because the player is not bound.
- **FR-015**: Newly unlocked achievements SHOULD be surfaced through the Lobby achievement entry or achievement list after match completion without blocking normal result, rematch, or navigation flow.
- **FR-016**: Achievement data shown to players, diagnostics, or logs MUST NOT expose LINE tokens, raw account payloads, or hidden game state.
- **FR-017**: The system MUST NOT change Hanamikoji rules, scoring, turn order, card ownership, action availability, or hidden-information visibility.
- **FR-018**: The system MUST keep achievement catalog definitions bounded to the foundation release and allow future catalog expansion without rewriting existing player progress.
- **FR-019**: When durable bound-account storage is unavailable, the system MUST show achievements as temporarily unavailable and MUST NOT record, display, or later sync session-only achievement progress.
- **FR-020**: The system MUST NOT retroactively unlock or initialize starter achievement progress from pre-025 account counters or historical matches.
- **FR-021**: Each server-confirmed completed match processed for achievements MUST have a stable server-owned completion identity so repeated processing of the same completion does not increment achievement progress more than once.

### Non-Functional Requirements

- **NFR-001**: Achievement progress updates MUST be deterministic for the same server-confirmed match outcome and account state.
- **NFR-002**: Achievement evaluation MUST be idempotent by tracking processed server-owned completion identities so repeated processing of the same completed match does not duplicate progress or unlocks.
- **NFR-003**: Guest play MUST remain fully playable without achievement persistence.
- **NFR-004**: Achievement surfaces MUST remain compact and mobile-friendly.
- **NFR-005**: Achievement status and diagnostics MUST distinguish durable account persistence from unavailable or temporary account storage, and unavailable storage MUST NOT be presented as achievement-ready.
- **NFR-006**: Achievement copy MUST be understandable to ordinary players and avoid exposing technical account-sync details.
- **NFR-007**: The starter catalog MUST be maintainable for later achievement categories without coupling achievements to hidden game state.

### Key Entities

- **Achievement Catalog Item**: A defined achievement with an identifier, player-facing title, description, condition, progress target, and visibility state.
- **Achievement Progress**: A per-bound-account record that tracks current progress toward one catalog item.
- **Achievement Unlock**: A per-bound-account record indicating that one achievement was completed and when it first unlocked.
- **Bound Account Achievement Summary**: The player-visible combination of catalog item, progress, and unlock state for one bound account.
- **Guest Achievement State**: A non-persistent state explaining that achievements require a bound account and durable persistence.
- **Unavailable Achievement State**: A non-persistent state explaining that a bound player's achievements cannot be loaded or updated because durable storage is temporarily unavailable.
- **Achievement Unlock Notification**: A non-blocking Lobby entry or list marker for achievements that unlocked from the latest completed match.

## Success Criteria

- **SC-001**: 100% of achievement unlocks are derived from server-confirmed completed match data for bound accounts.
- **SC-002**: 0 guest matches create persistent achievement progress or unlock records.
- **SC-003**: 100% of repeated processing attempts for the same completed match leave each affected achievement unlocked no more than once.
- **SC-004**: A bound player can identify unlocked, in-progress, and locked starter achievements from the achievement view without external instructions.
- **SC-005**: A guest player can understand within one achievement view that persistent achievements require a bound account.
- **SC-006**: 0 player-visible achievement surfaces, diagnostics, or logs expose LINE tokens, raw account payloads, or hidden game state.
- **SC-007**: Lobby unlock feedback, when present, does not prevent the player from seeing the result or continuing to rematch/navigation actions.
- **SC-008**: 0 matches completed while durable account storage is unavailable create session-only achievement progress or later backfilled achievement progress.
- **SC-009**: 0 pre-025 account counters or historical matches create starter achievement unlocks during 025 enablement.

## Assumptions

- 024 account binding foundation provides the bound account identity and minimal server-confirmed counters needed for the first achievement release.
- The first achievement catalog is limited to four safe, server-confirmed completion and win milestones: first completed match, first win, complete 3 matches, and win 3 matches.
- Achievement progress starts from server-confirmed completed matches processed after the 025 achievement system is enabled.
- Server-confirmed completed matches can provide a stable server-owned completion identity for achievement idempotency.
- Achievement progress requires durable bound account storage; temporary or unavailable persistence must not be presented as reliable achievement readiness.
- Guest players may see an explanatory achievement state but do not receive persistent achievement records.
- Detailed LINE Login verification, Channel ID configuration, and account binding trust work remain owned by the account foundation/integration path rather than this spec.

## Out of Scope

- Adding new LINE Login verification behavior or Channel ID handling.
- Adding invite attribution, friend referral achievements, or share tracking.
- Adding achievements based on hidden hand contents, opponent secret choices, or client-only actions.
- Changing gameplay rules, scoring, card actions, turn order, or match completion rules.
- Adding a broad achievement catalog beyond the starter foundation set.
- Adding public leaderboards, rankings, seasons, rewards, currencies, or paid progression.
- Migrating existing historical matches into achievement progress.
