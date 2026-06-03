jest.mock('../services/websocket', () => {
    const mockMessageHandlers = new Map();

    return {
        __esModule: true,
        gameWebSocket: {
            isConnected: jest.fn(() => true),
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
    consumeLineLoginCallback,
    getAccountDiagnosticsSnapshot,
    buildAccountSyncRequestFromAuthorizationCode,
    buildAccountSyncRequestFromLineIdToken,
    resetAccountSyncStateForTests,
    requestAccountStatus,
    syncLineAccount
} = require('./lineAccount');

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const messageHandlers = mockGameWebSocket.messageHandlers;

const emitAccountSyncResult = (payload: unknown) => {
    const handlerCall = [...mockGameWebSocket.on.mock.calls]
        .reverse()
        .find(([type]: [string, (payload: unknown) => void]) => type === 'ACCOUNT_SYNC_RESULT');
    const handler = handlerCall?.[1] as ((payload: unknown) => void) | undefined;
    expect(handler).toEqual(expect.any(Function));
    handler?.(payload);
};

describe('lineAccount', () => {
    beforeEach(() => {
        jest.useRealTimers();
        resetAccountSyncStateForTests();
        messageHandlers.clear();
        mockGameWebSocket.isConnected.mockReset();
        mockGameWebSocket.isConnected.mockReturnValue(true);
        mockGameWebSocket.on.mockClear();
        mockGameWebSocket.off.mockClear();
        mockGameWebSocket.send.mockClear();
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.history.pushState({}, '', '/');
    });

    test('syncLineAccount sends public profile request without client-side identity proof', async () => {
        const promise = syncLineAccount({
            userId: 'U1234567890',
            displayName: '銀座玩家',
            pictureUrl: 'https://example.test/avatar.png'
        });

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'ACCOUNT_SYNC',
            {
                profile: {
                    displayName: '銀座玩家',
                    avatarUrl: 'https://example.test/avatar.png'
                }
            }
        );
        const payload = mockGameWebSocket.send.mock.calls[0][1];
        expect(payload).not.toHaveProperty('verifiedIdentity');
        expect(payload).not.toHaveProperty('lineUserId');
        expect(payload).not.toHaveProperty('userId');
        expect(payload).not.toHaveProperty('token');
        expect(payload).not.toHaveProperty('rawProfile');

        emitAccountSyncResult({
            status: 'bound',
            profile: {
                lineUserId: 'U1234567890',
                displayName: '銀座玩家',
                avatarUrl: 'https://example.test/avatar.png',
                createdAt: '2026-05-05T12:00:00.000Z',
                updatedAt: '2026-05-05T12:00:00.000Z',
                counters: {
                    gamesPlayed: 0,
                    wins: 0,
                    lastPlayedAt: null
                }
            },
            persistenceStatus: {
                mode: 'durable',
                available: true,
                message: 'Account profiles are persistent.'
            }
        });

        await expect(promise).resolves.toMatchObject({
            status: 'bound',
            profile: {
                lineUserId: 'U1234567890',
                displayName: '銀座玩家'
            }
        });
    });

    test('builds server-verifiable LINE binding requests without client-submitted identity', () => {
        const idTokenRequest = buildAccountSyncRequestFromLineIdToken({
            userId: 'U1234567890',
            displayName: '銀座玩家',
            pictureUrl: 'https://example.test/avatar.png'
        }, 'id-token');

        expect(idTokenRequest).toEqual({
            idToken: 'id-token',
            profile: {
                displayName: '銀座玩家',
                avatarUrl: 'https://example.test/avatar.png'
            }
        });
        expect(idTokenRequest).not.toHaveProperty('verifiedIdentity');
        expect(idTokenRequest).not.toHaveProperty('lineUserId');

        expect(buildAccountSyncRequestFromAuthorizationCode('auth-code', 'https://example.test/?lineCallback=1')).toEqual({
            authorizationCode: 'auth-code',
            redirectUri: 'https://example.test/?lineCallback=1'
        });
    });

    test('consumeLineLoginCallback accepts matching state from localStorage fallback', () => {
        window.localStorage.setItem('hanamikoji-line-login-flow', JSON.stringify({
            state: 'saved-state',
            redirectUri: 'https://example.test/?lineCallback=1',
            createdAt: Date.now()
        }));
        window.history.pushState({}, '', '/?lineCallback=1&code=auth-code&state=saved-state');

        expect(consumeLineLoginCallback()).toEqual({
            authorizationCode: 'auth-code',
            redirectUri: 'https://example.test/?lineCallback=1'
        });
        expect(window.localStorage.getItem('hanamikoji-line-login-flow')).toBeNull();
    });

    test('consumeLineLoginCallback rejects expired localStorage fallback state', () => {
        window.localStorage.setItem('hanamikoji-line-login-flow', JSON.stringify({
            state: 'saved-state',
            redirectUri: 'https://example.test/?lineCallback=1',
            createdAt: Date.now() - (11 * 60 * 1000)
        }));
        window.history.pushState({}, '', '/?lineCallback=1&code=auth-code&state=saved-state');

        expect(consumeLineLoginCallback()).toBeNull();
        expect(window.localStorage.getItem('hanamikoji-line-login-flow')).toBeNull();
    });

    test('syncLineAccount returns guest when LINE profile is missing', async () => {
        await expect(syncLineAccount(null)).resolves.toEqual({
            status: 'guest',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        });
        expect(mockGameWebSocket.send).not.toHaveBeenCalled();
    });

    test('syncLineAccount returns sync-failed guest result when websocket is disconnected', async () => {
        mockGameWebSocket.isConnected.mockReturnValue(false);

        await expect(syncLineAccount({
            userId: 'U1234567890',
            displayName: '銀座玩家'
        })).resolves.toMatchObject({
            status: 'sync-failed',
            guestNotice: expect.stringContaining('訪客模式'),
            persistenceStatus: {
                mode: 'temporary',
                available: true
            }
        });
    });

    test('getAccountDiagnosticsSnapshot exposes status without profile details', async () => {
        const promise = syncLineAccount({
            userId: 'U1234567890',
            displayName: '銀座玩家'
        });

        emitAccountSyncResult({
            status: 'bound',
            profile: {
                lineUserId: 'U1234567890',
                displayName: '銀座玩家',
                createdAt: '2026-05-05T12:00:00.000Z',
                updatedAt: '2026-05-05T12:00:00.000Z',
                counters: {
                    gamesPlayed: 0,
                    wins: 0,
                    lastPlayedAt: null
                }
            },
            persistenceStatus: {
                mode: 'durable',
                available: true,
                message: 'Account profiles are persistent.'
            }
        });
        await promise;

        expect(getAccountDiagnosticsSnapshot()).toEqual({
            accountSyncStatus: 'bound',
            accountPersistenceMode: 'durable',
            accountPersistenceAvailable: true,
            accountPersistenceMessage: 'Account profiles are persistent.'
        });
        expect(getAccountDiagnosticsSnapshot()).not.toHaveProperty('lineUserId');
    });

    test('serializes account response requests on the shared response channel', async () => {
        const syncPromise = syncLineAccount({
            userId: 'U1234567890',
            displayName: '銀座玩家'
        });
        const statusPromise = requestAccountStatus();

        expect(mockGameWebSocket.send).toHaveBeenCalledTimes(1);
        expect(mockGameWebSocket.send).toHaveBeenNthCalledWith(
            1,
            'ACCOUNT_SYNC',
            expect.objectContaining({
                profile: expect.objectContaining({ displayName: '銀座玩家' })
            })
        );

        emitAccountSyncResult({
            status: 'bound',
            profile: {
                lineUserId: 'U1234567890',
                displayName: '銀座玩家',
                createdAt: '2026-05-05T12:00:00.000Z',
                updatedAt: '2026-05-05T12:00:00.000Z',
                counters: {
                    gamesPlayed: 0,
                    wins: 0,
                    lastPlayedAt: null
                }
            },
            persistenceStatus: {
                mode: 'durable',
                available: true,
                message: 'Account profiles are persistent.'
            }
        });

        await expect(syncPromise).resolves.toMatchObject({ status: 'bound' });
        await Promise.resolve();
        expect(mockGameWebSocket.send).toHaveBeenCalledTimes(2);
        expect(mockGameWebSocket.send).toHaveBeenNthCalledWith(2, 'ACCOUNT_STATUS', {});

        emitAccountSyncResult({
            status: 'guest',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        });

        await expect(statusPromise).resolves.toMatchObject({ status: 'guest' });
    });
});

export {};
