# Data Model: LINE Friend Invite Polish

## FriendInvite

Player-facing invitation generated from an online waiting room.

**Fields**:

- `roomId`: normalized room identity shown to host and recipient.
- `webInviteUrl`: browser-safe URL using `?roomId=<ROOM_ID>`.
- `liffInviteUrl`: LIFF URL using `https://liff.line.me/<LIFF_ID>?roomId=<ROOM_ID>` when `liffId` is configured; otherwise same as `webInviteUrl`.
- `messageText`: player-readable invitation text containing game context, room identity, and join action.
- `flexMessage`: optional LINE Flex payload used only for Share Target Picker.

**Validation rules**:

- `roomId` must be present before generating invite content.
- Shared content must include room identity and join action.
- Shared content must not include LINE tokens, raw profile payloads, recipient identities, account verification evidence, or hidden game state.

## InviteCapabilityStatus

Safe summary of whether LINE friend invite behavior can be attempted.

**Fields**:

- `environment`: `line-client` | `liff-supported-origin` | `browser` | `unsupported-origin`.
- `hasLiffSdk`: boolean.
- `hasLiffId`: boolean.
- `shareTargetPickerAvailable`: boolean | `unknown`.
- `fallbackAvailable`: boolean.
- `reason`: `ready` | `missing-liff` | `missing-liff-id` | `unsupported-origin` | `not-line-client` | `picker-unavailable` | `init-failed`.

**Validation rules**:

- Status must be safe for diagnostics and logs.
- Status must not contain raw LIFF objects, access tokens, profile payloads, or recipient data.

## InviteOutcome

Result returned to the waiting room after the host attempts to invite.

**Modes**:

- `share`: Share Target Picker completed with a truthy result.
- `copy`: Invite link was copied to clipboard as fallback.
- `cancelled`: Share Target Picker returned no result or the user cancelled selection; room state remains unchanged.
- `unavailable`: LINE-specific share cannot be attempted and fallback is available.
- `failed`: Invite attempt failed unexpectedly; fallback guidance remains available when possible.

**Fields**:

- `mode`: one of the modes above.
- `url`: safe invite URL when copy/fallback/retry is possible.
- `message`: short player-facing feedback.
- `safeReason`: optional sanitized reason for diagnostics.

**Validation rules**:

- Expected unavailable capability should prefer `copy` or `unavailable` over throwing.
- `cancelled` must not be treated as destructive failure.
- UI feedback must be non-blocking and preserve waiting room state.

## InvitedFriendJoinState

Recipient-side Lobby state created from `?roomId=` or LIFF `liff.state`.

**Fields**:

- `roomId`: normalized invited room identity.
- `source`: `query` | `liff`.
- `status`: `ready-to-confirm` | `joining` | `joined` | `recovery-needed`.
- `displayNameRequired`: boolean.

**State transitions**:

- `ready-to-confirm`: set when invite room id is found; Lobby preselects or prominently shows room id.
- `joining`: set only after the player confirms display name and join action.
- `joined`: set after server confirms `PLAYER_JOINED`.
- `recovery-needed`: set when server rejects the join due to missing/full/already-started room or another actionable invite failure.

**Validation rules**:

- Page load must never send `JOIN_ROOM` automatically.
- `roomId` remains visible while invite state is active.
- Guest and browser-only players remain able to use the normal join path.

## InviteRecoveryState

Recipient-side state shown when an invited room cannot be joined.

**Fields**:

- `roomId`: original invited room identity.
- `reason`: `missing` | `full` | `started` | `invalid` | `unknown`.
- `message`: player-facing explanation.
- `canCopyRoomId`: boolean.
- `canReturnToLobby`: boolean.

**Validation rules**:

- Recovery UI must preserve the original invited room identity.
- Recovery UI must provide both a path to copy/request a new invite and a path back to normal room creation or joining.
- Recovery messages must avoid exposing server internals or hidden game state.

## Relationships

- `FriendInvite` creates an `Invite Link`.
- `Invite Link` creates `InvitedFriendJoinState` in Lobby.
- A failed join from `InvitedFriendJoinState` creates `InviteRecoveryState`.
- `InviteCapabilityStatus` influences whether `FriendInvite` is sent through Share Target Picker or fallback copy link.
- `InviteOutcome` reports host-facing result after a share attempt.
