# Implementation Plan: Production Readiness And Online Binding Validation

**Branch**: `032-production-readiness-and-online-binding-validation`  
**Date**: 2026-05-07  
**Spec**: `/Users/zhangzhipeng/MyProject/hanamikoji-game/specs/032-production-readiness-and-online-binding-validation/spec.md`

## Summary

032 將目前已完成的 LINE 綁定、LIFF 邀請、Redis-backed 成就與線上房間流程收斂成可重複驗證的 production readiness 流程。實作重點是補強既有 `/diagnostics` 的安全 readiness 摘要、建立 source-controlled `quickstart.md` 人工 smoke checklist，以及補測試確保 diagnostics 不暴露 secret、不變成監控系統，也不把 smoke result 寫入 runtime storage。

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Node.js, Express, Socket.IO  
**Shared Types**: `game-shared-types`  
**Package Manager**: npm  
**External Services**: GitHub Pages frontend, Render backend, LINE Login/LIFF, Redis through `REDIS_URL`  
**Primary UI Surface**: Existing `/diagnostics` plus existing Lobby account/achievement state  
**Manual Artifact**: Source-controlled `specs/032-production-readiness-and-online-binding-validation/quickstart.md` checklist  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`, `npm --prefix server test`

## Constitution Check

- Game rule correctness: Pass. 032 does not change rules, scoring, turn order, action availability, card ownership, or hidden-information contracts.
- Shared state integrity: Pass. The plan does not let client UI bypass server state; diagnostics only reads safe local/app status.
- Explicit realtime contracts: Pass. No Socket.IO event or shared payload shape changes are planned.
- Mobile-first playability: Pass. Lobby remains player-facing; diagnostics is developer/tester-only and does not alter gameplay layout.
- Verifiable delivery: Pass. Automated tests/build plus source-controlled manual smoke checklist are required.

## Project Structure

```text
src/pages/Diagnostics/
src/utils/lineAccount.ts
src/utils/lineLiff.ts
server/
game-shared-types/
specs/032-production-readiness-and-online-binding-validation/
```

## Phase 0 - Research

Decisions are captured in `research.md`:

- Use source-controlled quickstart/checklist documents for manual smoke status.
- Extend existing `/diagnostics` with safe local/app readiness signals only.
- Keep Lobby technical-readiness-free.
- Do not add backend APIs, database tables, server-log records, remote health probes, frontend Redis probes, alerting, or history.

## Phase 1 - Design

Design artifacts:

- `data-model.md`: Defines `ProductionEnvironmentChecklist`, `ProductionSmokeItem`, `ReadinessGate`, `ExternalConfigurationRequirement`, and `SafeDiagnosticsReadinessSummary`.
- `contracts/production-readiness-contract.md`: Defines the checklist table contract and diagnostics readiness summary contract.
- `quickstart.md`: Provides required env checklist, automated validation commands, manual smoke test table, and deferred-item rules.

Implementation direction:

1. Add or adjust diagnostics summary fields derived from existing config, LIFF diagnostics, account diagnostics, and achievement readiness implications.
2. Keep readiness labels safe: show presence/status/category, never actual secret values, raw LINE payloads, Redis URL, tokens, or player hidden state.
3. Add focused diagnostics tests for readiness summary, no remote probe/history wording, and no secret leakage.
4. Build the production checklist in `quickstart.md` with user-editable `Status`, `Notes`, `Deferred Reason`, `Blocking Dependency`, `Follow-up Verifier`, and `Retest Condition`.

## Phase 2 - Task Planning

Task generation should split work into:

- Documentation/checklist tasks.
- Diagnostics model/summary tests.
- Diagnostics UI summary implementation.
- Focused validation and full validation tasks.

Do not create tasks for new runtime persistence, new backend APIs, new gameplay behavior, new achievement catalog entries, new character data, monitoring/status pages, or release version bumps.

## Risks

- Real LINE/LIFF and Render/Redis validation depends on user-owned external settings. Mitigation: checklist allows `Deferred` only with reason, blocking dependency, follow-up verifier, and retest condition.
- Diagnostics could accidentally expose sensitive config values. Mitigation: tests must assert no LINE secrets, Redis URLs, tokens, raw LINE payloads, or private account fields render.
- Scope could expand into monitoring. Mitigation: contracts explicitly reject live probes, history, status pages, alerting, frontend Redis tests, and server-log readiness records.

## Post-Design Constitution Check

- Game rule correctness: Pass.
- Shared state integrity: Pass.
- Explicit realtime contracts: Pass.
- Mobile-first playability: Pass.
- Verifiable delivery: Pass.
