# Quickstart: Legacy Data Cleanup

## Preconditions

- Work on branch `010-legacy-data-cleanup`.
- Specs `005` through `009` are already integrated into the current update branch.
- Treat UI visual verification as user-owned per `AGENTS.md`; this feature still requires automated build/test checks.

## Implementation Steps

1. Narrow shared data-mode types to the supported active key.
2. Remove non-Ginza mode options from lobby and room creation UI.
3. Remove server legacy data maps and legacy setup branches.
4. Ensure `default` still resolves to Ginza v2 setup.
5. Add or preserve explicit rejection for stale legacy mode/state input.
6. Remove frontend legacy lookup maps while keeping generic unknown-image/unknown-label fallback.
7. Keep old physical asset files in place.
8. Add or update tests for default Ginza setup and removed legacy mode rejection.
9. During transition, allow call sites to accept `GeishaSet | undefined`, but normalize once into `const activeGeishaSet: 'default' = 'default'` before downstream usage.

## Validation Commands

Run from repository root unless noted:

```bash
CI=1 npm test -- --watchAll=false
npm run build
cd server && npm test
```

## Static Reference Audit

After implementation, audit active source paths for removed legacy identifiers:

```bash
rg "akatsuki|onesan|collaboration|createLegacyGeishas|geishaSetMap|geisha-[0-9]" src server game-shared-types
```

Expected result:

- No active runtime references that keep removed legacy gameplay paths alive.
- References inside specs, docs, tests for rejection cases, or historical changelog entries may remain if clearly intentional.
- Styling class names containing `geisha-` are not considered legacy gameplay data references.

## Manual Acceptance Checks

- New default/NPC match starts with Ginza v2 data.
- Lobby no longer offers non-Ginza mode choices.
- Stale/removed mode input cannot create a legacy-mode room.
- Missing image/text fallback remains generic and does not crash UI.
- Old image asset files are still present unless a later spec explicitly removes them.
