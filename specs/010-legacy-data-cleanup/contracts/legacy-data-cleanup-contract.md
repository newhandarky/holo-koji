# Contract: Legacy Data Cleanup

This contract defines observable behavior for removing legacy data paths. It does not introduce a new Socket.IO event or API payload.

## Default Match Contract

- Creating a new match with no explicit data mode uses `default`.
- `default` resolves to Ginza v2 data.
- Ginza v2 setup uses board-slot charm/item bindings and a random set of seven Ginza characters.
- If required Ginza v2 data is invalid or missing, setup fails explicitly.
- Setup must not fallback to old character sets or old item mappings.

## Removed Legacy Mode Contract

- Non-Ginza mode keys are not selectable in the lobby.
- Runtime match creation must not accept removed mode keys as valid active modes.
- Removed mode keys include `akatsuki`, `onesan`, and `collaboration`.
- If a stale client submits a removed mode key, the request is rejected or normalized only if the server can prove it is the current `default` compatibility path. It must not create a legacy-mode room.

## Old Snapshot Contract

- Old room or match states that depend on removed legacy data are unsupported.
- Unsupported old states are rejected with a clear recreate-match path.
- Old states are not silently migrated to Ginza.
- Rejection handling must not leak hidden game information.

## Asset Retention Contract

- Old physical image assets may remain in the repository.
- Active runtime code should not depend on old image mappings.
- Asset deletion is out of scope for this spec.

## UI Fallback Contract

- Generic UI fallback is still allowed when a displayed image or label is unavailable.
- Generic fallback must be visually safe and non-crashing.
- Generic fallback must not use old character set data, old item mappings, or legacy mode lookup tables.

## Non-Goals

- No gameplay scoring changes.
- No action availability changes.
- No Socket.IO event redesign.
- No visual redesign of gameplay surfaces.
- No permanent deletion of retained asset files.

