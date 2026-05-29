# Feature Specification: Shared Types Three Repo Restore

**Feature Branch**: `039-shared-types-three-repo-restore`

Restore the original three-repository architecture by using the existing `newhandarky/hanakoji-game-types` repository as the shared contract package, publishing `@newhandarky/hanakoji-game-types@1.1.0` through GitHub Packages, and removing the root repository's local shared package plus server submodule.

## Requirements

- Frontend and backend must depend on `@newhandarky/hanakoji-game-types@1.1.0`, not local `file:` paths.
- Shared type imports must use `@newhandarky/hanakoji-game-types`.
- Root must no longer track `game-shared-types/` or the `server` submodule.
- Existing WebSocket wire shape, game rules, UI behavior, and hidden-information boundaries must remain unchanged.

## Success Criteria

- Shared package `1.1.0` is published and installable from GitHub Packages.
- Server build and tests pass using the published package.
- Frontend tests and build pass using the published package.
- Searches find no active `from 'game-shared-types'`, `file:./game-shared-types`, or `file:../game-shared-types` usage.
