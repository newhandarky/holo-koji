import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { GameProvider } from '../contexts/GameContext';
import { gameWebSocket } from '../services/websocket';
import { saveRoomSessionToken } from '../utils/roomSession';
import { useWebSocket } from './useWebSocket';
import type { Player } from 'game-shared-types';

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
});
