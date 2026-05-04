# Quickstart: Snapshot And Contract Hardening

## Scope

This feature strengthens room snapshot validation and room lifecycle contract consistency for multi-set gameplay. It does not redesign UI, add new character-set selectors, or clean up production logging.

## Implementation Order

1. Audit current restore, room creation, waiting-state, rematch, and resend paths that read or emit `geishaSet`.
2. Centralize supported-set validation rules for snapshot restore.
3. Enforce board/set consistency checks requiring an explicit restorable seven-character board from the referenced set.
4. Ensure invalid restore attempts stop the room from being reused as a partial shell.
5. Keep waiting room, active game, unresolved next round, rematch, and restore paths aligned on one room-level set identity.
6. Review player-visible state shaping so hidden hands and pending secret choices remain private after restore-related changes.
7. Update shared contract documentation and focused tests.

## Focused Behavioral Checks

- Valid snapshots for `default`, `collaboration`, and `hololive` restore successfully.
- Unknown, removed, or unavailable set keys are rejected without fallback.
- Snapshot board data mixing sets is rejected.
- Snapshot board data with fewer than seven valid characters is rejected.
- Snapshot data without any restorable seven-character board is rejected.
- Snapshot boards with duplicate or mixed-set characters are rejected.
- Rejected restore attempts do not leave a partial waiting room or active room shell.
- Host and joiner see the same room-level set identity across waiting room, active game, and valid restore.
- Unresolved next rounds keep the same seven room characters.
- Rematch continues to use the same room set.
- Hidden hands are masked during restore or resend paths.
- Pending interaction card contents and competition groups are only visible to the responding player.

## Validation Commands

Run from repo root unless otherwise noted.

```bash
cd server && npm test
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual Review Notes

Detailed UI visual review remains user-owned. Manual review for this spec should focus only on:

- restore failure messaging being simple and non-technical
- no contradictory room set identity appearing between waiting room and active room

## Test Coverage Notes

Preferred automated coverage for this feature is contract-focused and server-heavy:

- `resolveRestorableGeishaSet` success and rejection cases
- board/set validation for supported sets
- restore rejection for cross-set or incomplete board data
- room lifecycle preservation of `geishaSet` across waiting room, rematch, and unresolved next round
- player-visible state shaping for hidden information during restore-related sends

Browser inspection is not required by default unless a later implementation changes user-facing restore messaging or room-state presentation.
