# Quickstart: LINE Account Binding Foundation

## Configuration Note

The LINE Login Channel ID is not required for planning. Provide it during implementation or environment validation, when the feature needs to verify real LIFF/LINE Login behavior locally, in staging, or in production. It should be supplied through environment configuration and not hardcoded in source files.

024 implementation keeps the Channel ID out of source control. The account binding foundation can be validated with the local account sync contract first; provide the real Channel ID when testing actual LINE Login/LIFF verification against a configured LINE channel.

## Shared Type Validation

Run after changing `game-shared-types/src/game.types.ts` or generated shared type output:

```bash
./node_modules/.bin/tsc -p game-shared-types/tsconfig.json
```

Expected coverage:

- Account binding source types compile from `game-shared-types/src/game.types.ts`.
- Any checked-in `game-shared-types/dist/*` output stays synchronized with source changes.
- Frontend and server consumers do not need divergent local copies of account binding contracts.

## Focused Server Validation

Run:

```bash
npm --prefix server test
```

Expected coverage:

- Server-verifiable LINE identity creates a single bound account profile when invoked through a server-trusted verification path.
- Re-syncing the same LINE identity updates the existing profile instead of duplicating it.
- Arbitrary client-supplied `lineUserId`, profile, avatar, or `verifiedIdentity` claims do not create bound accounts.
- Missing, malformed, or unverifiable identity results return unbound sync results.
- Account profiles store canonical display name, optional avatar URL, timestamps, and minimal counters.
- Minimal counters update only from server-confirmed match completion data.
- Guest players do not receive persistent counter updates.
- Durable and temporary account persistence status are reported distinctly.
- Redis operation failures do not report durable persistence as available.
- Account sync results and logs do not expose tokens, raw LINE profile payloads, or private account data.

## Focused Frontend Validation

Run targeted tests for Lobby, diagnostics, and LIFF helper behavior after implementation:

```bash
CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx src/pages/Diagnostics/index.test.tsx src/utils/lineAccount.test.ts src/utils/runtimeLogger.test.ts
```

Expected coverage:

- Successful LINE profile flow sends only public presentation data from the browser; bound account state is only possible after the server has a trusted LINE verification result.
- Sync failure shows a non-blocking Lobby guest-mode notice.
- Room creation and room joining remain available when account sync fails or LINE identity is unavailable.
- Per-room display name can override room presentation without updating account canonical presentation.
- Diagnostics show account persistence/sync status without sensitive account payloads.
- No new gameplay avatar placement is required by 024.

## Full Repository Validation

Run before closeout:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

If backend-only changes are isolated, still run the most relevant server tests first. If frontend surfaces are touched, full frontend tests and build remain required by AGENTS.md.

## Manual Review

Detailed UI visual review remains user-owned under AGENTS.md. For this spec, the residual manual check is only the Lobby non-blocking guest-mode notice readability. LINE avatar placement is intentionally deferred.

## Privacy Checks

- Inspect public room/game state shaping for account fields.
- Inspect diagnostics output for account status only.
- Inspect runtime logging summaries for absence of token, raw LINE profile, and private account payload details.
- Confirm a plain `lineUserId` in room payload is not treated as verified account proof.

## Handoff Notes

- Channel ID is needed when implementation reaches real LINE Login/LIFF verification.
- Temporary account mode is valid for local development only when clearly marked non-durable.
- Achievement records, unlock rules, and achievement UI belong to 025, not 024.

## 2026-05-05 Implementation Validation

Completed checks:

- `./node_modules/.bin/tsc -p game-shared-types/tsconfig.json` passed and regenerated checked-in shared type output.
- `npm --prefix server test` passed with 48 backend tests.
- `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx src/pages/Diagnostics/index.test.tsx src/utils/lineAccount.test.ts src/utils/runtimeLogger.test.ts` passed with 4 frontend suites and 32 tests.
- `CI=1 npm test -- --watchAll=false` passed with 8 frontend suites and 47 tests.
- `npm run build` passed and produced the CRA production bundle.

Observed warnings:

- Frontend tests still emit existing React 18 `ReactDOMTestUtils.act` deprecation and `act(...)` warnings in Lobby coverage. They did not fail the test run.

Residual manual review:

- User-owned visual review remains limited to the compact Lobby guest-mode notice. No LINE avatar placement is required for 024.
