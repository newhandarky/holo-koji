# Contract: Deal And Draw Motion Refresh

## Existing Realtime Inputs Reused

021 不新增新的 socket event 名稱，沿用既有事件：

- `DEAL_ANIMATION`
- `CARD_DRAWN`
- `GAME_STATE_UPDATED`

## `DEAL_ANIMATION` Usage Contract

### Event

`DEAL_ANIMATION`

### Payload Shape

```ts
{
  sequence: Array<{
    order: number;
    playerId: string;
    card: ItemCard;
  }>;
}
```

### 021 Expectations

- 前端必須使用 `sequence.order` 呈現發牌順序。
- 前端必須依 viewer 視角把 local player 對應到下方、opponent 對應到上方。
- 前端必須表達上下 / 下上交替的發牌節奏。
- viewer 收到的 `card` 可能是 masked card；前端不得嘗試從 masked 資料推回真實卡面。
- opening deal cue 完成前，前端必須維持不可操作狀態。

## `CARD_DRAWN` Usage Contract

### Event

`CARD_DRAWN`

### Payload Shape

```ts
{
  playerId: string;
  card: ItemCard;
}
```

### 021 Expectations

- 若 `playerId === currentPlayerId` 且 `card` 為真實卡，前端顯示短暫 draw arrival cue。
- 若 viewer 不是持牌玩家，前端不得顯示完整新卡進場動畫。
- draw cue 必須在短時間內自動結束，結束後回到普通手牌狀態。

## Public-Safe Motion Boundary

021 若加入「卡牌移除」提示，必須符合以下約束：

- 雙方都可以感知有牌離開手牌
- 不得因移除 cue 暴露 hidden card identity
- 不得改變 authoritative hand contents、turn order 或 pending interaction correctness
- 前端移除 cue 只能依 hand-count delta 與 owner/source zone 建立，不得攜帶 `cardId`、`geishaId` 或卡面圖

## Reduced Motion Contract

- reduced motion 不移除狀態提示本身
- reduced motion 只弱化 movement intensity、duration 與 visual emphasis
- reduced motion 仍須讓玩家看得出：
  - opening deal 正在進行
  - draw arrival 已發生
