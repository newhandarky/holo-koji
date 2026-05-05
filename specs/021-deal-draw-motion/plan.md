# Implementation Plan: Deal And Draw Motion Refresh

**Branch**: `021-deal-draw-motion`  
**Date**: 2026-05-05  
**Spec**: [spec.md](/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/021-deal-draw-motion/spec.md)

## Summary

在不改變 server authoritative 規則與房間同步契約的前提下，重新接回開局發牌與抽牌進手牌的視覺提示。技術上沿用既有 `DEAL_ANIMATION` 事件、`CARD_DRAWN` 事件與 `gameMotion`/`PlayerHand` 結構，補上「雙方可見的開局交替發牌」、「持牌玩家可見的短暫抽牌進手牌提示」以及「Reduced motion 替代呈現」。同時將操作鎖定與動畫生命週期綁定在開局主要提示完成前，避免玩家過早操作。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`

**Primary Touchpoints**:
- `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/pages/GameRoom/index.tsx`
- `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/gameMotion.ts`
- `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/PlayerHand.tsx`
- `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`
- `/Users/zhangzhipeng/MyProject/hanamikoji-game/server/index.js`
- `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/hooks/useWebSocket.ts`

## Constitution Check

- Game rule correctness: Pass
- Shared state integrity: Pass
- Explicit realtime contracts: Pass
- Mobile-first playability: Pass
- Verifiable delivery: Pass

## Project Structure

```text
src/
  components/game/
  hooks/
  pages/GameRoom/
server/
game-shared-types/
specs/021-deal-draw-motion/
```

## Phase 0 - Research

- 沿用既有 `DEAL_ANIMATION.sequence` server payload，不新增新的 socket event 或 payload shape。
- 開局發牌做成 room-visible cue：server 已對每位 viewer 建立遮蔽版 sequence，前端只需依 viewer 自己的 sequence 渲染上下交替發牌節奏。
- 抽牌沿用既有 `CARD_DRAWN` 與 `createDrawMotionCue`，但把提示縮短為非常短的進手牌 cue，不保留長尾「新卡」標記。
- Reduced motion 直接沿用現有 `prefersReducedMotion` 檢測與較短 duration，改以 opacity / glow / short emphasis 為主，不做大幅位移。
- 開局可操作鎖定不交由 server 新增 phase，而是在前端以既有 interaction lock 基礎增加「deal cue 未完成」條件。

## Phase 1 - Design

### UI / Motion Flow

1. 房間開始或下一輪開始時，server 照常送出 `DEAL_ANIMATION.sequence`。
2. 前端建立「開局發牌 cue state」：
   - 依 sequence 順序短暫播放
   - 用 local player 在下、opponent 在上的對應方向呈現
   - 呈現上下 / 下上交替節奏
3. 開局主要提示完成前，玩家不可操作。
4. 提示完成後，解除鎖定並進入正常遊戲。
5. 抽牌事件到來時：
   - 只有實際持牌玩家看到短暫新卡加入 cue
   - 其他玩家只接收既有遮蔽同步，不做完整手牌進場動畫
6. 卡牌從手牌移除時：
   - 雙方都看到移除狀態變化
   - 但不新增會暴露卡面內容的資訊

### State Strategy

- 不新增 server-side persistent gameplay state。
- 前端在 `GameRoom` 內新增短生命週期的 deal-motion state，僅用於控制：
  - active opening sequence
  - cue completion
  - interaction unlock timing
- `PlayerHand` 延續既有 focus/selection 狀態，不改選牌資料結構。

### Styling Strategy

- 優先擴充既有 `.item-card--motion-draw`、`.item-card__motion-glow`、`.player-hand-row` 系列樣式。
- 如果需要 opponent-side deal cue，增加對應的非互動式 motion token/ghost card 樣式，而不是重做整個 board layout。
- Reduced motion 只調 duration、transform 與 emphasis 強度，不建立第二套獨立 DOM 流程。

### Server / Contract Strategy

- 保持 `DEAL_ANIMATION` 與 `CARD_DRAWN` 原事件名不變。
- 保持 `buildDealSequenceForPlayer()` 的 viewer masking 規則。
- 如需補足前端可靠渲染所需欄位，只能在既有 payload 內做向後相容的補充，避免擴大 contract 風險。

## Phase 2 - Task Planning

- 先從現有 `DEAL_ANIMATION` 與 `CARD_DRAWN` 路徑做 focused integration，不把 021 擴成 full motion redesign。
- 任務應至少拆成：
  - 現況盤點與 contract audit
  - 開局發牌 cue state 與操作鎖定
  - 抽牌 cue 收斂
  - Reduced motion 與樣式
  - focused tests 與手動驗收
- 測試重點：
  - 新局 / 下一輪都能觸發 opening cue
  - draw cue 只對持牌玩家顯示
  - interaction lock 會在 cue 後解除
  - room sync / turn flow 無回歸

## Risks

- 開局動畫與既有房間狀態同步時序可能競爭，若 cue state 綁錯時機，容易導致過早解鎖或重複播放。
- 扇形手牌已經有 focus/selection/motion class，若樣式疊加不當，可能造成新卡 cue 被現有 focus 邏輯吃掉。
- 雙方可見的發牌與移除提示若直接共用手牌 DOM，可能不小心碰到 hidden information 邊界；應優先使用 viewer-safe sequence 或狀態提示，而不是直接共享真實卡面。
