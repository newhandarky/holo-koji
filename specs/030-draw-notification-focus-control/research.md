# Research: 抽牌通知與焦點控制

## Decision: Keep draw review state local to GameRoom

**Rationale**: The draw has already happened in server-authoritative state. The feature only controls whether the viewer immediately watches a local presentation, delays it, or dismisses the notification. Persisting a "reviewed draw" state on the server would add synchronization work without changing gameplay rules.

**Alternatives considered**:
- Server ACK for draw notification review: rejected because it would create new realtime contracts for a presentation-only flow.
- Durable browser storage: rejected because refresh/reconnect should show current legal state, not replay stale notification decisions.

## Decision: Consume drawQueue items after presentation decision completes

**Rationale**: The existing `drawQueue` already serializes draw events. 030 needs to avoid dropping the active event before the player chooses `現在查看`, `稍後確認`, or the 5-second timeout fires. Consumption after the local decision keeps queue ordering deterministic.

**Alternatives considered**:
- Consume immediately and store separate local event copy: rejected because it duplicates queue ownership and increases stale-event risk.
- Keep all events forever until route leave: rejected because stale notifications could appear after state changes.

## Decision: Non-hand self draw notification shows only card back/safe summary

**Rationale**: The user clarified the intended physical-card feeling: first see the card back from the deck, then flip in hand. Showing the card face inside the notification would break that flow and distract from the current `資訊` or `角色` section.

**Alternatives considered**:
- Full card face in notification: rejected because it makes `現在查看` less meaningful and leaks face content outside the hand flow.
- Text-only card name in notification: rejected because it still reveals card content before the flip.

## Decision: Necessary flows defer self draw presentation

**Rationale**: Order confirmation, pending interactions, settlement, ready checks, opening deal modal, and opening hand reveal are higher-priority flows. The draw UI must not steal focus or appear behind/over those flows. Re-evaluating the current section after the flow ends respects the user's current context.

**Alternatives considered**:
- Low-priority toast during necessary flow: rejected because it can be missed or visually compete with modal/pending interaction.
- Auto-dismiss as later confirmation: rejected because it removes the user's chance to choose `現在查看`.

## Decision: Queue multiple self draw events in arrival order

**Rationale**: Consecutive self draws are not expected to be common, but if they occur, queueing preserves physical draw order and prevents a later event from overwriting a pending decision.

**Alternatives considered**:
- Merge into "N new cards": rejected because the feature asks for one-card draw/flip feeling.
- Latest event wins: rejected because it can drop a draw notification and weaken testability.

## Decision: Keep opponent draw as safe summary

**Rationale**: Opponent draw content is hidden information. The viewer may know the opponent drew a card or that hand count changed, but not card identity, image, geisha, charm, or label.

**Alternatives considered**:
- Opponent card-back animation: possible later polish, but not needed for 030 acceptance and could complicate hidden-info tests.
