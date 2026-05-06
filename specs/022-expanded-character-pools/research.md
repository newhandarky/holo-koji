# Research: Expanded Character Pools

## Decision: Keep character-pool selection server-side

**Rationale**: Room creation, restore, deck generation, next-round continuation, NPC play, and multiplayer synchronization already converge in `server/utils/gameUtils.js` and `server/index.js`. Keeping pool selection there preserves authoritative state and prevents clients from choosing or leaking alternate board casts.

**Alternatives considered**: Client-side board generation was rejected because it would duplicate game setup logic and weaken multiplayer state integrity. A new shared package for pool selection was rejected because there is no current non-server caller that needs to generate authoritative boards.

## Decision: Treat seven profiles as a complete valid pool

**Rationale**: The clarified requirement says current Ginza, collaboration, and Hololive data each have seven profiles. That is enough to validate the rule: select seven from the whole pool. With exactly seven profiles, all profiles appear and only board placement changes between generated boards.

**Alternatives considered**: Waiting until production data has more than seven profiles was rejected because the behavior can be tested with injected oversized fixtures. Requiring more than seven profiles now was rejected because it conflicts with the clarified scope.

## Decision: Sample without replacement before assigning board slots

**Rationale**: The board must contain seven unique characters, and board position owns charm/item behavior. Sampling characters first, then assigning them to the fixed ordered slots, keeps character identity independent from rule identity.

**Alternatives considered**: Binding character profiles permanently to charm slots was rejected because it would make character identity a gameplay rule. Sampling with replacement was rejected because duplicate characters violate the spec.

## Decision: Preserve current `Geisha` payload shape

**Rationale**: The existing `Geisha` model already separates `id`, `characterId`, `boardSlotId`, display `name`, `imageUrl`, and `charmPoints`. That supports the required distinction between selected character profile and board-position rule identity without adding a new Socket.IO payload.

**Alternatives considered**: Adding a new `selectedCast` field was rejected because it would duplicate `gameState.geishas` and increase restore/sync risk without adding user-visible value.

## Decision: Validate future expansion through test fixtures

**Rationale**: The current production pools may remain at seven profiles, but implementation must be ready for more. Tests can pass an injected pool with eight or more profiles to prove seven-character subset selection and uniqueness.

**Alternatives considered**: Manually expanding production data inside this spec was rejected because the user explicitly said expansion is not required now.
