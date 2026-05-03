# Research: Hand Action Controls Carousel

## Decision 1 - Keep hand focus as local frontend UI state

**Decision**: Implement the hand carousel focus as local frontend state in the hand/actions UI. Do not add Socket.IO events, server fields, or shared type fields.

**Rationale**: Hand focus is a presentation concern. The server already validates card ownership, selected card IDs, action legality, turn order, pending interactions, and game completion. Sending focus to the server would add realtime contract surface without improving rule correctness.

**Alternatives considered**:

- Add server-visible hand focus: rejected because it is not gameplay state and would increase contract risk.
- Store focus in shared types: rejected because it does not need to cross client/server boundaries.

## Decision 2 - Separate focus state from selection state

**Decision**: Keep focused-card state separate from selected-card state. Left/right controls change focus only. Clicking a card updates focus and toggles selection.

**Rationale**: Players need to inspect overlapping hand cards without accidentally selecting or deselecting them. Direct card clicks remain the primary select/deselect interaction and should also make the clicked card easier to inspect.

**Alternatives considered**:

- Left/right controls also select cards: rejected because it creates accidental action selection.
- Card clicks only select without focusing: rejected because the user clarified clicked cards should become focused.

## Decision 3 - Use wrapping carousel navigation

**Decision**: Previous/next hand focus controls wrap from first to last and last to first.

**Rationale**: The character coverflow already uses wrapping navigation. Applying the same model to hand focus avoids dead-end controls and keeps behavior predictable.

**Alternatives considered**:

- Disable controls at boundaries: rejected because it is less consistent with existing coverflow behavior.
- Keep buttons clickable but stationary at boundaries: rejected because it creates ambiguous feedback.

## Decision 4 - Preserve focus across hand changes when possible

**Decision**: On first hand load, focus the middle card. When the hand changes, preserve the current focused card if it still exists; otherwise focus the closest remaining card by previous position.

**Rationale**: Actions and draw events can change hand contents. Preserving focus reduces visual jumping, while nearest fallback prevents focus from becoming null after a selected card leaves the hand.

**Alternatives considered**:

- Always focus newest/rightmost card: rejected because non-draw state sync or action submission would move focus unexpectedly.
- Always reset to first card: rejected because it causes unnecessary jumps and makes overlapping cards harder to inspect.

## Decision 5 - Keep action tokens visible but disabled when not actionable

**Decision**: The bottom four action tokens remain visible in the hand/actions section when the player cannot act, but all are disabled and preserve state cues.

**Rationale**: Stable controls reduce layout shifts and keep action status understandable. Disabled behavior prevents accidental client-side submission attempts while server validation remains authoritative.

**Alternatives considered**:

- Hide tokens when waiting: rejected because it changes layout and obscures action state.
- Show status-only chips: rejected because it diverges from the clarified bottom action-control model.

## Decision 6 - Require keyboard-accessible controls and aria labels

**Decision**: Previous/next hand focus controls must be real focusable buttons with clear aria labels.

**Rationale**: This is low-cost accessibility that also clarifies test expectations. It avoids pointer-only carousel behavior and aligns with existing button-based coverflow controls.

**Alternatives considered**:

- Pointer-only controls: rejected because it excludes keyboard users and weakens UI testability.
- Aria labels without keyboard guarantees: rejected because native button semantics can satisfy both together.
