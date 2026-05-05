# Quickstart: Achievement System

## Configuration Note

025 does not need LINE Login Channel ID work. It consumes the bound account identity and persistence capability created by 024. A real LINE/LIFF channel is only relevant when validating the upstream account binding integration.

Durable account persistence must be available for achievement writes. If account persistence reports temporary or unavailable, achievement surfaces should show an unavailable state and must not display session-only progress.

## Shared Type Validation

Run after changing `game-shared-types/src/game.types.ts` or generated shared type output:

```bash
./node_modules/.bin/tsc -p game-shared-types/tsconfig.json
```

Expected coverage:

- Achievement catalog, summary, status, and WebSocket payload types compile.
- Frontend and server consumers use the same contract shape.
- Local ambient declarations remain synchronized if they are still required.

## Focused Server Validation

Run:

```bash
npm --prefix server test
```

Expected coverage:

- Starter catalog contains exactly four achievements.
- Bound durable accounts unlock first completed match, first win, complete 3 matches, and win 3 matches from server-confirmed completions.
- Guest players do not create progress or unlock records.
- Temporary or unavailable persistence returns achievement-unavailable state and creates no session-only progress.
- Repeated processing of the same server-owned `completionId` does not increment progress, duplicate unlocks, or replace first unlock time.
- Pre-025 counters do not initialize or unlock achievements.
- Account counters and achievement progress update consistently from the same accepted server-confirmed completion.
- Client-declared match results, progress, or unlock claims are ignored.
- Achievement summaries and logs do not expose LINE tokens, raw account payloads, or hidden game state.

## Focused Frontend Validation

Run targeted tests for Lobby achievement UI and diagnostics/runtime summaries after implementation:

```bash
CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx src/utils/runtimeLogger.test.ts
```

Expected coverage:

- Lobby shows a compact achievement entry for bound durable accounts.
- Achievement view lists locked, in-progress, and unlocked starter achievements with measurable progress.
- Guest account state shows a clear non-persistent explanation.
- Durable storage unavailable state shows achievements as temporarily unavailable and no session-only progress.
- New-unlock marker appears in Lobby after an achievement unlock and clears after the player opens/acknowledges the achievement view.
- New-unlock acknowledgement returns a refreshed achievement summary and does not leave stale marker state.
- No LINE token, raw account payload, or hidden game data appears in player-visible or diagnostic summaries.

## Full Repository Validation

Run before closeout:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

If backend changes are substantial, run `npm --prefix server test` first. If shared types change, run the shared type compilation before frontend tests.

## 2026-05-05 Implementation Validation

Completed checks:

- `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json` passed.
- `node --test server/utils/achievementStore.test.js server/utils/accountStore.test.js` passed with 27 backend tests.
- `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx src/utils/runtimeLogger.test.ts` passed with 2 suites and 28 tests.
- `npm --prefix server test` passed with 63 backend tests.
- `CI=1 npm test -- --watchAll=false` passed with 8 suites and 52 tests.
- `npm run build` passed.

Observed warnings:

- Frontend tests still emit existing React 18 `ReactDOMTestUtils.act` deprecation warnings and Lobby `act(...)` warnings. They did not fail the test run.
- Server tests still intentionally log the existing Redis failure path in accountStore coverage. It did not fail the test run.

Residual manual review:

- User-owned visual review remains for the Lobby achievement entry/list and new-unlock marker on mobile.

## Manual Review

Detailed UI visual review remains user-owned under AGENTS.md. For 025, the residual manual checks are:

- Lobby achievement entry is readable on mobile.
- Achievement list remains compact and scannable.
- New-unlock marker is visible without blocking room creation, joining, NPC mode, or navigation.

## Privacy Checks

- Inspect achievement summary payloads for absence of LINE tokens, raw account payloads, and storage credentials.
- Inspect runtime logging summaries for achievement status only.
- Confirm achievement conditions do not reference hidden hand cards, opponent secret choices, or client-only action details.
- Confirm starter achievement IDs remain stable and Traditional Chinese copy is player-readable.

## Handoff Notes

- Do not use pre-025 `MinimalAccountCounters` to backfill achievements.
- Do not add post-match result UI unless a later spec moves unlock feedback out of Lobby.
- Temporary account mode is playable but not achievement-ready.
