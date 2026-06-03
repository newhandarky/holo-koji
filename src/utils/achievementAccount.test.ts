jest.mock('../services/websocket', () => {
    const mockMessageHandlers = new Map();

    return {
        __esModule: true,
        gameWebSocket: {
            on: jest.fn((type, handler) => {
                const handlers = mockMessageHandlers.get(type) ?? new Set();
                handlers.add(handler);
                mockMessageHandlers.set(type, handlers);
                return () => {
                    handlers.delete(handler);
                    if (handlers.size === 0) {
                        mockMessageHandlers.delete(type);
                    }
                };
            }),
            off: jest.fn((type, handler) => {
                if (!handler) {
                    mockMessageHandlers.delete(type);
                    return;
                }
                const handlers = mockMessageHandlers.get(type);
                handlers?.delete(handler);
                if (handlers?.size === 0) {
                    mockMessageHandlers.delete(type);
                }
            }),
            send: jest.fn(),
            messageHandlers: mockMessageHandlers
        }
    };
});

const { gameWebSocket } = require('../services/websocket');
const {
    acknowledgeAchievementUnlocks,
    requestAchievementStatus,
    resetAchievementAccountStateForTests
} = require('./achievementAccount');

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const messageHandlers = mockGameWebSocket.messageHandlers;

const availableAchievementResult = {
    status: 'available',
    persistenceStatus: {
        mode: 'durable',
        available: true,
        message: 'Account profiles are persistent.'
    },
    newUnlockCount: 0,
    items: [],
    generatedAt: '2026-05-05T12:00:00.000Z'
};

const emitAchievementResult = (payload: unknown) => {
    const handlers = messageHandlers.get('ACHIEVEMENT_STATUS_RESULT');
    if (handlers?.size) {
        [...handlers].forEach((handler) => handler(payload));
        return;
    }
    const handlerCall = [...mockGameWebSocket.on.mock.calls]
        .reverse()
        .find(([type]: [string, (payload: unknown) => void]) => type === 'ACHIEVEMENT_STATUS_RESULT');
    const handler = handlerCall?.[1] as ((payload: unknown) => void) | undefined;
    expect(handler).toEqual(expect.any(Function));
    handler?.(payload);
};

describe('achievementAccount', () => {
    beforeEach(() => {
        jest.useRealTimers();
        resetAchievementAccountStateForTests();
        messageHandlers.clear();
        mockGameWebSocket.on.mockClear();
        mockGameWebSocket.off.mockClear();
        mockGameWebSocket.send.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('requestAchievementStatus resolves server result and removes only its own listener', async () => {
        const externalListener = jest.fn();
        gameWebSocket.on('ACHIEVEMENT_STATUS_RESULT', externalListener);

        const resultPromise = requestAchievementStatus();

        expect(mockGameWebSocket.send).toHaveBeenCalledWith('ACHIEVEMENT_STATUS', {});
        emitAchievementResult(availableAchievementResult);

        await expect(resultPromise).resolves.toEqual(availableAchievementResult);
        expect(mockGameWebSocket.off).not.toHaveBeenCalledWith('ACHIEVEMENT_STATUS_RESULT');
    });

    test('requestAchievementStatus times out as unavailable and keeps unrelated listeners', async () => {
        jest.useFakeTimers();
        const externalListener = jest.fn();
        gameWebSocket.on('ACHIEVEMENT_STATUS_RESULT', externalListener);

        const resultPromise = requestAchievementStatus();

        jest.advanceTimersByTime(3000);

        await expect(resultPromise).resolves.toMatchObject({
            status: 'unavailable',
            persistenceStatus: {
                mode: 'temporary',
                available: false
            }
        });
        expect(mockGameWebSocket.off).not.toHaveBeenCalledWith('ACHIEVEMENT_STATUS_RESULT');
    });

    test('acknowledgeAchievementUnlocks sends valid ids and resolves refreshed status', async () => {
        const resultPromise = acknowledgeAchievementUnlocks({
            achievementIds: ['first_match']
        });

        expect(mockGameWebSocket.send).toHaveBeenCalledWith('ACHIEVEMENT_ACK_NEW_UNLOCKS', {
            achievementIds: ['first_match']
        });

        emitAchievementResult(availableAchievementResult);

        await expect(resultPromise).resolves.toEqual(availableAchievementResult);
    });

    test('serializes achievement status and ack requests on the shared response channel', async () => {
        const statusPromise = requestAchievementStatus();
        const ackPromise = acknowledgeAchievementUnlocks({
            achievementIds: ['first_match']
        });

        expect(mockGameWebSocket.send).toHaveBeenCalledTimes(1);
        expect(mockGameWebSocket.send).toHaveBeenNthCalledWith(1, 'ACHIEVEMENT_STATUS', {});

        emitAchievementResult(availableAchievementResult);

        await expect(statusPromise).resolves.toEqual(availableAchievementResult);
        await Promise.resolve();

        expect(mockGameWebSocket.send).toHaveBeenCalledTimes(2);
        expect(mockGameWebSocket.send).toHaveBeenNthCalledWith(2, 'ACHIEVEMENT_ACK_NEW_UNLOCKS', {
            achievementIds: ['first_match']
        });

        emitAchievementResult({
            ...availableAchievementResult,
            newUnlockCount: 1
        });

        await expect(ackPromise).resolves.toMatchObject({
            status: 'available',
            newUnlockCount: 1
        });
    });
});

export {};
