# Quickstart: 大廳 AI 難度標籤

## Preconditions

- Work on branch `031-lobby-ai-difficulty-labels`.
- Keep this feature scoped to Lobby AI difficulty labels, descriptions, option ordering, default/fallback behavior, and room creation mapping.
- Do not change AI algorithms, server room rules, Socket.IO event names, payload shape, shared type unions, LINE/account flows, achievements, or character set selection behavior.
- The user owns detailed visual UI review; automated checks should cover functional and accessibility-relevant behavior.

## Implementation Checklist

1. Review current Lobby surfaces:
   - `src/pages/Lobby/LobbyPlayControls.tsx`
   - `src/pages/Lobby/index.tsx`
   - `src/pages/Lobby/index.test.tsx`

2. Add canonical AI difficulty display data:
   - `easy` -> `簡單` / `適合初次體驗`
   - `medium` -> `中等` / `標準挑戰`
   - `hard` -> `偏強` / `需要穩定判斷`
   - `expert` -> `超強` / `高壓進階對手`
   - `hell` -> `地獄` / `最高難度挑戰`

3. Update NPC difficulty control:
   - display labels and short descriptions
   - do not display person names
   - keep order from easiest to hardest
   - keep current selection clear before room creation
   - preserve keyboard, pointer, and touch operation

4. Preserve mode and payload behavior:
   - default NPC difficulty remains `easy`
   - invalid difficulty values fall back to `easy`
   - switching online/NPC preserves a valid difficulty selection
   - NPC `CREATE_ROOM` sends existing value
   - online `CREATE_ROOM` omits `aiDifficulty`

5. Add focused tests:
   - labels and descriptions render in NPC mode
   - previous person names are not rendered
   - option order is `簡單`, `中等`, `偏強`, `超強`, `地獄`
   - default is `easy` / `簡單`
   - all five displayed options map to expected `CREATE_ROOM.aiDifficulty`
   - online mode does not submit `aiDifficulty`
   - invalid/stale difficulty falls back to `easy`

## Validation Commands

Run focused Lobby tests first:

```bash
CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx
```

Run full frontend checks before handoff:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

Run server tests only if backend or shared contract behavior changes:

```bash
npm --prefix server test
```

## Manual Review Notes

- User performs detailed UI visual review manually.
- Automated implementation checks do not replace detailed mobile/desktop visual review. If no browser or device visual review is performed before handoff, report the remaining visual review as a residual manual review item.
- Automated validation completed on 2026-05-06:
  - `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx`
  - `CI=1 npm test -- --watchAll=false`
  - `npm run build`
- Detailed mobile/desktop visual review has not been performed by the agent and remains a residual manual review item.
- At minimum, manually confirm on mobile and desktop that:
  - all five labels and descriptions are readable
  - difficulty content does not overlap player name, mode, character set, setup mode, or create/join controls
  - NPC mode selection remains clear before room creation
  - online mode is not visually cluttered by AI-only settings

## Expected Outcome

- NPC difficulty choices read as clear challenge levels instead of person-name references.
- Existing NPC difficulty values and AI behavior remain unchanged.
- Online room creation remains unaffected.
- Tests prove display copy, ordering, absence of person names, default/fallback, and payload mapping.
