import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GameProvider } from '../contexts/GameContext';
import { gameWebSocket } from '../services/websocket';
import { getStoredRoomSessionToken, saveRoomSessionToken } from '../utils/roomSession';
import { useWebSocket } from './useWebSocket';
import type { Player } from '@newhandarky/hanakoji-game-types';

jest.mock('../services/websocket', () => {
    const messageHandlers = new Map();

    return {
        __esModule: true,
        gameWebSocket: {
            connect: jest.fn().mockResolvedValue(undefined),
            isConnected: jest.fn(() => true),
            on: jest.fn((messageType, handler) => {
                messageHandlers.set(messageType, handler);
            }),
            off: jest.fn((messageType) => {
                messageHandlers.delete(messageType);
            }),
            getAttachedSession: jest.fn(() => null),
            send: jest.fn(),
            messageHandlers
        }
    };
});

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;

const player: Player = {
    id: 'host',
    name: 'Host',
    hand: [],
    playedCards: [],
    secretCards: [],
    discardedCards: [],
    actionTokens: [
        { type: 'secret', used: false },
        { type: 'trade-off', used: false },
        { type: 'gift', used: false },
        { type: 'competition', used: false }
    ],
    score: {
        charm: 0,
        tokens: 0
    }
};

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <GameProvider>{children}</GameProvider>
);

describe('useWebSocket', () => {
    beforeEach(() => {
        window.localStorage.clear();
        mockGameWebSocket.connect.mockClear();
        mockGameWebSocket.isConnected.mockClear();
        mockGameWebSocket.isConnected.mockReturnValue(true);
        mockGameWebSocket.on.mockClear();
        mockGameWebSocket.off.mockClear();
        mockGameWebSocket.getAttachedSession.mockClear();
        mockGameWebSocket.getAttachedSession.mockReturnValue(null);
        mockGameWebSocket.send.mockClear();
    });

    test('sends stored room session token when joining from game room', async () => {
        saveRoomSessionToken('ABC123', 'host', 'host-token');

        renderHook(() => useWebSocket('ABC123', player), { wrapper });

        await waitFor(() => expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'JOIN_ROOM',
            {
                roomId: 'ABC123',
                playerId: 'host',
                roomSessionToken: 'host-token'
            }
        ));
    });

    test('clears stale room session token when server rejects player id ownership', async () => {
        saveRoomSessionToken('ABC123', 'host', 'stale-token');

        const { result } = renderHook(() => useWebSocket('ABC123', player), { wrapper });

        await waitFor(() => expect(mockGameWebSocket.on).toHaveBeenCalledWith('ERROR', expect.any(Function)));
        const errorHandler = [...mockGameWebSocket.on.mock.calls]
            .reverse()
            .find(([messageType]) => messageType === 'ERROR')?.[1] as ((payload: unknown) => void) | undefined;
        expect(errorHandler).toEqual(expect.any(Function));

        act(() => {
            errorHandler?.({
                code: 'PLAYER_ID_TAKEN',
                message: '此玩家名稱已在房間中使用，請重新加入或更換名稱。'
            });
        });

        expect(getStoredRoomSessionToken('ABC123', 'host')).toBeNull();
        expect(result.current.error).toBe('這個房間的重連憑證已失效，請返回大廳重新加入或更換名稱。');
    });
});
