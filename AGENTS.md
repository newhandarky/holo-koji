# AGENTS.md - Hanamikoji Game Agent Rules

## Communication

- Reply in Traditional Chinese (zh-TW) unless the user explicitly requests another language.
- Analysis reports, review findings, validation summaries, plans, tables, and generated handoff notes MUST also be written in Traditional Chinese (zh-TW) unless the user explicitly requests another language.
- Keep explanations concise and focused on concrete actions, risks, and verification.
- For code review, list findings and risks before summaries or suggestions.

## Project Context

- This repository is a Hanamikoji online game.
- Frontend: React 18, Create React App, TypeScript, Bootstrap.
- Backend: Node.js, Express, Socket.IO.
- Shared types: local `game-shared-types` package.
- The server is authoritative for multiplayer game state.

## Repository Structure

- `src/`: frontend application.
- `server/`: backend WebSocket/API server.
- `game-shared-types/`: shared TypeScript types used across client/server boundaries.
- `.specify/`: speckit scripts, templates, and constitution.
- `specs/`: feature and release planning artifacts.
- `.agents/skills/`: shared Codex skills linked into this project.

## Change Discipline

- Make the smallest change that satisfies the current task.
- Do not rewrite or reformat unrelated files.
- Do not overwrite or revert uncommitted user changes unless explicitly requested.
- Before changing gameplay behavior, identify affected state transitions, Socket.IO events, and UI flows.
- Treat hidden information as sensitive game state: opponent hand cards, secret cards, and pending choices must not leak through client-visible state.

## Commit Message Rules

- When the agent creates commits for the user, write commit messages in Traditional Chinese.
- Use a clear title line followed by a body when the change is more than trivial.
- Keep the title concise and outcome-focused.
- Prefer a bullet list in the body that separates what changed, verification, and residual risks when applicable.
- If changes include the nested `server/` repository, provide a separate server commit message in addition to the parent project commit message.
- Example:

```text
整理 0.2.0 版本更新

- 同步前端、後端與 shared types 版本號
- 更新 README 與 CHANGELOG
- 驗證：npm run build 通過
```

## Speckit Workflow

- Use `specs/` for new features, release work, and behavior changes that need planning.
- The normal flow is `spec.md` -> `plan.md` -> `tasks.md` -> implementation -> validation -> closeout.
- Keep long-term project rules in `AGENTS.md` or `.specify/memory/constitution.md`.
- Keep feature-specific requirements, acceptance criteria, and task lists inside the relevant `specs/<feature>/` directory.
- Do not change package versions, release notes, or release scope before the active spec records the intended versioning strategy.
- For each new spec, create and **switch to** the dedicated feature branch before editing code or spec artifacts.
- Do not continue implementation for a new spec on the current branch just because the branch name was created elsewhere; verify the active branch explicitly first.
- If the working tree still contains uncommitted changes from a previous spec, stop and resolve that branch hygiene issue before creating or switching to the next spec branch.
- When running `speckit-clarify`, every clarification prompt MUST visibly include the full question before any recommendation or options. Use this structure exactly:
  - `## Clarification Question N`
  - `**Question:** <complete question text>`
  - `**Recommended:** Option X - <reason>`
  - options table
  - reply instruction
- Do not accept or process a bare option letter, `yes`, `recommended`, or `suggested` unless the immediately preceding assistant message visibly contained `**Question:**` plus the full options. If the question line was omitted, re-render the same question instead of continuing.

## Implementation Rules

- Preserve the existing Create React App structure.
- Preserve the mobile-first gameplay layout and bottom-sheet interaction style unless the active spec says otherwise.
- Backend validation must remain explicit for turn order, action availability, card ownership, room membership, pending interactions, and game completion.
- Socket.IO event or payload changes must update both client and server in the same feature scope.
- Shared type changes must be reflected in `game-shared-types` and all affected consumers.

## Verification

Run the narrowest useful checks first. Before handoff for frontend or release-impacting changes, run:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

If a command cannot be run, report the reason and the residual risk.

For backend-only changes, run the most relevant server command available in `server/package.json`; if no useful automated test exists, state that clearly.

## UI Review Ownership

- The user performs detailed UI visual review manually.
- The agent should normally run automated checks and only perform minimal UI smoke tests when explicitly requested.
- If the user reports that a UI screen has already been checked, record that result in the active spec/tasks instead of re-running browser inspection.
- When UI verification remains unperformed by the user, report it as a residual manual review item rather than spending extra browser-inspection tokens by default.

## Release And Versioning

- Decide whether root, server, and `game-shared-types` versions are synchronized before editing package metadata.
- Update `CHANGELOG.md` for release-visible changes.
- Keep release preparation separate from unrelated gameplay or UI changes unless the active spec includes them.
- Do not declare a stable `1.0.0` release unless the spec explicitly defines stability criteria and acceptance checks.
