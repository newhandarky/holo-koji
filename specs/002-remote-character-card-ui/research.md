# Research: Remote Character Card UI

## Decision: Use server-provided `Geisha.imageUrl` as character artwork source

**Rationale**: The server already owns character set data in `server/utils/gameUtils.js` and includes `imageUrl` when building geisha objects. Using `geisha.imageUrl` in the frontend removes duplicated character artwork mapping and aligns with the desired frontend/backend separation.

**Alternatives considered**:

- Keep frontend `getGeishaImageById`: rejected because it preserves duplicate source-of-truth and can drift from server character data.
- Move artwork to shared frontend config only: rejected because the user wants backend-owned data.
- Add a new asset API endpoint: deferred because static game data already travels in game state and no asset-management backend is in scope.

## Decision: Treat `imageUrl` as display-only state

**Rationale**: The constitution requires game rule correctness and shared state integrity. `imageUrl` must not affect deck construction, scoring, ownership, action validation, or winner detection.

**Alternatives considered**:

- Include image loading status in game state: rejected because image loading is client UI state and must not affect gameplay.
- Use image URL to infer character identity: rejected because `id`, `name`, and `charmPoints` already define gameplay identity.

## Decision: Keep item-card image replacement out of this feature

**Rationale**: Item icon work is planned as a separate spec. Current item views depend on `cardUrl` from `src/utils/gameData.ts`, so removing that mapping now would expand scope and risk gift/competition/hand UI regressions.

**Alternatives considered**:

- Replace all item images now: rejected as scope creep.
- Hide item visuals entirely: rejected because current hand/action flows depend on readable item cards.

## Decision: Center-crop artwork into a 9:16 frame

**Rationale**: The user expects source images to be prepared as 9:16. Center-crop is the simplest fallback for occasional mismatched source images while keeping board layout stable.

**Alternatives considered**:

- Fit-contain with blank or blurred background: rejected because it creates inconsistent card surfaces.
- Preserve original ratio: rejected because it undermines a fixed card-game layout.

## Decision: Document realtime payload as a compatible extension

**Rationale**: `GameState.geishas[]` already carries `imageUrl` at runtime from the server, but the shared type does not declare it. The plan should formalize the field in the type and contract without changing event names or action semantics.

**Alternatives considered**:

- No contract update: rejected because payload shape changes must be explicit.
- New Socket.IO event: rejected because existing game-state sync already carries geisha data.
