export type AttachedSession = {
    roomId: string;
    playerId: string;
};

export const shouldUpdateAttachedSession = (messageType: string): boolean =>
    messageType === 'ROOM_CREATED' || messageType === 'PLAYER_JOINED';

export const resolveAttachedSession = (payload: unknown): AttachedSession | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const candidate = payload as { roomId?: unknown; playerId?: unknown };
    if (typeof candidate.roomId !== 'string' || typeof candidate.playerId !== 'string') {
        return null;
    }

    return {
        roomId: candidate.roomId,
        playerId: candidate.playerId
    };
};

export const getReconnectDelayMs = (
    reconnectDelay: number,
    reconnectAttempts: number
): number => reconnectDelay * reconnectAttempts;

export const shouldAttemptReconnect = ({
    shouldReconnect,
    wasClean,
    reconnectAttempts,
    maxReconnectAttempts
}: {
    shouldReconnect: boolean;
    wasClean: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
}): boolean =>
    shouldReconnect && !wasClean && reconnectAttempts < maxReconnectAttempts;
