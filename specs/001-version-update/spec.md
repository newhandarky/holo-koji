# Feature Specification: Version Update Preparation

**Feature Branch**: `001-version-update`  
**Created**: 2026-04-30  
**Status**: In Progress  
**Input**: User wants to introduce shared speckit workflow and prepare a project version update.

## Release Decision

- **Target Version**: `0.2.0`
- **Versioning Strategy**: Synchronize root `package.json`, `server/package.json`, and `game-shared-types/package.json` to `0.2.0`.
- **Scope**: Include speckit/agent workflow setup, release metadata, changelog, README environment alignment, and existing Lobby change already committed before this release pass.
- **Out of Scope**: Upcoming large feature rewrites or broad gameplay refactors.

## User Scenarios & Testing

### User Story 1 - Define Release Scope (Priority: P1)

As the project maintainer, I want the next version update scope documented before package versions change, so that frontend, backend, shared types, changelog, and verification steps remain aligned.

**Why this priority**: Version bumps without a documented release scope make it hard to review what is included and whether validation is sufficient.

**Independent Test**: A maintainer can read this spec and identify the intended version, included changes, excluded changes, and required validation before editing package metadata.

**Acceptance Scenarios**:

1. **Given** the current project has multiple package versions, **When** the version update is planned, **Then** the spec identifies which packages should share the release version and which may remain independent.
2. **Given** existing uncommitted changes are present, **When** release preparation begins, **Then** the plan records whether those changes belong to the release or must be separated.

---

### User Story 2 - Prepare Release Documentation (Priority: P2)

As the project maintainer, I want README and CHANGELOG updates tied to the release scope, so that users and reviewers understand what changed.

**Why this priority**: The project already has significant gameplay, UI, AI, and connection behavior changes that need a coherent release summary.

**Independent Test**: The release documentation states the version, date, notable changes, and verification commands.

**Acceptance Scenarios**:

1. **Given** a target version is selected, **When** documentation is updated, **Then** `CHANGELOG.md` contains a dated entry for that version.
2. **Given** setup or runtime requirements changed, **When** documentation is updated, **Then** `README.md` reflects the current Node.js and npm expectations.

---

### User Story 3 - Validate Release Readiness (Priority: P3)

As the project maintainer, I want repeatable validation before finalizing the version update, so that the release does not regress build or test status.

**Why this priority**: The project has frontend, backend, and shared type boundaries, and release changes should not hide broken validation.

**Independent Test**: The documented validation commands can be run locally and their results are recorded in the closeout summary.

**Acceptance Scenarios**:

1. **Given** release metadata and docs are updated, **When** validation runs, **Then** frontend tests and production build results are recorded.
2. **Given** validation fails, **When** the release is reviewed, **Then** the failure is either fixed in scope or documented as a blocker.

## Requirements

### Functional Requirements

- **FR-001**: The release plan MUST identify the target product version before changing package metadata.
- **FR-002**: The release plan MUST decide whether root, server, and `game-shared-types` package versions are synchronized or independently versioned.
- **FR-003**: The release update MUST include a dated `CHANGELOG.md` entry for the selected version.
- **FR-004**: The release update MUST preserve existing gameplay behavior unless a separate feature spec explicitly changes it.
- **FR-005**: The release closeout MUST record validation commands and outcomes.

### Non-Functional Requirements

- **NFR-001**: Release preparation MUST avoid unrelated refactors.
- **NFR-002**: Documentation MUST use Traditional Chinese for maintainer-facing project notes unless a file already establishes a different language.
- **NFR-003**: Release validation MUST include `CI=1 npm test -- --watchAll=false` and `npm run build`, unless the plan documents why a command is not applicable.

### Key Entities

- **Product Version**: The public version label for the Hanamikoji online game release.
- **Package Version**: Version values in `package.json`, `server/package.json`, and `game-shared-types/package.json`.
- **Release Notes**: The dated changelog entry and any README updates required for the release.

## Success Criteria

- **SC-001**: The selected versioning strategy is documented before package metadata changes.
- **SC-002**: The release documentation lists notable gameplay, UI, AI, and connection-stability changes included in the release.
- **SC-003**: The final closeout identifies tests/builds run and any remaining release blockers.

## Assumptions

- The first speckit-managed release is expected to be a minor version update rather than a stable `1.0.0` release unless the maintainer decides otherwise.
- Existing Lobby changes were committed separately before this release metadata pass and are treated as part of the baseline for `0.2.0`.

## Out of Scope

- New gameplay features.
- Broad UI redesign.
- Dependency upgrades unrelated to release preparation.
- Deployment automation changes beyond documenting the current process.
