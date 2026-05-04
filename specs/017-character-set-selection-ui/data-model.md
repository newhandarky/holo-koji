# Data Model: Character Set Selection UI

## LobbyCharacterSetOption

Represents one selectable character-set entry shown in the Lobby room-creation area.

### Fields

- `key`: Stable character-set key. Expected values in this feature are `default`, `collaboration`, and `hololive`.
- `displayName`: User-facing label shown in the selector.
- `available`: Whether the option can currently be selected for room creation.
- `disabledReason`: Optional short explanation for why a known option is currently unavailable.

### Validation Rules

- `key` must be unique within the option list.
- Every supported set shown to the user must have a `displayName`.
- Unavailable options remain visible but cannot be selected.
- The default option remains `default` unless the user explicitly changes it.

## LobbyCreationState

Represents the user’s pre-room creation choices while they are on the Lobby screen.

### Fields

- `playerName`: Player-entered name used for room creation or join-room flow.
- `matchMode`: One of `online` or `npc`.
- `aiDifficulty`: Optional difficulty used only when `matchMode` is `npc`.
- `selectedGeishaSet`: Shared character-set choice used for room creation across both match modes.
- `isConnecting`: Submission-in-progress state for room creation or join.
- `connectionStatus`: Current socket connection state shown on the lobby.

### Validation Rules

- `selectedGeishaSet` must always reference a visible supported option.
- Switching `matchMode` must preserve `selectedGeishaSet`.
- `selectedGeishaSet` must not affect join-room submission.
- If an option is unavailable, `selectedGeishaSet` must not be allowed to resolve to that option for room creation.

## CreateRoomRequest

Represents the room-creation message sent from Lobby to the realtime room service.

### Fields

- `playerId`: Player identity for the room creator.
- `displayName`: Optional richer display name carried from local profile context.
- `lineUserId`: Optional external profile identity.
- `avatarUrl`: Optional external avatar.
- `mode`: One of `online` or `npc`.
- `aiDifficulty`: Optional difficulty included only for NPC creation.
- `geishaSet`: Selected character-set key for the room to use.

### Validation Rules

- `geishaSet` must be included using the current lobby selection.
- If the user never changes the selector, `geishaSet` resolves to `default`.
- `aiDifficulty` is only meaningful for `npc` mode.
- Join-room requests must not include or depend on this selection model.

## RoomCharacterSetIdentity

Represents the fixed character-set identity that applies to a room after successful creation.

### Fields

- `geishaSet`: The room’s selected set key as accepted by the server.
- `source`: Derived origin of the room identity, always coming from room creation rather than join-room.
- `lockedAfterCreation`: Derived room rule indicating the set cannot be changed inside the room session.

### Validation Rules

- The room identity is established once, at creation time.
- In-room flows do not expose a control to mutate `geishaSet`.
- Online rooms and NPC rooms follow the same locking rule after creation.
