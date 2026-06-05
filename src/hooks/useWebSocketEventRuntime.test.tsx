import { act, renderHook, waitFor } from '@testing-library/react';
import { gameWebSocket } from '../services/websocket';
import { getStoredRoomSessionToken, saveRoomSessionToken } from '../utils/roomSession';
import { useWebSocketEventRuntime } from './useWebSocketEventRuntime';

jest.mock('../services/websocket', () => {
    const messageHandlers = new Map<string, Set<(payload: unknown) => void>>();
    const unsubscribeHandlers: jest.Mock[] = [];

    return {
        __esModule: true,
        gameWebSocket: {
            connect: jest.fn().mockResolvedValue(undefined),
            isConnected: jest.fn(() => true),
            on: jest.fn((messageType: string, handler: (payload: unknown) => void) => {
                const handlers = messageHandlers.get(messageType) ?? new Set();
                handlers.add(handler);
                messageHandlers.set(messageType, handlers);
                const unsubscribe = jest.fn(() => {
                    handlers.delete(handler);
                    if (handlers.size === 0) {
                        messageHandlers.delete(messageType);
                    }
                });
                unsubscribeHandlers.push(unsubscribe);
                return unsubscribe;
            }),
            send: jest.fn(),
            disconnect: jest.fn(),
            getAttachedSession: jest.fn(() => null),
            messageHandlers,
            unsubscribeHandlers
        }
    };
});

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket> & {
    messageHandlers: Map<string, Set<(payload: unknown) => void>>;
    unsubscribeHandlers: jest.Mock[];
};

const getRegisteredHandler = async (messageType: string) => {
    await waitFor(() => expect(mockGameWebSocket.on).toHaveBeenCalledWith(messageType, expect.any(Function)));
    return [...mockGameWebSocket.on.mock.calls]
        .reverse()
        .find(([registeredType]) => registeredType === messageType)?.[1] as ((payload: unknown) => void);
};

describe('useWebSocketEventRuntime', () => {
    beforeEach(() => {
        window.localStorage.clear();
        mockGameWebSocket.connect.mockClear();
        mockGameWebSocket.isConnected.mockClear();
        mockGameWebSocket.isConnected.mockReturnValue(true);
        mockGameWebSocket.send.mockClear();
        mockGameWebSocket.getAttachedSession.mockClear();
        mockGameWebSocket.getAttachedSession.mockReturnValue(null);
        mockGameWebSocket.messageHandlers.clear();
        mockGameWebSocket.unsubscribeHandlers.length = 0;
        mockGameWebSocket.on.mockImplementation((messageType: string, handler: (payload: unknown) => void) => {
            const handlers = mockGameWebSocket.messageHandlers.get(messageType) ?? new Set();
            handlers.add(handler);
            mockGameWebSocket.messageHandlers.set(messageType, handlers);
            const unsubscribe = jest.fn(() => {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    mockGameWebSocket.messageHandlers.delete(messageType);
                }
            });
            mockGameWebSocket.unsubscribeHandlers.push(unsubscribe);
            return unsubscribe;
        });
        mockGameWebSocket.on.mockClear();
    });

    test('joins connected room with stored session token', async () => {
        saveRoomSessionToken('ABC123', 'host', 'host-token');

        renderHook(() => useWebSocketEventRuntime({
            gameId: 'ABC123',
            playerId: 'host',
            gameDispatch: jest.fn(),
            clientDispatch: jest.fn()
        }));

        await waitFor(() => expect(mockGameWebSocket.send).toHaveBeenCalledWith('JOIN_ROOM', {
            roomId: 'ABC123',
            playerId: 'host',
            roomSessionToken: 'host-token'
        }));
    });

    test('does not rejoin when the current socket is already attached to this room and player', async () => {
        mockGameWebSocket.getAttachedSession.mockReturnValue({
            roomId: 'ABC123',
            playerId: 'host'
        });

        renderHook(() => useWebSocketEventRuntime({
            gameId: 'ABC123',
            playerId: 'host',
            gameDispatch: jest.fn(),
            clientDispatch: jest.fn()
        }));

        await waitFor(() => expect(mockGameWebSocket.getAttachedSession).toHaveBeenCalled());
        expect(mockGameWebSocket.send).not.toHaveBeenCalledWith('JOIN_ROOM', expect.anything());
    });

    test('clears stale room session token on PLAYER_ID_TAKEN', async () => {
        saveRoomSessionToken('ABC123', 'host', 'stale-token');
        const clientDispatch = jest.fn();

        renderHook(() => useWebSocketEventRuntime({
            gameId: 'ABC123',
            playerId: 'host',
            gameDispatch: jest.fn(),
            clientDispatch
        }));

        const errorHandler = await getRegisteredHandler('ERROR');

        act(() => {
            errorHandler({
                code: 'PLAYER_ID_TAKEN',
                message: '此玩家名稱已在房間中使用，請重新加入或更換名稱。'
            });
        });

        expect(getStoredRoomSessionToken('ABC123', 'host')).toBeNull();
        expect(clientDispatch).toHaveBeenCalledWith({
            type: 'SET_ERROR',
            payload: {
                error: '這個房間的重連憑證已失效，請返回大廳重新加入或更換名稱。'
            }
        });
    });

    test('queues and consumes draw and deal animation events', async () => {
        const card = { id: 'card-1', geishaId: 1, type: 'real' as const };
        const { result } = renderHook(() => useWebSocketEventRuntime({
            gameId: 'ABC123',
            playerId: 'host',
            gameDispatch: jest.fn(),
            clientDispatch: jest.fn()
        }));

        const cardDrawnHandler = await getRegisteredHandler('CARD_DRAWN');
        const dealAnimationHandler = await getRegisteredHandler('DEAL_ANIMATION');

        act(() => {
            cardDrawnHandler({ playerId: 'host', card });
            dealAnimationHandler({
                sequence: [{ order: 1, playerId: 'host', card }]
            });
        });

        expect(result.current.drawQueue).toEqual([{ playerId: 'host', card }]);
        expect(result.current.dealQueue).toEqual([{ sequence: [{ order: 1, playerId: 'host', card }] }]);

        act(() => {
            result.current.consumeDrawEvent();
            result.current.consumeDealEvent();
        });

        expect(result.current.drawQueue).toEqual([]);
        expect(result.current.dealQueue).toEqual([]);
    });

    test('clears ready status when server state enters active play', async () => {
        const { result } = renderHook(() => useWebSocketEventRuntime({
            gameId: 'ABC123',
            playerId: 'host',
            gameDispatch: jest.fn(),
            clientDispatch: jest.fn()
        }));

        const readyCheckHandler = await getRegisteredHandler('READY_CHECK');
        const gameStateHandler = await getRegisteredHandler('GAME_STATE_UPDATE');

        act(() => {
            readyCheckHandler({
                confirmations: ['host'],
                waitingFor: ['guest']
            });
        });

        expect(result.current.readyStatus).toEqual({
            confirmations: ['host'],
            waitingFor: ['guest']
        });

        act(() => {
            gameStateHandler({
                gameId: 'ABC123',
                players: [],
                phase: 'playing'
            });
        });

        expect(result.current.readyStatus).toBeNull();
    });

    test('ignores non-object draw and deal payloads without changing queues', async () => {
        const { result } = renderHook(() => useWebSocketEventRuntime({
            gameId: 'ABC123',
            playerId: 'host',
            gameDispatch: jest.fn(),
            clientDispatch: jest.fn()
        }));

        const cardDrawnHandler = await getRegisteredHandler('CARD_DRAWN');
        const dealAnimationHandler = await getRegisteredHandler('DEAL_ANIMATION');

        act(() => {
            cardDrawnHandler({ playerId: 'host', card: null });
            dealAnimationHandler({ sequence: [{ order: 1, playerId: 'host', card: null }] });
        });

        expect(result.current.drawQueue).toEqual([]);
        expect(result.current.dealQueue).toEqual([]);
    });

    test('unmount cleanup removes draw and deal listeners', async () => {
        const { unmount } = renderHook(() => useWebSocketEventRuntime({
            gameId: 'ABC123',
            playerId: 'host',
            gameDispatch: jest.fn(),
            clientDispatch: jest.fn()
        }));

        const cardDrawnHandler = await getRegisteredHandler('CARD_DRAWN');
        const dealAnimationHandler = await getRegisteredHandler('DEAL_ANIMATION');
        expect(mockGameWebSocket.messageHandlers.get('CARD_DRAWN')?.has(cardDrawnHandler)).toBe(true);
        expect(mockGameWebSocket.messageHandlers.get('DEAL_ANIMATION')?.has(dealAnimationHandler)).toBe(true);

        unmount();

        expect(mockGameWebSocket.messageHandlers.get('CARD_DRAWN')).toBeUndefined();
        expect(mockGameWebSocket.messageHandlers.get('DEAL_ANIMATION')).toBeUndefined();
    });

    test('unmount cleanup removes only this hook listeners', async () => {
        const externalHandler = jest.fn();
        gameWebSocket.on('ERROR', externalHandler);

        const { unmount } = renderHook(() => useWebSocketEventRuntime({
            gameId: 'ABC123',
            playerId: 'host',
            gameDispatch: jest.fn(),
            clientDispatch: jest.fn()
        }));

        await waitFor(() => expect(mockGameWebSocket.on).toHaveBeenCalledWith('ERROR', expect.any(Function)));
        const handlersBeforeUnmount = mockGameWebSocket.messageHandlers.get('ERROR');
        expect(handlersBeforeUnmount?.has(externalHandler)).toBe(true);
        expect(handlersBeforeUnmount?.size).toBeGreaterThan(1);

        unmount();

        const handlersAfterUnmount = mockGameWebSocket.messageHandlers.get('ERROR');
        expect(handlersAfterUnmount?.has(externalHandler)).toBe(true);
        expect(handlersAfterUnmount?.size).toBe(1);
    });
});
