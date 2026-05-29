# Implementation Plan: Active Docs And Workflow Cleanup

## Summary

Update only active documentation and workflow memory after 039. This spec records the current three-repo architecture and keeps historical feature artifacts intact.

## Technical Decisions

- Root repository is the frontend repository and may contain an ignored local `server/` checkout for convenience.
- Backend repository is independent and uses Node.js, Express, and `ws`.
- Shared contract source is the independent `newhandarky/hanakoji-game-types` repo, published as `@newhandarky/hanakoji-game-types`.
- Shared type changes require a published package version before frontend/server dependency upgrades.
- `docs/memories/` is ignored by root `.gitignore`; it can be updated locally for the agent workspace, but tracked workflow truth must live in `AGENTS.md`, `.specify/`, and this spec.

## Validation

- Search active docs for stale current-architecture wording.
- Confirm root and server `main` are no longer ahead of remote after pushing 039.
- Do not run frontend/server builds because this spec does not touch runtime code.
