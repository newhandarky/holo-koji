# Contract: LINE Account Binding Foundation

This contract defines the account binding surface for 024. It documents account synchronization, account capability status, public player presentation boundaries, and minimal counter updates. It does not define achievement unlock records or new avatar UI placement.

## Account Sync Request

Account sync is initiated only after the LINE verification flow produces a server-verifiable identity result. Ordinary room creation or join payloads that merely contain `lineUserId`, display name, or avatar URL are not proof of account binding. If a browser client initiates sync, the server must construct or validate `verifiedIdentity` through trusted verification logic; a client-submitted `verifiedIdentity` object is not proof by itself.

### Browser Request Shape

```json
{
  "profile": {
    "displayName": "銀座玩家",
    "avatarUrl": "https://example.test/avatar.png"
  }
}
```

### Server-Trusted Identity Shape

After server-side LINE Login/LIFF verification succeeds, trusted server code may construct this internal identity result and pass it to the account store:

```json
{
  "provider": "line",
  "lineUserId": "U1234567890",
  "verifiedAt": "2026-05-05T12:34:56.000Z",
  "source": "line-login-verification"
}
```

### Rules

- `verifiedIdentity.lineUserId` is required for bound sync, but only when the identity object is constructed or trusted by server-side verification code.
- `verifiedIdentity` must come from server-verifiable LINE Login/LIFF verification logic, not from ordinary client profile fields.
- Browser-submitted `verifiedIdentity` is ignored for binding in the foundation implementation; until real server-side verification is configured, `ACCOUNT_SYNC` returns an unbound result and guest play continues.
- `verifiedIdentity.source` is a non-secret implementation label; real Channel ID, verification credentials, and environment identifiers are provided through deployment configuration and must not be hardcoded.
- `profile.displayName` is required when available from the verified source.
- `avatarUrl` is optional.
- The request/result boundary must not store, return, or log LINE login tokens, raw login credential payloads, raw verification evidence, or raw profile responses.
- If the identity source is not server-verifiable, the sync must return an unbound result and must not create a profile.

## Account Sync Result

### Bound Result

```json
{
  "status": "bound",
  "profile": {
    "lineUserId": "U1234567890",
    "displayName": "銀座玩家",
    "avatarUrl": "https://example.test/avatar.png",
    "counters": {
      "gamesPlayed": 0,
      "wins": 0,
      "lastPlayedAt": null
    }
  },
  "persistenceStatus": {
    "mode": "durable",
    "available": true,
    "message": "Account profiles are persistent."
  }
}
```

### Guest Fallback Result

```json
{
  "status": "sync-failed",
  "guestNotice": "目前以訪客模式繼續，帳號進度暫時不會保存。",
  "persistenceStatus": {
    "mode": "temporary",
    "available": true,
    "message": "Account profiles are temporary in this environment."
  }
}
```

### Visibility Rules

- Lobby may show `guestNotice` as a non-blocking message.
- Diagnostics may show `persistenceStatus` and a non-sensitive sync status.
- Public room/game state must not expose tokens, raw LINE responses, or private account payloads.
- Other players may see room display name and public avatar presentation only when those fields are already used for room presentation.

## Account Persistence Status

### Shape

```json
{
  "mode": "durable",
  "available": true,
  "message": "Account profiles are persistent."
}
```

### Rules

- `mode` is either `durable` or `temporary`.
- `temporary` must be explicitly labeled non-durable and unsuitable as achievement readiness proof.
- Status payload must not include storage credentials, connection strings, tokens, or private account payloads.

## Room Presentation Contract

Bound account canonical presentation and per-room display are separate.

### Rules

- A bound account stores canonical LINE display name and avatar URL when available.
- A player may use a per-room display name for room presentation.
- Per-room display name must not update the canonical account profile.
- 024 does not require a new avatar display location in the ordinary gameplay UI.

## Minimal Counter Update Contract

Minimal counters update only from server-confirmed completed games.

### Counter Shape

```json
{
  "gamesPlayed": 12,
  "wins": 5,
  "lastPlayedAt": "2026-05-05T12:34:56.000Z"
}
```

### Rules

- Bound accounts may receive counter updates after server-confirmed match completion.
- Guest players do not receive persistent counter updates.
- Client-declared match results or achievement claims must not update counters.
- `wins` cannot exceed `gamesPlayed`.
- Counter updates do not unlock achievements in this spec.

## Error And Fallback Behavior

- Server-verifiable LINE identity unavailable: continue as guest.
- Account persistence unavailable: continue as guest or temporary profile mode, with non-durable status visible to diagnostics.
- Account sync failure: Lobby shows a non-blocking guest-mode notice and room creation/join remains available.
- Invalid or unverifiable identity claim: no bound account profile is created.

## Implementation Notes

- WebSocket clients use `ACCOUNT_SYNC` to request synchronization and receive `ACCOUNT_SYNC_RESULT`.
- WebSocket clients may request current account capability through `ACCOUNT_STATUS`; the server responds with `ACCOUNT_SYNC_RESULT` using the same public-safe result shape.
- 024 does not accept client-submitted `verifiedIdentity` as account proof. The current WebSocket path stays unbound until a later real LINE verification path can produce a server-trusted identity result.
- The first implementation stores the bound public account profile on the server-side connection and injects that verified profile into room metadata. Ordinary room payload `lineUserId` and `avatarUrl` fields are ignored as account proof.
- Canonical LINE display data remains separate from the per-room display name submitted from Lobby. The per-room name can be edited for a room without writing back to `LineAccountProfile.displayName`.
- New LINE avatar placement is intentionally deferred. Bound profiles can carry a public avatar URL for future UI work, but 024 does not add a dedicated avatar surface.
