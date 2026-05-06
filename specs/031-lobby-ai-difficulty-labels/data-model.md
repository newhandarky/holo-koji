# Data Model: 大廳 AI 難度標籤

## Entity: AI Difficulty Option

Represents one selectable NPC challenge level in the Lobby.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `value` | enum | Yes | Must be one of `easy`, `medium`, `hard`, `expert`, `hell`. Preserved as the value sent for NPC room creation. |
| `label` | string | Yes | Must be the fixed Traditional Chinese label for the value. |
| `description` | string | Yes | Must be the fixed short description for the value. |
| `rank` | number | Yes | Must represent display order from easiest to hardest. |

### Canonical Values

| Rank | Value | Label | Description |
|------|-------|-------|-------------|
| 1 | `easy` | 簡單 | 適合初次體驗 |
| 2 | `medium` | 中等 | 標準挑戰 |
| 3 | `hard` | 偏強 | 需要穩定判斷 |
| 4 | `expert` | 超強 | 高壓進階對手 |
| 5 | `hell` | 地獄 | 最高難度挑戰 |

### Validation Rules

- The option list must contain exactly the five canonical values.
- Display order must follow `rank` ascending.
- `label` and `description` must not include person names.
- `value` must not be displayed as the primary player-facing label.
- Unknown, invalid, stale, or unavailable values must normalize to `easy`.

### State Transitions

```text
Lobby opens
  -> default AI difficulty = easy

Player selects NPC mode
  -> show AI difficulty options ordered by rank
  -> selected value remains current valid AI difficulty

Player selects another AI difficulty
  -> selected value updates to that option value
  -> visible label/description update to match selected value

Player switches to online mode
  -> AI difficulty is not an active required choice
  -> current valid AI difficulty remains in local Lobby state

Player switches back to NPC mode
  -> previous valid AI difficulty is restored
  -> invalid value normalizes to easy
```

## Entity: Lobby Play Mode

Represents whether the Lobby is preparing an online player match or an NPC match.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `matchMode` | enum | Yes | Must be `online` or `npc`. |
| `aiDifficulty` | AI Difficulty value | Conditional | Relevant only when `matchMode` is `npc`; omitted from online room creation payload. |

### Validation Rules

- When `matchMode` is `npc`, room creation uses the selected normalized AI difficulty value.
- When `matchMode` is `online`, room creation must not require or submit `aiDifficulty`.
- Switching modes must not clear a valid AI difficulty selection.

## Non-Persistent Data

This feature does not introduce persistent storage, server state, shared type changes, or new room snapshot fields. All label and description behavior is derived from frontend display data and existing Lobby state.
