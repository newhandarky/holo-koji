const ROOM_SESSION_PREFIX = 'hanamikoji-room-session';

const normalize = (value?: string | null) => (
    typeof value === 'string' && value.trim() ? value.trim() : null
);

const buildRoomSessionKey = (roomId?: string | null, playerId?: string | null) => {
    const normalizedRoomId = normalize(roomId);
    const normalizedPlayerId = normalize(playerId);
    if (!normalizedRoomId || !normalizedPlayerId) {
        return null;
    }
    return `${ROOM_SESSION_PREFIX}:${normalizedRoomId}:${normalizedPlayerId}`;
};

export const saveRoomSessionToken = (
    roomId?: string | null,
    playerId?: string | null,
    roomSessionToken?: string | null
) => {
    const key = buildRoomSessionKey(roomId, playerId);
    const token = normalize(roomSessionToken);
    if (!key || !token) {
        return;
    }
    window.localStorage.setItem(key, token);
};

export const getStoredRoomSessionToken = (
    roomId?: string | null,
    playerId?: string | null
) => {
    const key = buildRoomSessionKey(roomId, playerId);
    if (!key) {
        return null;
    }
    return normalize(window.localStorage.getItem(key));
};
