# Tasks: Character Card Visual Refinement

**Input**: Design documents from `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/014-character-card-visual-refinement/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1 - Setup

- [x] T001 Review 014 scope, clarifications, and contract boundaries in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/014-character-card-visual-refinement/spec.md` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/014-character-card-visual-refinement/contracts/character-card-visual-refinement-contract.md`.
- [x] T002 Identify and confirm the only planned code-touch files in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GeishaCard.tsx`, `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/gameData.ts`, and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.

## Phase 2 - Foundational

- [x] T003 Implement a frontend-only position item icon lookup helper in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/utils/gameData.ts` that maps field position/slot to stable Ginza icon definitions.
- [x] T004 Refactor character-section icon derivation in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` to use position-based item icon mapping instead of known-card ownership scanning.
- [x] T005 Add a guard/commented decision point in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/014-character-card-visual-refinement/quickstart.md` documenting that 014 must stop and report if existing frontend-visible data cannot satisfy always-visible position icons.

## Phase 3 - User Story 1 (P1)

**Goal**: 在維持單一 viewport layout 下提升焦點角色卡人物主體可見性，並保留 coverflow 首尾循環、拖曳與側卡重疊語意。  
**Independent Test**: 進入 `角色` 分頁後，焦點卡人物主體明顯更完整，非焦點卡仍維持深度與側邊露出，且無整頁水平捲動。

- [x] T006 [US1] Pass focused-card state from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` into each card render path in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GeishaCard.tsx`.
- [x] T007 [US1] Update focused-card artwork rendering strategy in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GeishaCard.tsx` to prioritize full image visibility with non-cropping behavior.
- [x] T008 [US1] Adjust coverflow slide/card sizing constraints in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` so focused-card visibility improves without breaking single-viewport section layout.
- [x] T009 [US1] Preserve non-focused card overlap/depth and loop navigation visuals in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` for adjacent and distant slides.

## Phase 4 - User Story 2 (P2)

**Goal**: 精簡角色卡上層資訊遮罩，降低圖像遮蔽並統一文字視覺。  
**Independent Test**: 角色名稱顯示為 16px 粗體，左上深色斜角區縮短約 40%，且 `魅力 {數值}` 舊文字 badge 完全移除。

- [x] T010 [US2] Update character-card overlay markup in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GeishaCard.tsx` to remove the old `魅力 {value}` text badge.
- [x] T011 [US2] Apply 16px bold role-name typography in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` for `.geisha-card__name`.
- [x] T012 [US2] Shorten the top-left dark diagonal info treatment by approximately 40% in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` while preserving readability.

## Phase 5 - User Story 3 (P3)

**Goal**: 讓場上每個位置都常駐顯示對應 item icon 與魅力數字 badge，不依賴道具持有狀態。  
**Independent Test**: 無論玩家是否持有該位置道具，七個位置皆顯示 48px 無邊框 item icon，右上角顯示紅底白字圓形魅力數字。

- [x] T013 [US3] Wire position-based item icon output from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx` into `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GeishaCard.tsx` for every visible position.
- [x] T014 [US3] Render the charm number as icon-attached badge in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GeishaCard.tsx`.
- [x] T015 [US3] [P] Style item icon to 48px without border/background in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.
- [x] T016 [US3] [P] Style charm number badge as red circular white-text marker at item icon top-right in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css`.

## Phase 6 - User Story 4 (P4)

**Goal**: 移除角色 coverflow 上方四個指令 icon，且不影響資訊區與手牌區對應行為。  
**Independent Test**: `角色` 分頁上方不再出現該四個 icon，切換到 `資訊`/`手牌&指令` 時既有 action status 與 controls 保持不變。

- [x] T017 [US4] Remove only the character-section top opponent action icon row render from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`.
- [x] T018 [US4] Clean up unused action-icon constants/import dependencies related to the removed row in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`.
- [x] T019 [US4] Remove obsolete character-section action-row styling selectors from `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/index.css` without touching info-panel or hand-action styling.

## Phase 7 - Polish & Cross-Cutting

- [x] T020 [P] Verify existing control-border logic still depends only on `geisha.controlledBy` in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GeishaCard.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`.
- [x] T021 [P] Verify hidden-information safety for character section labels/icons/alt text in `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GeishaCard.tsx` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/src/components/game/GameBoard.tsx`（最小情境：對手存在未公開互動時，角色區不顯示對手手牌/密約/未公開選擇）。
- [x] T022 Run `CI=1 npm test -- --watchAll=false` in `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [x] T023 Run `npm run build` in `/Users/zhangzhipeng/MyProject/hanamikoji-game`.
- [x] T024 Record task completion and user-owned visual validation notes in `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/014-character-card-visual-refinement/tasks.md` and `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/014-character-card-visual-refinement/spec.md`.

## Dependencies

- Phase 1 must complete before Phase 2.
- Phase 2 must complete before user story phases.
- User story order for lowest rework risk: US1 (Phase 3) -> US2 (Phase 4) -> US3 (Phase 5) -> US4 (Phase 6).
- Phase 7 runs after all user story phases.

## Parallel Execution Examples

- US1: T008 and T009 can run in parallel after T006-T007 establish focused-card rendering boundaries.
- US3: T015 and T016 can run in parallel after T013-T014 establishes icon/badge structure.
- Polish: T020 and T021 can run in parallel before validation commands.

## Implementation Strategy

- MVP first: deliver US1 to secure focused-card visibility improvement without breaking coverflow behavior.
- Next: deliver US2 and US3 to complete card chrome simplification and position icon/charm badge presentation.
- Then: deliver US4 as a scoped cleanup to remove only the character-section command icon row.
- Finally: run focused validation and complete spec/task closeout notes for user-owned visual acceptance.
