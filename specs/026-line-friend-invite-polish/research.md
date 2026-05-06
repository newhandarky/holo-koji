# Research: LINE Friend Invite Polish

## Decision: Use LIFF Share Target Picker only when supported

**Rationale**: The current project already has LIFF initialization, LINE client detection, and `shareTargetPicker` usage in `src/utils/lineLiff.ts`. Keeping Share Target Picker as the primary LINE-specific mechanism preserves the intended friend selection experience while avoiding broken actions in normal browsers or unsupported origins. Unsupported cases should resolve to a copyable link result, not a dead button.

**Alternatives considered**:

- Force all users through a LINE deep link first. Rejected because browser-only guest play must remain fully usable and this would add extra environment failure modes.
- Remove Share Target Picker and use only copyable links. Rejected because the spec asks to polish LINE friend invite behavior, not remove the LINE-specific path.

## Decision: Treat invite links as routing hints, not join authority

**Rationale**: The server remains authoritative for room membership and validation. An invite link should prefill or highlight the intended room id in Lobby, but it must not automatically send `JOIN_ROOM` on page load. This preserves user control over display name/account context and avoids accidental joins from link previews, reloads, or shared-device browsing.

**Alternatives considered**:

- Auto-join when room id is present. Rejected because it can submit blank/stale display names and makes failures harder to recover from clearly.
- Only prefill the room id with no visible invite state. Rejected because first-time recipients need a clear join path and recovery context.

## Decision: Keep invite recovery as frontend state based on join outcome

**Rationale**: Room missing, full, and already-started states are already server-authoritative join outcomes. The frontend should preserve the original invited room id, show a clear reason, and offer safe actions: copy room id/request a new invite, or return to normal room creation/joining. This avoids server-side invite records and keeps the feature narrowly scoped.

**Alternatives considered**:

- Add server-side invite records with lifecycle statuses. Rejected because attribution, tracking, and invite persistence are explicitly out of scope.
- Immediately redirect to room creation after failure. Rejected because it loses the original invite context and can imply the new room is connected to the original invitation.

## Decision: Use safe capability diagnostics only

**Rationale**: Diagnostics are useful for LIFF setup and Share Target Picker readiness, but they must not expose LINE tokens, raw profile payloads, recipient identity, account verification evidence, or hidden game state. Safe fields include capability availability, LIFF environment readiness, fallback mode, and sanitized failure category.

**Alternatives considered**:

- Log raw LIFF/profile payloads to speed debugging. Rejected due to privacy and account-boundary requirements from this and prior LINE account specs.
- Hide all diagnostics. Rejected because runtime environment differences are common with LIFF and need safe troubleshooting.

## Decision: Do not change backend contracts unless join errors are too ambiguous

**Rationale**: The current feature can be implemented primarily in frontend utility and UI layers. If existing `ERROR` messages from `JOIN_ROOM` are sufficient to distinguish missing/full/started rooms, no backend change is needed. If they are ambiguous, the smallest acceptable backend change is an explicit non-sensitive error code for existing join failures, documented before implementation.

**Alternatives considered**:

- Always add new Socket.IO invite events. Rejected because there is no server-side invite entity in scope.
- Parse localized error strings permanently. Rejected as brittle; acceptable only as a temporary bridge if existing server responses cannot be changed within scope.
