# Data Model: Theme And Room Surface

This feature does not introduce persistent data, shared types, server entities, or gameplay state changes. The following are UI surface concepts used to guide implementation and validation.

## Theme Background

**Represents**: The full-app Ginza v2 visual background visible behind all routes.

**Attributes**:

- Direction: top-left to bottom-right diagonal visual flow.
- Palette: black at both ends with red as the central emphasis.
- Scope: all app pages.
- Asset dependency: none required.

**Validation Rules**:

- Must be visible on lobby and game-room routes.
- Must remain stable during route load, waiting-room state, active gameplay, scrolling, and state updates.
- Must not require new backend data or external image assets.

## Room Main Surface

**Represents**: The active game-room container that wraps the board, players, hand, action tokens, and game status.

**Attributes**:

- Background treatment: not large solid white; may be transparent, translucent, or non-white while clearly exposing the theme.
- Scope: active gameplay room main area.
- Layout role: preserves current spacing and mobile-first gameplay structure.

**Validation Rules**:

- Must clearly expose the Ginza v2 background.
- Must not move board, player, hand, action, or modal interaction flows.
- Must not introduce horizontal overflow or clipped primary controls on mobile width.

## Readable Content Panel

**Represents**: Local UI surfaces that need their own readable background.

**Examples**:

- Lobby create/join room card.
- Waiting-room cards and room-code panels.
- Form controls.
- Dialogs and modals.
- Geisha cards, item cards, action-token popovers, draw modal, round summary, player cards.

**Validation Rules**:

- May keep opaque or semi-opaque readable backgrounds.
- Must remain legible over the Ginza v2 app background.
- Must not be globally forced transparent by this feature.

## State Transitions

No application state transition changes are introduced.

- Route changes keep the same routes and navigation behavior.
- Room state changes keep the same loading, waiting-room, active gameplay, interaction, and summary flows.
- Gameplay state, server state, and Socket.IO events remain unchanged.
