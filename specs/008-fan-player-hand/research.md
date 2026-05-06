# Research: Fan Player Hand

## Decision: Keep fan hand as a presentation-only redesign

**Rationale**: The spec requires no changes to card data, action payloads, Socket.IO events, scoring, or server validation. `PlayerHand` already owns local selected-card presentation and reports selections through the existing `onCardSelect` callback, so the feature can stay in the frontend presentation layer.

**Alternatives considered**:

- Add shared type fields for focus or fan position: rejected because focus is only local UI state.
- Add server events for hand focus: rejected because it would expose irrelevant UI state and increase realtime contract surface.

## Decision: Use clicked card as both selection toggle and focus target

**Rationale**: Clarification chose the current click action to both toggle selected state and set the local focus. This preserves the existing one-click selection model while adding visual clarity.

**Alternatives considered**:

- First click only focuses and second click selects: rejected because it would change action speed and likely surprise users.
- Separate focus and selected states with independent gestures: rejected because it adds mode complexity to a small hand surface.

## Decision: Apply fan geometry through per-card visual metadata

**Rationale**: The hand can calculate each card's relative index and expose presentation values such as angle, horizontal offset, vertical arc, and stacking order to CSS. This keeps JSX readable and lets responsive CSS tune desktop/mobile density without changing game behavior.

**Alternatives considered**:

- Hard-code each hand-size layout in CSS only: rejected because hand size changes during play and fixed selectors would be brittle.
- Use an external carousel/fan library: rejected because the interaction is simple and should remain close to the existing component.

## Decision: Desktop uses medium spread; mobile uses denser overlap

**Rationale**: Clarification selected medium desktop spread and denser mobile overlap. This balances readable card faces with available room around 007 coverflow, action tokens, and bottom sheets.

**Alternatives considered**:

- Fully spread every card: rejected because it can consume too much horizontal space.
- Convert mobile to a horizontal scroll list: rejected because the user wants to preserve fan presentation on mobile.

## Decision: Detailed UI review is user-owned

**Rationale**: `AGENTS.md` now defines detailed UI visual review as the user's responsibility. The implementation should still run automated checks and record any manual UI review remaining, but should not spend extra browser-inspection tokens by default.

**Alternatives considered**:

- Always run browser-based UI inspection: rejected for cost reasons and because the user will inspect visual details directly.
