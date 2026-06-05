# 160–168 試玩驗收 Checklist

## 自動測試已覆蓋

- GameRoom 在順序確認、ready sheet、opening deal、opening hand reveal、round summary 顯示中，抽牌提示必須延後，不得蓋過必要流程。
- GameRoom flow 解除後，draw queue 不可被丟棄，必須依原順序繼續顯示通知或手牌翻牌。
- Lobby 從邀請連結加入成功後，必須保存 `roomSessionToken` 並導向 `/game/:roomId`。
- WebSocket 已 attached 到相同 `roomId/playerId` 時，不得重送 `JOIN_ROOM`。
- `PLAYER_ID_TAKEN` 必須清掉 stale room session token 並顯示既有安全錯誤文字。

## 之後手動試玩項目

- NPC 房：建立房間後不重複 join，不跳 `PLAYER_ID_TAKEN`，順序確認後能正常進入開局。
- Online 房：雙方都完成順序確認前，不出現 opening deal / opening hand reveal。
- 開局流程：順序確認完成後，畫面順序應為 ready sheet → opening deal → opening hand reveal → 抽牌提示。
- 抽牌提示：開局與回合結算動畫期間不重疊；流程結束後仍會出現，不被吞掉。
- 重整重連：同一房間同一玩家使用 session token 恢復，不會重複 join 或覆蓋其他 listener。
- 回合切換：目前玩家抽牌、對手安全 toast、pending interaction modal 不互相遮蓋。
- 再來一場：ready sheet、order decision、opening presentation 都重新開始，不殘留上一場狀態。

## 手動試玩通過標準

- 沒有 hidden state 外洩：對手手牌、removed card、secret cards、pending choices 不出現在畫面或 diagnostics。
- 沒有卡住的 overlay：ready sheet、opening deal modal、round summary、end sheet 都能正常消失或操作。
- 沒有重複事件：同一抽牌通知不重複播放，同一 opening deal 不重複彈出。
- 錯誤 recovery 不破壞路由：返回大廳時仍保留邀請 room id。
