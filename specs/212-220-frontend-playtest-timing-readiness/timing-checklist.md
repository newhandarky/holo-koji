# 212–220 Frontend Timing Checklist

## 自動測試應覆蓋

- 順序確認尚未完成時，不啟動 opening deal 或 opening hand reveal。
- ready sheet 顯示中，draw presentation 必須 defer，不消費 draw queue。
- server state 進入 active playing 後，ready status 必須清掉。
- opening deal modal active 時，自抽 notification 與對手 toast 都不得插入。
- opening hand reveal blocking 時，自抽 notification 與對手 toast 都不得插入。
- round summary active 時，draw presentation 必須 defer。
- presentation flow 結束後，draw queue 必須依原本順序繼續處理。
- pending interaction 不額外阻擋 opponent safe toast。
- WebSocket 已 attached 到相同 room/player 時，不重送 `JOIN_ROOM`。
- `PLAYER_ID_TAKEN` 必須清掉 stale session token 並保留既有錯誤文字。

## 需要手動觀察

- opening deal → opening hand reveal → draw notification 的視覺銜接是否自然。
- 手機 viewport 下 modal、bottom sheet、toast 是否互相遮擋。
- online 延遲較高時，order decision / ready sheet / reconnect 的體感是否清楚。
- 再來一場後，上一局的 opening 或 draw presentation 是否殘留。
- pending interaction 與對手 draw toast 是否讓玩家誤解目前可操作狀態。

## 通過標準

- 沒有 hidden state 外洩。
- 沒有卡住或重播的 overlay / modal / toast。
- 沒有 draw queue 被吞掉或重複消費。
- 沒有 reconnect 後重複 join 或 listener cleanup 誤刪。
- UI 文案、DOM class、WebSocket payload、遊戲規則都不因本輪改動而變更。
