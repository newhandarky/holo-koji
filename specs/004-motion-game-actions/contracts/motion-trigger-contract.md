# Contract: Motion Trigger Contract

## Purpose

Define how the frontend derives motion cues from existing confirmed gameplay state without adding new server events.

## Inputs

- previous confirmed `GameState` snapshot
- current confirmed `GameState` snapshot
- existing client draw event queue when available
- reduced-motion preference

## Rules

1. Motion cues are derived only after a state change is confirmed and visible to the client.
2. Motion derivation must not infer or reveal hidden card identity earlier than current UI already allows.
3. The first version may use semantic zones instead of exact DOM origin coordinates.
4. Motion derivation must not block or alter gameplay state transitions.
5. When multiple changes occur together, cue ordering must remain deterministic.

## Output Shape

```ts
interface MotionCue {
  id: string;
  kind: 'draw' | 'placement' | 'gift-result' | 'competition-result' | 'count-update';
  sourceZone: MotionZone;
  targetZone: MotionZone;
  cardIds: string[];
  geishaIds: number[];
  reducedMode: boolean;
}
```

## Consumer Expectations

- UI components may render from `MotionCue` records without needing new server payload fields.
- Unknown or ambiguous source geometry should degrade to semantic source zones.
- Motion cues are disposable display data and must not be persisted as gameplay state.
