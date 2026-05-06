# Research: Snapshot And Contract Hardening

## Decision 1: Snapshot restore 採嚴格拒絕策略，不做 fallback 或部分修復

- Decision: 當 snapshot 的 `geishaSet` 非法、已移除、目前不可用，或 board 與 set 不一致時，直接拒絕 restore，並要求使用者重新建立房間。
- Rationale: 這是最一致的 contract。若嘗試 fallback 到 `default`、保留半成品 room shell，或只修補部分資料，會讓 host / joiner 看到不同 room identity，並增加 hidden-state 與 state desync 風險。
- Alternatives considered:
  - fallback 到 Ginza：會掩蓋資料錯誤，且可能讓 restore 後畫面與原 room 不一致。
  - 保留房間外殼但清空對局：會留下不完整 room state，增加後續狀態分支。
  - 自動修補 board：會把資料驗證邊界變成隱性資料重寫，風險高。

## Decision 2: Snapshot 一致性檢查要驗證 7 位角色全部屬於同一 `geishaSet`

- Decision: restore 時不只檢查 room-level `geishaSet` 合法，還要驗證 snapshot 中 7 位角色都屬於該 set，且不得缺少、重複補位、或混入其他 set。
- Rationale: room-level key 單獨合法並不足以保證 snapshot 可安全還原。真正會破壞 match correctness 的，是 board 角色內容與 room-level set identity 脫鉤。
- Alternatives considered:
  - 只檢查 `geishaSet` 合法值：無法阻止 cross-set board data 混入。
  - 驗證更細的固定排序：超出 spec 需求，因為角色位置本來就是依選組後填入，不要求 snapshot 角色順序映射到固定 roster 順序。

## Decision 3: room lifecycle contract 必須覆蓋 waiting room、active game、rematch、restore

- Decision: 018 不只處理 restore reject case，也明確要求同一 room 在 waiting room、active gameplay、unresolved next round、rematch、restore 後保持同一個 room-level set identity。
- Rationale: 若只驗 reject case，實作容易遺漏 waiting-state 或 rematch path 的 contract drift。這個 feature 的核心是 lifecycle hardening，不只是 restore guard。
- Alternatives considered:
  - 只驗 restore 路徑：無法完整覆蓋 room contract 漂移。
  - 把 waiting room 排除：會留下 host / joiner 在進房前後看到不同 set identity 的風險。

## Decision 4: restore failure 訊息保持簡單，不暴露技術細節

- Decision: 前端顯示「房間資料無效，請重新建立對戰」這類簡潔訊息，不直接暴露 snapshot schema、invalid set key、board mismatch 等技術原因。
- Rationale: 這符合產品語言，也可避免讓一般玩家接觸內部資料模型細節。詳細原因應保留在開發者可控的 log / test 中，而不是玩家訊息中。
- Alternatives considered:
  - 顯示中等原因：雖然可讀性較高，但仍會讓產品文案與資料契約耦合。
  - 顯示完整技術錯誤：不符合玩家導向，也可能暴露內部結構。

## Decision 5: hidden-state hardening 以既有 player-visible state contract 為主，不新增新的 reveal surface

- Decision: 018 應審查 create / restore / resend / rematch 時的 player-visible state，確認新增 set validation 與 restore contract 後，仍不會外洩 opponent hand、secret cards、pending choices。
- Rationale: snapshot hardening 很容易在錯誤處理或 room rebuild 時把完整 state 直接送回 client。這是比 UI 細節更高風險的 correctness / privacy 問題。
- Alternatives considered:
  - 僅驗證 set correctness，不審查 hidden state：風險過高，因為 restore/rebuild path 直接接觸完整 state。
  - 另開 spec 再看 hidden state：會讓 018 的 contract hardening 不完整。

## Decision 6: shared type / producer-consumer contract 以同一組 supported keys 為基礎

- Decision: 規劃上要檢查 frontend、server、shared types 對 supported set keys 的理解是否一致，尤其是 room creation、waiting state、restore result、game state 的 `geishaSet` 欄位。
- Rationale: 若 shared types 與 runtime validation 漂移，即使 restore guard 正確，consumer 端仍可能 default-normalize 或忽略非 `default` 值。
- Alternatives considered:
  - 只檢 server：無法防止 frontend 把非 default 值縮回 default。
  - 只檢 shared types：無法保證 runtime rejection 正確。
