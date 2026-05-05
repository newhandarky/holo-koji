# Quickstart: Custom Character Selection

## Focused Server Validation

Compile shared runtime/type data after changes to `game-shared-types`:

```bash
./node_modules/.bin/tsc -p game-shared-types/tsconfig.json
```

Run:

```bash
npm --prefix server test
```

Expected coverage:

- Random setup remains the default when custom fields are omitted.
- Custom setup accepts exactly seven unique character IDs from the selected set.
- Custom setup rejects fewer than seven, more than seven, duplicate, cross-set, unavailable, or stale IDs.
- Custom setup generates exactly seven board positions without accepting client-provided board slot assignment.
- Joiner room state preserves creator setup and generated board.
- Custom rematch reuses the same selected seven IDs and may reassign board positions.
- Custom room restore validates saved selected IDs and rejects stale selections.

## Focused Frontend Validation

Run targeted Lobby tests after UI implementation:

```bash
CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx
```

Expected coverage:

- Random setup room creation sends the existing compatible payload.
- Custom setup can be enabled and sends exactly seven selected character IDs.
- Exactly-seven sets preselect all profiles in custom mode.
- Custom setup shows selected count/readiness and disables room creation when selection count is invalid.
- Switching character sets resets or revalidates custom selection.
- Join room submission remains independent of custom selection.

## Full Repository Validation

Run before closeout:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

If the full frontend suite fails because of unrelated Lobby label expectations, record the exact failing tests separately from 023 behavior.

## Manual Review

Detailed UI visual review remains user-owned under AGENTS.md. For this spec, the residual manual check is that the mobile Lobby custom selection flow remains readable, shows selection count, and does not obscure room creation readiness.

## Validation Notes

- `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json` passed.
- `npm --prefix server test` passed.
- `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx --silent` passed.
- `CI=1 npm test -- --watchAll=false --silent` passed.
- `npm run build` passed.
- Residual manual review: user-owned mobile visual review for the Lobby custom selection layout.
