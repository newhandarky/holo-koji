# Research: LINE Account Binding Foundation

## Decision: Verified LINE identity is required for bound account creation

**Rationale**: The spec explicitly rejects arbitrary client identity claims. Existing room creation and join payloads already carry public player metadata, and LIFF profile data can help with presentation, but those values are not proof of LINE account ownership by themselves. Bound account creation must be limited to a server-verifiable LINE identity result so later achievements cannot be attributed to spoofed accounts.

**Alternatives considered**:

- Trust frontend-submitted `lineUserId`: rejected because it creates account impersonation risk.
- Treat LIFF `getProfile()` output alone as account proof: rejected because it is presentation data unless paired with server-verifiable LINE Login/LIFF verification.
- Create unverified candidate profiles: rejected for 024 because it adds a second account lifecycle that cannot be used for achievements.

## Decision: Channel ID is implementation/deployment configuration, not spec input

**Rationale**: Planning can define that LINE/LIFF identifiers come from environment configuration without knowing the real Channel ID. The user only needs to provide the LINE Login Channel ID when implementation reaches real server-side LIFF/LINE Login verification in local, staging, or production environments.

**Alternatives considered**:

- Ask for Channel ID during planning: rejected because it would introduce sensitive deployment data into planning artifacts and is not needed for design.
- Hardcode Channel ID into code or spec: rejected because environment-specific IDs should not become source-controlled logic.

## Decision: Account profile stores minimal counters, not achievement progress

**Rationale**: 025 needs a stable foundation for server-confirmed progress attribution. Storing `gamesPlayed`, `wins`, and `lastPlayedAt` gives later work useful account activity context while avoiding achievement rules, unlock state, or progress record scope in 024.

**Alternatives considered**:

- Store only profile data: rejected because it leaves 025 without any prebuilt activity foundation.
- Store full achievement progress skeleton: rejected because it expands 024 into achievement-system design.

## Decision: Per-room display name stays separate from account canonical presentation

**Rationale**: Existing Lobby flow lets players type or reuse a room display name. A bound account should keep LINE display name/avatar as canonical profile presentation, but room-specific names should not overwrite the profile.

**Alternatives considered**:

- Always use LINE display name in rooms: rejected because it removes existing player naming flexibility.
- Let manual names update account profile: rejected because ordinary input would overwrite verified profile presentation.

## Decision: Avatar data can be stored, but new avatar UI placement is deferred

**Rationale**: The spec records avatar data as part of the account profile when available, but the user explicitly does not want to plan a specific display location until LINE integration succeeds. This keeps 024 focused on account foundation.

**Alternatives considered**:

- Add a new Lobby/GameRoom avatar placement now: rejected as premature UI scope.
- Drop avatar from the account profile: rejected because avatar is part of the existing LINE profile and useful for later presentation work.

## Decision: Redis-backed persistence with explicit temporary fallback

**Rationale**: The project already uses Redis conditionally for room snapshots. Reusing the same durable/temporary split keeps deployment aligned with existing operations while making development fallback honest. Temporary fallback must be visible and unsuitable for persistent achievements.

**Alternatives considered**:

- Require Redis in all environments: rejected because current development flow supports missing `REDIS_URL`.
- Silent in-memory fallback: rejected because it can mislead testers into thinking account data is durable.

## Decision: Account sync failure is a Lobby notice plus diagnostics detail

**Rationale**: Guest play must remain available, but players should understand that account persistence is unavailable. A non-blocking Lobby notice avoids confusing silent fallback; diagnostics can retain detailed causes for testers.

**Alternatives considered**:

- Silent guest fallback: rejected because it hides account readiness failures.
- Blocking error with retry-only flow: rejected because LINE binding is not required for gameplay.
