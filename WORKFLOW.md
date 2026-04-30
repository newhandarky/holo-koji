---
tracker:
  kind: linear
  endpoint: https://api.linear.app/graphql
  api_key_env: LINEAR_API_KEY
  team: Holokoji
  project: HOLOKOJI
  active_states:
    - Todo
    - In Progress
  terminal_states:
    - Done
    - Canceled
    - Duplicate

polling:
  interval_seconds: 120

workspace:
  root: ../hanamikoji-game-symphony-workspaces
  branch_prefix: symphony

hooks:
  after_create:
    - npm install
  before_run:
    - npm install
  after_run:
    - CI=1 npm test -- --watchAll=false
    - npm run build

agent:
  max_concurrent_agents: 1
  max_attempts: 1
  handoff_state: In Review

codex:
  command: codex
  timeout_seconds: 3600
  sandbox: workspace-write
---

# Agent Workflow

You are working on the Hanamikoji online game repository.

## Required Context

Before editing, read:

- `README.md`
- The Linear issue title, description, comments, labels, and acceptance criteria
- Any files directly related to the requested change

## Scope Rules

- Only change files needed for the current Linear issue.
- Do not expand the issue into unrelated refactors or new features.
- Do not modify existing user changes unless they are required for the issue and you have verified the interaction.
- If the issue is unclear, blocked, or missing acceptance criteria, stop and hand it back for human review.

## Implementation Rules

- Follow the existing React Create React App structure for frontend changes.
- Keep UI behavior consistent with the existing game flow and mobile-oriented bottom sheet patterns.
- For backend changes, keep Socket.IO event contracts explicit and preserve existing room/game state behavior.
- Prefer small, reviewable changes over broad rewrites.

## Verification

Run the narrowest useful checks first. Before handoff, run:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

If verification fails, fix issues directly related to the current change. If failures appear unrelated or require broader decisions, record them in the handoff summary.

## Handoff

When finished, provide:

- What changed
- Files changed
- Verification commands and results
- Any remaining risks or follow-up needed

Move the Linear issue to `In Review` for human review instead of directly marking it `Done`.
