# Implementation Plan: [FEATURE]

**Branch**: `[###-feature]`  
**Date**: [DATE]  
**Spec**: [Link to spec.md]

## Summary

[Summarize the technical approach.]

## Technical Context

**Frontend**: React 18, Create React App, TypeScript  
**Backend**: Independent Node.js, Express, `ws` server  
**Shared Types**: `@newhandarky/hanakoji-game-types` from GitHub Packages  
**Package Manager**: npm  
**Validation**: `CI=1 npm test -- --watchAll=false`, `npm run build`

## Constitution Check

- Game rule correctness: [Pass/Needs work]
- Shared state integrity: [Pass/Needs work]
- Explicit realtime contracts: [Pass/Needs work]
- Mobile-first playability: [Pass/Needs work]
- Verifiable delivery: [Pass/Needs work]

## Project Structure

```text
src/
server/ (optional ignored local checkout)
newhandarky/hanakoji-game-types (independent shared repo)
specs/[###-feature]/
```

## Phase 0 - Research

[Decisions, tradeoffs, rejected alternatives.]

## Phase 1 - Design

[Data model, contracts, UI flow, migration notes.]

## Phase 2 - Task Planning

[Task generation notes.]

## Risks

- [Risk and mitigation.]
