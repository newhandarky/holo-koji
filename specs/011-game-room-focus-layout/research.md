# Research: Game Room Focus Layout

## Decision 1: Focus state is client-only

**Decision**: 使用前端 React UI state 管理目前聚焦區塊，不新增 server state、Socket.IO event、shared type 或 persistence。

**Rationale**: 聚焦區塊只影響本機玩家視圖，不是遊戲規則或多人同步狀態。放到 server 會增加 realtime contract 與同步風險，且不提供 gameplay correctness 價值。

**Alternatives considered**:

- Server 同步 focus state：拒絕，會把純 UI 狀態升級成多人 contract。
- URL/query persistence：拒絕，當前需求未要求 reload 後保留 focus。

## Decision 2: Exactly one expanded section

**Decision**: 正常遊玩時三個 section 中只能有一個 expanded，其他兩個顯示 collapsed summary。

**Rationale**: 使用者明確要求三區塊聚焦，並避免資訊、角色、手牌同時擠滿畫面。單一 expanded state 能降低 layout 複雜度，也能符合單一 viewport 高度限制。

**Alternatives considered**:

- 允許多區塊同時展開：拒絕，容易回到目前畫面擁擠與捲動問題。
- 允許全部收合：拒絕，會出現沒有主要操作視野的空白狀態。

## Decision 3: Character board is default focus

**Decision**: playable room 初始畫面預設聚焦 `characterBoard`。

**Rationale**: 角色區是目前主要檢視區，使用者要求預設顯示角色區塊；也最適合在非自己回合維持對局狀態理解。

**Alternatives considered**:

- 預設手牌/指令：拒絕，非自己回合會造成操作區過度突出。
- 預設資訊區：拒絕，資訊區是摘要/狀態用途，不是主要遊玩視野。

## Decision 4: Actionable turn auto-focuses hand/actions

**Decision**: 當玩家 newly actionable 且沒有 blocking interaction 時，自動聚焦 `handActions`。

**Rationale**: 輪到自己時，玩家需要立即選牌與送出行動。此規則能降低操作成本，但必須限制觸發時機，避免每次 state update 都搶走使用者焦點。

**Alternatives considered**:

- 永遠不 auto-focus：拒絕，會讓玩家每次輪到自己都要手動切區。
- 每次 current player 是自己都 auto-focus：拒絕，ordinary state update 可能造成焦點跳動。

## Decision 5: Blocking interactions remain overlay-first

**Decision**: draw、gift、competition、order confirmation、ready check、end-round 等阻擋互動維持在 section layout 之上。互動開啟時記錄 previous focus；關閉後恢復 previous focus，除非玩家此時 newly actionable。

**Rationale**: 既有 modal/bottom-sheet 是 gameplay 關鍵操作，不應被 section 高度或 collapsed state 影響。恢復 previous focus 可避免互動結束後視野突變。

**Alternatives considered**:

- 把 blocking interaction 嵌入手牌/指令區：拒絕，會破壞既有 bottom-sheet/modal expectations。
- 關閉後永遠回角色區：拒絕，會覆蓋使用者互動前意圖。

## Decision 6: Collapsed summaries expose only safe status/counts

**Decision**: collapsed summary 僅顯示 round/current player/turn state/hand count/action count 等狀態與數量，不顯示 card identity、card thumbnail、secret selections、opponent hidden details。

**Rationale**: collapsed state 是新增資訊露出位置，必須避免把 hidden information 透過摘要傳出去。用安全摘要資料而非完整 card objects 作為 summary input，可降低誤用。

**Alternatives considered**:

- 顯示小縮圖提示：拒絕，可能洩漏手牌或秘密選擇。
- 顯示詳細 action/card list：拒絕，違反 summary-only 與 hidden-info 邊界。

## Decision 7: Viewport-bounded layout with section-local overflow

**Decision**: 主要 game room container 維持單一 viewport 高度；expanded section 內容若超出高度，僅在該 section 內部捲動。

**Rationale**: 使用者要求避免 whole-page vertical scroll。section-local overflow 能讓角色/手牌內容保持可操作，同時避免整頁跑版。

**Alternatives considered**:

- 保留整頁 scroll：拒絕，違反需求。
- 強制縮小全部內容無內部 scroll：拒絕，可能讓卡牌與按鈕小到不可用。

## Decision 8: Short transitions with reduced-motion support

**Decision**: section 切換使用短 expand/collapse transition；在 reduced-motion 偏好下移除或大幅縮短動畫。

**Rationale**: 短動畫能幫助玩家理解焦點變化，但不能阻礙選牌或送出行動。尊重 reduced motion 可避免不必要動態負擔。

**Alternatives considered**:

- 無動畫：可行但方向感較弱。
- 長動畫/華麗轉場：拒絕，會延遲 gameplay 操作。
