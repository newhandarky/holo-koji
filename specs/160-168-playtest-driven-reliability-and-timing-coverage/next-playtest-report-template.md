# 168 下一輪試玩回報模板

## 基本資訊

- 日期：
- 測試方式：NPC / online 雙人 / 重整重連 / 再來一場
- 瀏覽器與裝置：
- 房間模式：random / custom、角色組合：

## 觀察到的問題

- 發生步驟：
- 預期結果：
- 實際結果：
- 是否可重現：
- 是否有 console error：
- 是否影響繼續遊玩：

## Timing / Animation 重點

- 問題出現在：順序確認 / ready sheet / opening deal / opening hand / 抽牌提示 / round summary / pending interaction / end sheet
- 是否有 overlay 重疊：
- 是否有通知被吞掉：
- 是否有同一動畫重播：

## 安全狀態檢查

- 是否看到對手手牌 id 或圖：
- 是否看到 removed card 真值：
- 是否看到 secret cards 真值：
- diagnostics 是否出現 token、LINE profile、hidden card id：

## 建議分類

- P0/P1：遊戲無法繼續、安全資訊外洩、房間/session 錯亂。
- P2：動畫時序、重連體驗、錯誤 recovery、測試缺口。
- P3：文案、視覺 polish、日後重構。
