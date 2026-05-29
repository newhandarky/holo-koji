# Feature Specification: Active Docs And Workflow Cleanup

**Feature Branch**: `040-active-docs-workflow-cleanup`

Clean up active documentation and workflow memory after the shared types three-repo restore. The goal is to prevent future agents and developers from treating the old local `game-shared-types`, Socket.IO wording, or `server/index.js` backend path as current architecture.

## Requirements

- Active workflow documents must describe the backend as Node.js, Express, and `ws` / WebSocket message flow.
- Active shared types guidance must point to `newhandarky/hanakoji-game-types` and the package `@newhandarky/hanakoji-game-types`.
- Shared contract changes must be documented as: update the shared repo, publish a new GitHub Packages version, then upgrade frontend and server consumers.
- Root docs must describe `server/` as an optional independent backend checkout, not a tracked submodule.
- Historical specs and old roadmap documents must not be batch-rewritten.
- `learning-notes/` remains out of scope and should be handled by a separate task if needed.

## Success Criteria

- Root and server `main` branches are pushed after 039.
- Active docs and workflow templates no longer present local `game-shared-types` or Socket.IO as current architecture.
- Searches may still find old terms only in historical specs/plans or explicit historical/removal context.
- No runtime code, package dependencies, game rules, UI behavior, or WebSocket wire shape changes are introduced.
