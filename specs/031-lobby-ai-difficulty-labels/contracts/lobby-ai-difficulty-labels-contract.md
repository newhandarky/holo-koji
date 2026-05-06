# Contract: 大廳 AI 難度標籤

## Scope

This contract defines the Lobby UI and room creation behavior for NPC AI difficulty display. It does not add server events, shared payload fields, persisted state, or AI behavior changes.

Out of scope:

- Changing AI decision logic, strength, delays, or scoring.
- Changing `CREATE_ROOM` event shape.
- Changing shared type values for AI difficulty.
- Changing online room creation, room joining, invite recovery, account sync, achievements, or character set selection.

## UI Contract

When `matchMode` is `npc`, the Lobby must present exactly these AI difficulty options in this order:

| Value | Label | Description |
|-------|-------|-------------|
| `easy` | 簡單 | 適合初次體驗 |
| `medium` | 中等 | 標準挑戰 |
| `hard` | 偏強 | 需要穩定判斷 |
| `expert` | 超強 | 高壓進階對手 |
| `hell` | 地獄 | 最高難度挑戰 |

Rules:

- The player-facing difficulty content must not display person names.
- The player-facing primary label must not be `easy`, `medium`, `hard`, `expert`, or `hell`.
- Each option must expose both label and description to users.
- The selected option must remain identifiable before NPC room creation.
- The control must remain usable by pointer, touch, and keyboard.
- Mobile and desktop layouts must avoid label/description overlap with adjacent lobby controls.

## Mode Contract

When `matchMode` is `online`:

- AI difficulty must not be presented as an active required choice.
- Online room creation must not submit an AI difficulty value.
- Switching away from NPC mode must not erase a valid selected AI difficulty from the current Lobby session.

When switching back to `npc`:

- A valid previous selection must be restored.
- An invalid, stale, or unavailable selection must normalize to `easy`.

## Room Creation Contract

NPC room creation payload remains compatible with the existing server contract:

```json
{
  "playerId": "host-name",
  "mode": "npc",
  "aiDifficulty": "easy"
}
```

Allowed `aiDifficulty` values:

- `easy`
- `medium`
- `hard`
- `expert`
- `hell`

Online room creation payload must omit AI difficulty:

```json
{
  "playerId": "host-name",
  "mode": "online"
}
```

The feature must not require any new acknowledgement, server-side label field, or shared type update.

## Default and Fallback Contract

- Initial NPC difficulty is `easy`.
- Invalid, stale, or unavailable AI difficulty values normalize to `easy`.
- Fallback must not block room creation.

## Forbidden Output

AI difficulty UI must not render the previous person-name labels as difficulty content:

- `しぐれうい`
- `大空スバル`
- `兎田ぺこら`
- `猫又おかゆ`
- `ときのそら`

## Validation Contract

Minimum validation must cover:

- NPC mode displays all five labels and descriptions.
- Options appear in the canonical order.
- Person names are absent from difficulty UI.
- Default NPC difficulty is `easy` / `簡單`.
- Selecting each displayed difficulty sends the matching existing value for NPC room creation.
- Online mode does not submit `aiDifficulty`.
- Switching online -> NPC preserves a valid selected difficulty.
- Invalid/stale value fallback resolves to `easy`.
- Difficulty labels/descriptions remain accessible through keyboard-operable controls.
