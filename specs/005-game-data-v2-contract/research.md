# Research: Game Data v2 Contract

## Decision 1: Make server-owned `ginza` data the active `default` match source
- Decision: Keep the public `geishaSet` entrypoint as `default`, but resolve that path to Ginza data on the server for all new default matches.
- Rationale: This matches the clarified product direction, minimizes lobby and room-flow churn, and keeps the migration focused on data and contracts rather than mode-selection UI.
- Alternatives considered:
  - Add a separate `ginza` selectable mode now: rejected because the user wants `ginza` to replace the current default path.
  - Rename all client/server selectors immediately: rejected because it increases migration surface without changing gameplay behavior.

## Decision 2: Separate character identity from board-position gameplay/display attributes
- Decision: Model Ginza setup with server-owned character records plus seven board-position records that own charm values and item asset bindings.
- Rationale: The spec explicitly ties charm and item assets to board positions, not to characters. This breaks the current index-coupled model cleanly and supports future pools larger than seven.
- Alternatives considered:
  - Keep charm and item metadata on character records: rejected because it contradicts the clarified rules.
  - Recompute board-slot metadata purely on the client: rejected because match setup must remain server-authoritative.

## Decision 3: Expand `ItemCard` with display-only payload fields instead of relying on frontend lookup tables
- Decision: Keep rule-bearing identity on existing card fields, but add display-only fields for board slot, internal item asset name, item image URL, item icon URL, and neutral label.
- Rationale: Current UI helpers infer images/icons from `geishaId` and `type`, which breaks once characters are randomized independently from board positions. Shipping complete display data in synced state reduces client coupling and future UI rework.
- Alternatives considered:
  - Keep only `geishaId` and infer everything on the frontend: rejected because it would force every UI surface to rebuild board-position context independently.
  - Replace rule identity with display identity: rejected because display fields must not affect legality or scoring.

## Decision 4: Use deterministic setup injection only at the match-setup boundary
- Decision: Introduce deterministic random injection for tests in the server match-setup path, while normal gameplay continues using ordinary randomness.
- Rationale: Tests need reproducible seven-character selection and board assignment, but production code should keep one authoritative setup path. Injecting randomness at setup time keeps implementation narrow and validation reliable.
- Alternatives considered:
  - Seed global `Math.random()` usage across the whole server: rejected because it is invasive and brittle.
  - Duplicate a separate deterministic setup flow for tests: rejected because it risks divergence from production behavior.

## Decision 5: Fail fast on invalid Ginza datasets
- Decision: Reject match creation when the character pool has fewer than seven entries or when any board-position item asset lacks required fields.
- Rationale: Silent fallback to legacy data would undermine the migration and make acceptance checks unreliable. Data contract errors should surface immediately during setup.
- Alternatives considered:
  - Fallback to legacy `default` data: rejected because it hides migration failures.
  - Allow placeholder item assets: rejected because 005 specifically establishes the contract future UI specs will depend on.

## Decision 6: Preserve current unresolved-round behavior and treat rematch as a new match
- Decision: Keep the same selected seven characters and control state when a round ends without a winner; treat rematch only as a user-started new match after a match has ended.
- Rationale: This matches the clarified gameplay rule and fits the current room lifecycle in `server/index.js`, where rematch already restarts setup.
- Alternatives considered:
  - Re-randomize after unresolved rounds: rejected because it breaks match continuity.
  - Keep rematch on the same seven characters: rejected because the user wants rematch to reshuffle.
