# Quickstart: Logging And Production Safety Cleanup

## Goal
Verify that runtime logging is quieter and safer without changing gameplay behavior.

## Prerequisites
- Install root dependencies with `npm install`
- Install server dependencies with `cd server && npm install`

## Verification Steps
1. Run `cd server && npm test`
2. Run `CI=1 npm test -- --watchAll=false`
3. Run `npm run build`
4. Start the frontend and server in the usual local workflow.
   - Frontend diagnostics opt-in: `REACT_APP_ENABLE_DIAGNOSTICS=true`
   - Backend diagnostics opt-in: `GAME_DIAGNOSTICS=true`
5. Exercise these flows:
   - create room
   - join room
   - start match
   - trigger restore rejection path
   - trigger pending gift or competition path
6. Confirm the browser console does not print full room state, hidden hands, secret cards, or raw payload dumps.
7. Confirm the server output keeps concise lifecycle messages and actionable warnings or errors, but does not dump hidden hands, pending-choice contents, or full state payloads.
8. If diagnostic mode is supported, enable it explicitly and confirm output stays at event-summary or redacted-summary level rather than full hidden payload level.

## Manual Review Notes
- The user owns detailed UI visual review.
- Manual review for this spec is limited to console and server-output inspection rather than gameplay layout inspection.
- Room entry should remain stable in local development even when `React.StrictMode` remounts the game room; entering a newly created room must not immediately fail with `房間不存在` because of an implicit cleanup disconnect.
- 2026-05-05 narrow smoke review results:
  - create/join/reload flows previously exposed `JOIN_ROOM` send attempts while the socket was still `CONNECTING`; the frontend now reuses the same pending socket connection and only sends room-entry events after `OPEN`.
  - normal gameplay broadcasts such as `DEAL_ANIMATION` and `ACTION_EXECUTED` no longer surface as `找不到處理器` warnings.
  - React Router v7 future warnings are silenced through explicit router future flags, and localhost no longer tries to initialize LIFF against the deployed endpoint origin.
