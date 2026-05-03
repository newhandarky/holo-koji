# Contract: Game Room Focus Layout

此 contract 定義使用者可觀察的 UI 行為。此 spec 不新增或修改 HTTP API、Socket.IO event、server payload、shared type 或 persistence contract。

## 1. Layout Contract

The game room MUST expose exactly three recognizable gameplay sections after a playable room is ready:

- Information section
- Character board section
- Hand/actions section

During normal play, exactly one section is expanded. The other sections are collapsed summaries.

## 2. Initial Focus Contract

When a playable room view loads:

- `characterBoard` is the expanded section.
- `info` is collapsed with a safe status/count summary.
- `handActions` is collapsed with a safe status/count summary.

The player must be able to identify the current round/turn context, the character board location, and the hand/action entry point without whole-page scrolling.

## 3. Manual Focus Switching Contract

When the player selects a collapsed section summary:

- The selected section becomes expanded.
- The previously expanded section becomes collapsed.
- No state is submitted to the server.
- No gameplay action is triggered.
- Re-selecting the active section does not collapse all sections.

## 4. Actionable Turn Auto-Focus Contract

When the local player newly becomes actionable and no blocking interaction is active:

- `handActions` becomes the expanded section.
- The player can select hand cards and submit available actions through the existing action flow.

When the room receives ordinary state updates that do not newly make the player actionable:

- The current focus remains unchanged.

## 5. Blocking Interaction Contract

Blocking interactions include draw, gift, competition, order confirmation, ready check, and end-of-round flows.

When a blocking interaction opens:

- It appears above the section layout.
- It remains usable regardless of which section is expanded.
- The current focus is remembered.

When a blocking interaction closes:

- If the local player is newly actionable, focus changes to `handActions`.
- Otherwise, focus returns to the remembered section.

## 6. Collapsed Summary Privacy Contract

Collapsed summaries MAY show:

- Round number
- Current player
- Turn/phase status
- Hand card count
- Available action count
- Visible character count or current character index
- Public control/charm summary counts

Collapsed summaries MUST NOT show:

- Hidden card identities
- Hidden card thumbnails/images
- Opponent hand details
- Secret cards
- Unresolved secret selections
- Raw hidden card arrays in UI props where counts are sufficient

## 7. Viewport And Scrolling Contract

During normal play:

- The main game room is bounded to a single viewport height.
- Whole-page vertical scrolling should not be required for normal interaction.
- Horizontal scrolling must not be required.
- If expanded content overflows, scrolling is contained inside that expanded section.

## 8. Motion Contract

Focus changes use short expand/collapse transitions.

When the player prefers reduced motion:

- Transition duration is removed or significantly reduced.
- Card selection, action submission, and blocking interaction responses remain immediate.

## 9. Non-Contract Changes

The implementation MUST NOT change:

- Game rules
- Scoring
- Turn order
- Action legality
- Rematch behavior
- Server validation
- Socket.IO event names or payloads
- Shared game data schemas
