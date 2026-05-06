# Research: Motion Game Actions

## Decision 1: Trigger first-version motion from existing confirmed state only
- Decision: Derive animation cues from existing client-visible state changes and current draw events rather than adding server animation events.
- Rationale: This preserves the current realtime contract and keeps animation as a pure presentation concern.
- Alternatives considered:
  - Add server display-only animation events: rejected because it expands protocol complexity and hidden-information risk.
  - Trigger animations from optimistic local actions: rejected because motion must not get ahead of confirmed state.

## Decision 2: Use approximate semantic paths for first-version movement
- Decision: Use source-zone-to-destination-zone motion rather than exact DOM-to-DOM path reconstruction when exact origins are unavailable.
- Rationale: The current state model does not always preserve precise source geometry, especially for gift and competition results.
- Alternatives considered:
  - Measure exact DOM origins for every card: rejected for first version due to complexity and fragility.
  - Avoid movement and use only highlights: rejected because the user explicitly wants clear movement or fly-in feedback.

## Decision 3: Keep reduced motion as low-movement emphasis
- Decision: Reduced motion will swap large movement for short highlight, opacity, outline, or small scale feedback.
- Rationale: This keeps change visibility while respecting user comfort preferences.
- Alternatives considered:
  - Disable all feedback entirely: rejected because players still need to understand state changes.
  - Keep most motion unchanged: rejected because it would not satisfy reduced-motion expectations.

## Decision 4: Reuse existing gameplay surfaces instead of building a new animation layer API
- Decision: Animate within or between current regions such as hand, board, pending interaction modal, and action-token preview areas.
- Rationale: The repo already has stable UI regions for the gameplay moments covered by this spec.
- Alternatives considered:
  - Build a generic animation scene graph first: rejected as too large for this feature.

## Decision 5: Sequence interaction-result motion after state visibility, not before
- Decision: For gift and competition, motion will explain the confirmed result once the target state is visible.
- Rationale: This avoids speculative animation and respects the confirmed-state-only rule.
- Alternatives considered:
  - Animate before resolution completes: rejected because it risks implying outcomes too early.
