# Contract: Game Room Section Tabs

此 contract 定義 012 使用者可觀察的 UI 行為。此 spec 不新增或修改 HTTP API、Socket.IO event、server payload、shared type 或 persistence contract。

## 1. Tab Control Contract

When a playable room is shown, the active game room surface MUST expose one top full-width section control with exactly three options:

- `資訊`
- `角色`
- `手牌&指令`

The control MUST show only these labels and active state. It MUST NOT show:

- badges
- counts
- section summaries
- actionable hints
- card names
- card thumbnails
- secret selections
- opponent hidden details

## 2. Initial State Contract

On playable room load:

- `角色` is active.
- The character board section is expanded.
- `資訊` and `手牌&指令` are not expanded.
- The tab control remains visible at the top of the active game room.

## 3. Manual Switching Contract

When the player selects a tab:

- The selected section becomes active.
- The selected section expands.
- The other sections collapse.
- The active visual state moves to the selected tab.
- No gameplay action is submitted.
- No room event is emitted.
- No server state is changed.

Selecting the already active tab keeps the current section active.

## 4. Summary Control Contract

Non-active section summary rows MUST NOT remain as clickable section switching controls during normal play.

Normal section switching MUST occur through the top tab control.

## 5. Auto-Focus Contract

When the local player transitions from not actionable to actionable and no blocking interaction is active:

- `手牌&指令` becomes active.
- The hand/actions section expands.
- The `手牌&指令` tab shows active state.

If the local player manually switches away from `手牌&指令` while already actionable:

- Ordinary state updates preserve the manually selected tab.
- The system may auto-focus `手牌&指令` again only after a later not-actionable to actionable transition.

## 6. Blocking Interaction Contract

When a blocking interaction opens:

- It remains above the tab control and section layout.
- It remains usable.
- The active section before the interaction is remembered.

When the blocking interaction closes:

- If the local player is newly actionable, `手牌&指令` becomes active.
- Otherwise, the remembered section becomes active.
- The active tab must match the restored active section.

## 7. Accessibility Contract

The tab control MUST support:

- touch selection
- pointer selection
- keyboard focus
- Enter activation
- Space activation

## 8. Motion Contract

Normal motion mode:

- Section switching SHOULD complete within 250ms.

Reduced-motion mode:

- Section switching SHOULD be immediate or complete within 100ms.

## 9. Non-Contract Changes

The implementation MUST NOT change:

- game rules
- scoring
- turn order
- action legality
- rematch behavior
- server validation
- Socket.IO event names or payloads
- shared game data schemas
- existing section content beyond replacing the switching control
