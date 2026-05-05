# Quickstart: Deal And Draw Motion Refresh

## Prerequisites

- 前端依賴已安裝
- 本地 server 可啟動並可建立房間
- 建議同時準備：
  - 一場線上雙人房
  - 一場 NPC 房

## Automated Validation

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual Review

### Opening deal
1. 建立一場新對戰
2. 確認開局時不是整批手牌瞬間出現
3. 確認雙方都能感知交替發牌節奏
4. 確認 local player hand 以房間既有上下方向顯示
5. 確認開局主要提示完成前不可操作，完成後才解鎖

### Draw arrival
1. 進行一個會觸發抽牌的回合
2. 確認持牌玩家能看到新卡短暫加入 cue
3. 確認 cue 很短，之後立刻回到普通手牌狀態
4. 確認非持牌玩家看不到對手完整新卡進場細節

### Reduced motion
1. 開啟系統 reduced motion 偏好
2. 重新進入對戰
3. 確認仍能辨識發牌與抽牌有發生
4. 確認沒有大幅位移

### Regression
1. 確認發牌與抽牌後的手牌內容、手牌數量與可操作性正確
2. 確認房主、joiner、NPC 房都沒有因動畫導致回合同步錯亂
3. 確認下一輪重新發牌時也會套用同樣 opening cue
4. 確認卡牌離開手牌時雙方都能感知移除提示，且提示不顯示被移除卡牌的卡面或額外身份資訊

## Residual Manual Review

- 021 的最終動畫節奏、可讀性與 reduced motion 體感仍由使用者手動驗收。
- 代理已覆蓋自動化與 contract 邊界；未執行瀏覽器逐畫面視覺驗收。
