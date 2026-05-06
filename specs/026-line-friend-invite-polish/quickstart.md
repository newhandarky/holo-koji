# Quickstart: LINE Friend Invite Polish

## Prerequisites

- Node.js compatible with the root `package.json` engines.
- Dependencies installed in the root project.
- For real LINE manual validation only: a configured LIFF app with Share Target Picker enabled. Automated tests should mock LIFF and do not require a real Channel ID.

## Focused Implementation Checks

Run focused frontend tests while implementing:

```bash
CI=1 npm test -- --watchAll=false src/utils/lineLiff.test.ts
CI=1 npm test -- --watchAll=false src/pages/GameRoom/index.test.tsx
CI=1 npm test -- --watchAll=false src/pages/Lobby/index.test.tsx
```

If diagnostics behavior changes, also run the Diagnostics test file for the touched surface.

## Required Behavioral Coverage

Before handoff, confirm automated coverage for:

- Share Target Picker success returns a sent/share result with room identity and join action.
- Unsupported browser or unsupported LIFF origin produces a copyable fallback link.
- Clipboard-denied fallback still exposes a manually selectable invite URL.
- Share Target Picker cancellation preserves waiting room state and shows non-blocking feedback.
- Active gameplay does not show waiting-room invite controls.
- Unexpected invite failure avoids sensitive error details and keeps fallback guidance available.
- `?roomId=` and LIFF `liff.state` prefill or highlight the invited room id.
- Opening an invite link does not send `JOIN_ROOM` until display name and join action are confirmed.
- Missing, full, or already-started invited room errors preserve the original room id and show recovery actions.
- Diagnostics/logs contain only safe invite capability summaries.

## Full Verification

Run the project-required frontend checks:

```bash
CI=1 npm test -- --watchAll=false
npm run build
```

## Manual Review Notes

The user owns detailed visual review under `AGENTS.md`. Handoff should explicitly mention any remaining manual UI review for:

- Waiting room invite button and feedback on mobile.
- Recipient Lobby invite state and recovery copy.
- Actual LINE in-app Share Target Picker behavior if a real LIFF channel is available.

## Out-of-Scope Checks

Do not add or validate:

- Invite attribution, referral tracking, rewards, or invite achievements.
- Friend relationship storage or social graph.
- New LINE account verification or Channel ID committed to source.
- Gameplay rule or hidden-state changes.
