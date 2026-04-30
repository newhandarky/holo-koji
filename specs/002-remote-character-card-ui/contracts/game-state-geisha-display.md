# Contract: Game State Geisha Display Data

## Scope

This contract documents the compatible display-field extension for `GameState.geishas[]`.

## Event Compatibility

Existing Socket.IO game-state sync events remain unchanged:

- `GAME_STATE_UPDATED`
- `GAME_STATE_UPDATE`
- `GAME_STATE_SYNC`

No new event is required for this feature.

## Payload Shape

Every geisha in `GameState.geishas[]` must include:

```ts
interface Geisha {
  id: number;
  name: string;
  charmPoints: number;
  controlledBy: PlayerId | null;
  imageUrl: string;
}
```

## Compatibility Rules

- `imageUrl` is display-only.
- `imageUrl` must not change item-card identity or scoring.
- Clients must tolerate missing or failed `imageUrl` by rendering fallback UI.
- Servers must continue to send all existing gameplay fields.
- Event names and action payloads must not change for this feature.

## Examples

```json
{
  "id": 1,
  "name": "一伊那尓栖",
  "charmPoints": 2,
  "controlledBy": null,
  "imageUrl": "https://example.com/geisha/origin/ninomae-inanis.jpg"
}
```
