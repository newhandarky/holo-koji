# Typing Escape Hatch Notes

日期：2026-06-04

## 目標

本輪 142–144 的目標不是消滅所有測試環境中的 `any` 字串，而是把 production diagnostics / logger 的未知輸入收斂成明確 boundary，並記錄仍保留 escape hatch 的原因。

## 已收斂項目

- `src/utils/runtimeLogger.ts` 不再用 `any` 讀取 WebSocket message 或 game state summary。
- `summarizeSocketMessage()` 與 `summarizeGameState()` 改用 structural unknown input、safe record helper 與窄化存取。
- `src/pages/GameRoom/gameRoomTestHarness.tsx` 已型別化 mock game state、player、card、action token、hook state 與 mocked `GameBoard` props。
- `src/pages/GameRoom/index.test.tsx` 不再需要高頻 `mockState as any` 或 player cast。

## 仍保留的 escape hatch

- `src/utils/lineLiffTypes.ts` 的 `window.liff?: any`：
  - LINE LIFF SDK 是 runtime 注入的 global object，測試與 production 只在 `lineLiff*` boundary 使用。
  - 不把完整 SDK shape 複製到專案內，避免本地型別與實際 SDK drift。

- Jest matcher 形式的 `expect.any(Function)` / `expect.any(Object)`：
  - 這不是 TypeScript escape hatch，而是 assertion matcher。
  - 保留在 test harness 與 response queue tests 中，用來確認 listener registration / callback payload shape。

- 少數 focused hook tests 的 fixture cast：
  - `useGameRoomPlayers.test.ts` 與 `useGameRoomOpeningPresentation.test.ts` 使用局部 fixture cast 來建立最小狀態。
  - 這些 cast 沒有進入 production code，也沒有擴散到大型整合測試主體。
  - 若未來這些 hook 再變複雜，應優先抽 shared fixture factory，而不是在每個案例內增加更重的泛型。

## 掃描摘要

執行：

```bash
rg -n "@ts-ignore|@ts-expect-error|\\bany\\b" src server -g "*.ts" -g "*.tsx" -g "!server/dist/**" -g "!server/node_modules/**"
```

結果摘要：

- `@ts-ignore`：0 筆。
- `@ts-expect-error`：0 筆。
- `any` 字串命中：20 筆。
- 其中 14 筆為 Jest matcher `expect.any(...)`。
- 其中 5 筆為 focused hook test fixture cast。
- 其中 1 筆為 LIFF SDK global boundary。

## 後續規則

- 新增 production `any` 時必須先確認是否可用 `unknown` + narrow helper 表達。
- 若保留 `any`，應集中在外部 SDK、測試 harness 或 diagnostics boundary，並在同一層加入原因註記或測試。
- 不為了消除測試 fixture cast 而引入比測試本身更難讀的型別樣板。
