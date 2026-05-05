# Data Model: Logging And Production Safety Cleanup

## Entity: Runtime Log Policy
- **Purpose**: Defines what category of runtime output is allowed for a given environment or diagnostic mode.
- **Fields**:
  - `mode`: default runtime or explicit diagnostic mode
  - `defaultVisibility`: concise lifecycle, warning, and error output only
  - `allowsPayloadDump`: always false for this feature's accepted design
  - `allowsHiddenStateDump`: always false for this feature's accepted design
  - `requiresOptIn`: true for any diagnostic behavior beyond the default runtime path
- **Validation Rules**:
  - Diagnostic mode cannot be active implicitly.
  - No mode may permit full hidden-payload output.

## Entity: Runtime Log Event
- **Purpose**: Represents one emitted client-side or server-side log line or grouped summary.
- **Fields**:
  - `surface`: frontend or backend runtime source
  - `level`: info, warn, or error
  - `eventType`: room lifecycle, transport, restore, pending interaction, or validation-related category
  - `roomContext`: optional room identifier
  - `playerContext`: optional player identifier
  - `summary`: concise human-readable description
  - `sensitivity`: public context, redacted summary, or forbidden hidden payload
- **Validation Rules**:
  - Events marked as forbidden hidden payload must never be emitted.
  - Redacted summaries may mention counts, ids, or event kinds but not full hidden card contents.

## Entity: Hidden Game State
- **Purpose**: Captures information categories that must never appear in retained runtime output.
- **Fields**:
  - `hiddenHands`
  - `secretCards`
  - `pendingGiftCards`
  - `pendingCompetitionGroups`
  - `fullRoomSnapshot`
  - `fullOutboundGameState`
- **Validation Rules**:
  - Any log content containing these categories in full form violates the spec.
  - Diagnostic mode may only reference these categories through redacted summaries.

## Entity: Surface Audit Record
- **Purpose**: Tracks whether a known logging surface is active, legacy, retained, gated, condensed, or removed.
- **Fields**:
  - `path`: file path of the logging surface
  - `runtimeStatus`: active or legacy
  - `action`: retain, condense, gate, remove, or defer with rationale
  - `notes`: concise reason tied to safety or operability
- **Validation Rules**:
  - Every active runtime surface identified in the plan must receive an explicit action.
  - Deferred surfaces must include a reason why they do not block 019.
