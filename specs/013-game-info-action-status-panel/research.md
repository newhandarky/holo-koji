# Research: Game Info Action Status Panel

## Decision 1: Use existing client-visible player state

**Decision**: Use `Player.actionTokens` for used/unused status, `Player.secretCards` for local `密約` replay, and `Player.discardedCards` for local `取捨` replay.

**Rationale**: These fields already exist in `game-shared-types` and are already consumed by the hand/action control UI for local used-card inspection. Using them keeps 013 frontend-only and avoids new Socket.IO or shared type contracts.

**Alternatives considered**:

- Add new server event or replay payload: rejected because the required local data is already present and this would increase realtime contract risk.
- Track replay cards in new frontend-only action history: rejected because it could drift from authoritative synchronized state.

## Decision 2: Keep replay inline inside the information panel

**Decision**: Show local `密約` / `取捨` replay cards inline below the local player's action icon row.

**Rationale**: Clarification selected inline display. It keeps replay contextual, avoids adding a new modal layer, and works with the existing focused section layout.

**Alternatives considered**:

- Popover near the icon: rejected because it can be fragile on mobile and may conflict with overflow boundaries.
- Bottom-sheet/modal: rejected because it would compete with existing gift/competition/order/ready/end-game blocking flows.

## Decision 3: Only eligible local replay icons are interactive

**Decision**: Only the local player's used `密約` and used `取捨` icons are selectable. All other action icons are status-only.

**Rationale**: This reduces hidden-information risk and prevents empty or misleading interactions. It also makes acceptance tests straightforward: non-eligible icons do not open content or submit actions.

**Alternatives considered**:

- Make all icons clickable with empty-state text: rejected because it adds unnecessary states and invites confusion.
- Make local `贈予` / `競爭` clickable for summary: rejected because 013 explicitly limits replay to `密約` / `取捨`.

## Decision 4: Preserve one replay panel across tab switches

**Decision**: Keep at most one local replay area open. Selecting another eligible icon replaces the content. Switching away from and back to `資訊` preserves the current replay selection.

**Rationale**: This matches clarification, avoids stacking multiple card displays, and supports the user's "回看" intent without altering game state.

**Alternatives considered**:

- Collapse replay when leaving `資訊`: rejected because it makes repeated checking less ergonomic.
- Allow multiple replay sections open: rejected because it increases vertical pressure on mobile.

## Decision 5: Leave-game button boundary

**Decision**: Render current-player status as non-clickable information on the left and `離開遊戲` as a clear button on the right.

**Rationale**: `離開遊戲` is a deliberate action and should preserve the existing confirmation flow. A clear button avoids accidental activation from tapping the status row.

**Alternatives considered**:

- Make the right half a segmented row hit target: rejected because it makes accidental taps more likely.
- Move `離開遊戲` elsewhere in the information panel: rejected because the spec asks for a two-part status row.

## Decision 6: No server/shared type changes

**Decision**: Plan 013 as frontend-only unless implementation proves current state cannot support a requirement.

**Rationale**: The constitution requires explicit realtime contracts for event/payload changes. Current state supports action status and local secret/trade-off replay, so avoiding backend changes is lower risk.

**Alternatives considered**:

- Add a dedicated action history model: rejected for 013 because it is not necessary for local `密約` / `取捨` replay.
