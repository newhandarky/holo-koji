describe('runtimeLogger summaries', () => {
    afterEach(() => {
        jest.resetModules();
        jest.restoreAllMocks();
        delete process.env.REACT_APP_ENABLE_DIAGNOSTICS;
    });

    test('summarizeSocketMessage keeps only safe transport context', async () => {
        const { summarizeSocketMessage } = await import('./runtimeLogger');

        const summary = summarizeSocketMessage({
            type: 'GAME_ACTION',
            payload: {
                roomId: 'ROOM01',
                playerId: 'p1',
                action: {
                    type: 'INITIATE_GIFT',
                    payload: {
                        cardIds: ['c1', 'c2', 'c3']
                    }
                },
                offeredCards: [{ id: 'secret-card' }]
            }
        });

        expect(summary).toEqual({
            type: 'GAME_ACTION',
            roomId: 'ROOM01',
            playerId: 'p1',
            actionType: 'INITIATE_GIFT',
            hasPayload: true
        });
        expect(summary).not.toHaveProperty('offeredCards');
        expect(summary).not.toHaveProperty('cardIds');
    });

    test('summarizeSocketMessage includes setup mode without selected IDs', async () => {
        const { summarizeSocketMessage } = await import('./runtimeLogger');

        const summary = summarizeSocketMessage({
            type: 'CREATE_ROOM',
            payload: {
                roomId: 'ROOM01',
                playerId: 'p1',
                mode: 'online',
                geishaSet: 'hololive',
                setupMode: 'custom',
                customSelection: {
                    characterIds: ['hidden-for-log-safety']
                }
            }
        });

        expect(summary).toEqual({
            type: 'CREATE_ROOM',
            roomId: 'ROOM01',
            playerId: 'p1',
            mode: 'online',
            geishaSet: 'hololive',
            setupMode: 'custom',
            hasPayload: true
        });
        expect(summary).not.toHaveProperty('customSelection');
        expect(summary).not.toHaveProperty('characterIds');
    });

    test('summarizeGameState emits redacted state summary only', async () => {
        const { summarizeGameState } = await import('./runtimeLogger');

        const summary = summarizeGameState({
            gameId: 'ROOM01',
            geishaSet: 'hololive',
            phase: 'playing',
            round: 2,
            players: [
                { id: 'p1', hand: [{ id: 'c1' }] },
                { id: 'p2', hand: [{ id: 'c2' }] }
            ],
            pendingInteraction: {
                type: 'GIFT_SELECTION',
                offeredCards: [{ id: 'hidden-card' }]
            }
        });

        expect(summary).toEqual({
            gameId: 'ROOM01',
            geishaSet: 'hololive',
            phase: 'playing',
            round: 2,
            playerCount: 2,
            hasPendingInteraction: true
        });
        expect(summary).not.toHaveProperty('players');
        expect(summary).not.toHaveProperty('offeredCards');
    });

    test('summarizeSocketMessage reports account status without account payload details', async () => {
        const { summarizeSocketMessage } = await import('./runtimeLogger');

        const summary = summarizeSocketMessage({
            type: 'ACCOUNT_SYNC_RESULT',
            payload: {
                status: 'bound',
                profile: {
                    lineUserId: 'U1234567890',
                    displayName: '銀座玩家',
                    avatarUrl: 'https://example.test/avatar.png'
                },
                rawProfile: {
                    userId: 'U1234567890'
                },
                token: 'secret',
                persistenceStatus: {
                    mode: 'temporary',
                    message: 'Account profiles are temporary in this environment.'
                }
            }
        });

        expect(summary).toEqual({
            type: 'ACCOUNT_SYNC_RESULT',
            accountStatus: 'bound',
            accountPersistenceMode: 'temporary',
            hasPayload: true
        });
        expect(summary).not.toHaveProperty('lineUserId');
        expect(summary).not.toHaveProperty('displayName');
        expect(summary).not.toHaveProperty('rawProfile');
        expect(summary).not.toHaveProperty('token');
    });

    test('summarizeGameState reports account persistence mode only', async () => {
        const { summarizeGameState } = await import('./runtimeLogger');

        const summary = summarizeGameState({
            gameId: 'ROOM01',
            phase: 'waiting',
            players: [],
            accountPersistenceStatus: {
                mode: 'durable',
                message: 'Account profiles are persistent.',
                redisUrl: 'redis://secret'
            }
        });

        expect(summary).toEqual({
            gameId: 'ROOM01',
            phase: 'waiting',
            playerCount: 0,
            accountPersistenceMode: 'durable',
            hasPendingInteraction: false
        });
        expect(summary).not.toHaveProperty('redisUrl');
    });

    test('frontend diagnostics stay opt-in', async () => {
        const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);

        jest.resetModules();
        jest.doMock('../config/environment', () => ({
            __esModule: true,
            default: {
                isDevelopment: false,
                diagnosticsEnabled: false
            }
        }));

        const quietModule = await import('./runtimeLogger');
        quietModule.frontendLogger.diagnostic('quiet', { roomId: 'ROOM01' });
        expect(debugSpy).not.toHaveBeenCalled();

        jest.resetModules();
        jest.doMock('../config/environment', () => ({
            __esModule: true,
            default: {
                isDevelopment: true,
                diagnosticsEnabled: true
            }
        }));

        const diagnosticModule = await import('./runtimeLogger');
        diagnosticModule.frontendLogger.diagnostic('enabled', { roomId: 'ROOM01' });
        expect(debugSpy).toHaveBeenCalledWith('enabled', { roomId: 'ROOM01' });
    });
});

export {};
