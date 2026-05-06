# Data Model: Gift Competition Surface Polish

This feature does not add persistent data, server state, shared types, or network payload fields. The entities below are UI projections of existing client-visible game state.

## Interaction Card Option

Represents one visible item card shown in a gift or competition surface.

**Source fields**:

- `id`: Existing item card id.
- `geishaId`: Existing target position used for charm lookup.
- `image`: Existing card face image resolved from current geisha set/item data.
- `charm`: Existing charm value resolved from server-first charm lookup when available, otherwise local fallback.
- `isSelectable`: Whether the card or its containing group is currently clickable.

**Validation rules**:

- Must represent only cards already visible through the current pending interaction or selected competition cards.
- Must not include opponent hand cards, secret cards, or unrevealed choices.
- Must not introduce new payload fields when selected.

## Gift Response Surface

Represents the bottom-sheet content where the player chooses one offered gift card.

**Fields**:

- `offeredCards`: Existing three-card list from the pending gift interaction.
- `selectedCardId`: Not stored as preview state; click submits immediately.
- `motionState`: Existing optional gift-result motion hint.
- `layoutMode`: Desktop inline/wrapped presentation or mobile stacked/wrapped presentation.

**State transitions**:

- Opened -> card clicked: sends existing gift resolution action immediately.
- Opened -> collapsed/expanded: preserves existing bottom-sheet behavior.

**Validation rules**:

- Must show exactly the offered cards from the pending interaction.
- Must preserve click-to-submit behavior.
- Must preserve bottom-sheet container behavior.

## Competition Grouping Surface

Represents the bottom-sheet content where the active player chooses one grouping方案 for four selected cards.

**Fields**:

- `selectedCards`: Existing four item cards chosen for competition.
- `groupingOptions`: Existing three possible two-by-two groupings.
- `groupCharmTotal`: Display-only sum of each group's visible card charm values.
- `motionState`: Existing optional competition-result motion hint.
- `layoutMode`: Desktop side-by-side grouping or mobile stacked/wrapped grouping.

**State transitions**:

- Opened with four cards ->方案 clicked: sends existing competition initiation action immediately.
- Opened -> closed: preserves current close behavior without submitting.

**Validation rules**:

- Must preserve the same three grouping options and card id output order used by the existing flow.
- Group charm totals are display-only and must not affect legality or payload generation.
- Must not add a preview/confirmation state.

## Competition Response Surface

Represents the bottom-sheet content where the responding player chooses one of two offered competition groups.

**Fields**:

- `groups`: Existing two groups from pending competition interaction.
- `groupCharmTotal`: Display-only sum of each group's visible card charm values.
- `chosenGroupIndex`: Not stored as preview state; click submits immediately.
- `motionState`: Existing optional competition-result motion hint.
- `layoutMode`: Desktop side-by-side/wrapped presentation or mobile stacked/wrapped presentation.

**State transitions**:

- Opened -> group clicked: sends existing competition resolution action immediately.
- Opened -> collapsed/expanded: preserves existing bottom-sheet behavior.

**Validation rules**:

- Must render only the pending interaction groups.
- Must preserve the existing chosen group index semantics.
- Group charm totals are display-only and must not change scoring or ownership rules.

## Existing State Not Changed

- Card ownership and hand membership.
- Pending interaction payloads.
- Action token state.
- Socket.IO event names and payload shapes.
- Scoring, round state, winner, turn order, and server validation.
