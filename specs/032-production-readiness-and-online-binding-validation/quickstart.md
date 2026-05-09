# Quickstart: Production Readiness And Online Binding Validation

## Purpose

Use this document as the source-controlled 032 production readiness checklist. It records release validation status in repo documentation only. Do not store smoke test results in Redis, a database, backend APIs, server logs, or player-facing UI.

## Required External Configuration

### Render Server

| Setting | Required | Secret | Validation |
|---|---|---:|---|
| `LINE_CHANNEL_ID` | Yes | No | Present in Render environment settings; value must not be copied here. |
| `LINE_CHANNEL_SECRET` | Yes | Yes | Present in Render environment settings; value must not be copied here. |
| `REDIS_URL` | Yes for durable achievements | Yes | Present in Render environment settings when achievement persistence should be available; value must not be copied here. |
| `WEB_APP_URL` | Yes | No | Points to production frontend, expected `https://newhandarky.github.io/holo-koji`. |
| `NODE_ENV` | Yes | No | Expected `production`. |

### GitHub Pages Build

| Setting | Required | Secret | Validation |
|---|---|---:|---|
| `REACT_APP_WEBSOCKET_URL` | Yes | No | Points to production WebSocket endpoint. |
| `REACT_APP_API_URL` | Yes | No | Points to production API endpoint. |
| `REACT_APP_WEB_APP_URL` | Yes | No | Expected `https://newhandarky.github.io/holo-koji`. |
| `REACT_APP_LIFF_ID` | Yes | No | Matches the intended production LIFF app. |
| `REACT_APP_LINE_CHANNEL_ID` | Yes | No | Matches the LINE Login Channel ID. |

### LINE Developers

| Setting | Required | Expected |
|---|---|---|
| LINE Login callback URL | Yes | `https://newhandarky.github.io/holo-koji/?lineCallback=1` |
| LIFF endpoint URL | Yes | Production frontend URL for this app. |
| LIFF Share Target Picker capability | Needed for LINE invite smoke | Enabled or supported for the production LIFF app. |

## Automated Validation

Run these before closeout:

```bash
CI=1 npm test -- --watchAll=false
npm run build
npm --prefix server test
```

If implementation only changes docs and frontend diagnostics, `npm --prefix server test` should still be run for production-readiness confidence unless there is a local blocker.

### Automated Validation Status

| Command | Required | Status | Notes |
|---|---|---|---|
| `CI=1 npm test -- --watchAll=false src/pages/Diagnostics/index.test.tsx` | Yes for diagnostics changes | Pass | 8 tests passed on 2026-05-07; existing React act deprecation warning remains. |
| `CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx` | Yes for Lobby/account-achievement readiness confidence | Pass | 41 tests passed on 2026-05-07; existing act warnings and intentional server-error log remain. |
| `CI=1 npm test -- --watchAll=false` | Yes | Pass | 15 suites / 147 tests passed on 2026-05-07; existing act/router warnings remain. |
| `npm run build` | Yes | Pass | Production build compiled successfully on 2026-05-07. |
| `npm --prefix server test` | Yes for production-readiness confidence | Pass | 75 server tests passed on 2026-05-07. |
| 032 readiness gate | Yes | Not Run | Automated validation passed, but production manual smoke rows remain Not Run until user validates real online environment. |

## Manual Production Smoke Checklist

Allowed status values: `Not Run`, `Pass`, `Fail`, `Deferred`.

When using `Deferred`, fill in Deferred Reason, Blocking Dependency, Follow-up Verifier, and Retest Condition.

| Item | Environment | Expected Result | Status | Notes | Deferred Reason | Blocking Dependency | Follow-up Verifier | Retest Condition |
|---|---|---|---|---|---|---|---|---|
| Render health endpoint | Production Render backend | `/health` returns ok without exposing secrets. | Not Run |  |  |  |  |  |
| Production WebSocket connection | GitHub Pages frontend + Render backend | Lobby connects to configured production WebSocket. | Not Run |  |  |  |  |  |
| Browser LINE Login binding | Production browser flow | Login returns to `?lineCallback=1`, Lobby shows bound LINE account. | Not Run |  |  |  |  |  |
| Achievement durable readiness | Bound production account + Redis | Achievement surface is available when Redis-backed persistence is durable. | Not Run |  |  |  |  |  |
| Redis unavailable honesty | Production or controlled missing Redis case | Achievement surface clearly says progress cannot be saved when durable persistence is unavailable. | Not Run |  |  |  |  |  |
| LINE app / LIFF invite | Mobile LINE app | Invite uses Share Target Picker when supported or safe copy fallback when unsupported. | Not Run |  |  |  |  |  |
| Two-player room start | Two production clients | Create/join room, order confirmation, both ready, opening deal animation, playable state. | Not Run |  |  |  |  |  |
| Tie-to-next-round recovery | Production NPC or two-player match | After tie and next round, UI does not get stuck on waiting-for-opponent. | Not Run |  |  |  |  |  |
| Diagnostics readiness summary | Production `/diagnostics` | Shows safe readiness categories without secrets, raw payloads, live probes, or monitoring history. | Not Run |  |  |  |  |  |

## Current Readiness Gate Status

Automated validation is passing. The 032 production readiness gate is not closeout-ready yet because manual production smoke rows remain `Not Run`. These rows are intentionally user-owned and should be updated after validating the real GitHub Pages, Render, LINE Developers, LIFF, Redis, and two-client production environment.

## Lobby Boundary Notes

- Lobby remains player-facing and must not show a technical production readiness panel.
- Lobby may continue showing normal LINE account binding state and achievement availability/unavailability.
- Technical readiness details belong in `/diagnostics` and this source-controlled checklist.

## Deferred Item Rules

Use `Deferred` only for externally blocked validation, such as unavailable LINE app access, Render outage, missing Redis provider, or LINE Developers settings not yet changed.

Each Deferred row must include:

- Deferred Reason
- Blocking Dependency
- Follow-up Verifier
- Retest Condition

## Readiness Gate Rules

- Gate is ready only when all automated validation commands pass.
- Gate is ready only when each required manual smoke row is `Pass` or valid `Deferred`.
- Any `Not Run` or `Fail` manual smoke row means the gate is not closeout-ready.
- Any `Deferred` row is residual risk and must be summarized during closeout.

## Security Checklist

- Do not commit `.env.local` or deployment secrets.
- Do not paste `LINE_CHANNEL_SECRET`, `REDIS_URL`, tokens, authorization codes, or raw LINE payloads into this file.
- Diagnostics must show status/category only, not secret values.
- Smoke result notes must avoid account IDs, private user data, hidden cards, and raw provider payloads.
- Do not use server logs, backend APIs, Redis, databases, browser local storage, or player-facing UI as the source of truth for this checklist.

## Out Of Scope

- New achievement conditions.
- New character data.
- New gameplay rules.
- Backend smoke result APIs.
- Database-backed smoke result storage.
- Server-log release records.
- Live remote health probes from diagnostics.
- Monitoring, alerting, uptime tracking, or status-page history.
