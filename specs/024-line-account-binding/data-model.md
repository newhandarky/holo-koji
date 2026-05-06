# Data Model: LINE Account Binding Foundation

## LineAccountProfile

Represents one bound LINE account profile.

### Fields

- `lineUserId`: Stable verified LINE user identity. Primary identity key.
- `displayName`: Canonical account display name from the verified LINE profile.
- `avatarUrl`: Optional canonical avatar URL from the verified LINE profile.
- `createdAt`: ISO timestamp when the account profile was first created.
- `updatedAt`: ISO timestamp when the account profile was last updated.
- `counters`: Minimal account counters for later achievement work.

### Validation Rules

- `lineUserId` is required and can only come from a server-verifiable LINE identity result.
- `displayName` is required when provided by the verified profile source; empty or whitespace-only values are invalid.
- `avatarUrl` is optional and must not force any new UI placement in this spec.
- Re-syncing the same `lineUserId` updates the same profile, preserving `createdAt`.
- Account profile data must not include LINE login tokens, raw login credential payloads, or raw profile responses.

### State Transitions

- Missing -> Bound: server-verified LINE identity sync creates the profile.
- Bound -> Updated: server-verified LINE identity sync refreshes canonical display fields and `updatedAt`.
- Bound -> Counter Updated: server-confirmed match completion updates minimal counters.
- Any -> Guest Fallback: failed or unavailable sync does not create or update a bound account.

## VerifiedLineIdentity

Represents the server-verifiable LINE identity result used to authorize account binding.

### Fields

- `provider`: Fixed value `line`.
- `lineUserId`: Stable LINE user identity proven by the verification flow.
- `verifiedAt`: ISO timestamp when the verification result was produced.
- `source`: Non-secret implementation label for the LINE verification path.

### Validation Rules

- `lineUserId` must not come from ordinary room payloads, local storage, or frontend profile fields alone.
- Verification credentials, Channel ID values, raw tokens, and raw verification evidence must be environment-provided and must not be stored in account profiles, public state, diagnostics, or logs.
- A missing, expired, malformed, or unverifiable identity result must produce a guest/unverified sync result and must not create or update `LineAccountProfile`.

## MinimalAccountCounters

Represents the smallest durable account activity data needed by the next achievement spec.

### Fields

- `gamesPlayed`: Number of server-confirmed completed games attributed to the bound account.
- `wins`: Number of server-confirmed wins attributed to the bound account.
- `lastPlayedAt`: Optional ISO timestamp of the latest server-confirmed completed game for the bound account.

### Validation Rules

- Counters can only be updated from server-confirmed game completion data.
- Guest players do not receive persistent counter updates.
- Counters are not achievement progress records and do not unlock achievements by themselves.
- `gamesPlayed` and `wins` cannot be negative.
- `wins` cannot exceed `gamesPlayed`.

## GuestPlayer

Represents a player session without a bound LINE identity.

### Fields

- `playerId`: Session or room player identifier used by existing gameplay flow.
- `displayName`: Room display name used for public presentation.
- `accountBindingStatus`: `guest`, `sync-failed`, or equivalent non-bound status.

### Validation Rules

- Guest players can create rooms, join rooms, play NPC games, and complete matches.
- Guest players do not create bound account profiles.
- Guest players do not receive persistent minimal counter updates.

## PerRoomDisplayName

Represents a room-specific nickname chosen by a player.

### Fields

- `playerId`: Room player identifier.
- `displayName`: Name shown in the current room.
- `source`: Indicates whether the name came from LINE profile prefill or manual entry.

### Validation Rules

- Per-room display name may override room presentation for a bound player.
- Per-room display name must not update `LineAccountProfile.displayName`.
- Existing room display behavior should remain available for guest and bound players.

## AccountPersistenceStatus

Represents whether account data is durable or temporary.

### Fields

- `mode`: `durable` or `temporary`.
- `available`: Boolean indicating whether account profile read/write capability is currently available.
- `message`: Non-sensitive human-readable status for diagnostics or tester review.

### Validation Rules

- Durable mode means account profiles and counters are expected to survive server restart.
- Temporary mode must be clearly marked as non-durable and unsuitable as proof of achievement readiness.
- Status must not include connection secrets, tokens, raw profile data, or private account payloads.

## AccountSyncResult

Represents the result of a LINE account synchronization attempt.

### Fields

- `status`: `bound`, `guest`, `sync-failed`, or `unverified`.
- `profile`: Public-safe account profile summary when bound.
- `persistenceStatus`: Current account persistence capability.
- `guestNotice`: Optional non-blocking message for Lobby when continuing as guest.

### Validation Rules

- `bound` requires a server-verifiable LINE identity result.
- `unverified` must not create or update an account profile.
- `sync-failed` must allow guest continuation.
- Result payload must not include LINE tokens, raw login credential payloads, or raw profile responses.

## Final Implementation Field Notes

- `VerifiedLineIdentity.source` currently uses a non-secret implementation label such as `line-login-verification`; real LINE Channel ID and verification credentials are environment configuration, not model fields.
- `AccountPersistenceStatus.mode` is implemented as `durable` when Redis-backed account persistence is available and `temporary` for local in-memory fallback.
- If Redis-backed persistence is configured but read/write operations fail, `AccountPersistenceStatus` reports `mode: temporary` and `available: false` so diagnostics do not falsely claim durable account persistence.
- `AccountSyncResult.status` is implemented with `bound`, `guest`, `sync-failed`, and `unverified`. All non-bound statuses are safe for guest continuation.
- Public bound account projection includes only `lineUserId`, `displayName`, optional `avatarUrl`, timestamps, and `counters`. Raw LINE profile data, tokens, verification evidence, and storage credentials are never part of the public projection.
