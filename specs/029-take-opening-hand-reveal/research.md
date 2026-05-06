# Research: 拿取開局手牌與翻面揭示

## Decision: 拿取狀態維持本地 page-session 呈現狀態

**Rationale**: 029 的 clarified scope 明確排除新增 server 端「已拿取手牌」狀態、Socket.IO event 或 ACK。玩家自己的手牌已在 server 權威狀態中合法存在，029 只改變呈現時機與互動鎖定。

**Alternatives considered**:

- Server persisted taken state: rejected because it expands realtime contract and server state for a UI-only flow.
- Browser durable storage: rejected because it introduces cross-refresh persistence behavior not required by clarified spec.

## Decision: 開局拿取 eligibility 由目前合法可見狀態推導

**Rationale**: Gate should appear only when opening deal has completed, the viewer's own hand is still the starting 6 cards, and no operation that changes hand/action state has occurred. This avoids blocking reconnects into already-progressed games while keeping 029 independent of new server markers.

**Alternatives considered**:

- Show whenever own hand is visible: rejected because it could block mid-game states.
- Show only once after first entering playing state: rejected because clarified reconnect behavior allows local re-presentation when still eligible.

## Decision: 揭示前遮蔽只保護 viewer 自己的 opening hand display

**Rationale**: Opponent hand, removed card, draw pile, and pending hidden choices are already governed by viewer-safe state contracts from 027. 029 must additionally prevent the viewer's own opening hand faces from appearing before take, including visible content and accessibility/test surfaces.

**Alternatives considered**:

- Mutate received hand data before rendering: rejected because it risks corrupting downstream action logic.
- Add a server-visible masked own-hand payload: rejected because own-hand face availability is already legal and 029 is presentation-only.

## Decision: 揭示期間只鎖手牌/指令與 gameplay actions

**Rationale**: Clarification allows non-destructive UI section navigation during reveal while preventing hand selection, hand commands, and actual gameplay action submission. This limits implementation blast radius and preserves mobile bottom-section navigation.

**Alternatives considered**:

- Block the entire gameplay UI: rejected because it is stricter than clarified behavior and adds focus/inert complexity beyond the feature need.
- Allow card selection but suppress final submit: rejected because it can create confusing preselected state during reveal.

## Decision: 一般模式逐張翻面，reduced motion 直接完成

**Rationale**: Sequential reveal by current hand order matches the requested opening-hand reveal ceremony and is testable against order preservation. Reduced motion direct completion satisfies accessibility and timing requirements without large movement.

**Alternatives considered**:

- Reveal all cards simultaneously: rejected because it weakens the clarified step-by-step reveal expectation.
- No animation for all users: rejected because 029 explicitly covers翻面揭示.

## Decision: 揭示完成後一律切換或聚焦到 `手牌&指令`

**Rationale**: This gives a deterministic completion signal and aligns with the clarified UX requirement. It also makes tests straightforward: after reveal completion, the active gameplay section should be hand actions regardless of interim navigation.

**Alternatives considered**:

- Preserve current section after reveal: rejected because it can hide the completed hand/action state.
- Switch only when current player can act: rejected because 029 needs a consistent completion focus even when actions are not legally available yet.
