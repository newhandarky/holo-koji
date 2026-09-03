# 239–247 前端執行期效能驗收結果

**Date**: 2026-09-03

**Baseline commit**: `56f0a09`（工具鏈固定完成、runtime 優化前）

**Measured implementation commit**: `4eee3b9`

## 量測環境

- macOS arm64，Node.js `22.13.0` arm64。
- Google Chrome `152.0.7977.65`。
- Lighthouse 精確固定為 `12.8.2`；`13.4.1` 要求 Node `>=22.19`，不符合本規格的 Node 版本，因此未使用。
- 本機 production build 由 `serve@14.2.6` 提供；baseline 與目前版本使用相同 Chrome、Lighthouse、節流與伺服器設定。
- 行動模式各執行三次並採中位數；桌機僅對目前版本執行一次 smoke。

## Production bundle

| 資產 | Baseline | 最終 | 差異 |
| --- | ---: | ---: | ---: |
| Lobby 初始 JS gzip | 91.86 kB（原規格紀錄 91.85 kB） | 69.94 kB | -21.92 kB（-23.9%） |
| CSS gzip | 44.08 kB | 44.08 kB | 0 |
| GameRoom async chunk | 無 | 21.91 kB | 已分離 |
| Diagnostics async chunk | 無 | 3.34 kB | 已分離 |
| LINE callback async chunk | 無 | 1.14 kB | 已分離 |

Lobby 初始 JS 降幅超過 15% 驗收門檻。Lobby 保持 eager；沒有加入無條件或意圖式 GameRoom 預取，因現有量測未顯示需要用額外網路工作交換切換延遲。

## Lighthouse 結果

### 行動節流（三次中位數）

| 指標 | Baseline | 最終 | 差異 |
| --- | ---: | ---: | ---: |
| Performance score | 99 | 100 | +1 |
| FCP | 1540 ms | 1053 ms | -487 ms（-31.6%） |
| LCP | 2104 ms | 1803 ms | -301 ms（-14.3%） |
| TBT | 0 ms | 0 ms | 0 |
| CLS | 0 | 0 | 0 |

Baseline 三次 performance score 為 98／99／99；最終三次皆為 100。最終行動分數沒有下降，符合「不得退步超過 2 分」門檻。

### 桌機 smoke

- Performance score 100。
- FCP 284 ms、LCP 404 ms、TBT 0 ms、CLS 0。

### LIFF 首載網路行為

- Baseline Lighthouse network request 包含 `https://static.line-scdn.net/liff/edge/2/sdk.js`。
- 最終一般非 LINE Lobby 的三次量測均沒有 LIFF SDK request。
- Loader 單元測試驗證成功、並行 Promise 去重、失敗移除 script 後可重試，以及 SDK 已存在時不建立 script。
- LINE runtime／profile／invite 測試涵蓋不支援環境、登入與分享 fallback。

## React Profiler 與 paint/composite 決策

| Scripted flow | Commit 數 | actualDuration | baseDuration | 決策 |
| --- | ---: | ---: | ---: | --- |
| WebSocket state update | 1 | 0.410 ms | 0.303 ms | 無非必要 subtree 證據，不修改 |
| focus-section 切換 | 2 | 5.202 ms | 1.849 ms | 符合預期 state/effect 階段，不修改 |
| 抽牌呈現 | 2 | 0.553 ms | 0.480 ms | 無可達 20% 門檻的 render boundary，不修改 |
| 發牌呈現 | 5 | 0.506 ms | 0.631 ms | 符合既有 staged presentation，不修改 |

- 沒有保留 memo boundary、state slice 或 stable callback 修改。
- Trace 沒有證明 filter、backdrop blur、box-shadow 或動畫為可重現 paint/composite 熱點，因此沒有修改 CSS／動畫。
- 固定尺寸圖片補上尺寸、非關鍵 lazy loading 與非同步解碼後，CLS 中位數仍為 0。

## 自動化與瀏覽器驗證

- Focused GameRoom 圖片／流程回歸：3 suites、50 tests 通過。
- LIFF／route 聚焦回歸：7 suites、84 tests 通過。
- 完整測試：75 suites、399 tests 通過。
- `npm run build`：成功。
- 320、375、768、1024、1440：Lobby 掛載、建立／加入控制可見，且無水平溢位。
- `prefers-reduced-motion: reduce`：媒體條件成功套用，Lobby 維持掛載且無水平溢位。
- Suspense fallback 使用 `role="status"` 與 `aria-live="polite"`，不主動移動焦點。

## GitNexus 與變更邊界

- `gitnexus` 只存在於 `devDependencies`，精確版本為 `1.6.9`；production dependency tree 與 bundle 都不包含 GitNexus。
- 最終 full analyze：1,806 nodes、3,851 edges、134 clusters、144 flows。
- Index 已對應 `4eee3b9`；analyze 自動改寫的 `AGENTS.md`、`CLAUDE.md` 與六份 `.claude/skills/gitnexus` 文件已審查並還原。
- `.gitnexus/` 維持 ignored，未提交。
- Runtime 變更沒有修改遊戲規則、WebSocket event／payload、後端、shared types 或 authoritative server state。

## 回退與保留決策

- **保留**：route-level code splitting，因三個 async chunk 成立且首載 JS 降低 23.9%。
- **保留**：LIFF SDK 條件 loader，因一般 Lobby 不再請求 SDK，去重／重試與 fallback 測試通過。
- **保留**：圖片載入提示，因不改視覺結構且 CLS 維持 0。
- **不實作**：React render boundary，因 Profiler 未證明可達 20% 的非必要 render 降幅。
- **不實作**：CSS／動畫降級，因沒有可重現 trace 證據。

## 合併前剩餘事項

- [ ] 使用者以實際 LINE 登入／綁定／邀請／分享環境完成手動確認。
- [ ] 使用者完成 GameRoom、bottom sheet、載入 fallback 與圖片視覺品質的詳細 UI 驗收。

## 非阻擋警告

- Build 顯示 `caniuse-lite` 資料已 8 個月未更新；本 spec 不升級依賴，未執行自動更新。
- `npm install` 報告 64 個既有 audit findings（11 low、17 moderate、33 high、3 critical）；未執行可能造成破壞性升級的 `npm audit fix`，應另開依賴安全維護工作處理。
