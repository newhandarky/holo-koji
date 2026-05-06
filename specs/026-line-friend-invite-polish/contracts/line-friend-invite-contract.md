# Contract: LINE Friend Invite Polish

## Scope

This contract documents the frontend invite utility, waiting room feedback, recipient Lobby behavior, and optional diagnostics surface for 026. It does not define a new server-side invite entity, referral record, friend relationship, achievement, or LINE account verification flow.

## Invite Link Contract

### Browser fallback URL

```text
<WEB_APP_URL>/?roomId=<ROOM_ID>
```

**Rules**:

- `ROOM_ID` must be URL-encoded.
- `WEB_APP_URL` should use configured `config.webAppUrl` when available; otherwise use the current origin/base path fallback.
- The URL carries only room identity. It does not prove authorization and does not bypass server join validation.

### LIFF URL

```text
https://liff.line.me/<LIFF_ID>?roomId=<ROOM_ID>
```

**Rules**:

- Use only when `config.liffId` is configured.
- If `LIFF_ID` is unavailable, use the browser fallback URL.
- The receiver must normalize `liff.state` into `?roomId=<ROOM_ID>` when LINE redirects through LIFF state.

## Share Room Invite Utility Contract

### Function

```ts
shareRoomInvite(roomId: string): Promise<InviteOutcome>
```

### Expected outcome shape

```ts
type InviteOutcome =
  | { mode: 'share'; url: string }
  | { mode: 'copy'; url: string }
  | { mode: 'cancelled'; url: string }
  | { mode: 'unavailable'; url: string; reason: string }
  | { mode: 'failed'; url?: string; reason: string };
```

### Behavior

- If the app is in a supported LINE/LIFF environment and `shareTargetPicker` is available, attempt Share Target Picker with invite content that includes game context, room identity, and join action.
- If Share Target Picker succeeds with a truthy result, return `mode: 'share'`.
- If Share Target Picker returns no result or user cancellation can be detected, preserve room state and return `mode: 'cancelled'` or copy fallback according to implementation capability.
- If LINE/LIFF capability is unavailable, copy a browser-safe invite link when clipboard is available and return `mode: 'copy'`; otherwise return `mode: 'unavailable'` with safe fallback guidance.
- If clipboard is unavailable or denied, return the browser-safe invite URL so UI can show a manually selectable/copyable link.
- Unexpected failures may return `mode: 'failed'`, but must not expose raw LIFF errors to ordinary UI.

### Privacy

Invite utility logs and results must not include:

- LINE access tokens.
- Raw LINE profile payloads.
- Invite recipient identities.
- Account verification evidence.
- Hidden game state or opponent information.

## Waiting Room UI Contract

### Available before match start

The invite action is available only while an online room is waiting for another player. It must not clutter active gameplay decisions after the match starts.

### Host feedback

The waiting room must distinguish:

- Sent through LINE.
- Copied as fallback link.
- Cancelled by host.
- LINE-specific capability unavailable.
- Unexpected failure.

Feedback must be non-blocking and must not prevent:

- Copying room code.
- Waiting in the room.
- Leaving the room.
- Retrying invite.

## Recipient Lobby Contract

### Invite parsing

`getInviteRoomIdFromLocation()` reads:

- `?roomId=<ROOM_ID>` directly.
- `liff.state` containing `roomId=<ROOM_ID>`.

When a room id is found:

- Normalize to uppercase.
- Set online mode.
- Prefill or prominently show the invited room id.
- If source is `liff`, replace URL state with direct `?roomId=<ROOM_ID>` for stable reload behavior.

### Join submission

The Lobby must not send `JOIN_ROOM` on page load. `JOIN_ROOM` is sent only after the player confirms:

- Display name.
- Join action.

### Recovery

When server rejects an invited room join due to missing, full, already-started, invalid, or unknown actionable invite failure:

- Keep the original invited room id visible.
- Show a clear reason.
- Provide a way to copy the room id or ask the host for a new invite.
- Provide a way back to normal room creation or joining.

## Diagnostics Contract

Diagnostics may include safe invite readiness fields:

```ts
type SafeInviteDiagnostics = {
  supportedOrigin: boolean;
  hasSdk: boolean;
  ready: boolean;
  inLineClient: boolean | 'unknown';
  shareTargetPickerAvailable: boolean | 'unknown';
  fallbackAvailable: boolean;
};
```

Diagnostics must not include raw LIFF objects, tokens, profile payloads, recipient identities, account verification evidence, or hidden game state.

## Server Contract

No new Socket.IO event is planned.

Existing `JOIN_ROOM` remains authoritative for membership validation. Implementation must first audit whether existing `ERROR` payloads can reliably distinguish missing, full, already-started, and invalid invited-room recovery cases without brittle localized string parsing. If not, add the smallest explicit non-sensitive error code to the existing `ERROR` payload before frontend mapping.

### Join recovery error codes

```ts
type JoinRecoveryErrorCode =
  | 'INVALID_JOIN_REQUEST'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'ROOM_ALREADY_STARTED'
  | 'ROOM_RESTORE_FAILED'
  | 'ROOM_CONFIG_INVALID';
```

These codes are non-sensitive and may be used by the Lobby to choose recovery copy. They must not include invite recipient identity, LINE account data, hidden game state, or server internals.
