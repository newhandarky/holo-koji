# Research: Gift Competition Surface Polish

## Decision: Preserve bottom-sheet structure

**Rationale**: The repo constitution and `AGENTS.md` both prioritize mobile-first gameplay and bottom-sheet interaction. The user clarified that 009 should keep the bottom-sheet model and only polish internal card, group, and option presentation.

**Alternatives considered**:

- Centered modal: rejected because it would replace an established mobile interaction model and broaden scope.
- Desktop modal plus mobile bottom sheet: rejected because it creates divergent flows without a gameplay need.

## Decision: Keep click-to-submit behavior

**Rationale**: Existing gift response, competition grouping, and competition response flows submit when the user clicks the chosen card/group/方案. The user clarified that 009 should not add preview selection or a second confirmation step.

**Alternatives considered**:

- Click to preview, then confirm: rejected because it adds state and slows established action flow.
- Mixed behavior by surface: rejected because inconsistent behavior increases user error risk.

## Decision: Display competition group charm totals

**Rationale**: Competition decisions require comparing two-card groups. The user clarified that both the grouping surface and response surface should show card images, single-card charm values, and each group's charm total. This uses already-visible information and does not change rules or payloads.

**Alternatives considered**:

- Single-card values only: rejected because group comparison remains slower.
- Totals only: rejected because it weakens card identity and could hide why a total matters.

## Decision: Prefer mobile stacking/wrapping over card shrinkage

**Rationale**: The user clarified that mobile layouts may stack or wrap options inside the bottom sheet to preserve card readability. This aligns with the no-horizontal-scroll requirement and avoids making card art and charm badges too small.

**Alternatives considered**:

- Keep everything in one row and shrink cards: rejected because readability is more important for this decision surface.
- Show summaries only on mobile: rejected because the spec requires card image and charm visibility.

## Decision: Frontend-only UI contract

**Rationale**: The feature explicitly excludes changes to server validation, shared types, Socket.IO, action payloads, scoring, turn order, and win/loss logic. The relevant contract is therefore an observable UI behavior contract rather than an API/network contract.

**Alternatives considered**:

- Network contract update: rejected because no payload or realtime interface changes are planned.
- Data model migration: rejected because no persistent data or shared type fields are introduced.
