# Hanamikoji Game Constitution

## Core Principles

### I. Game Rule Correctness
All feature work MUST preserve Hanamikoji game rules, scoring, action limits, turn order, and hidden-information boundaries. Any intentional rule deviation MUST be documented in the feature spec.

### II. Shared State Integrity
Server state is authoritative for multiplayer flows. Client UI state MUST not bypass server-side validation for turns, card ownership, pending interactions, room membership, or game completion.

### III. Explicit Realtime Contracts
Socket.IO events and payload shape changes MUST be documented in the plan or contracts before implementation. Backward-incompatible changes MUST include client and server updates in the same feature scope.

### IV. Mobile-First Playability
User-facing gameplay changes MUST preserve the mobile-oriented layout and bottom-sheet interaction model unless the spec explicitly defines a replacement.

### V. Verifiable Delivery
Every implementation plan MUST define focused validation. At minimum, frontend changes require `CI=1 npm test -- --watchAll=false` and `npm run build` unless the plan documents why they are not applicable.

## Project Context

This project is a React Create React App frontend with a Node.js / Socket.IO backend and a local `game-shared-types` package.

## Governance

This constitution applies to all specs under `specs/`. Changes to these principles require an explicit constitution update and a review of affected templates or active specs.

**Version**: 1.0.0  
**Ratified**: 2026-04-30  
**Last Amended**: 2026-04-30
