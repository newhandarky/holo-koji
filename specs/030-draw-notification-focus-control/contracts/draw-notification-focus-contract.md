# Contract: 抽牌通知與焦點控制

## Scope

This contract defines frontend presentation behavior for existing draw events. It does not add server mutations, Socket.IO acknowledgements, shared type fields, or rule-state transitions.

Out of scope:

- New server-persisted draw review state.
- New draw event payload fields.
- Server draw rules, turn progression, scoring, settlement, or card ownership.
- Opening deal and opening hand reveal behavior except treating them as necessary flows.

## Input: Existing Draw Event Queue

The feature consumes existing draw event entries exposed to GameRoom:

```json
{
  "playerId": "viewer",
  "card": {
    "id": "viewer-legal-card",
    "geishaId": 3,
    "type": "item"
  }
}
```

Rules:

- For self draws, the viewer may already legally have the card in current game state.
- For opponent draws, the event and any rendered output must remain hidden-safe.
- The feature must not require a new draw acknowledgement event.
- The feature must not alter the synchronized game state.

## Focus Contract

When a self draw event is active:

- If current section is `資訊` or `角色`, keep that section focused and show the draw notification.
- If current section is `手牌&指令`, keep that section focused and run the draw flip presentation.
- If the user selects `現在查看`, switch or focus to `手牌&指令` and run the draw flip presentation.
- If the user selects `稍後確認`, close the notification and keep the current section.
- If the notification reaches 5 seconds without input, close it and treat it as `稍後確認`.

The draw event must not be a sufficient reason by itself to auto-focus `手牌&指令`.

## Notification Contract

Self draw notification outside `手牌&指令`:

- Must show a safe message and/or card back.
- Must include `稍後確認` and `現在查看`.
- Must auto-dismiss after 5 seconds.
- Must support pointer, touch, and keyboard activation.

It must not render:

- card id
- `geishaId`
- charm value
- item label
- image URL
- icon URL
- full card object content

Opponent draw notification:

- May show a safe summary such as "對手抽到了新卡".
- Must not include card face identity, image, geisha, charm, label, or full object content.

## Flip Presentation Contract

Self draw flip presentation:

- Starts only in `手牌&指令`.
- Normal motion must show a card back before revealing card content.
- The reveal must end with the current legal hand result.
- Normal motion should complete within 2 seconds.
- Reduced motion must complete within 1 second or show the completed state directly.
- Completion must not submit gameplay actions.

## Queue Contract

Multiple self draw events:

- Process in arrival order.
- A later self draw event must not overwrite an unhandled earlier notification.
- Each event is consumed only after it is viewed, dismissed, timed out, or completed as an animation.

Necessary flow deferral:

- If a necessary flow is active, defer self draw notification/presentation.
- When the necessary flow ends, process the event according to the current focus section at that time.
- Necessary flows include order decision, pending interaction, settlement or round summary, ready check, opening deal modal, and opening hand pending/revealing.

## Forbidden State Changes

The feature must not:

- change server phase
- change turn order
- change player hand ownership
- change draw pile or discard pile
- create or remove cards
- change action-token availability
- change scoring or settlement
- mutate shared payload shape
- persist draw review state to the server

## Validation Contract

Minimum validation must cover:

- self draw in `資訊` keeps focus and shows safe notification
- self draw in `角色` keeps focus and shows safe notification
- notification contains `稍後確認` and `現在查看`
- `現在查看` focuses `手牌&指令` and runs card-back-to-flip presentation
- `稍後確認` keeps current section and prevents later replay for the same event
- 5-second timeout equals `稍後確認`
- self draw while already in `手牌&指令` runs the flip presentation without showing decision notification
- queued self draws process in order
- necessary-flow deferral waits until release and then uses current focus section
- opponent draw output remains hidden-safe
- reduced motion completes within budget
