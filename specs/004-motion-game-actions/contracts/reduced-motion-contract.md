# Contract: Reduced Motion Contract

## Purpose

Define how normal motion feedback degrades when reduced motion is requested.

## Rules

1. Reduced motion replaces large travel or fly-in movement with short highlight, opacity, outline, or very small scale cues.
2. Reduced motion must still make the changed area identifiable.
3. Reduced motion must keep the same gameplay timing and action availability semantics as normal motion.
4. Reduced motion behavior applies consistently across draw, placement, gift-result, and competition-result cues.

## Minimum Display Semantics

- reveal which area changed
- indicate that a confirmed state transition occurred
- avoid large positional travel

## Failure Handling

- If reduced-motion preference cannot be read, default to normal motion.
- If a normal motion cue cannot be rendered safely, it may fall back to reduced-motion style emphasis.
