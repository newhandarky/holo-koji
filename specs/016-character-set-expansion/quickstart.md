# Quickstart: Character Set Expansion

## Scope

This feature expands the character-set contract and server board generation. It does not add the character-set picker UI.

## Implementation Order

1. Update shared types so `GeishaSet` allows `default`, `collaboration`, and `hololive`.
2. Add server-side character profiles for collaboration and Hololive using `docs/plan/update-phase3.md`.
3. Normalize the collaboration name `、マリン` to `マリン`.
4. Centralize supported-set validation and availability checks.
5. Update board generation to draw seven characters from the requested set while keeping board slot charm/item data unchanged.
6. Update room creation, waiting game state, rematch, and snapshot restoration to preserve selected set.
7. Update frontend consumers that currently force `default` so they can accept server-supplied set keys.
8. Add focused tests.

## Focused Behavioral Checks

- `default` creates a seven-character Ginza board.
- `collaboration` creates a seven-character 擅自合作系列 board.
- `hololive` creates a seven-character Hololive board.
- All generated boards preserve charm distribution `2,2,2,3,3,4,5`.
- All generated item cards still use board-position item data.
- A set with fewer than seven valid characters is unavailable and rejected.
- Unsupported set keys such as old `akatsuki` are rejected.
- Unresolved next round preserves selected set, board identity, and control state.
- Rematch regenerates from the same selected set.
- Snapshot restore preserves selected set and rejects unsupported set keys.

## Validation Commands

Run from repo root unless noted.

```bash
CI=1 npm test -- --watchAll=false
npm run build
cd server && npm test
```

## Manual Review Notes

Detailed visual UI review remains user-owned. This spec only requires minimal smoke confidence that server-supplied character names/images appear after state sync.

## Test Coverage Notes

Room creation and snapshot behavior are validated through focused server utility contract tests rather than an end-to-end WebSocket room-flow harness. The covered boundaries are: missing `geishaSet` defaults to `default`, explicit `collaboration` and `hololive` values are preserved, empty and unknown set values are rejected, fewer-than-seven character pools are rejected, supported snapshot sets are restored, restored boards must belong to the selected set, restored board slots must map to known board positions, and unknown snapshot sets are rejected without fallback. A dedicated WebSocket integration harness can be added in a later testing-focused spec if room lifecycle coverage needs to become fully end-to-end.


## Verification Result

- 2026-05-04: `cd server && npm test` passed.
- 2026-05-04: `CI=1 npm test -- --watchAll=false` passed, with existing React Router/test-utils deprecation warnings only.
- 2026-05-04: `npm run build` passed.
