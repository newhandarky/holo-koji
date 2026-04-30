# Tasks: Version Update Preparation

**Input**: Design documents from `specs/001-version-update/`  
**Prerequisites**: `spec.md`, `plan.md`

## Phase 1 - Setup

- [x] T001 Create project speckit structure under `.specify/`.
- [x] T002 Link shared Codex speckit skills under `.agents/skills/`.
- [x] T003 Create version update feature spec in `specs/001-version-update/spec.md`.
- [x] T004 Create implementation plan in `specs/001-version-update/plan.md`.

## Phase 2 - Version Decision

- [x] T005 Decide target version for this release: `0.2.0`.
- [x] T006 Decide synchronized versions for `package.json`, `server/package.json`, and `game-shared-types/package.json`.
- [x] T007 Classify current `src/pages/Lobby/index.tsx` change as previously committed release baseline.

## Phase 3 - Release Metadata

**Goal**: Package metadata reflects the chosen versioning strategy.

**Independent Test**: The selected package files contain the intended versions and no unrelated fields changed.

- [x] T008 Update root `package.json` version if included in strategy.
- [x] T009 Update `server/package.json` version if included in strategy.
- [x] T010 Update `game-shared-types/package.json` version if included in strategy.
- [x] T011 Review whether lockfiles need version-only updates.

## Phase 4 - Release Documentation

**Goal**: Release notes and setup docs match the selected version.

**Independent Test**: A maintainer can read the docs and understand version, date, notable changes, environment requirements, and validation status.

- [x] T012 Update `CHANGELOG.md` with a dated release entry.
- [x] T013 Update `README.md` Node.js requirement to match `package.json` engines if needed.
- [x] T014 Document speckit workflow entry points if they are part of this release process.

## Phase 5 - Validation

- [x] T015 Run `CI=1 npm test -- --watchAll=false`.
- [x] T016 Run `npm run build`.
- [x] T017 Record validation results and remaining risks in closeout summary.

## Validation Results

- `CI=1 npm test -- --watchAll=false`: Passed. Existing console output includes environment logs and React/Router deprecation warnings.
- `npm run build`: Passed with warning. Existing ESLint warning: `src/components/game/PendingInteractionModal.tsx` line 39, `title` is assigned but never used.
- Residual risk: the build warning should be cleaned up in a focused follow-up or included in the next larger refactor if that file is already in scope.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before metadata or documentation edits.
- Phase 3 and Phase 4 before validation.

## Notes

- Do not change gameplay logic as part of this spec unless explicitly approved.
- Do not silently include unrelated user changes in release metadata.
- Keep release preparation small and reviewable.
