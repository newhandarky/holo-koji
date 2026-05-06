# Data Model: 抽牌通知與焦點控制

## Draw Review Event

Represents one local presentation item derived from the existing draw event queue.

Fields:

- `eventId`: Stable local identifier for the queued draw presentation.
- `playerId`: Player who drew the card.
- `owner`: `self` or `opponent` from the viewer perspective.
- `cardReference`: Existing legal card reference for self draws only; hidden or absent for opponent draws.
- `receivedAt`: Local timestamp when the event became visible to the page.
- `source`: Existing draw queue event.

Validation rules:

- Self `cardReference` may be used only for hand-section flip presentation, not for non-hand notification text or labels.
- Opponent events must never store or render card face identity beyond existing hidden-safe payload.
- Events are local presentation artifacts and must not be sent to the server.

## Draw Review Decision

Represents the viewer's local decision for one self draw event.

States:

- `pending`: Notification visible or waiting to be shown.
- `view_now`: Player selected `現在查看`.
- `dismissed`: Player selected `稍後確認`.
- `timeout_dismissed`: 5-second timeout elapsed.
- `animated`: Hand-section draw/flip presentation completed or reduced-motion completion applied.

Validation rules:

- `pending` outside `手牌&指令` must not reveal card face details.
- `view_now` must switch or focus to `手牌&指令`.
- `dismissed` and `timeout_dismissed` must not replay the same draw animation on later manual entry.
- `animated` must not submit gameplay actions or mutate server state.

## Draw Presentation Queue

Represents ordered local handling for draw events.

Fields:

- `activeEventId`: Current draw event being notified or animated.
- `pendingEvents`: Remaining draw review events in arrival order.
- `deferredByNecessaryFlow`: Whether active handling is paused because a higher-priority UI flow is active.

Validation rules:

- Self draw events must be processed one at a time.
- A new self draw event must wait until the previous self draw event is viewed, dismissed, timed out, or animated.
- Necessary-flow deferral must re-evaluate the current focus section when released.
- Queue entries must be cleared when the underlying draw event is consumed or when current legal state makes the event stale.

## Draw Notification

Represents the user-visible prompt shown for self draws outside `手牌&指令`.

Fields:

- `message`: Safe text such as "你抽到一張新牌".
- `showsCardBack`: True for self draw notification.
- `actions`: `稍後確認`, `現在查看`.
- `autoDismissMs`: `5000`.
- `visibleInSection`: `info` or `characterBoard`.

Validation rules:

- Must not include card id, geisha id, charm value, item label, image URL, icon URL, or full card object.
- Must be keyboard, pointer, and touch reachable.
- Must not permanently block the game surface.

## Draw Flip Presentation

Represents the hand-section visual treatment for a self draw.

Fields:

- `cardId`: Current legal self card id, used only after hand-section presentation begins.
- `phase`: `card_back`, `flipping`, `revealed`, or `complete`.
- `durationBudgetMs`: Normal mode <= 2000, reduced motion <= 1000.
- `targetSection`: `handActions`.

Validation rules:

- Starts only when the viewer is already in `手牌&指令` or after `現在查看`.
- Shows card back before card face in normal motion.
- Reduced motion may show the completed state directly.
- Completion must preserve card count, order, identity, ownership, and action legality from current server state.

## Necessary Flow Gate

Represents higher-priority UI state that delays draw notification/presentation.

Examples:

- order decision or confirmation
- pending interaction
- settlement or round summary
- ready check
- opening deal modal
- opening hand pending/revealing

Validation rules:

- Draw notification must not steal focus while the gate is active.
- When the gate releases, draw presentation uses the current focus section at release time.
- Gate handling must not drop the underlying draw event unless current legal state makes it stale.
