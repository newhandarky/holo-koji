# Implementation Plan: 權威開局發牌

**Branch**: `027-server-authoritative-opening-deal`  
**Date**: 2026-05-06  
**Spec**: [spec.md](./spec.md)

## Summary

將開局牌務固定為 server authoritative contract：雙方完成先後順序確認後，server 以已確認的 player order 建立本局牌務，先移除 1 張隱藏牌，再以先手第 1 張、後手第 1 張的輪流順序分配雙方各 6 張起始手牌。玩家可見狀態與開局進度摘要只提供安全資訊，不包含移除牌、對手手牌、牌堆或任何未揭露卡面身分。

此功能主要強化後端狀態、shared type contract、state shaping 與測試；前端只需能消費安全摘要與維持現有畫面相容。開局動畫 modal、卡背、`拿取手牌`、skip UI、結算畫面改版都不在此 spec 實作，但本功能要保證後續 UI 可以安全取得必要資訊：開局進度摘要保留到第一位玩家完成首次實際操作，對局結束後結算流程可取得移除牌身分。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO/WebSocket server in `server/index.js`  
**Shared Types**: `game-shared-types` plus frontend local declarations in `src/types/`  
**Package Manager**: npm  
**Primary Risk Surface**: order-confirmation completion, round setup, removed-card visibility, per-viewer game-state shaping, reconnect/resend path, runtime logging, end-of-game summary data, NPC/online parity  
**Validation**: `npm --prefix server test`, `CI=1 npm test -- --watchAll=false`, `npm run build`  
**Unknowns**: None. Clarify resolved dealing order, removed-card end visibility, server/UI animation decoupling, log safety, and opening progress retention.

## Constitution Check

- Game rule correctness: Pass. 規格明確維持 21 張牌、移除 1 張、雙方各 6 張起始手牌、牌堆剩餘 8 張，並要求重連不重算。
- Shared state integrity: Pass. 移除牌、起始手牌與開局進度均由 server 狀態決定；client 只消費 per-viewer 安全狀態。
- Explicit realtime contracts: Pass. 本 plan 產出 contract 文件，定義 game-state visibility、opening progress summary、GAME_STARTED/更新事件承載規則與結算揭露邊界。
- Mobile-first playability: Pass. 027 不改手機版 layout 或 bottom-sheet 互動；動畫與拿取手牌留給後續 spec。
- Verifiable delivery: Pass. quickstart 定義 server tests、frontend tests 與 build 驗證。

## Project Structure

```text
server/
  index.js
  utils/gameUtils.js
  utils/gameUtils.test.js
  utils/runtimeLogger.js
  utils/runtimeLogger.test.js
game-shared-types/
  src/game.types.ts
src/
  pages/GameRoom/
  hooks/useWebSocket.ts
  types/game-shared-types.d.ts
specs/027-server-authoritative-opening-deal/
  spec.md
  plan.md
  research.md
  data-model.md
  contracts/
  quickstart.md
```

## Phase 0 - Research

See [research.md](./research.md).

Key conclusions:
- 開局發牌結果必須由 server 在 order confirmation 完成後一次性決定，且重連不可重新洗牌或重新發牌。
- 開局進度摘要只描述步驟與目標，不包含 `cardId`、角色、魅力值、圖片或牌堆順序。
- Runtime log/diagnostics 在對局進行中只能記錄安全摘要；移除牌身分只能在對局結束後透過結算資料揭露。
- Server 規則狀態不等待動畫、skip 或未來 `拿取手牌`；這些屬於 UI 呈現決策。

## Phase 1 - Design

See [data-model.md](./data-model.md), [contracts/opening-deal-contract.md](./contracts/opening-deal-contract.md), and [quickstart.md](./quickstart.md).

Design focus:
- Add or formalize an `OpeningDealState`/equivalent state segment that records one-time opening deal completion, safe progress summary, and replay-retention status.
- Keep `removedCard` in authoritative server state and out of player-visible game state until `phase === 'ended'`.
- Ensure per-viewer state shaping never sends opponent hand faces, draw pile contents, or removed-card identity during active play.
- Ensure opening progress summary can be included in existing state sync events without adding card-face data.
- Add end-of-game summary contract so settlement can access the removed card later without implementing settlement UI in this spec.
- Update shared type declarations for new safe summary fields and visibility boundaries.

## Phase 2 - Task Planning

Task generation should group work into five implementation slices:

1. **Authoritative opening deal state**
   - one-time opening deal completion marker
   - hidden removed-card retention
   - alternating first/second player deal summary
   - duplicate/late confirmation guard

2. **Visibility and contract shaping**
   - per-viewer state excludes hidden removed card before game end
   - opponent starting hands remain masked
   - opening progress summary contains only safe step metadata
   - end-of-game summary can include removed card identity

3. **Shared types and frontend compatibility**
   - shared type additions for opening progress summary
   - frontend local declaration sync
   - GameRoom consumption remains non-breaking before animation specs

4. **Reconnect and lifecycle retention**
   - reconnect before first actual action can recover safe summary
   - first actual action clears or marks summary as non-replayable
   - no re-deal or re-remove behavior on reconnect

5. **Verification and log safety**
   - server tests for hand counts, removed card, draw pile, alternating sequence, duplicate confirmation, reconnect summary, end-state reveal
   - runtime logger tests for hidden removed-card redaction during active play
   - frontend regression tests and build

## Risks

- **Risk**: 既有 state shaping 使用 `removedCard: null`，若結算資訊共用同一路徑，可能導致結束後仍無法呈現移除牌。  
  **Mitigation**: contract 明確區分 active play player-visible state 與 ended settlement summary，並補結束狀態測試。

- **Risk**: 開局進度摘要若直接重用 deal sequence 中的卡片物件，會把 `cardId` 或圖片帶到 client。  
  **Mitigation**: 設計 safe summary 只含 `order`、`type`、`targetPlayerId`、`cardIndex`、`completed` 等 metadata，測試 assert 不含卡面欄位。

- **Risk**: 重連或 duplicate order confirmation 觸發重新建局，造成移除牌與起始手牌改變。  
  **Mitigation**: 將 opening deal completion 作為狀態 guard，重連只重送現有權威 state。

- **Risk**: runtime diagnostics 為了除錯記錄完整 game state，外洩移除牌或手牌。  
  **Mitigation**: 更新 logger sanitizer 與測試，active play 只允許安全摘要。

- **Risk**: 027 先讓 server 規則狀態不等待動畫，後續 UI 若未鎖定互動，玩家可能在動畫期間操作。  
  **Mitigation**: 在 contract/assumptions 中明確標示動畫期間互動鎖定、skip 與 `拿取手牌` 屬 028/029 UI spec；027 不改此 UI 行為。

## Post-Design Constitution Check

- Game rule correctness: Pass. 設計固定開局牌數、順序與結束揭露邊界，不改 action/scoring。
- Shared state integrity: Pass. 權威狀態由 server 維護，client 不提供牌務決策輸入。
- Explicit realtime contracts: Pass. contract 文件定義可見狀態、開局進度摘要與結算揭露。
- Mobile-first playability: Pass. 無 layout 或 bottom-sheet 行為變更。
- Verifiable delivery: Pass. quickstart 定義 server、frontend 與 build 驗證。
