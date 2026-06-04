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
            messageHandlers: mockMessageHandlers
        }
    };
});

const { gameWebSocket } = require('../services/websocket');
const {
    resetAccountResponseQueueForTests,
    runExclusiveAccountResponseRequest,
    waitForAccountSyncResult
} = require('./lineAccountResponseQueue');

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const messageHandlers = mockGameWebSocket.messageHandlers as Map<string, Set<(payload: unknown) => void>>;

const getLatestAccountSyncHandler = () => {
    const handlerCall = [...mockGameWebSocket.on.mock.calls]
        .reverse()
        .find(([type]: [string, (payload: unknown) => void]) => type === 'ACCOUNT_SYNC_RESULT');
    return handlerCall?.[1] as ((payload: unknown) => void) | undefined;
};

describe('lineAccountResponseQueue', () => {
    beforeEach(() => {
        jest.useRealTimers();
        resetAccountResponseQueueForTests();
        messageHandlers.clear();
        mockGameWebSocket.on.mockClear();
        mockGameWebSocket.off.mockClear();
    });

    test('waits for ACCOUNT_SYNC_RESULT and removes only its own listener', async () => {
        const resultPromise = waitForAccountSyncResult();
        const handler = getLatestAccountSyncHandler();
        expect(handler).toEqual(expect.any(Function));

        handler?.({
            status: 'guest',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        });

        await expect(resultPromise).resolves.toMatchObject({ status: 'guest' });
        expect(messageHandlers.has('ACCOUNT_SYNC_RESULT')).toBe(false);
        expect(mockGameWebSocket.off).not.toHaveBeenCalledWith('ACCOUNT_SYNC_RESULT');
    });

    test('returns sync-failed guest result on timeout and cleans listener', async () => {
        jest.useFakeTimers();

        const resultPromise = waitForAccountSyncResult();
        expect(getLatestAccountSyncHandler()).toEqual(expect.any(Function));

        jest.advanceTimersByTime(3000);

        await expect(resultPromise).resolves.toMatchObject({
            status: 'sync-failed',
            guestNotice: expect.stringContaining('訪客模式')
        });
        expect(messageHandlers.has('ACCOUNT_SYNC_RESULT')).toBe(false);
    });

    test('serializes requests on the shared account response channel', async () => {
        const calls: string[] = [];
        let resolveFirst: (value: string) => void = () => undefined;

        const first = runExclusiveAccountResponseRequest(() => new Promise<string>((resolve) => {
            calls.push('first');
            resolveFirst = resolve;
        }));
        const second = runExclusiveAccountResponseRequest(() => {
            calls.push('second');
            return Promise.resolve('second');
        });

        expect(calls).toEqual(['first']);
        resolveFirst('first');

        await expect(first).resolves.toBe('first');
        await expect(second).resolves.toBe('second');
        expect(calls).toEqual(['first', 'second']);
    });
});

export {};
