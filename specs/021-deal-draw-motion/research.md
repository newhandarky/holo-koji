# Research: Deal And Draw Motion Refresh

## Decision 1: 沿用既有 `DEAL_ANIMATION` contract，不新增新事件

**Decision**: 開局發牌與下一輪發牌都沿用既有 `DEAL_ANIMATION` 事件與 `sequence` payload，不新增新的 socket event 名稱。

**Rationale**: server 已在 `prepareRoundState()` 建立 `dealSequence`，並在 `startGameWithOrder()` 與 `startNextRound()` 送出 viewer-specific sequence。這已經提供 021 所需的核心資料，而且每位 viewer 看到的對手牌面已被遮蔽，符合 hidden information 邊界。

**Alternatives considered**:
- 新增新的 `OPENING_HAND_MOTION` event：沒有必要，會增加 client/server contract 成本。
- 完全不依賴 server sequence、只靠 client 比對 state：會失去交替順序與 viewer-specific masking 的可靠來源。

## Decision 2: 開局發牌操作鎖定由前端短生命週期 state 控制

**Decision**: 不新增 server phase；前端在 `GameRoom` 以 local motion state 暫時延長 interaction lock，直到 opening-deal primary cue 完成。

**Rationale**: server already defines the real playable state. 021 的需求是「看完主要提示再操作」，這屬於顯示層節奏問題，不應為此改變 authoritative game phase。只要 lock 時間短且 deterministic，就能兼顧可讀性與規則正確性。

**Alternatives considered**:
- 新增 server-side opening animation phase：成本高，且會把純 UI cue 拉進規則 contract。
- 完全不鎖定：不符合已確認需求，玩家可能在還沒看完初始牌時就開始操作。

## Decision 3: 抽牌 cue 保持非常短，不保留新卡長尾標記

**Decision**: 抽牌只做短暫加入 cue，完成後立即回到普通手牌狀態。

**Rationale**: 使用者已明確確認這個遊戲不需要長時間強調新舊卡差異。既有 `drawHighlightCardId` / `highlightActive` 與 `createDrawMotionCue()` 已可支援短 cue，不必新增長尾 badge 或 persistent marker。

**Alternatives considered**:
- 保留直到下一次操作：辨識性更強，但會干擾扇形手牌選牌。
- 幾乎無提示：會讓抽牌存在感不足，不符合 spec 目標。

## Decision 4: Reduced motion 使用現有偏好檢測與弱化樣式

**Decision**: 沿用 `usePrefersReducedMotion()`，以較短 duration、較小 transform、opacity/glow emphasis 取代大幅位移。

**Rationale**: repo 已有 reduced-motion 設計基礎與 motion cue duration 分流。重用現有模式最穩，也較容易寫 focused regression tests。

**Alternatives considered**:
- 完全禁用動作：不符合需求，因為 reduced motion 仍要可辨識狀態變化。
- 為 reduced motion 建第二套邏輯：複雜度不必要地提高。

## Decision 5: 雙方可見的 card-removal cue 以「狀態變化提示」為主

**Decision**: 若 021 實作卡牌移除提示，應以雙方都能看懂「有牌被移除」為主，不新增會暴露真實卡面來源的 cue。

**Rationale**: 使用者要求雙方都要看到卡牌移除動畫，但同時不能破壞 hidden-information 邊界。因此這部分應偏向 zone-level 或 count-level 的 movement cue，而不是真實卡面跨區飛行。

**Alternatives considered**:
- 直接顯示真實被移除卡面：高風險，可能外洩隱藏資訊。
- 完全不做移除提示：不符合已確認需求。
