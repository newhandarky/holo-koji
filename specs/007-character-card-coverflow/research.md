# Research: Character Card Coverflow Redesign

## Decision: Replace the static two-row geisha layout with one ordered coverflow strip

**Rationale**: The spec requires a single hand-operated coverflow ordered by board-slot charm values. Keeping the existing split rows would preserve old mental grouping and make the redesign incomplete.

**Alternatives considered**:

- Keep the current top/bottom row grouping and only restyle cards: rejected because it does not satisfy the coverflow browsing requirement.
- Show all seven cards at equal size in one row: rejected because it weakens the focus-card behavior and reduces readability for the new overlay information.

## Decision: Use central-card-first density rules for mobile and desktop

**Rationale**: The clarification answers establish one primary readable center card on all viewports. Mobile shows partial neighboring cards; desktop shows about two neighboring cards per side. This keeps the card overlay and bottom counters legible.

**Alternatives considered**:

- Single full-card-only mobile view: rejected because it removes the coverflow browsing cue.
- Show all seven cards clearly at once on desktop: rejected because cards would become too small for the required overlay and bottom counters.

## Decision: Remove the old control label block and standalone item area entirely

**Rationale**: The new card layout centers identity, charm, and item-icon information in the top-left overlay while pushing ownership counts to the bottom. Keeping old control/item sections would duplicate information and crowd the artwork.

**Alternatives considered**:

- Keep a smaller “未掌控 / 我方掌控 / 對手掌控” chip: rejected because the spec explicitly removes that block.
- Keep a compact standalone item section below the artwork: rejected because the spec moves item identity into the overlay.

## Decision: Treat border state as persisted control display, not live inferred preview

**Rationale**: The spec distinguishes previous-round control state from in-round temporary conditions. The UI must render only the control state that is already authoritative in synced match state.

**Alternatives considered**:

- Recompute border state locally from current played-card counts: rejected because it risks showing premature control changes and bypassing server-authoritative meaning.
- Hide borders entirely until the match ends: rejected because the spec requires showing control state during unresolved-round carryover.

## Decision: Preserve existing synced payloads and consume 005 display data directly

**Rationale**: 005 already established display-ready character and item fields. 007 should use the synced state directly and avoid creating new local mapping assumptions or contract changes.

**Alternatives considered**:

- Add new payload fields just for coverflow positioning: rejected because ordering can be derived from existing charm and board-slot data.
- Rebuild item/icon lookups on the client from local tables: rejected because it increases drift risk against the Ginza contract.

## Decision: Validation requires browser review in addition to test/build

**Rationale**: Coverflow density, drag/swipe feel, overlay readability, and bottom-sheet coexistence are highly visual and interaction-dependent. Existing automated tests cannot prove acceptance on their own.

**Alternatives considered**:

- Rely only on existing frontend tests/build: rejected because they do not validate interaction density or visual composition.
- Introduce snapshot tooling in this feature: deferred because the current repo does not define that infrastructure and it would expand scope.
