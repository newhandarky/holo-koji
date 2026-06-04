import { act, renderHook } from '@testing-library/react';
import { gameWebSocket } from '../../services/websocket';
import { frontendLogger } from '../../utils/runtimeLogger';
import { useLobbyRoomCommands } from './useLobbyRoomCommands';

jest.mock('../../services/websocket', () => ({
    gameWebSocket: {
        send: jest.fn()
    }
}));

jest.mock('../../utils/runtimeLogger', () => ({
    frontendLogger: {
        diagnostic: jest.fn()
    }
}));

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const mockFrontendLogger = frontendLogger as jest.Mocked<typeof frontendLogger>;

const boundAccountProfile = {
    lineUserId: 'line-1',
    displayName: '玩家一',
    avatarUrl: 'https://example.test/avatar.png',
    createdAt: '2026-05-05T12:00:00.000Z',
    updatedAt: '2026-05-05T12:00:00.000Z',
    counters: {
        gamesPlayed: 1,
        gamesWon: 1,
        wins: 1,
        lastPlayedAt: '2026-05-05T12:00:00.000Z'
    }
};

const renderCommands = (overrides: Partial<Parameters<typeof useLobbyRoomCommands>[0]> = {}) => {
    const pendingJoinRoomRef = { current: null as string | null };
    const options: Parameters<typeof useLobbyRoomCommands>[0] = {
        playerName: 'player1',
        roomId: 'ROOM01',
        matchMode: 'online',
        aiDifficulty: 'easy',
        selectedGeishaSet: 'hololive',
        setupMode: 'random',
        selectedCharacterIds: [],
        selectedGeishaSetAvailable: true,
        customSelectionIsReady: true,
        isConnecting: false,
        isAccountSyncPending: false,
        connectionStatus: 'connected',
        boundAccountProfile: null,
        pendingJoinRoomRef,
        setIsConnecting: jest.fn(),
        setInviteRecovery: jest.fn(),
        ...overrides
    };

    return {
        ...renderHook(() => useLobbyRoomCommands(options)),
        options
    };
};

describe('useLobbyRoomCommands', () => {
    beforeEach(() => {
        mockGameWebSocket.send.mockClear();
        mockFrontendLogger.diagnostic.mockClear();
    });

    test('builds create room payload and diagnostic summary', () => {
        const { result, options } = renderCommands({
            matchMode: 'npc',
            aiDifficulty: 'hell',
            setupMode: 'custom',
            selectedCharacterIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            boundAccountProfile
        });

        expect(result.current.canCreateRoom).toBe(true);

        act(() => {
            result.current.createRoom();
        });

        expect(options.setIsConnecting).toHaveBeenCalledWith(true);
        expect(mockFrontendLogger.diagnostic).toHaveBeenCalledWith('🐞 [Lobby] 建立房間摘要', {
            playerId: 'player1',
            mode: 'npc',
            aiDifficulty: 'hell',
            geishaSet: 'hololive',
            setupMode: 'custom'
        });
        expect(mockGameWebSocket.send).toHaveBeenCalledWith('CREATE_ROOM', expect.objectContaining({
            playerId: 'player1',
            displayName: 'player1',
            mode: 'npc',
            aiDifficulty: 'hell',
            geishaSet: 'hololive',
            setupMode: 'custom',
            customSelection: { characterIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] },
            lineUserId: 'line-1',
            avatarUrl: 'https://example.test/avatar.png'
        }));
    });

    test('create room is blocked when custom selection is incomplete', () => {
        const { result } = renderCommands({ customSelectionIsReady: false });

        expect(result.current.canCreateRoom).toBe(false);

        act(() => {
            result.current.createRoom();
        });

        expect(mockGameWebSocket.send).not.toHaveBeenCalled();
    });

    test('builds join payload and clears invite recovery', () => {
        const { result, options } = renderCommands({ boundAccountProfile });

        expect(result.current.canJoinRoom).toBe(true);

        act(() => {
            result.current.joinRoom();
        });

        expect(options.setIsConnecting).toHaveBeenCalledWith(true);
        expect(options.pendingJoinRoomRef.current).toBe('ROOM01');
        expect(options.setInviteRecovery).toHaveBeenCalledWith(null);
        expect(mockFrontendLogger.diagnostic).toHaveBeenCalledWith('🐞 [Lobby] 加入房間摘要', {
            roomId: 'ROOM01',
            playerId: 'player1'
        });
        expect(mockGameWebSocket.send).toHaveBeenCalledWith('JOIN_ROOM', expect.objectContaining({
            roomId: 'ROOM01',
            playerId: 'player1',
            displayName: 'player1',
            lineUserId: 'line-1',
            avatarUrl: 'https://example.test/avatar.png'
        }));
    });

    test('join room is blocked while disconnected', () => {
        const { result } = renderCommands({ connectionStatus: 'disconnected' });

        expect(result.current.canJoinRoom).toBe(false);

        act(() => {
            result.current.joinRoom();
        });

        expect(mockGameWebSocket.send).not.toHaveBeenCalled();
    });
});
