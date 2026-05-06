# Feature Specification: Deal And Draw Motion Refresh

**Feature Branch**: `021-deal-draw-motion`  
**Created**: 2026-05-05  
**Status**: Implemented - pending user visual review  
**Input**: User description: "021-deal-and-draw-motion-refresh"

## Clarifications

### Session 2026-05-05

- Q: 發牌與抽牌動畫要顯示給誰看？ → A: 原則上只有持牌玩家看到完整手牌進場，但開局發牌與移除一張卡牌的動畫雙方玩家都要看到；開局發牌依上下/下上交替呈現，回合抽牌只有當前持牌玩家看得到。
- Q: 發牌動畫進行時，玩家什麼時候可以開始操作？ → A: 等開局發牌主要提示完成後才可操作，但動畫時間必須短且不拖節奏。
- Q: 抽牌後「新卡提示」要維持到什麼程度？ → A: 新卡只在加入當下做非常短的提示，之後立刻回到普通手牌狀態；這個遊戲不需要長時間強調新舊卡差異。

## User Scenarios & Testing

### User Story 1 - 開局發牌重新具有進場感 (Priority: P1)

玩家開始一場新對戰時，手牌不應突然整批出現。系統應讓起始手牌依序進入 `手牌&指令` 區，讓玩家清楚感受到開局完成與卡牌已經發到自己手上。

**Why this priority**: 開局發牌是每一局都會出現的第一個互動節點。如果這裡沒有明確進場感，整體對戰節奏會顯得斷裂，也無法體現後續動畫系統的價值。

**Independent Test**: 建立一場新對戰並進入開局，確認起始手牌會逐張進入手牌區，而不是整批瞬間出現。

**Acceptance Scenarios**:

1. **Given** 玩家進入一場新的對戰開局， **When** 系統完成起始發牌， **Then** 玩家會看到手牌逐張進入手牌區。
2. **Given** 玩家正在觀看開局發牌， **When** 卡牌依序加入手牌區， **Then** 每張新卡的出現順序清楚可辨識，而不是同時疊在一起。
3. **Given** 開局發牌動畫完成， **When** 玩家開始操作， **Then** 手牌內容、張數與實際可操作狀態與遊戲規則完全一致。
4. **Given** 雙方玩家都在房內， **When** 開局發牌開始， **Then** 雙方都能看到依上下/下上交替進行的發牌節奏，而不是只在單一玩家畫面上發生。
5. **Given** 玩家正在等待開局完成， **When** 主要發牌提示尚未完成， **Then** 系統不應過早進入可操作狀態。

---

### User Story 2 - 抽牌時能明確辨識新加入的卡 (Priority: P1)

玩家在自己的回合抽牌時，應能清楚知道有一張新卡加入手牌，而不是只能依靠手牌數字變化自行猜測。

**Why this priority**: 抽牌是回合節奏的核心訊號。若玩家無法立即辨識新卡加入，後續選牌與操作判斷會更吃力，尤其在手牌扇形展示下更容易忽略新增卡片。

**Independent Test**: 進行一個會觸發抽牌的回合，確認新抽到的卡牌有清楚的加入手牌提示，且玩家能辨識哪張是新卡。

**Acceptance Scenarios**:

1. **Given** 玩家在回合中獲得一張新手牌， **When** 抽牌完成， **Then** 新卡會以清楚可見的方式加入現有手牌區。
2. **Given** 玩家手牌原本已經展開， **When** 新卡加入， **Then** 玩家仍能辨識新增卡片，而不是只看到整排手牌重新排版。
3. **Given** 抽牌提示已顯示， **When** 玩家接著進行行動選牌， **Then** 手牌的實際資料、可選狀態與規則不因動畫而延遲或錯亂。
4. **Given** 非持牌玩家正在同一房間觀看， **When** 對手完成抽牌， **Then** 非持牌玩家不會看到對手新手牌的完整進場細節。
5. **Given** 新卡已完成加入提示， **When** 短暫提示結束， **Then** 該卡應立即回到普通手牌狀態，而不持續保留特殊標記。

---

### User Story 3 - 減少動作模式下仍能辨識狀態變化 (Priority: P2)

偏好減少動作的玩家仍需要知道發牌與抽牌有發生，但不應承受大幅位移或強烈動畫。

**Why this priority**: 這是可用性與無障礙需求。動畫不能只為了視覺效果而犧牲可讀性或舒適度。

**Independent Test**: 在減少動作偏好開啟的情況下進入對戰與抽牌，確認仍有明確狀態提示，但不使用大幅位移進場。

**Acceptance Scenarios**:

1. **Given** 玩家偏好減少動作， **When** 開局發牌發生， **Then** 系統改以較低刺激的短暫狀態提示呈現，而不是大幅位移動畫。
2. **Given** 玩家偏好減少動作， **When** 回合抽牌發生， **Then** 系統仍能讓玩家辨識新卡加入，但整體動作顯著簡化。

---

### User Story 4 - 動畫不得改變遊戲正確性 (Priority: P2)

動畫只應幫助玩家看懂狀態變化，不能改變手牌內容、抽牌結果、回合時序、可操作狀態或多人同步結果。

**Why this priority**: 這個專案是 server authoritative game。任何動畫刷新如果影響 state 正確性，會直接造成規則錯誤與多人不同步。

**Independent Test**: 在有發牌與抽牌動畫的情況下完成一段對戰流程，確認手牌張數、卡牌內容、操作可用性與多人同步結果保持正確。

**Acceptance Scenarios**:

1. **Given** 發牌或抽牌動畫正在進行， **When** 遊戲狀態更新完成， **Then** 玩家最終看到的手牌內容與實際遊戲狀態一致。
2. **Given** 對戰房內有多位參與者， **When** 發牌或抽牌動畫觸發， **Then** 動畫只影響顯示，不會改變房間同步結果。
3. **Given** 一局遊戲正常進行， **When** 發牌與抽牌動畫加入後， **Then** 回合推進、行動可用性與結算流程維持原有規則。
4. **Given** 卡牌從手牌中被移除， **When** 該移除效果需要提示， **Then** 雙方玩家都能看到該移除動作的狀態變化，但不因此暴露額外隱藏資訊。

## Requirements

### Functional Requirements

- **FR-001**: The system MUST present opening-hand cards as a sequential arrival into the player hand area instead of rendering the full starting hand with no visible transition.
- **FR-002**: The system MUST make each opening-hand card arrival visually distinguishable from the previous one.
- **FR-003**: The system MUST present newly drawn cards as a clear addition to the existing player hand area.
- **FR-004**: The system MUST allow players to identify which card is newly added after a draw event.
- **FR-005**: The draw-arrival cue MUST be brief and MUST return the new card to the normal hand presentation immediately after the short cue completes.
- **FR-006**: The system MUST show the opening deal motion to both players, using the existing room orientation so the local player hand is presented on the lower side and the opponent hand on the upper side.
- **FR-007**: The opening deal motion MUST communicate an alternating deal rhythm between both sides rather than implying that all cards appear for only one player first.
- **FR-008**: The system MUST restrict full draw-to-hand arrival feedback to the player who actually receives the new card.
- **FR-009**: The system MUST allow both players to perceive card-removal motion cues when a card leaves a hand, as long as no extra hidden information is exposed.
- **FR-010**: The system MUST keep the motion scope focused on hand-entry and hand-removal feedback and MUST NOT turn this feature into a broader full-board animation redesign.
- **FR-011**: The system MUST preserve final hand contents, hand counts, card order rules, and action availability exactly as determined by the authoritative game state.
- **FR-012**: The system MUST NOT require players to wait for long motion sequences before the hand becomes readable or actionable.
- **FR-013**: The system MUST keep the player interaction lock in place until the opening-deal primary cue has completed.
- **FR-014**: The system MUST provide a reduced-motion presentation for opening deal and draw feedback.
- **FR-015**: The reduced-motion presentation MUST still make state changes visible without relying on large movement.
- **FR-016**: The same opening-deal feedback rules MUST apply regardless of which supported character set the room is using.
- **FR-017**: The same draw-feedback rules MUST apply in both online rooms and NPC rooms.
- **FR-018**: The feature MUST keep room synchronization and turn flow behavior unchanged for hosts, joiners, and NPC matches.

### Non-Functional Requirements

- **NFR-001**: Motion feedback MUST make the start of a round and the receipt of a new card easier to understand for players at normal play speed.
- **NFR-002**: Motion feedback MUST remain visually readable on the existing mobile-first hand layout.
- **NFR-003**: Reduced-motion behavior MUST remain meaningfully informative rather than silently removing all state-change feedback.
- **NFR-004**: The feature MUST be verifiable through focused automated checks plus user-owned manual UI review.

### Key Entities

- **Opening Hand Arrival**: The visual sequence that communicates the player’s starting hand entering the hand area at the beginning of a round.
- **Draw Arrival Cue**: The visual feedback that communicates a newly obtained card joining the existing player hand.
- **Reduced Motion Cue**: A lower-intensity replacement for large movement that still signals that cards were dealt or drawn.
- **Hand Presentation Surface**: The existing `手牌&指令` area where the player reads and interacts with cards.

## Success Criteria

- **SC-001**: In manual verification, players can visually distinguish opening-hand cards entering the hand area one by one in 100% of tested new-round starts.
- **SC-002**: In manual verification, players can identify which card was newly added after a draw in 100% of tested draw events.
- **SC-003**: Reduced-motion verification shows visible deal and draw state-change cues in 100% of tested cases without relying on large travel motion.
- **SC-004**: Automated regression checks show no gameplay-rule or room-sync regressions introduced by the motion refresh.

## Assumptions

- This feature builds on the existing hand layout and current motion foundation rather than replacing the entire game-room animation model.
- The required motion refresh only covers opening deal and draw-to-hand feedback, not every possible card movement in the game.
- Opening deal is treated as a room-visible state cue for both sides, while ordinary draw-to-hand arrival remains a player-local hidden-information cue.
- The authoritative source of hand contents remains unchanged; this feature only improves how already-confirmed state changes are surfaced.
- Character sets, charm positions, action rules, rematch rules, and snapshot behavior remain unchanged by this feature.
- The user will continue to perform final visual review manually after automated validation passes.

## Implementation Notes

- Opening deal consumes the existing `DEAL_ANIMATION.sequence` queue and projects each viewer-safe step into self/opponent hand lanes.
- Opening deal keeps interaction locked only until the short primary cue has completed; it does not add a server-side phase.
- Draw arrival uses the existing `CARD_DRAWN` path and shows the full short hand-entry cue only to the receiving player.
- Card removal feedback is public-safe: it is derived from hand-count decreases and renders zone-level motion without card identity, geisha id, or artwork.
- Reduced motion keeps visible deal/draw/removal emphasis while shortening duration and avoiding large travel.

## Residual Manual Review

- Final animation rhythm, mobile readability, and reduced-motion feel still require user visual review per `quickstart.md`.

## Out of Scope

- Redesigning the full game-room layout or the overall hand/focus architecture.
- Changing game rules, draw timing, turn sequencing, or server-side state transitions.
- Adding new animation systems for non-hand actions such as score transfers, control markers, or full-board cinematics.
- Reworking character-set selection, snapshot restore rules, logging behavior, account binding, or achievements.
