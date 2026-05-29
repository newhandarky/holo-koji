# Implementation Plan: Learning Notes Architecture Update

## Summary

Refresh ignored local learning notes after the tracked workflow docs were corrected in 040. This spec keeps the work documentation-only and records that `learning-notes/` is not tracked by root Git.

## Key Changes

- Update high-traffic learning chapters to current paths and responsibilities.
- Add a short current-architecture note where stale terms are useful historically.
- Keep Socket.IO legacy cleanup notes as history, but prevent general learning chapters from presenting Socket.IO or local `game-shared-types` as current.
- Do not force-add ignored learning notes to Git; only the 041 spec is tracked.

## Validation

- Search `learning-notes/` for stale current-architecture terms.
- Confirm remaining Socket.IO references are legacy/history or comparison context.
- Confirm root diff contains only 041 spec files; learning notes remain ignored local updates.
