import { getLineCallbackOutcome } from './lineCallbackFlow';

describe('lineCallbackFlow', () => {
    test('bound account result shows success and schedules lobby return', () => {
        expect(getLineCallbackOutcome({
            status: 'bound',
            profile: {
                lineUserId: 'U1234567890',
                displayName: 'LINE 玩家',
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
        })).toEqual({
            message: 'LINE 帳號綁定完成，正在返回大廳。',
            shouldReturnToLobby: true
        });
    });

    test('non-bound account result shows guest notice and stays on callback page', () => {
        expect(getLineCallbackOutcome({
            status: 'sync-failed',
            guestNotice: '目前以訪客模式繼續。',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        })).toEqual({
            message: '目前以訪客模式繼續。',
            shouldReturnToLobby: false
        });
    });
});
