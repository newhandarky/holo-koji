# Feature Specification: Motion Game Actions

**Feature Branch**: `004-motion-game-actions`  
**Created**: 2026-05-01  
**Status**: Implemented  
**Input**: User description: "004-motion-game-actions"

## Clarifications

### Session 2026-05-01

- Q: `004-motion-game-actions` 第一版應該優先做到哪個動畫範圍？ → A: 卡牌移動感：抽牌、出牌、贈予、競爭都要有明顯卡牌移動或飛入效果。
- Q: 第一版卡牌移動動畫應該怎麼觸發？ → A: 只用前端現有 state diff / 已確認狀態觸發動畫，不新增 server event。
- Q: 玩家啟用 reduced motion 時，動畫應該如何降級？ → A: 用短暫 highlight、opacity、outline、scale 極小變化取代大幅移動。
- Q: 第一版卡牌移動路徑要追求到什麼程度？ → A: 語意正確的近似路徑即可，例如從手牌/互動區方向 fly-in 到角色卡。

## User Scenarios & Testing

### User Story 1 - See Key Game Actions Move (Priority: P1)

As a player, I want important in-game actions to have visible motion, so that I can understand what just happened without relying only on sudden state changes.

**Why this priority**: The main user value is clarity during play. Animations should make card movement, ownership changes, and action results easier to follow before adding broader polish.

**Independent Test**: Play through draw, card placement, gift, and competition flows and confirm the UI shows clear card movement or fly-in style motion for confirmed state changes while the same actions, scoring, and turn flow remain unchanged.

**Acceptance Scenarios**:

1. **Given** a player draws a card, **When** the draw is confirmed by game state, **Then** the newly drawn card is visually emphasized with movement or fly-in style motion without changing hand contents beyond the confirmed state.
2. **Given** a player resolves an action that places cards onto character areas, **When** the state update is shown, **Then** the affected card or character summary animates with a movement cue that communicates the placement.
3. **Given** gift or competition is resolved, **When** the result becomes visible, **Then** the receiving side and affected character cards show movement or fly-in style motion that helps the player understand the outcome.
4. **Given** the game proceeds normally, **When** animations are active, **Then** legal actions, scoring, hidden information boundaries, and turn order behave the same as before this feature.
5. **Given** a card movement path cannot be reconstructed exactly from existing state, **When** motion feedback plays, **Then** it may use a semantically correct approximate path that still communicates the affected source direction and destination.

---

### User Story 2 - Keep Motion Readable and Non-Blocking (Priority: P2)

As a player, I want animations to improve readability without delaying my ability to act, so that gameplay stays responsive on mobile and desktop.

**Why this priority**: Motion can easily make a turn-based game feel slower or confusing. The animation system must reinforce game state rather than become a new interaction bottleneck.

**Independent Test**: Play several turns on mobile and desktop layouts and confirm animations complete quickly, do not obscure controls, and never prevent valid actions after the state allows them.

**Acceptance Scenarios**:

1. **Given** multiple board values update at once, **When** animations play, **Then** the board remains readable and controls do not overlap or become unusable.
2. **Given** a player can perform a legal action, **When** an animation is still settling, **Then** the UI does not block the action unless existing gameplay state already blocks it.
3. **Given** a player reviews the board on a narrow mobile screen, **When** motion effects play, **Then** the layout remains stable and no card or control jumps outside the playable area.

---

### User Story 3 - Respect Reduced Motion Preferences (Priority: P3)

As a player who prefers reduced motion, I want animation effects to be minimized, so that the game remains comfortable and accessible.

**Why this priority**: Motion is a visual enhancement, not a gameplay requirement. Players who reduce motion should still receive clear state feedback.

**Independent Test**: Enable reduced motion at the device/browser level and confirm the game still communicates state changes through low-motion emphasis, highlights, or instant transitions.

**Acceptance Scenarios**:

1. **Given** reduced motion is enabled, **When** an animated game action occurs, **Then** the game uses brief highlight, opacity, outline, or very small scale changes instead of large movement.
2. **Given** reduced motion is enabled, **When** ownership, count, or item icon data changes, **Then** the changed area remains identifiable without relying on travel animations.
3. **Given** reduced motion is disabled, **When** the same actions occur, **Then** normal motion effects remain available.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST add motion feedback for confirmed in-game action updates, including draw feedback, card placement or summary changes, gift or competition results, and ownership or count changes.
- **FR-002**: The system MUST preserve all existing gameplay rules, scoring, turn order, action validation, hidden-information boundaries, and server-authoritative state behavior.
- **FR-003**: The system MUST ensure animations reflect already-confirmed game state and do not determine or mutate gameplay outcomes.
- **FR-004**: The system MUST keep valid player actions available according to existing game state, without adding animation-only blocking conditions.
- **FR-005**: The system MUST keep motion readable on both mobile and desktop layouts.
- **FR-006**: The system MUST provide reduced-motion behavior for players who request reduced motion.
- **FR-007**: The system MUST avoid exposing hidden card identity or pending choices through animation timing, previews, or transitional states.
- **FR-008**: The system MUST keep existing Socket.IO event names and rule-bearing payload semantics unchanged unless a later spec explicitly changes them.
- **FR-009**: The system MUST make animated state changes understandable even if motion is skipped, interrupted, or reduced.
- **FR-010**: The system MUST limit this feature to in-game action motion and related visual feedback, leaving broader visual redesign and final art polish to separate work.
- **FR-011**: The system MUST provide clear card movement or fly-in style motion for draw, played-card placement, gift resolution, and competition resolution in the first version.
- **FR-012**: The system MUST trigger first-version motion from existing client-visible state changes or confirmed synced state, without adding new server events.
- **FR-013**: The system MUST replace large movement with brief highlight, opacity, outline, or very small scale feedback when reduced motion is requested.
- **FR-014**: The system MAY use semantically correct approximate movement paths for the first version, rather than requiring exact measured movement from original DOM positions.

### Non-Functional Requirements

- **NFR-001**: Motion effects MUST remain short enough that they do not make routine turns feel delayed.
- **NFR-002**: Motion effects MUST not introduce layout instability that makes board elements overlap or controls unusable.
- **NFR-003**: The feature MUST remain compatible with the existing mobile-first gameplay layout and bottom-sheet interaction model.
- **NFR-004**: The feature MUST remain verifiable with existing automated tests and production build checks.
- **NFR-005**: The feature MUST keep animation implementation maintainable enough that new action animations can be added without duplicating unrelated game logic.

### Key Entities

- **Motion Feedback**: A visual transition, highlight, or movement that communicates a confirmed game-state change.
- **Animated Game Action**: A gameplay event or state transition surfaced with motion, such as drawing, placing cards, resolving gifts or competitions, or updating ownership/counts.
- **Reduced Motion Mode**: A presentation mode that minimizes movement while still showing visible state feedback.
- **Motion Trigger Source**: Existing client-visible state or event information used only to decide when to show visual feedback.
- **State Diff Trigger**: A client-side comparison between previous and current confirmed game state used to infer which visual feedback should play.
- **Approximate Movement Path**: A motion path that communicates the correct action meaning and destination without requiring exact original element coordinates.
- **Stable Gameplay State**: The authoritative game state after server validation and synchronization.

## Success Criteria

- **SC-001**: Players can visually identify at least the primary draw, placement, gift or competition result, and ownership/count update moments during normal play.
- **SC-002**: Existing automated tests still pass after motion feedback is added.
- **SC-003**: A production build completes successfully after motion feedback is added.
- **SC-004**: Reduced motion mode still communicates animated state changes through low-motion or instant feedback.
- **SC-005**: During manual review on mobile and desktop, animations do not obscure required controls or move board elements outside the playable layout.

## Assumptions

- Motion is a presentation-layer feature and should not require server validation changes.
- Existing state changes and client-visible events provide enough information to trigger first-version animations.
- A first version can use highlights, fades, scale changes, or short movement effects rather than full cinematic card travel.
- The first version should prioritize visible card movement or fly-in style feedback over purely subtle highlights.
- First-version animation paths may communicate result movement rather than reconstructing every original card source and destination exactly.
- Approximate movement paths are acceptable when exact source or destination coordinates are not available from existing confirmed state.
- The feature should build on the character-card and item-icon UI created by earlier specs.
- Manual visual review will be used for final motion feel, while automated tests and build checks cover regression risk.
- Reduced motion should still communicate what changed, but without large card travel or fly-in movement.

## Out of Scope

- Changing Hanamikoji game rules, scoring, action availability, or server-side validation.
- Adding new Socket.IO events or changing rule-bearing payload semantics.
- Adding display-only animation events from the server.
- Replacing the character-card or item-icon visual systems from earlier specs.
- Building a full animation timeline editor or design tooling system.
- Final art-direction polish for every game surface.
