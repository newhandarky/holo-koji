# Contract: Achievement System

This contract defines the 025 achievement system surface. It documents starter catalog behavior, server-owned progress evaluation, achievement summary/status messages, Lobby new-unlock markers, and privacy boundaries.

## Starter Catalog Contract

The first catalog contains exactly four visible achievements.

| Achievement ID | Condition | Target |
|---|---|---|
| `first_completed_match` | Server-confirmed completed matches | 1 |
| `first_win` | Server-confirmed wins | 1 |
| `complete_3_matches` | Server-confirmed completed matches | 3 |
| `win_3_matches` | Server-confirmed wins | 3 |

### Rules

- Catalog items are code-defined and stable.
- Catalog conditions must not depend on hidden cards, opponent secret choices, client-only actions, or client-declared match results.
- The starter catalog is visible in the achievement view even when individual items are locked or in progress.
- Copy must be player-readable and must not expose technical account-sync details.

## Server-Owned Match Completion Evaluation

Achievement mutation is triggered only from the server-confirmed match completion path.

### Input Shape

```json
{
  "completionId": "room-ABCD:round-3:ended:2026-05-05T12:34:56.000Z",
  "winner": "player-1",
  "completedAt": "2026-05-05T12:34:56.000Z",
  "players": [
    {
      "playerId": "player-1",
      "accountProfile": {
        "lineUserId": "U1234567890"
      }
    },
    {
      "playerId": "player-2",
      "accountProfile": {
        "lineUserId": "U0987654321"
      }
    }
  ]
}
```

### Rules

- The server constructs this input from authoritative room/player state.
- `completionId` is a stable server-owned identifier for one completed match and is required for durable progress mutation.
- Client-sent `lineUserId`, room payload profile fields, achievement progress, unlock claims, or match result claims are not valid proof.
- Guest players and unbound players are ignored for achievement writes.
- Achievement writes require durable account persistence. Temporary or unavailable persistence returns unavailable status and creates no session-only progress.
- Pre-025 counters and historical matches are not converted into achievement completion input.
- Repeated evaluation of the same `completionId` must not increment progress again, duplicate unlocks, or replace the first `unlockedAt` timestamp.

## Achievement Summary Request

Lobby requests the current achievement state for the active connection/account.

### WebSocket Message

```json
{
  "type": "ACHIEVEMENT_STATUS",
  "payload": {}
}
```

### Rules

- The server determines the current bound account from server-side connection state.
- The request does not accept account identity, progress, unlock, or match result fields from the client.
- The response uses `ACHIEVEMENT_STATUS_RESULT`.

## Achievement Summary Result

### Available Result

```json
{
  "type": "ACHIEVEMENT_STATUS_RESULT",
  "payload": {
    "status": "available",
    "persistenceStatus": {
      "mode": "durable",
      "available": true,
      "message": "Account profiles are persistent."
    },
    "newUnlockCount": 1,
    "items": [
      {
        "achievementId": "first_completed_match",
        "title": "初次花見",
        "description": "完成第一場對局。",
        "state": "unlocked",
        "currentValue": 1,
        "target": 1,
        "unlockedAt": "2026-05-05T12:34:56.000Z",
        "isNew": true
      }
    ],
    "generatedAt": "2026-05-05T12:35:00.000Z"
  }
}
```

### Guest Result

```json
{
  "type": "ACHIEVEMENT_STATUS_RESULT",
  "payload": {
    "status": "guest",
    "message": "成就需要綁定帳號後才會保存。",
    "persistenceStatus": {
      "mode": "temporary",
      "available": true,
      "message": "Account profiles are temporary in this environment."
    }
  }
}
```

### Unavailable Result

```json
{
  "type": "ACHIEVEMENT_STATUS_RESULT",
  "payload": {
    "status": "unavailable",
    "message": "成就暫時不可用，進度目前無法保存。",
    "persistenceStatus": {
      "mode": "temporary",
      "available": false,
      "message": "Account profiles are unavailable; durable persistence is not connected."
    }
  }
}
```

### Rules

- `available` responses include all four starter achievements.
- `guest` and `unavailable` responses do not include progress or unlock records.
- `newUnlockCount` counts unlocked achievements that have not been marked seen.
- Summary payloads must not include LINE tokens, raw account payloads, storage credentials, hidden cards, opponent secret choices, or private verification evidence.

## New-Unlock Acknowledgement

Lobby may clear new-unlock markers after the player opens the achievement view or explicitly acknowledges the marker.

### WebSocket Message

```json
{
  "type": "ACHIEVEMENT_ACK_NEW_UNLOCKS",
  "payload": {
    "achievementIds": ["first_completed_match"]
  }
}
```

### Result

```json
{
  "type": "ACHIEVEMENT_STATUS_RESULT",
  "payload": {
    "status": "available",
    "persistenceStatus": {
      "mode": "durable",
      "available": true,
      "message": "Account profiles are persistent."
    },
    "newUnlockCount": 0,
    "items": [
      {
        "achievementId": "first_completed_match",
        "title": "初次花見",
        "description": "完成第一場對局。",
        "state": "unlocked",
        "currentValue": 1,
        "target": 1,
        "unlockedAt": "2026-05-05T12:34:56.000Z",
        "isNew": false
      }
    ],
    "generatedAt": "2026-05-05T12:36:00.000Z"
  }
}
```

### Rules

- The server determines the account from connection state; the client does not send `lineUserId`.
- Acknowledgement can only set `seenAt` for already unlocked achievements.
- Successful acknowledgement returns a refreshed `ACHIEVEMENT_STATUS_RESULT` using the same full summary shape as `ACHIEVEMENT_STATUS`.
- Repeated acknowledgement is idempotent.
- Invalid or unknown achievement IDs are ignored or rejected with a safe error; they must not create progress or unlocks.
- Guest/unavailable accounts receive guest/unavailable status and no progress mutation.

## Lobby UI Contract

### Rules

- Lobby provides the primary achievement entry and achievement list.
- The list shows locked, in-progress, and unlocked states with measurable progress for progress-based achievements.
- New-unlock feedback is shown through the Lobby entry or list marker after match completion.
- The marker can be cleared after the player opens or acknowledges the achievement view.
- The feature does not require post-match result UI changes.
- Achievement UI must remain compact and mobile-friendly.

## Privacy And Logging Contract

### Rules

- Achievement diagnostics may report status, persistence mode, availability, item counts, and new-unlock count.
- Diagnostics and logs must not include LINE tokens, raw LINE profile payloads, verified identity evidence, storage credentials, hidden hand cards, opponent secret choices, or client-only private state.
- Public game state remains governed by existing hidden-information rules.
