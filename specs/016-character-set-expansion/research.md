# Research: Character Set Expansion

## Decision: Keep item/charm data board-position based

**Rationale**: The project already treats charm values, item cards, item icons, and deck copy counts as properties of the seven fixed board positions. The user confirmed new character sets should only change which character enters each position. Keeping this invariant preserves current scoring, card counts, and UI item mapping.

**Alternatives considered**:

- Bind items/charm to character profiles. Rejected because it changes game balance and contradicts the current Phase 3 decision.
- Duplicate item definitions per character set. Rejected because the new sets are visual/identity expansions, not new item sets.

## Decision: Centralize supported character-set validation

**Rationale**: Room creation, waiting-state creation, rematch, and snapshot restoration all need the same supported-set and minimum-character-count rules. A single validation source reduces fallback bugs and prevents accidentally creating rooms with incomplete character data.

**Alternatives considered**:

- Validate only at room creation. Rejected because restored snapshots and future callers can bypass creation-time validation.
- Silently fallback to Ginza for invalid sets. Rejected by spec because unknown or removed set keys must be rejected.

## Decision: Treat fewer-than-seven character sets as unavailable

**Rationale**: The board requires exactly seven positions. Filling missing slots with another set or duplicate characters would violate the selected-set meaning and make tests ambiguous. The user confirmed future character sets should be defined with at least seven characters.

**Alternatives considered**:

- Mix in Ginza characters to fill missing slots. Rejected because it breaks set identity.
- Duplicate available characters. Rejected because it creates repeated character identities on a board that expects seven distinct characters.

## Decision: Normalize only obvious display-name formatting errors

**Rationale**: The Phase 3 data includes `、マリン`, which is an obvious stray punctuation mark before a name. Correcting that to `マリン` avoids storing a visible typo while preserving the rest of the provided naming style.

**Alternatives considered**:

- Preserve all names byte-for-byte. Rejected because it would carry a known typo into UI and tests.
- Rename all characters into a new canonical style. Rejected because it changes source data beyond the requested correction.

## Decision: Keep character-set picker UI out of scope

**Rationale**: This spec is the foundational contract and server behavior expansion. The selection UI has its own later roadmap item and should depend on the stable set contract produced here.

**Alternatives considered**:

- Implement selection UI in the same feature. Rejected to keep this spec focused and reduce cross-cutting UI scope.
