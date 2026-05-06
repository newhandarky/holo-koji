# Research: 開局發牌動畫 Modal

## Decision: 使用 027 openingDeal 作為主要動畫來源

**Rationale**: 027 已定義 safe opening progress summary，包含 hidden burn、12 個 facedown deal steps、completion marker、`sequenceId`、`replayable` 與 `status`。它不含卡牌正面資料，符合 028 的 hidden-info 要求。

**Alternatives considered**:
- 使用既有 `DEAL_ANIMATION` event：可相容既有流程，但歷史語意是發牌事件，不如 `openingDeal` 適合重連與 replay lifecycle。
- 前端自行推導 14 個步驟：會降低 server authoritative contract 的一致性，也可能和 confirmed order 不一致。

## Decision: Modal 狀態由前端本地管理，server 不等待動畫完成

**Rationale**: 028 clarified modal 播放期間阻擋後方 UI，但 server 規則狀態不等待動畫。前端本地 modal lifecycle 可以自動關閉、記錄目前頁面已播放 sequence，且不新增 server mutation。

**Alternatives considered**:
- 讓 server 等待 modal 完成：違反 027/028 的 server/UI 解耦。
- 新增 client 完成事件：超出 028 必要範圍，且容易讓 client 影響規則狀態。

## Decision: 重連時依 `openingDeal.replayable` 決定是否從頭播放

**Rationale**: Clarification 指定 replayable 時重連後從頭播放，not replayable 時不強制重播。這與 027 的 opening progress retention contract 一致。

**Alternatives considered**:
- 一律跳過重播：會失去 027 保留 replayable progress 的使用價值。
- 一律重播：可能在首次實際操作後造成過期儀式感，與 not replayable lifecycle 衝突。

## Decision: 使用可替換的預設卡背主題

**Rationale**: 028 需要符合銀座夜間風格的卡背，同時要求後續可替換。以 card-back definition 表示 id、label、style/image source，可集中管理視覺而不觸碰卡牌正面資料。

**Alternatives considered**:
- 直接在 modal 元件寫死 CSS 圖案：短期簡單，但不利主題替換。
- 使用任一現有卡面作為背面：會混淆未揭露資訊，不符合 FR-009/FR-010。

## Decision: Reduced motion 保留流程語意但縮短或直接完成

**Rationale**: Spec 要求 reduced motion 在 2 秒內完成或直接顯示完成狀態。設計上仍要呈現 hidden reserve 與雙方各 6 張背面牌的結果，避免資訊落差。

**Alternatives considered**:
- 完全不顯示 modal：會降低可理解性，也與 SC-005 不一致。
- 播放完整大位移但縮短時間：對 reduced-motion 使用者仍可能不舒適。

## Decision: 028 不遮蔽玩家自己的既有合法手牌

**Rationale**: Clarification 指定 modal 關閉後玩家自己的手牌可照現有合法流程顯示。點擊前遮蔽、拿取手牌與翻面屬 029。

**Alternatives considered**:
- 028 就遮蔽自己的起始手牌：會偷做 029 的核心流程並提高重工風險。
- Modal 後永久停留完成狀態：與自動關閉 clarification 衝突。
