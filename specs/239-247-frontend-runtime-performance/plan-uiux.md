# 239–247 UI／UX 效能維護計畫

## 介面目標與使用情境

- 一般使用者進入 Lobby 時更快看到可操作內容，且不下載 GameRoom、Diagnostics、LINE callback 或 LIFF SDK 的非必要程式。
- 建立／加入房間後能平順進入 GameRoom；chunk 載入期間有可感知但不搶焦點的狀態訊息。
- WebSocket 更新、抽牌、發牌與 focus-section 切換時減少無關 subtree render，但不改遊戲時序與資訊揭露。
- 低階行動裝置上維持現有視覺語言、bottom sheet 與 reduced-motion 行為。

## 資訊架構與畫面區塊

- **Lobby**：維持 eager，作為首載核心體驗。
- **GameRoom**：lazy route；只有進房後才載入。
- **Diagnostics**：lazy route；只有進入診斷頁才載入。
- **LINE callback**：lazy route；只有 callback route 才載入。
- **Suspense fallback**：位於 route outlet 周圍，呈現簡短載入狀態，不覆蓋或假造遊戲資訊。

## 元件層級拆分原則

- 不重新設計公開 component API，不新增大量 boolean props。
- route boundary 只負責 code splitting 與狀態語意。
- render boundary 必須來自 profiler 證據，且以最小 memoized subtree 為單位。
- state 維持靠近使用位置；不將 WebSocket 或 hidden state 搬入新 global store。

## 狀態矩陣

| 狀態 | 預期行為 |
| --- | --- |
| default | Lobby 立即可用，不請求非必要 route chunk 或 LIFF SDK。 |
| loading | lazy route 顯示 `role="status"` 的簡短載入訊息，不自動移動焦點。 |
| empty | 沿用既有 Lobby／GameRoom 空狀態，不因效能修改改變文案或操作。 |
| error | 保留 route、LINE、邀請、clipboard 與 Diagnostics 現有錯誤／fallback。 |
| disabled | 保留按鈕禁用與 server-authoritative 狀態，不做 optimistic gameplay。 |
| mobile | 維持 bottom sheet、safe spacing 與可觸控區域；不因 lazy fallback 產生水平捲動。 |
| reduced-motion | 維持或加強 `prefers-reduced-motion`，不得為量測改善移除必要狀態回饋。 |

## 使用者互動規則

- **click / touch**：建立、加入、登入、綁定、分享與邀請行為不變。
- **hover**：不以 hover 作為手機必需流程；預取預設關閉。
- **focus**：所有既有互動元素保持可聚焦；lazy fallback 不搶焦點。
- **keyboard**：Tab、Enter、Space 與 modal／bottom-sheet 焦點行為不變。
- **screen reader**：載入狀態使用 `role="status"`；不朗讀 hidden information 或 profiler 細節。

## Responsive 規則

- 320／375：確認 Lobby、fallback、GameRoom bottom sheet 無橫向溢位或操作遮蔽。
- 768：確認 tablet 版資訊層級與 sheet 定位。
- 1024／1440：確認 desktop layout、焦點順序與非首屏 chunk 導航。
- 所有尺寸確認圖片固定尺寸不造成 CLS，且 lazy loading 不延遲首屏必要圖片。

## 視覺不變原則

- 不調整色彩、字體、間距、圓角或陰影，除非 trace 證明該效果造成 paint/composite 熱點。
- 即使 trace 證明需要降低效果，也只做最小調整並交由使用者確認視覺品質。
- 不改 Lobby eager 畫面結構，不重做 GameRoom 或 bottom sheet。

## 視覺與效能驗證重點

- fallback 出現與消失沒有 layout jump、焦點遺失或重複朗讀。
- LINE 非支援環境不顯示新的 console error 或永久 loading。
- 圖片尺寸與 decoding 設定不造成變形、模糊或首屏延遲。
- WebSocket／抽牌／發牌動畫時序與 visible/hidden card 邊界不變。
- reduced-motion 不新增過場動畫，且關鍵狀態仍可辨識。

## 驗證清單

- [ ] 320px 最小 smoke。
- [ ] 375px 最小 smoke。
- [ ] 768px 最小 smoke。
- [ ] 1024px 最小 smoke。
- [ ] 1440px 最小 smoke。
- [ ] `prefers-reduced-motion: reduce` smoke。
- [ ] keyboard focus 與 screen reader status 語意檢查。
- [ ] 使用者完成詳細 UI 視覺品質驗收。

> 本 repo 沒有 Storybook；因此不建立 Storybook 展示矩陣，以既有 Jest integration tests、production build 與上述瀏覽器 smoke 取代。
