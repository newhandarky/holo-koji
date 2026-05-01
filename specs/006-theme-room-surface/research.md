# Research: Theme And Room Surface

## Decision: Use one canonical Ginza v2 app background

**Rationale**: The spec requires the black-red-black diagonal theme across the entire app. A shared visual definition avoids separate lobby and game-room gradients drifting apart and keeps future v2 surfaces aligned.

**Alternatives considered**:

- Keep separate lobby and game-room gradients: rejected because it conflicts with the clarified full-app scope.
- Apply the theme only inside the game room: rejected because clarification selected all app pages.

## Decision: Preserve readable content panels outside the room main surface

**Rationale**: The spec allows non-room content cards, forms, and dialogs to keep readable backgrounds. This reduces contrast regressions and keeps lobby/join flows stable while still applying the theme to the app background.

**Alternatives considered**:

- Make all panels transparent: rejected because it increases readability risk for forms, room codes, modal text, and status cards.
- Leave non-room pages unchanged: rejected because the full-app background must be visible everywhere.

## Decision: Target the active game-room main container separately

**Rationale**: The room main surface is the specific area currently at risk of showing a large white Bootstrap card. Targeting the active gameplay container avoids accidentally changing card, modal, hand, geisha, item, and summary surfaces that are intentionally readable.

**Alternatives considered**:

- Override every Bootstrap `.card`: rejected because it would break lobby forms and game information panels.
- Remove the room wrapper entirely: rejected because it risks layout and spacing regressions.

## Decision: No backend, shared-type, or realtime contract changes

**Rationale**: The feature is visual-only. Game data, action availability, turn order, room state, and Socket.IO payloads are explicitly out of scope.

**Alternatives considered**:

- Add a server-driven theme setting: rejected for this feature because Ginza directly replaces the current app visual shell and does not need runtime server selection.
- Add shared type fields for theme metadata: rejected because no gameplay state or client/server contract needs the theme to function.

## Decision: Validate through build/tests plus manual visual review

**Rationale**: Automated tests catch compile/regression failures, but theme visibility, contrast, and mobile clipping require browser review. The plan therefore keeps repo-standard commands and adds focused visual checks.

**Alternatives considered**:

- Rely only on automated tests: rejected because visual shell acceptance is not meaningfully covered by existing unit tests.
- Require exhaustive visual snapshots: deferred because the repo does not currently define screenshot infrastructure for this feature.
