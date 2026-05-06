# Contract: Snapshot And Contract Hardening

## Supported Character Set Contract

Room lifecycle flows covered by this feature accept only these room-level set keys:

| Key | Meaning | Valid For Restore | Valid For Room Lifecycle |
|-----|---------|-------------------|--------------------------|
| `default` | Ginza | Yes | Yes |
| `collaboration` | 擅自合作系列 | Yes | Yes |
| `hololive` | Hololive | Yes | Yes |

### Rules

- Unknown or removed set keys are invalid.
- A temporarily unavailable supported set is also invalid for restore.
- No invalid set key may fall back to another set silently.

## Snapshot Restore Validation Contract

A snapshot is restorable only when all of the following are true:

1. The snapshot contains a supported room-level `geishaSet`.
2. The snapshot's board character data is present in a valid seven-character form.
3. All seven restored characters belong to the referenced `geishaSet`.
4. No restored character comes from another set.
5. The restore path does not require implicit patching, replacement, or fallback to rebuild the room.

### Rejection Rules

Reject the snapshot when:

- the set key is unknown
- the set key has been removed
- the set key is currently unavailable
- the board contains fewer than seven valid characters
- the snapshot omits restorable board character data
- the board mixes characters from multiple sets
- the board repeats the same character twice
- the restore flow would need silent repair to continue

## Room Lifecycle Identity Contract

A valid room keeps one room-level character-set identity across these states:

- room creation
- waiting room
- active gameplay
- unresolved next round
- rematch
- valid restore

### Rules

- Host and joiner must observe the same room-level set identity.
- Waiting room and active gameplay must not disagree about the room's active set.
- Rematch regenerates from the same room set unless the user creates a different room through a new selection flow.
- Unresolved next rounds preserve the same room set and same seven room characters.

## Restore Failure UX Contract

When restore fails:

- the room is not resumed
- the user receives a simple message such as invalid room data / create a new match
- the shipped restore-failure message may be `房間資料無效，請重新建立對戰。`
- the user is sent to a new-room recovery path
- the invalid room is not kept as a partial waiting room or partial game shell
- technical validation details are not shown in the user-facing message

## Player Visibility Contract

For all create / restore / resend / rematch flows:

- room-level `geishaSet` is public to valid room participants
- public board data remains visible
- opponent hidden hand contents remain hidden
- secret cards remain hidden unless already public by rule
- pending choices remain visible in full only to the authorized player
- non-authorized players may know an interaction is waiting, but they must not receive the offered card contents or competition groups

This feature hardens restore and room contracts without expanding what players are allowed to see.
