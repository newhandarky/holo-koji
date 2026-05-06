# Quickstart: Motion Game Actions

## Goal

Add clear motion feedback for confirmed gameplay changes while preserving gameplay logic, current realtime contracts, and mobile readability.

## Implementation Outline

1. Capture a reduced previous-state snapshot for the gameplay regions that can animate.
2. Derive `MotionCue` records from previous/current confirmed state and existing draw events.
3. Render first-version draw, placement, gift-result, and competition-result motion from semantic source zones to target zones.
4. Keep animations short and non-blocking.
5. Add reduced-motion fallbacks that replace travel with low-motion emphasis.
6. Validate on mobile and desktop that animation layers do not obscure required controls.

## Validation

Run:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

Also perform manual review for:

- draw feedback readability
- gift and competition result clarity
- mobile layout stability during motion
- reduced-motion fallback behavior

## Notes

- No new Socket.IO events are introduced in this feature.
- Approximate semantic movement paths are acceptable in the first version.
- Motion cues are frontend-only display data and must not become gameplay state.
