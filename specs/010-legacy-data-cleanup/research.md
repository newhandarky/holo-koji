# Research: Legacy Data Cleanup

## Decision 1: Keep `default` as the only active public mode key

**Decision**: `default` remains the stable external key and resolves to Ginza v2 data. Non-Ginza keys such as `akatsuki`, `onesan`, and `collaboration` are removed from active selection and setup paths.

**Rationale**: Existing clients, routes, and tests may still expect `default`. Keeping it avoids unnecessary migration while still allowing the underlying data source to be Ginza-only.

**Alternatives considered**:

- Rename the public key to `ginza`: Rejected because it creates avoidable compatibility work and is not required by the user.
- Keep legacy keys hidden only in UI: Rejected because stale clients could still request them.

## Decision 2: Reject old room snapshots and stale legacy requests

**Decision**: Old states that reference removed legacy data are unsupported and should be rejected with a clear recreate-match path. They are not migrated.

**Rationale**: Legacy state migration increases complexity and risks mixing old card data with Ginza board-slot rules. The project is still pre-release enough that explicit rejection is safer than silent compatibility.

**Alternatives considered**:

- Auto-map old legacy states to Ginza: Rejected because legacy card ownership, item identity, and board-slot data do not map cleanly.
- Continue loading old states read-only: Rejected because it keeps obsolete data contracts alive.

## Decision 3: Keep physical asset files for now

**Decision**: Remove active code references and data mappings to old assets, but do not delete image files in this feature.

**Rationale**: The user explicitly wants assets retained until data is fully stable. Keeping files reduces accidental deletion risk and lets future specs decide permanent asset cleanup.

**Alternatives considered**:

- Delete all unused assets now: Rejected as too risky and outside current acceptance criteria.
- Keep old asset mappings for future reuse: Rejected because mappings would remain active legacy data paths.

## Decision 4: Preserve generic UI fallbacks, not legacy data fallbacks

**Decision**: UI may still show generic unknown-card/unknown-image fallbacks for robustness, but it must not fallback to old character/item mappings.

**Rationale**: Generic fallback protects rendering when data is missing. Legacy fallback would mask invalid state and violate the Ginza-only cleanup goal.

**Alternatives considered**:

- Remove all fallback rendering: Rejected because a missing image should not crash the game UI.
- Keep legacy lookup as a fallback: Rejected because it makes invalid data appear valid.

## Decision 5: Verify with tests plus static reference audit

**Decision**: Validation requires frontend tests/build, server tests, and a static search for removed legacy identifiers in active source paths.

**Rationale**: This feature is mostly negative cleanup. Static references are as important as runtime tests because leftover maps/options may remain unused until stale input appears.

**Alternatives considered**:

- Only run build: Rejected because build success does not prove old runtime branches were removed.
- Only manually inspect UI: Rejected because server rejection and shared types need automated coverage.

