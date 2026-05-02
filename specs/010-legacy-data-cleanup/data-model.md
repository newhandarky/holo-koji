# Data Model: Legacy Data Cleanup

## ActiveDefaultMode

Represents the only active public game data mode after cleanup.

**Fields / Concepts**

- `publicModeKey`: Always `default` for current external entrypoints.
- `dataSource`: Ginza v2 character pool, board slots, charm values, and item/icon definitions.
- `characterSelection`: Server randomly selects seven characters for the match from the Ginza pool.
- `boardSlotBinding`: Charm value and item/icon identity remain bound to board position, not to character identity.

**Validation Rules**

- New match creation without a mode uses `default`.
- New match creation with `default` uses Ginza v2.
- New match creation with removed legacy keys is invalid.
- If Ginza setup data is incomplete, fail explicitly; do not fallback to legacy data.

## LegacyGameplayData

Represents old active gameplay data that must be removed from runtime paths.

**Examples**

- Old character sets: `akatsuki`, `onesan`, `collaboration`.
- Old legacy geisha creation helpers.
- Old `geishaSetMap` branches for non-Ginza modes.
- Old item card fallback generation such as `geisha-<id>`.
- Old frontend image/icon lookup maps tied to removed modes.

**Lifecycle**

1. Existing source references are identified.
2. Active setup, selection, and lookup paths are removed.
3. Any stale input referencing these paths is rejected.
4. Physical assets remain until a future asset cleanup spec.

## RetainedAssetFile

Represents old image files that are intentionally kept on disk.

**Rules**

- Asset files may remain in the repository.
- Active data maps should not require these files.
- No feature behavior depends on these assets after cleanup.
- Future deletion requires a separate spec or explicit user instruction.

## UnsupportedLegacyState

Represents old room snapshots, stale client requests, or stored state that references removed data.

**Detected By**

- A room/match state references a removed `geishaSet`.
- A card/item payload uses legacy-only identity.
- A setup request asks for a removed legacy mode.

**Required Behavior**

- Reject loading or continuing the old state.
- Show or return a clear unsupported-old-room/recreate-match path.
- Do not silently migrate to Ginza.
- Do not expose hidden information while handling the rejection.

## GenericUIFallback

Represents non-data-specific rendering fallback.

**Allowed**

- Generic unknown image placeholder.
- Generic unknown item/card label.
- Safe missing text fallback.

**Not Allowed**

- Looking up removed legacy character data to repair invalid state.
- Mapping removed legacy item cards to old images/icons.
- Treating legacy fallback data as playable state.

