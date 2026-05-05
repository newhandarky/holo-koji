# Data Model: Deal And Draw Motion Refresh

## Overview

021 以顯示層短生命週期資料為主，不新增持久化資料表或 server authoritative gameplay entity。核心是補齊現有 room state 在前端的 motion projection。

## Entities

### OpeningDealCueState

代表目前房內正在播放的開局發牌提示狀態。

**Fields**
- `isActive`: 是否正在播放 opening cue
- `startedAt`: cue 開始時間
- `completedAt?`: cue 完成時間
- `sequenceLength`: 本次發牌 sequence 長度
- `currentStepIndex`: 目前播放到第幾步
- `viewerId`: 目前 viewer playerId
- `reducedMotion`: 是否使用 reduced motion

**Validation / Rules**
- 僅在新局開始或下一輪開始時建立
- cue 完成後立即清除，不進入 game state
- cue 狀態不得覆蓋 server authoritative hand contents

### DealSequenceStep

來自 server `DEAL_ANIMATION.payload.sequence` 的單一步驟。

**Fields**
- `order`: 發牌順序
- `playerId`: 這一步是發給哪位玩家
- `card`: viewer-safe card data；自己可見真實牌，對手只見 masked card

**Validation / Rules**
- `order` 必須可排序
- step 顯示方向依 viewer 轉成上 / 下
- 對手 step 不得被前端還原成真實牌面

### DrawArrivalCue

代表某張新牌短暫加入手牌的提示狀態。

**Fields**
- `cardId`: 新牌 id
- `owner`: `self`
- `durationMs`: cue 持續時間
- `reducedMotion`: 是否使用 reduced motion

**Validation / Rules**
- 只對實際持牌玩家建立
- cue 結束後立即回復普通手牌狀態
- 不對其他 viewer 建立完整新卡 cue

### HandRemovalCue

代表某張牌離開手牌時的雙方可見狀態變化提示。

**Fields**
- `owner`: `self | opponent`
- `sourceZone`: `hand`
- `visibility`: `public-safe`
- `durationMs`: cue 持續時間

**Validation / Rules**
- cue 可被雙方感知
- 不得揭露 hidden card identity
- 若目前 repo 無法安全辨識特定移除來源，應以 zone-level cue 實作

## Relationships

- `OpeningDealCueState` 會消耗 `DealSequenceStep[]`
- `DrawArrivalCue` 依附於既有 hand card rendering
- `HandRemovalCue` 依附於既有 motion cue / hand state transitions

## State Transitions

### Opening Deal
1. room enters new round
2. server sends `DEAL_ANIMATION.sequence`
3. frontend creates `OpeningDealCueState`
4. frontend keeps interaction locked
5. cue completes
6. frontend clears `OpeningDealCueState`
7. interaction unlocks

### Draw Arrival
1. server sends `CARD_DRAWN`
2. holder viewer receives true card
3. frontend creates short `DrawArrivalCue`
4. cue completes
5. card returns to normal hand presentation

### Hand Removal
1. card leaves hand due to confirmed state transition
2. frontend emits public-safe removal cue
3. cue completes without exposing hidden card identity

## Non-Persistent Constraint

這些 entity 都是前端瞬時顯示模型，不應寫入 room snapshot，也不應擴充 server-side persistent game state。
