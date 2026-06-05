# 212–220 前端時序試玩回報模板

## 基本資訊

- 日期：
- 測試方式：NPC / online 雙人 / 重整重連 / 再來一場
- 瀏覽器與裝置：
- 房間模式：random / custom
- 角色組合：
- NPC 難度：
- 是否發生 reconnect：

## 房間與順序確認

- 建房 / 加房是否成功：
- 是否看到重複 join 或 `PLAYER_ID_TAKEN`：
- session token 是否成功恢復：
- order decision 是否正常開啟：
- 雙方確認前是否提早進入 opening：
- ready sheet 是否在進入 playing 後消失：

## Opening / Draw Timing

- opening deal 是否只播放一次：
- opening deal modal 是否與 ready sheet / order decision 重疊：
- opening hand reveal 是否在 opening deal 完成後才出現：
- opening hand reveal 期間是否阻擋互動：
- 自己抽牌通知是否被必要流程延後：
- 對手抽牌 toast 是否被必要流程延後：
- flow 結束後 draw toast / hand flip 是否仍依序出現：

## Pending Interaction / Round / End

- gift / competition pending modal 是否遮住必要提示：
- pending interaction 期間對手安全抽牌 toast 是否仍可接受：
- round summary 是否蓋過 draw toast：
- round summary 結束後是否有通知殘留：
- end sheet / rematch / return lobby 是否正常：

## 安全與 Diagnostics

- 是否看到對手手牌 id 或圖：
- 是否看到 removed card 真值：
- 是否看到 secret cards 真值：
- diagnostics 是否出現 token / LINE profile / hidden card id：
- console 是否出現未預期 error：

## 問題描述

- 發生步驟：
- 預期結果：
- 實際結果：
- 是否可重現：
- 是否影響繼續遊玩：
- 建議分類：P0 / P1 / P2 / P3
