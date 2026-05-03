# Data Model: Game Room Section Tabs

此 spec 不新增 backend model、database schema、Socket.IO payload 或 shared type。以下為前端 UI 狀態與互動模型。

## Entity: SectionTabControl

**Purpose**: 顯示 active game room 最上方的三段式區塊切換入口。

**Fields**:

- `options`: fixed list of `info`, `characterBoard`, `handActions`
- `activeSection`: `ActiveSection`
- `isKeyboardFocusable`: boolean
- `isFixedVisible`: boolean

**Validation Rules**:

- Options must render exactly as `資訊`, `角色`, `手牌&指令`.
- Control must show only labels and active state.
- Control must not show badges, counts, summaries, actionable hints, card data, or secret data.
- Control must stay visible while section content scrolls internally.
- Control must be usable by touch, pointer, keyboard focus, Enter, and Space.

## Entity: ActiveSection

**Purpose**: 表示目前展開的主要遊戲房間區塊。

**Values**:

- `info`
- `characterBoard`
- `handActions`

**State Rules**:

- Initial playable room value is `characterBoard`.
- Selecting a tab sets `activeSection` to the selected section.
- Selecting the active tab keeps the same value.
- Exactly one active section exists during normal play.
- When the local player transitions from not actionable to actionable and no blocking interaction is active, active section becomes `handActions`.
- If the local player manually switches away from `handActions` while already actionable, ordinary state updates preserve the manual active section.

## Entity: BlockingInteractionFocusMemory

**Purpose**: 保留 011 的 blocking interaction restore 行為。

**Fields**:

- `previousSection`: `ActiveSection`
- `wasActionableBeforeBlocking`: boolean
- `blockingInteractionActive`: boolean

**State Rules**:

- When a blocking interaction opens, remember the current active section.
- When it closes and the local player is newly actionable, active section becomes `handActions`.
- When it closes and the local player is not newly actionable, active section returns to `previousSection`.
- Tabs active styling must match the restored active section.

## State Transitions

```text
playable room loaded
  -> activeSection = characterBoard

tab selected(info)
  -> activeSection = info

tab selected(characterBoard)
  -> activeSection = characterBoard

tab selected(handActions)
  -> activeSection = handActions

active tab selected again
  -> activeSection unchanged

local player transitions not actionable -> actionable, no blocking interaction
  -> activeSection = handActions

local player manually switches away while already actionable
  -> activeSection = selected tab
  -> ordinary state updates preserve selected tab

blocking interaction opens
  -> previousSection = activeSection

blocking interaction closes, newly actionable
  -> activeSection = handActions

blocking interaction closes, not newly actionable
  -> activeSection = previousSection
```

## Hidden Information Constraints

- Do not pass card arrays or card identities into tab label rendering.
- Do not derive tab labels from player hands, secret cards, pending selections, or action history.
- Active state may indicate only which section is open, not gameplay content.
