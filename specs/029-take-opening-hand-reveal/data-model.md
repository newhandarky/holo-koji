# Data Model: 拿取開局手牌與翻面揭示

## Opening Hand Reveal State

Represents local page-session state for the viewer's opening hand take/reveal flow.

Fields:

- `sequenceId`: Optional opening deal sequence identifier when available.
- `status`: `not_eligible`, `pending_take`, `revealing`, `revealed`, or `skipped_not_opening`.
- `startedAt`: Local timestamp when reveal begins.
- `completedAt`: Local timestamp when reveal completes.
- `reducedMotion`: Whether direct completion should be used.
- `currentRevealIndex`: Number of own-hand cards already revealed in normal motion.

Validation rules:

- State must not be sent to the server.
- `pending_take` is allowed only when opening take eligibility is true.
- `revealing` must not change card ownership, order, or server action availability.
- `revealed` means this page session can render own hand normally for the eligible opening state.
- Refresh/reconnect may recreate `pending_take` if eligibility still holds.

## Opening Take Eligibility

Represents the derived condition for showing the `拿取手牌` gate.

Fields:

- `openingDealCompleted`: Whether the opening deal presentation/source state is completed enough for the user to return to gameplay.
- `phaseIsPlaying`: True when the current game phase is `playing`.
- `ownHandCount`: Number of currently visible own-hand cards in the legal viewer state.
- `isStartingHandCount`: True when `ownHandCount === 6`.
- `hasUsedAnyActionToken`: True when the current player has used any visible action marker.
- `hasPendingInteraction`: True when a pending interaction is present for the room/player.
- `hasProgressedPastOpeningTake`: True when current state indicates a hand/action-changing operation has already occurred, including non-playing phase, non-starting hand count, any used action marker, or pending interaction.
- `isEligible`: True only when opening deal is completed, phase is playing, own hand is the starting 6 cards, no action marker has been used, and no pending interaction exists.

Validation rules:

- If `isEligible === false`, the gate must be skipped and current legal state shown.
- Eligibility must be derived from current state; it must not require a new server field.
- Eligibility must not inspect opponent hand identities, removed card identity, or draw pile identities.

## Concealed Opening Hand

Represents the viewer's own hand display before take.

Fields:

- `cardCount`: Number of concealed cards, expected to be 6 while eligible.
- `cards`: Six safe placeholders/card backs.
- `displayMode`: `card_back`, `placeholder`, or `count_only`.
- `forbiddenFaceData`: Card ids, geisha ids, charm values, labels, image URLs, icons, and full card objects must not be rendered.

Validation rules:

- Concealed cards must not render card face text, labels, ids, image URLs, or face-specific accessibility labels.
- Concealment must apply only to viewer's own opening hand before take.
- Underlying legal hand data may remain available for post-reveal rendering and existing rule checks, but concealed UI must not expose it.

## Reveal Step

Represents one own-hand card becoming visible during normal motion.

Fields:

- `index`: Zero-based card position in current hand order.
- `status`: `hidden`, `revealing`, or `visible`.
- `delayMs`: Local reveal delay.
- `durationMs`: Local reveal duration.
- `cardReference`: The existing legal own-hand card at the same order position.

Validation rules:

- Steps must follow current hand order.
- Steps must reveal exactly the current own-hand cards; no sorting or reshuffling.
- Total normal reveal time should be within 3 seconds.
- Reduced motion can skip individual steps and mark all cards visible immediately.

## Interaction Gate

Represents local UI interaction restrictions during pending take and reveal.

Fields:

- `blocksHandSelection`: Boolean, true while `pending_take` or `revealing`.
- `blocksHandCommands`: Boolean, true while `pending_take` or `revealing`.
- `blocksGameplayActions`: Boolean, true while `pending_take` or `revealing`.
- `allowsSectionNavigation`: Boolean, true for non-destructive UI section navigation.
- `releaseCondition`: `reveal_completed` or `skip_not_eligible`.

Validation rules:

- Hand card selection and hand-action commands must not trigger before reveal completes.
- Keyboard activation of behind-hand controls must be blocked under the same rules as pointer activation.
- Non-destructive section navigation may continue.
- After release, existing server-authoritative action availability rules apply unchanged.

## Hand Action Focus Transition

Represents the deterministic UI completion signal after reveal.

Fields:

- `targetSection`: `handActions`.
- `trigger`: `reveal_completed`.
- `required`: `true`.

Validation rules:

- Reveal completion must switch or focus to `手牌&指令`.
- The focus transition must not force an action to become legal.
- Mobile layout must keep the target section reachable and non-overlapping.
