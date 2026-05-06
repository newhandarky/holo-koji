# Research: 權威開局發牌

## Decision: 開局牌務由 server 在 order confirmation 完成後一次性決定

Rationale:
- 專案 constitution 要求 server state 是多人流程的 authoritative source。
- 移除牌與起始手牌都屬 hidden-information 邊界，不能由 client 推導或重建。
- 一次性決定可讓重連、重送與 late confirmation 都回到同一份權威狀態。

Alternatives considered:
- Client 端播放動畫時才要求 server 逐張發牌：會讓 UI timing 影響規則狀態，也讓重連恢復更複雜。
- 每次重連依 sequence 重算開局：會破壞固定牌務，且可能改變移除牌或起始手牌。

## Decision: 發牌順序採先手、後手輪流到各 6 張

Rationale:
- Clarify 已決定採「先手第 1 張、後手第 1 張」輪流模式。
- 輪流 sequence 最容易支援後續逐張發牌動畫，也讓玩家理解發牌公平性。
- 現有 server `prepareRoundState` 也已接近此模型，能降低改動風險。

Alternatives considered:
- 先發完先手 6 張再發後手 6 張：動畫與規則理解較不直覺。
- 先發完後手再發先手：同樣缺乏目前規格依據。

## Decision: 開局進度摘要只包含安全 metadata

Rationale:
- 後續 UI 只需要知道「移除 1 張牌」、「發給哪位玩家」、「第幾張」、「順序」、「是否完成」。
- 不需要也不應傳送 `cardId`、`geishaId`、`boardSlotId`、魅力值、圖片、牌堆剩餘順序或對手手牌內容。
- 這讓動畫 modal 可以安全播放背面牌，不需要碰觸卡面資料。

Alternatives considered:
- 直接傳現有 deal sequence 卡片物件：會洩漏未揭露手牌。
- 只傳完成狀態不傳步驟：安全但無法支援 028 的逐張動畫。

## Decision: Server 規則狀態不等待動畫或未來按鈕

Rationale:
- Clarify 已決定開局牌務完成後 server 即可進入規則可操作狀態。
- 動畫、skip、`拿取手牌` 是 client UI 呈現狀態，不應阻塞多人規則流程。
- 此設計可避免玩家斷線、動畫停住或未按按鈕導致對局卡住。

Alternatives considered:
- 等待雙方動畫完成：需要新增 client ack 與超時處理，且使 server 規則依賴 UI。
- 只等待目前回合玩家：仍會把 UI 決策混入規則流程。

## Decision: 對局中 log/diagnostics 不記錄移除牌真實身分

Rationale:
- 專案 memories 已把 removed card identity 視為 hidden information。
- Runtime log 與 diagnostics 可能被複製、截圖或外部收集，應只保留安全摘要。
- 移除牌身分只在對局結束後可供結算呈現，不應提前出現在任何玩家或診斷可見輸出。

Alternatives considered:
- 只允許 server debug log 記錄：仍會在部署 log 中留下 hidden data。
- 結束後才允許 log 真實身分：可以作為未來 audit 設計，但 027 不需要新增此紀錄需求。

## Decision: 開局進度摘要保留到第一位玩家完成首次實際操作

Rationale:
- Clarify 已決定保留到第一個玩家完成首次實際操作後即可清除或標記不再重播。
- 這足以支援開局動畫、skip 與開局期間重連恢復。
- 第一個實際操作後，介面通常不應再重播開局動畫，避免干擾已開始的對局。

Alternatives considered:
- 保留整局：資料生命週期較長，增加誤用風險。
- 開局完成立即清除：會讓動畫期間重連無法恢復安全進度。

## Decision: 對局結束後透過結算資訊揭露移除牌，UI 改版另行規劃

Rationale:
- Clarify 已決定原則上結束時要在結算畫面呈現移除牌。
- 027 應提供結算流程可取得的資料邊界，但不設計或改版結算畫面。
- 這保持 server contract 與 UI spec 分離，降低本功能範圍。

Alternatives considered:
- 027 直接改結算畫面：超出目前 spec，且使用者已表示結算畫面另有改版計畫。
- 永不揭露移除牌：不符合 clarified 需求。
