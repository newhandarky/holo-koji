# Hanamikoji Game Constitution

## Core Principles

### I. Game Rule Correctness
All feature work MUST preserve Hanamikoji game rules, scoring, action limits, turn order, and hidden-information boundaries. Any intentional rule deviation MUST be documented in the feature spec.

### II. Shared State Integrity
Server state is authoritative for multiplayer flows. Client UI state MUST not bypass server-side validation for turns, card ownership, pending interactions, room membership, or game completion.

### III. Explicit Realtime Contracts
WebSocket message events and payload shape changes MUST be documented in the plan or contracts before implementation. Backward-incompatible changes MUST include shared types, client, and server updates in the same feature scope.

### IV. Mobile-First Playability
User-facing gameplay changes MUST preserve the mobile-oriented layout and bottom-sheet interaction model unless the spec explicitly defines a replacement.

### V. Verifiable Delivery
Every implementation plan MUST define focused validation. At minimum, frontend changes require `CI=1 npm test -- --watchAll=false` and `npm run build` unless the plan documents why they are not applicable.

## Project Context

This project is a React Create React App frontend with an independent Node.js / Express / `ws` backend and a published shared contract package, `@newhandarky/hanakoji-game-types`.

Shared type changes MUST be made in the `newhandarky/hanakoji-game-types` repository, published through GitHub Packages as a new version, and then consumed by frontend and server dependency updates.

## Governance

This constitution applies to all specs under `specs/`. Changes to these principles require an explicit constitution update and a review of affected templates or active specs.

**Version**: 1.1.0  
**Ratified**: 2026-04-30  
**Last Amended**: 2026-05-29
