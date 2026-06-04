# Release Readiness Checklist

日期：2026-06-04

## 自動驗證

- [ ] `CI=1 npm test -- --watchAll=false`
- [ ] `npm run build`
- [ ] `cd server && npm test`
- [ ] `cd server && npm run verify:deploy`
- [ ] root 工作樹乾淨。
- [ ] `server/` 工作樹乾淨。

## Render Health

- [ ] 最新 server commit 已推送並完成 Render deploy。
- [ ] `curl -fsSL https://holo-koji-server.onrender.com/health` 回傳 production `ok`。
- [ ] 若 Render health 失敗，先停止 release，回到 backend deploy / runtime log 查核，不混入 frontend closeout。

## 手動 UI Review

細部視覺驗收由使用者負責。Agent 只需回報尚未人工確認的殘餘項目。

- [ ] Lobby：建立房間、加入房間、邀請房號預填、custom selection、NPC mode。
- [ ] Lobby：LINE account bound / unbound、成就列表、新解鎖提示、錯誤 recovery。
- [ ] GameRoom waiting：房號顯示、複製、LINE 邀請、返回大廳。
- [ ] GameRoom opening：開局發牌 modal、拿取手牌、reduced motion、hidden-state 不外洩。
- [ ] GameRoom gameplay：四個 action command、pending interaction modal、draw notification、round summary。
- [ ] GameRoom end flow：ready sheet、end sheet、rematch、返回大廳。
- [ ] mobile viewport：主要 bottom sheet、手牌、board coverflow、Lobby play controls 沒有文字重疊。

## 風險檢查

- [ ] Hidden-state：前端只顯示 server viewer-safe state，不推斷對手手牌、secret cards、removed card 真值。
- [ ] Server authoritative：turn gate、action availability、card ownership、pending interaction 仍由後端驗證。
- [ ] Session：room session token 失效時會清 stale token，未授權同名玩家不能接管座位。
- [ ] Reconnect：房間 snapshot restore 後仍投影正確玩家視角。
- [ ] Account：前端不信任 `lineUserId`，account sync 只經由 verified identity / server response 更新 UI。
- [ ] Achievement：status / ack response queue 保持序列化，不互相清掉 listener。
- [ ] Diagnostics：不輸出 token、raw LINE profile、hidden cards 或 removed card identity。

## Known Non-Goals

- 不新增遊戲功能。
- 不修改 WebSocket event name 或 payload shape。
- 不修改 shared package version。
- 不修改 server 遊戲規則。
- 不修改 Render 設定。
- 不修改 root / server package version。
- 不把所有 compatibility barrel 清零。
- 不把所有測試 fixture cast 強行改成完整 production type。

## 告一段落標準

- 自動驗證與 Render health 都通過。
- 沒有已知 P0 / P1：hidden info leak、authoritative bypass、session/auth bypass、production crash、deploy regression。
- 大型整合測試已完成 harness closeout，後續維護不再被重複 setup 阻礙。
- README、CHANGELOG、typing notes、release checklist 已能說明目前架構與驗證方式。
