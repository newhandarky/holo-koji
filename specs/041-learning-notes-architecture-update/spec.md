# Feature Specification: Learning Notes Architecture Update

**Feature Branch**: `041-learning-notes-architecture-update`

Update local learning notes so they match the current architecture after the shared types three-repo restore and backend TypeScript migration.

## Requirements

- Learning notes must describe the current three-repo architecture:
  - frontend root repo: `holo-koji`
  - backend repo: `holo-koji-server`, optionally checked out under ignored `server/`
  - shared types repo: `newhandarky/hanakoji-game-types`
  - shared package: `@newhandarky/hanakoji-game-types`
- Learning notes must describe backend runtime as TypeScript compiled to `dist/`, using Express plus `ws` / WebSocket message flow.
- `GameWebSocket` must be explained as the frontend application wrapper around browser native `WebSocket`, not a third-party WebSocket package instance.
- Notes must explain that shared type changes happen in the shared repo, publish a GitHub Packages version, then update frontend/server dependencies.
- Historical Socket.IO references are allowed only in legacy cleanup or explicit history sections.
- No runtime code, package dependencies, UI behavior, game rules, or WebSocket wire shape changes are allowed.

## Success Criteria

- The core learning path no longer tells the reader to edit root `game-shared-types/` or `server/index.js` as current architecture.
- The overview, WebSocket flow, backend architecture, shared types, maintenance workflow, glossary, assessment, AI collaboration, and architecture decision notes align with 039/040.
- Search results for stale terms are either removed or clearly historical.
