# Tasks: [FEATURE]

**Input**: Design documents from `specs/[###-feature]/`  
**Prerequisites**: `spec.md`, `plan.md`

## Phase 1 - Setup

- [ ] T001 Review the active spec and plan in `specs/[###-feature]/`.

## Phase 2 - Foundation

- [ ] T002 Identify affected frontend, backend, and shared-type files.

## Phase 3 - User Story 1

**Goal**: [User story goal]

**Independent Test**: [How to verify this story]

- [ ] T003 Implement [specific change] in `[path]`.

## Phase 4 - Validation

- [ ] T004 Run `CI=1 npm test -- --watchAll=false`.
- [ ] T005 Run `npm run build`.
- [ ] T006 Update docs or changelog if behavior changed.

## Dependencies

- Phase 1 before Phase 2.
- Phase 2 before implementation phases.
- Validation after implementation.

## Notes

- Keep changes scoped to the feature.
- Do not modify unrelated user changes.
