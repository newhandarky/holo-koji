import { AccountSyncResult, LineAccountProfile } from 'game-shared-types';
import { gameWebSocket } from '../services/websocket';
import { LineProfile } from './lineLiff';
import { frontendLogger } from './runtimeLogger';

const ACCOUNT_GUEST_NOTICE = '目前以訪客模式繼續，帳號進度暫時不會保存。';
const ACCOUNT_SYNC_TIMEOUT_MS = 3000;

const temporaryPersistenceStatus = {
    mode: 'temporary' as const,
    available: true,
    message: 'Account profiles are temporary in this environment.'
};

let latestAccountSyncResult: AccountSyncResult = {
    status: 'guest',
    persistenceStatus: temporaryPersistenceStatus
};

export const getLatestAccountSyncResult = () => latestAccountSyncResult;

export const resetAccountSyncStateForTests = () => {
    latestAccountSyncResult = {
        status: 'guest',
        persistenceStatus: temporaryPersistenceStatus
    };
};

export const getAccountDiagnosticsSnapshot = () => ({
    accountSyncStatus: latestAccountSyncResult.status,
    accountPersistenceMode: latestAccountSyncResult.persistenceStatus.mode,
    accountPersistenceAvailable: latestAccountSyncResult.persistenceStatus.available,
    accountPersistenceMessage: latestAccountSyncResult.persistenceStatus.message
});

const toGuestResult = (status: AccountSyncResult['status'] = 'guest', guestNotice?: string): AccountSyncResult => ({
    status,
    guestNotice,
    persistenceStatus: temporaryPersistenceStatus
});

export const getBoundAccountProfile = (result: AccountSyncResult): LineAccountProfile | null => (
    result.status === 'bound' && result.profile ? result.profile : null
);

export const buildAccountSyncRequestFromLineProfile = (profile: LineProfile) => ({
    profile: {
        displayName: profile.displayName,
        avatarUrl: profile.pictureUrl
    }
});

const waitForAccountSyncResult = () => new Promise<AccountSyncResult>((resolve) => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        gameWebSocket.off('ACCOUNT_SYNC_RESULT');
        resolve(toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE));
    }, ACCOUNT_SYNC_TIMEOUT_MS);

    gameWebSocket.on('ACCOUNT_SYNC_RESULT', (payload: AccountSyncResult) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        gameWebSocket.off('ACCOUNT_SYNC_RESULT');
        resolve(payload);
    });
});

export const syncLineAccount = async (profile: LineProfile | null): Promise<AccountSyncResult> => {
    if (!profile) {
        latestAccountSyncResult = toGuestResult('guest');
        return latestAccountSyncResult;
    }

    if (!gameWebSocket.isConnected()) {
        latestAccountSyncResult = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
        return latestAccountSyncResult;
    }

    try {
        const resultPromise = waitForAccountSyncResult();
        gameWebSocket.send('ACCOUNT_SYNC', buildAccountSyncRequestFromLineProfile(profile));
        latestAccountSyncResult = await resultPromise;
    } catch (error) {
        frontendLogger.warn('⚠️ LINE account sync failed', {
            error: error instanceof Error ? error.message : 'unknown'
        });
        latestAccountSyncResult = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
    }

    return latestAccountSyncResult;
};

export const requestAccountStatus = async (): Promise<AccountSyncResult> => {
    if (!gameWebSocket.isConnected()) {
        latestAccountSyncResult = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
        return latestAccountSyncResult;
    }

    try {
        const resultPromise = waitForAccountSyncResult();
        gameWebSocket.send('ACCOUNT_STATUS', {});
        latestAccountSyncResult = await resultPromise;
    } catch {
        latestAccountSyncResult = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
    }

    return latestAccountSyncResult;
};
