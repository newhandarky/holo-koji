# 221–229 Diagnostics 輔助時序分流紀錄

## 目前狀態

- Branch: `221-229-frontend-diagnostics-assisted-timing-fixes`
- Source baseline：已合併 `212-220 frontend playtest timing readiness` 的 `main`
- Diagnostics 回報：尚未收到
- Production timing change：未變更
- Server source change：未變更
- 230–238 執行紀錄：`specs/230-238-diagnostics-guided-playtest-timing-fixes/execution-log.md`

## Baseline 驗證

以下 focused checks 已在未修改 production code 前通過：

```bash
CI=1 npm test -- --watchAll=false src/pages/GameRoom/useGameRoomOpeningPresentation.test.ts src/pages/GameRoom/useGameRoomDrawPresentation.test.ts src/pages/GameRoom/index.test.tsx
CI=1 npm test -- --watchAll=false src/hooks/useWebSocketEventRuntime.test.tsx src/hooks/useWebSocket.test.tsx src/services/websocket.test.ts
CI=1 npm test -- --watchAll=false src/pages/Diagnostics/index.test.tsx
```

已確認的自動保障：

- Opening / draw presentation timing guards 目前通過。
- WebSocket reconnect 與 session-token regression tests 目前通過。
- Diagnostics 試玩確認清單可正常顯示與複製，且不包含敏感欄位。

## 分流規則

沒有具體 Diagnostics 回報或可重現 regression 前，不調整動畫時機。收到回報後，先歸類到一個主要 bucket：

| Bucket | 症狀 | 第一個測試入口 |
| --- | --- | --- |
| Opening | opening deal 提早啟動、重播，或 opening hand reveal 阻擋時機錯誤 | `src/pages/GameRoom/useGameRoomOpeningPresentation.test.ts` |
| Draw | draw toast 插入必要流程、消失或重複出現 | `src/pages/GameRoom/useGameRoomDrawPresentation.test.ts` |
| Ready/Reconnect | ready sheet 殘留、重複 join、stale token 或 reconnect 錯誤 | `src/hooks/useWebSocketEventRuntime.test.tsx` |
| Pending Interaction | gift / competition modal 干擾安全抽牌提示 | `src/pages/GameRoom/index.test.tsx` |

## 下一次回報接收

只有在無法從使用者描述判斷分類時，才要求補 Diagnostics 複製清單或截圖。最小可用回報格式：

```text
問題分類：
發生畫面：
最小重現步驟：
預期時序：
實際時序：
```

若回報指向 hidden-state 外洩、session/auth 錯亂、重複加入房間或遊戲流程卡死，優先視為 hotfix，不繼續一般重構。

## 230–238 Baseline Update

230–238 已再次執行 frontend timing / reconnect / Diagnostics focused checks，未發現可自動重現的 timing regression。因尚未收到實際 Diagnostics 試玩回報，仍不調整 production timing 行為。
