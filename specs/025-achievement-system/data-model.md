# Data Model: Achievement System

## AchievementCatalogItem

Represents one code-defined starter achievement.

### Fields

- `achievementId`: Stable identifier for the achievement.
- `title`: Player-facing Traditional Chinese achievement name.
- `description`: Player-facing Traditional Chinese explanation.
- `conditionType`: `completed_games` or `wins`.
- `target`: Positive integer target value.
- `visibility`: First version uses visible starter achievements only.

### Validation Rules

- The 025 starter catalog contains exactly four items: first completed match, first win, complete 3 matches, and win 3 matches.
- IDs must be stable and must not change after player progress exists.
- Catalog definitions must not depend on hidden hand contents, opponent secret choices, or client-only actions.
- Catalog copy must avoid technical account-sync details.

## AchievementProgress

Represents current progress for one achievement on one durable bound account.

### Fields

- `lineUserId`: Bound account key from the 024 account foundation.
- `achievementId`: References one `AchievementCatalogItem`.
- `currentValue`: Current server-confirmed progress value.
- `target`: Snapshot of the catalog target used for display/evaluation.
- `updatedAt`: ISO timestamp when progress last changed.

### Validation Rules

- Progress exists only for durable bound accounts.
- Progress can only be updated from server-confirmed match completion data processed after 025 is enabled.
- Guest players and unavailable/temporary persistence states must not create progress.
- `currentValue` cannot be negative and should not exceed `target` for player-facing summary output.
- Client payloads must never directly set `currentValue`.

### State Transitions

- Missing -> In Progress: post-025 completed match creates progress below target.
- Missing -> Unlocked: post-025 completed match satisfies a target immediately.
- In Progress -> In Progress: later completed match increments progress without reaching target.
- In Progress -> Unlocked: completed match reaches target and creates an unlock record.
- Any -> Unavailable: durable storage unavailable prevents reads/writes and returns unavailable summary instead of session-only progress.

## AchievementUnlock

Represents one unlocked achievement for one durable bound account.

### Fields

- `lineUserId`: Bound account key from the 024 account foundation.
- `achievementId`: References one `AchievementCatalogItem`.
- `unlockedAt`: ISO timestamp of the first unlock.
- `seenAt`: Optional ISO timestamp when the player cleared the new-unlock marker.

### Validation Rules

- Each `(lineUserId, achievementId)` pair can unlock at most once.
- `unlockedAt` must preserve the first unlock time.
- `seenAt` can only be set after an unlock exists.
- Repeated processing must not duplicate the unlock or replace `unlockedAt`.
- Unlock records must not contain LINE tokens, raw account payloads, raw profile data, or hidden game state.

### State Transitions

- Locked -> Unlocked Unseen: achievement condition is first met from server-confirmed match completion.
- Unlocked Unseen -> Unlocked Seen: player opens the achievement view or acknowledges the marker in Lobby.
- Unlocked Seen -> Unlocked Seen: repeated acknowledgement is idempotent.

## BoundAccountAchievementSummary

Represents the public-safe achievement view for a bound player.

### Fields

- `status`: `available`.
- `persistenceStatus`: Current account persistence status.
- `items`: List of starter achievement summaries.
- `newUnlockCount`: Number of unlocked achievements without `seenAt`.
- `generatedAt`: ISO timestamp when the summary was created.

### Item Fields

- `achievementId`
- `title`
- `description`
- `state`: `locked`, `in_progress`, or `unlocked`.
- `currentValue`
- `target`
- `unlockedAt`
- `isNew`

### Validation Rules

- Summary must include all four starter achievements for bound durable accounts.
- Summary must not expose private LINE identity payloads beyond the public-safe bound account context already established by 024.
- Summary must not expose hidden game state.
- Locked and in-progress starter achievements remain visible.

## GuestAchievementState

Represents achievement state when no bound account is available.

### Fields

- `status`: `guest`.
- `message`: Player-facing explanation that persistent achievements require a bound account.
- `persistenceStatus`: Current account persistence status when known.

### Validation Rules

- Guest state is non-persistent.
- Guest state does not include progress, unlocks, or session-only counters.
- Guest play remains fully available.

## UnavailableAchievementState

Represents achievement state when a bound account exists but durable storage is unavailable.

### Fields

- `status`: `unavailable`.
- `message`: Player-facing explanation that achievements are temporarily unavailable and cannot be saved.
- `persistenceStatus`: Account persistence status showing temporary/unavailable state.

### Validation Rules

- Unavailable state must not show session-only progress.
- Unavailable state must not record or later sync progress from matches completed during the outage.
- Diagnostics may show durable/temporary availability but must not include storage credentials or account secrets.

## AchievementCompletionEvent

Represents the server-owned input to achievement evaluation.

### Fields

- `completionId`: Stable server-owned identifier for one completed match.
- `completedAt`: ISO timestamp of server-confirmed match completion.
- `winner`: Server-determined winning player id.
- `players`: Public-safe server-side player/account references needed to attribute bound accounts.

### Validation Rules

- This event is produced by the server match completion flow only.
- `completionId` is required before progress can be written and repeated processing of the same `completionId` must be ignored for progress increments.
- Client-declared match results, achievement claims, or room payload account IDs are not valid completion events.
- Evaluation must ignore players without durable bound account profiles.
- Pre-025 counters and historical match records are not converted into completion events.

## ProcessedAchievementCompletion

Represents a durable guard that prevents the same completed match from incrementing achievement progress more than once.

### Fields

- `completionId`: Stable server-owned completed match identifier.
- `processedAt`: ISO timestamp when achievement evaluation first accepted the completion.
- `affectedLineUserIds`: Bound account keys that were evaluated for this completion.

### Validation Rules

- The store must check `completionId` before incrementing any progress.
- Reprocessing an existing `completionId` must return the existing summary effect without changing progress, unlock records, or first unlock times.
- The guard must not include hidden cards, secret choices, raw account payloads, or storage credentials.
