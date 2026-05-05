jest.mock('../services/websocket', () => {
    const mockMessageHandlers = new Map();

    return {
        __esModule: true,
        gameWebSocket: {
            isConnected: jest.fn(() => true),
            on: jest.fn((type, handler) => {
                mockMessageHandlers.set(type, handler);
            }),
            off: jest.fn((type) => {
                mockMessageHandlers.delete(type);
            }),
            send: jest.fn(),
            messageHandlers: mockMessageHandlers
        }
    };
});

const { gameWebSocket } = require('../services/websocket');
const {
    getAccountDiagnosticsSnapshot,
    resetAccountSyncStateForTests,
    syncLineAccount
} = require('./lineAccount');

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const messageHandlers = mockGameWebSocket.messageHandlers;

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

        const accountSyncHandler = mockGameWebSocket.on.mock.calls.find(
            ([type]: [string, (payload: any) => void]) => type === 'ACCOUNT_SYNC_RESULT'
        )?.[1];
        accountSyncHandler?.({
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

        const accountSyncHandler = mockGameWebSocket.on.mock.calls.find(
            ([type]: [string, (payload: any) => void]) => type === 'ACCOUNT_SYNC_RESULT'
        )?.[1];
        accountSyncHandler?.({
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
});

export {};
