# Research: Achievement System

## Decision: Fixed Starter Catalog

The first achievement catalog is exactly four items: first completed match, first win, complete 3 matches, and win 3 matches.

**Rationale**: These achievements are derived from server-confirmed completion and winner data already available through the 024 account counter foundation. They avoid hidden card state, opponent choices, client-only actions, or broad catalog maintenance before the core progress model is proven.

**Alternatives considered**:

- Larger starter catalog: rejected because it increases copy, UI, test, and maintenance scope before persistence semantics are validated.
- Hidden-information achievements: rejected because they risk leaking private game state and are explicitly out of scope.

## Decision: Durable Bound Accounts Only

Achievement progress and unlock records are written only for bound accounts when durable account persistence is available.

**Rationale**: 024 distinguishes durable and temporary account persistence, and 025 must not imply achievement readiness when progress cannot survive server restart. Guest and temporary/unavailable states remain playable but show non-persistent or unavailable achievement messaging.

**Alternatives considered**:

- Session-only progress: rejected because it would require additional warning, clearing, and support semantics while still not satisfying persistent achievement expectations.
- Temporary storage with later backfill: rejected because there is no reliable reconciliation source for missed durable writes in this scope.

## Decision: Separate Achievement Store From Account Counters

Achievement progress/unlocks are stored separately from 024 `MinimalAccountCounters`, while being updated from the same server-confirmed match completion flow.

**Rationale**: Minimal counters are broad account statistics and do not encode per-achievement state, first unlock time, marker state, or future catalog expansion. Keeping achievements separate avoids turning account counters into implicit achievement records.

**Alternatives considered**:

- Derive all achievements from counters on every read: rejected because it would retroactively unlock pre-025 progress and cannot preserve first unlock time.
- Store achievement state inside the account profile object: rejected because it couples the account foundation to future achievement catalog growth.

## Decision: No Pre-025 Backfill

Existing bound account counters and historical matches do not initialize or unlock starter achievements when 025 is enabled.

**Rationale**: The spec explicitly excludes historical migration. Starting from post-025 completion events makes acceptance tests deterministic and avoids changing the meaning of counters created before achievement rules existed.

**Alternatives considered**:

- Initialize from existing counters: rejected because it conflicts with the no-backfill clarification and could unlock achievements without per-achievement first unlock time.
- Scan historical matches: rejected because historical migration is out of scope and not guaranteed to have durable source data.

## Decision: Lobby-Only First UI Surface

The first player-facing achievement surface is a compact Lobby entry/list with a new-unlock marker.

**Rationale**: The Lobby already owns account sync and guest-mode status. Keeping achievement discovery and markers there avoids changing game result/rematch flow and respects mobile-first playability.

**Alternatives considered**:

- Post-match result notification: deferred because it touches game room result flow and rematch ergonomics.
- Global navigation or profile page: rejected for first version because this app currently does not have a broader account profile surface.

## Decision: WebSocket Summary/Ack Contract

Clients request an achievement summary/status over WebSocket and may acknowledge/clear new-unlock markers; clients never send achievement progress or unlock claims.

**Rationale**: The app already uses Socket.IO/WebSocket for game and account state. A summary/ack contract keeps mutation authority on the server while letting Lobby render current state and clear player-visible markers.

**Alternatives considered**:

- REST endpoint: rejected for first version because the existing real-time server already owns account state and room connection context.
- Local-only frontend derivation: rejected because clients cannot be authoritative for account progress or unlock status.
