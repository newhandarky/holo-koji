# Research: 大廳 AI 難度標籤

## Decision: Use a canonical frontend difficulty option model

**Rationale**: The feature is display-focused but must preserve exact backend difficulty identities. A single option model containing value, label, description, and rank reduces the chance that labels, tests, and payload mappings drift apart.

**Alternatives considered**:
- Inline option text directly in JSX: simpler initially, but harder to test all mappings and easier to duplicate incorrectly.
- Move labels into backend/shared types: unnecessary because this is lobby presentation copy and no server behavior changes are planned.

## Decision: Do not display person names in AI difficulty controls

**Rationale**: Clarification fixed the UX direction: the control should show only difficulty labels and short descriptions. Removing person names makes the challenge level understandable without character-name knowledge and provides a clear acceptance test.

**Alternatives considered**:
- Person name as primary label with difficulty in parentheses: keeps existing flavor but conflicts with the clarified requirement.
- Difficulty as primary label with person name as secondary text: still leaves person names in difficulty content and could distract from the intended challenge scale.

## Decision: Fixed labels and fixed short descriptions

**Rationale**: Fixed copy makes implementation and validation deterministic. The selected labels and descriptions are:

| Value | Label | Description |
|-------|-------|-------------|
| `easy` | 簡單 | 適合初次體驗 |
| `medium` | 中等 | 標準挑戰 |
| `hard` | 偏強 | 需要穩定判斷 |
| `expert` | 超強 | 高壓進階對手 |
| `hell` | 地獄 | 最高難度挑戰 |

**Alternatives considered**:
- Labels only: lower UI complexity, but does not satisfy the clarified short-description requirement.
- Implementation-defined descriptions: less spec churn, but weakens tests and risks inconsistent copy.

## Decision: Preserve existing difficulty identities and room creation payload

**Rationale**: The spec explicitly excludes AI behavior and payload changes. Existing server behavior normalizes difficulty values and applies AI logic based on `easy`, `medium`, `hard`, `expert`, and `hell`. The frontend should continue sending those values for NPC rooms and omit `aiDifficulty` for online rooms.

**Alternatives considered**:
- Rename payload values to match Traditional Chinese labels: would require shared type/server changes and introduce unnecessary realtime contract risk.
- Add a new display label field to room creation: no server need and violates scope.

## Decision: Keep `easy` as default and fallback

**Rationale**: `easy` is the existing Lobby default and the clarified desired default. It is the safest fallback for invalid or stale UI values and aligns with new-player expectations.

**Alternatives considered**:
- Default to `medium`: reasonable for experienced users, but changes existing behavior.
- Persist last selected difficulty as default: useful later, but adds persistence scope and edge cases not requested.

## Decision: Validate primarily with focused Lobby tests

**Rationale**: The change surface is `src/pages/Lobby/`. Focused tests can verify label text, descriptions, hidden person names, mode visibility, default/fallback, and exact payload mapping. Full frontend test/build remains required before handoff.

**Alternatives considered**:
- Server tests: not necessary unless implementation touches `server/` or shared payload logic.
- Browser visual inspection by agent: project rules assign detailed UI visual review to the user; automated checks plus residual manual review note are sufficient.
