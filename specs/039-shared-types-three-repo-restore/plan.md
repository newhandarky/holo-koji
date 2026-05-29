# Implementation Plan: Shared Types Three Repo Restore

## Summary

Use the existing `newhandarky/hanakoji-game-types` repository as the shared types source, publish the scoped GitHub Packages package as `@newhandarky/hanakoji-game-types@1.1.0`, then update frontend and server to consume that package as independent repositories.

## Technical Decisions

- Package scope: `@newhandarky/hanakoji-game-types`
- Version: `1.1.0`
- Registry: GitHub Packages
- Root repository becomes frontend-only and ignores local `server/` checkouts.
- Server remains an independent repository and no longer depends on the parent path.

## Validation

- Shared types: `npm test`, `npm pack --dry-run`, package publish verification.
- Server: `npm run build`, `npm test`, contract search.
- Frontend: `CI=1 npm test -- --watchAll=false`, `npm run build`, contract search.
