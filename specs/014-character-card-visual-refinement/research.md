# Research: Character Card Visual Refinement

## Decision 1 - Preserve single viewport layout as the hard boundary

**Decision**: Improve focused card visibility within the existing single viewport character section. Do not expand the room into uncontrolled page scrolling.

**Rationale**: 011 and 012 established a focused room layout with stable section switching. Preserving that container avoids reintroducing whole-page scrolling and keeps `資訊 / 角色 / 手牌&指令` behavior predictable.

**Alternatives considered**:

- Prioritize full card visibility even if the whole room grows vertically: rejected because it conflicts with the clarified 014 scope and 011 layout.
- Allow horizontal overflow for wider cards: rejected because mobile playability and no horizontal page scrolling are explicit requirements.

## Decision 2 - Focused card gets full-image priority; non-focused cards preserve coverflow depth

**Decision**: Apply the strongest image-visibility improvement to the active/focused card. Adjacent and distant cards keep overlap, depth, and side-card exposure as their primary behavior.

**Rationale**: Players inspect the focused card for details. Non-focused cards serve as navigational context in the coverflow and should not force the entire track to flatten or lose its stacked visual model.

**Alternatives considered**:

- Make all cards equally complete: rejected because it would likely reduce coverflow depth or force wider layouts.
- Only reduce overlay size without changing image fit: rejected because the user specifically wants less image clipping.

## Decision 3 - Use contain-style focused imagery with intentional fill

**Decision**: Focused card imagery should prioritize full image visibility. If the image ratio does not fill the card frame, use intentional empty space or background fill instead of cropping the subject.

**Rationale**: Current `object-fit: cover` behavior can cut off important character content. A contain-style strategy aligns with the user's request to see the character more completely.

**Alternatives considered**:

- Keep cover fit and adjust object-position: rejected because it can still crop important content.
- Keep existing cropping and only move labels: rejected because it does not address the core visibility issue.

## Decision 4 - Position item icons must be position-derived, not ownership-derived

**Decision**: Always-visible item icons should be derived from the field position/slot and existing frontend-visible item definitions. They must not depend on whether a player currently owns an item card for that position.

**Rationale**: The project already models charm and item identity as position-bound for Ginza. Current known-card scanning can fail when no currently visible/owned card has exposed the icon for that position, so implementation should use a stable position lookup instead.

**Alternatives considered**:

- Continue scanning known `ItemCard`s: rejected because it violates the "always visible even when not owned" requirement.
- Add server/shared type fields in 014: rejected by clarification; 014 must stop and report if existing visible data is insufficient.
- Use placeholder icons until cards are seen: rejected because the requirement is stable position icon visibility.

## Decision 5 - Remove only the character-section top command icons

**Decision**: Remove the opponent action icon row rendered above the character coverflow. Do not remove 013 information action status icons or hand/action controls.

**Rationale**: 013 owns action status display in the information panel, and 015 will address hand action controls. 014 should keep scope limited to character-section visual refinement.

**Alternatives considered**:

- Remove all non-hand action icons: rejected because it would undo 013.
- Remove all action icons in the room: rejected because it breaks existing gameplay controls.

## Decision 6 - Control borders remain server-state based

**Decision**: Keep character border ownership based on `geisha.controlledBy`; do not calculate border changes from current mid-round counts.

**Rationale**: The game rule clarification says borders only represent already controlled characters carried into a continued unresolved match state, not temporary mid-round majority.

**Alternatives considered**:

- Derive border color from current counts: rejected because it would create misleading mid-round ownership.
- Hide all borders: rejected because continued-match control state must remain visible.
