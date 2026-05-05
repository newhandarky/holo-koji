# Quickstart: Expanded Character Pools

## Focused Validation

Run server setup tests first:

```bash
npm --prefix server test
```

Expected focused coverage:

- Each supported set validates as available with at least seven profiles.
- Each generated board contains exactly seven unique characters.
- Exactly-seven pools can still produce different character-to-slot placement.
- Injected oversized pools select only seven unique characters.
- Undersized, duplicate, and mismatched pools are rejected.
- Restore rejects boards outside the selected set and saved/current board identity mismatches.
- Next-round continuation preserves the existing selected cast.

## Full Repository Validation

Run the frontend suite and build before closeout:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

If the full frontend suite fails because of unrelated Lobby label expectations, record the exact failing tests separately from 022 behavior.

## Manual Review

Detailed UI visual review remains user-owned under AGENTS.md. For this spec, manual review is limited to confirming that existing room creation choices still look recognizable after automated tests pass.
