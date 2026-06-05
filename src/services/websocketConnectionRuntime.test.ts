import {
    getReconnectDelayMs,
    resolveAttachedSession,
    shouldAttemptReconnect,
    shouldUpdateAttachedSession
} from './websocketConnectionRuntime';

describe('websocketConnectionRuntime', () => {
    test('resolves attached session only from valid room and player ids', () => {
        expect(resolveAttachedSession({
            roomId: 'ABC123',
            playerId: 'host'
        })).toEqual({
            roomId: 'ABC123',
            playerId: 'host'
        });

        expect(resolveAttachedSession({ roomId: 'ABC123' })).toBeNull();
        expect(resolveAttachedSession(null)).toBeNull();
    });

    test('updates attached session only for accepted lifecycle events', () => {
        expect(shouldUpdateAttachedSession('ROOM_CREATED')).toBe(true);
        expect(shouldUpdateAttachedSession('PLAYER_JOINED')).toBe(true);
        expect(shouldUpdateAttachedSession('GAME_STATE_UPDATED')).toBe(false);
    });

    test('keeps reconnect backoff and gate decisions stable', () => {
        expect(getReconnectDelayMs(1000, 3)).toBe(3000);
        expect(shouldAttemptReconnect({
            shouldReconnect: true,
            wasClean: false,
            reconnectAttempts: 4,
            maxReconnectAttempts: 5
        })).toBe(true);
        expect(shouldAttemptReconnect({
            shouldReconnect: true,
            wasClean: true,
            reconnectAttempts: 4,
            maxReconnectAttempts: 5
        })).toBe(false);
        expect(shouldAttemptReconnect({
            shouldReconnect: true,
            wasClean: false,
            reconnectAttempts: 5,
            maxReconnectAttempts: 5
        })).toBe(false);
    });
});
