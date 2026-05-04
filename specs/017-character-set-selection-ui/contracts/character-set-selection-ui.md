# Contract: Character Set Selection UI

## Lobby Selection Contract

The Lobby room-creation area presents all supported character sets as simple text-based options.

| Set Key | Display Name | Visibility Rule | Selection Rule |
|--------|--------------|-----------------|----------------|
| `default` | Ginza | Always visible while supported | Selectable when available |
| `collaboration` | 擅自合作系列 | Visible while supported | Selectable when available |
| `hololive` | Hololive | Visible while supported | Selectable when available |

### Rules

- The selector appears only in the room-creation area.
- The selector is shared by online room creation and NPC room creation.
- The join-room area does not show a separate character-set selector.
- The untouched default selection is `default`.
- Temporarily unavailable sets remain visible but disabled.
- Switching between online and NPC creation preserves the current selection.

## Create Room Message Contract

Lobby room creation includes the selected set in the existing create-room message.

```json
{
  "type": "CREATE_ROOM",
  "payload": {
    "playerId": "player-name-or-id",
    "mode": "online | npc",
    "aiDifficulty": "optional-for-npc",
    "geishaSet": "default | collaboration | hololive"
  }
}
```

### Rules

- Online and NPC room creation both send `geishaSet`.
- If the player does not change the selector, `geishaSet` is `default`.
- If a set is disabled in the selector, the user cannot submit a room creation using that set.
- Join-room messages do not use this selector and do not carry a separate room-choice value for set selection.

## Room Surface Contract

The room does not gain a new dedicated label for the active set as part of this feature.

### Rules

- The selected set is represented by the character board already shown in the room.
- Room shell text does not add a dedicated `Ginza` / `Hololive` / `擅自合作系列` metadata label for this feature.
- The room must not provide an in-room control to switch sets after creation.
- Joiners and hosts see the same board-driven set identity because the room is created with one fixed set.

## Failure Handling Contract

- If room creation fails, the player remains on the Lobby with the current character-set selection still available for review or change.
- If a supported set is temporarily unavailable, the Lobby prevents selection before submission rather than failing late during room creation.
- Server-side rejection rules from spec 016 remain authoritative for unsupported or invalid set keys.
