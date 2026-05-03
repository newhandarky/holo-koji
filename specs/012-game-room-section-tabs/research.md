# Research: Game Room Section Tabs

## Decision 1: Reuse 011 focus state as source of truth

**Decision**: The active tab and expanded section should both derive from the existing focus section state introduced in 011.

**Rationale**: 012 changes the control surface, not the game room state model. Reusing the existing focus state avoids duplicate UI state and keeps auto-focus / restore behavior consistent.

**Alternatives considered**:

- Add separate tab state: rejected because it can drift from the expanded section.
- Persist selected tab in server state: rejected because this is local UI preference, not game state.

## Decision 2: Top tabs are the only normal switching control

**Decision**: Normal play uses the top full-width tabs as the only section switching control. Non-active section summary rows are removed as clickable switching controls.

**Rationale**: The purpose of 012 is to replace distributed summary switching with a stable top control. Keeping both controls would complicate the UI and make validation ambiguous.

**Alternatives considered**:

- Keep summary rows clickable: rejected because it creates two control systems.
- Keep summary rows as non-clickable status: rejected for 012 because tabs must display only labels and active state, and detailed summaries belong to later specs.

## Decision 3: Tabs are label-only plus active state

**Decision**: Tabs display only `資訊`, `角色`, `手牌&指令`, and active styling.

**Rationale**: Label-only tabs avoid hidden-information risk and keep 012 scoped to navigation. Status badges, counts, and action hints belong to later information/hand specs.

**Alternatives considered**:

- Add public badges: rejected to avoid scope creep into status design.
- Add per-section summaries: rejected because summaries are explicitly out of scope.

## Decision 4: Tabs stay visible while section content scrolls

**Decision**: The tab control remains visible at the top of the active game room while section content scrolls internally.

**Rationale**: The user requested the switching control at the top. Keeping it visible prevents players from losing navigation while reviewing long information, character, or hand content.

**Alternatives considered**:

- Let tabs scroll away with content: rejected because it undermines the fixed navigation purpose.
- Only fix tabs on mobile: rejected because desktop validation should match mobile behavior.

## Decision 5: Auto-focus only on newly actionable transition

**Decision**: The UI automatically switches to `手牌&指令` only when the local player transitions from not actionable to actionable and no blocking interaction is active.

**Rationale**: This preserves 011's helpful turn-start behavior without fighting the player after they manually switch away during the same actionable turn.

**Alternatives considered**:

- Always force `手牌&指令` while actionable: rejected because it can create repeated focus jumps.
- Disable auto-focus entirely: rejected because 011 explicitly established this behavior.

## Decision 6: Keyboard activation is in scope

**Decision**: Tabs must be keyboard focusable and switch sections with Enter or Space.

**Rationale**: The tab control is the primary navigation surface for gameplay sections. Keyboard activation is low-cost and prevents an accessibility regression.

**Alternatives considered**:

- Touch/pointer only: rejected because the UI would be less accessible.
- Browser focus only without activation requirement: rejected because validation would be ambiguous.

## Decision 7: No realtime or shared type changes

**Decision**: 012 must not change Socket.IO events, API payloads, server validation, or shared types.

**Rationale**: Section tabs are local UI navigation only. Changing multiplayer contracts would increase risk without improving the feature.

**Alternatives considered**:

- Broadcast active tab to opponent: rejected because it is not gameplay state.
