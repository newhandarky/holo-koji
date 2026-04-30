# Implementation Plan: Version Update Preparation

**Branch**: `001-version-update`  
**Date**: 2026-04-30  
**Spec**: [spec.md](./spec.md)

## Summary

Prepare the project for its first speckit-managed version update. The work is release-process oriented: decide versioning strategy, align package metadata, update changelog/readme release notes, and record validation results. This plan intentionally avoids gameplay changes and broad refactors.

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: Local `game-shared-types` package  
**Package Manager**: npm  
**Current Versions**:

- Root app: `0.1.0`
- Server: `1.0.0`
- Shared types: `1.0.0`

**Validation**:

- `CI=1 npm test -- --watchAll=false`
- `npm run build`

## Constitution Check

- Game rule correctness: Pass, release work does not change gameplay rules.
- Shared state integrity: Pass, no state logic changes planned.
- Explicit realtime contracts: Pass, no Socket.IO event changes planned.
- Mobile-first playability: Pass, no UI behavior changes planned.
- Verifiable delivery: Pass, validation commands are defined.

## Project Structure

```text
package.json
server/package.json
game-shared-types/package.json
CHANGELOG.md
README.md
specs/001-version-update/
```

## Phase 0 - Research

### Versioning Strategy

Recommended default: synchronize root, server, and shared package versions to the selected product version for this release. The current mismatch (`0.1.0` vs `1.0.0`) makes release status ambiguous.

Candidate target: `0.2.0`, because the project appears pre-1.0 and this update packages existing feature progress rather than declaring stable API/gameplay maturity.

### Existing Worktree Scope

Current uncommitted files must be classified before final release edits:

- `.agents/` and `.specify/`: speckit workflow setup for this release process.
- `WORKFLOW.md`: existing agent workflow file, likely related to automation/Linear handoff.
- `src/pages/Lobby/index.tsx`: functional/UI change that should be reviewed before inclusion.

## Phase 1 - Design

### Release Metadata

If synchronized versioning is accepted, update:

- `package.json`
- `server/package.json`
- `game-shared-types/package.json`

### Release Notes

Update `CHANGELOG.md` from `[Unreleased]` into a dated version entry after deciding the target version. Keep the release summary focused on user-visible gameplay/UI/AI/connection changes and release-process changes.

### README Alignment

Check README environment requirements against `package.json` engines. The root package currently requires Node `>=20 <24`, while README says Node.js `16+`.

## Phase 2 - Task Planning

Tasks are ordered so metadata decisions happen before package edits, and validation happens after documentation/package updates.

## Risks

- Existing uncommitted `src/pages/Lobby/index.tsx` may represent unrelated behavior changes and should not be silently folded into the release.
- Updating lockfiles may be necessary if package versions are changed with npm tooling; manual edits should be reviewed carefully.
- Server and shared package versions may intentionally be independent; if so, the release docs must explain that instead of forcing synchronization.
