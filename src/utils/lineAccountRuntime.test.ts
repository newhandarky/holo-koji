import type { AccountSyncResult } from '@newhandarky/hanakoji-game-types';
import {
    getAccountDiagnosticsSnapshot,
    getBoundAccountProfile,
    getLatestAccountSyncResult,
    resetAccountSyncStateForTests,
    setLatestAccountSyncResultForTests,
    toGuestResult
} from './lineAccountRuntime';

const boundResult: AccountSyncResult = {
    status: 'bound',
    profile: {
        lineUserId: 'line-user-1',
        displayName: '銀座玩家',
        avatarUrl: 'https://example.test/avatar.png',
        createdAt: '2026-05-05T12:00:00.000Z',
        updatedAt: '2026-05-05T12:00:00.000Z',
        counters: {
            gamesPlayed: 1,
            wins: 1,
            lastPlayedAt: '2026-05-05T12:00:00.000Z'
        }
    },
    persistenceStatus: {
        mode: 'durable',
        available: true,
        message: 'Account profiles are persistent.'
    }
};

describe('lineAccountRuntime', () => {
    beforeEach(() => {
        resetAccountSyncStateForTests();
    });

    test('starts from temporary guest account sync result', () => {
        expect(getLatestAccountSyncResult()).toEqual({
            status: 'guest',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        });
    });

    test('builds guest fallback result with optional notice', () => {
        expect(toGuestResult('sync-failed', '目前以訪客模式繼續')).toEqual({
            status: 'sync-failed',
            guestNotice: '目前以訪客模式繼續',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        });
    });

    test('diagnostics expose persistence status without profile identity', () => {
        setLatestAccountSyncResultForTests(boundResult);

        const snapshot = getAccountDiagnosticsSnapshot();

        expect(snapshot).toEqual({
            accountSyncStatus: 'bound',
            accountPersistenceMode: 'durable',
            accountPersistenceAvailable: true,
            accountPersistenceMessage: 'Account profiles are persistent.'
        });
        expect(snapshot).not.toHaveProperty('lineUserId');
        expect(JSON.stringify(snapshot)).not.toContain('line-user-1');
    });

    test('extracts bound account profile only from bound result', () => {
        expect(getBoundAccountProfile(boundResult)).toEqual(boundResult.profile);
        expect(getBoundAccountProfile(toGuestResult('guest'))).toBeNull();
    });
});
