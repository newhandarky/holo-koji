# Data Model: Game Room Focus Layout

此 spec 不新增 backend model、database schema、Socket.IO payload 或 shared type。以下 model 是前端 UI 狀態與安全摘要資料的設計邊界。

## Entity: FocusSection

**Purpose**: 表示目前主要展開的遊戲房間區塊。

**Values**:

- `info`: 上方資訊區
- `characterBoard`: 中間角色區
- `handActions`: 下方手牌與指令區

**Rules**:

- 正常遊玩時必須 exactly one active focus。
- 初始 playable room focus 為 `characterBoard`。
- 點擊 collapsed summary 後，active focus 改為被點擊 section。
- 重複點擊目前 active section 不得造成全部收合。
- ordinary game state update 不得重設 active focus。
- 玩家 newly actionable 且無 blocking interaction 時，active focus 改為 `handActions`。

## Entity: FocusMemory

**Purpose**: 記錄 blocking interaction 開啟前的 focus，用於互動關閉後恢復視野。

**Fields**:

- `previousFocus`: `FocusSection | null`
- `blockingInteractionActive`: `boolean`

**Rules**:

- blocking interaction 從 inactive 變 active 時，保存當前 focus。
- blocking interaction 關閉後，若玩家 newly actionable，focus `handActions`。
- blocking interaction 關閉後，若玩家沒有 newly actionable，恢復 `previousFocus`。
- 恢復後清除或重置 `previousFocus`，避免下一次互動誤用舊值。

## Entity: CollapsedSummary

**Purpose**: 非聚焦 section 的可點擊摘要，提供切換入口與安全狀態提示。

**Common Fields**:

- `section`: `FocusSection`
- `label`: string
- `isExpanded`: boolean
- `isActionableHint`: boolean

**Allowed Info Summary Fields**:

- `roundNumber`
- `currentPlayerName`
- `phase`
- `turnStatus`

**Allowed Hand/Actions Summary Fields**:

- `handCount`
- `availableActionCount`
- `isCurrentPlayer`
- `canAct`

**Allowed Character Summary Fields**:

- `visibleCharacterCount`
- `focusedCharacterIndex`
- `controlSummaryCount`

**Forbidden Fields**:

- card identity for hidden cards
- card thumbnail/image for hidden cards
- opponent hand card details
- secret card details
- unresolved gift/competition/order hidden selections
- raw card arrays when only counts are required

## Entity: FocusLayoutSection

**Purpose**: 統一描述一個 section 的 expanded/collapsed 呈現。

**Fields**:

- `section`: `FocusSection`
- `title`: string
- `summary`: `CollapsedSummary`
- `content`: React children
- `isExpanded`: boolean

**Rules**:

- expanded section 顯示完整內容。
- collapsed section 顯示 summary，並且 summary 必須可選取切換 focus。
- collapsed section 高度應保持 compact，但不能讓文字與控制項重疊。
- expanded section 若內容超出可用高度，只能在 section 內部 scroll。

## Entity: BlockingInteractionState

**Purpose**: 表示目前是否有需優先處理的阻擋互動。

**Examples**:

- draw response
- gift response
- competition response
- order confirmation
- ready check
- end-of-round flow

**Rules**:

- blocking interaction UI 必須顯示在 focus layout 之上。
- blocking interaction 不能被 collapsed section 裁切或遮蔽。
- blocking interaction 不能要求玩家先切換 section 才能完成。

## State Transitions

```text
room playable loaded
  -> focus = characterBoard

user selects summary(section)
  -> focus = section

ordinary game state update
  -> focus unchanged

current player becomes local player and can act, no blocking interaction
  -> focus = handActions

blocking interaction opens
  -> previousFocus = focus
  -> overlay active

blocking interaction closes and local player can act newly
  -> focus = handActions
  -> previousFocus cleared

blocking interaction closes and local player is not newly actionable
  -> focus = previousFocus ?? characterBoard
  -> previousFocus cleared
```

## Validation Rules

- There must never be zero expanded sections in normal play.
- There must never be more than one expanded section in normal play.
- Collapsed summaries must be derived from safe primitive counts/status, not hidden card objects.
- Layout changes must not alter `sendGameAction` payloads or server-side validation.
- Focus transitions must respect reduced-motion preferences.
