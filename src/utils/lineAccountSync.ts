import { AccountSyncResult } from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { LineProfile } from './lineLiffTypes';
import { frontendLogger } from './runtimeLogger';
import { ACCOUNT_GUEST_NOTICE } from './lineAccountTypes';
import {
    buildAccountSyncRequestFromAuthorizationCode,
    buildAccountSyncRequestFromLineIdToken,
    buildAccountSyncRequestFromLineProfile
} from './lineAccountRequests';
import {
    getLatestAccountSyncResult,
    resetAccountSyncStateForTests as resetRuntimeAccountSyncStateForTests,
    setLatestAccountSyncResult,
    toGuestResult
} from './lineAccountRuntime';
import {
    resetAccountResponseQueueForTests,
    runExclusiveAccountResponseRequest,
    waitForAccountSyncResult
} from './lineAccountResponseQueue';

export const resetAccountSyncStateForTests = () => {
    resetRuntimeAccountSyncStateForTests();
    resetAccountResponseQueueForTests();
};

export const syncLineAccount = async (profile: LineProfile | null): Promise<AccountSyncResult> => {
    if (!profile) {
        const result = toGuestResult('guest');
        setLatestAccountSyncResult(result);
        return result;
    }

    if (!gameWebSocket.isConnected()) {
        const result = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
        setLatestAccountSyncResult(result);
        return result;
    }

    await runExclusiveAccountResponseRequest(async () => {
        try {
            const resultPromise = waitForAccountSyncResult();
            gameWebSocket.send('ACCOUNT_SYNC', buildAccountSyncRequestFromLineProfile(profile));
            setLatestAccountSyncResult(await resultPromise);
        } catch (error) {
            frontendLogger.warn('⚠️ LINE account sync failed', {
                error: error instanceof Error ? error.message : 'unknown'
            });
            setLatestAccountSyncResult(toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE));
        }
    });

    return getLatestAccountSyncResult();
};

export const syncLineAccountWithIdToken = async (
    profile: LineProfile,
    idToken: string
): Promise<AccountSyncResult> => {
    if (!gameWebSocket.isConnected()) {
        const result = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
        setLatestAccountSyncResult(result);
        return result;
    }

    await runExclusiveAccountResponseRequest(async () => {
        try {
            const resultPromise = waitForAccountSyncResult();
            gameWebSocket.send('ACCOUNT_SYNC', buildAccountSyncRequestFromLineIdToken(profile, idToken));
            setLatestAccountSyncResult(await resultPromise);
        } catch (error) {
            frontendLogger.warn('⚠️ LINE account binding failed', {
                error: error instanceof Error ? error.message : 'unknown'
            });
            setLatestAccountSyncResult(toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE));
        }
    });

    return getLatestAccountSyncResult();
};

export const syncLineAccountWithAuthorizationCode = async (
    authorizationCode: string,
    redirectUri: string
): Promise<AccountSyncResult> => {
    if (!gameWebSocket.isConnected()) {
        const result = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
        setLatestAccountSyncResult(result);
        return result;
    }

    await runExclusiveAccountResponseRequest(async () => {
        try {
            const resultPromise = waitForAccountSyncResult();
            gameWebSocket.send('ACCOUNT_SYNC', buildAccountSyncRequestFromAuthorizationCode(authorizationCode, redirectUri));
            setLatestAccountSyncResult(await resultPromise);
        } catch (error) {
            frontendLogger.warn('⚠️ LINE callback binding failed', {
                error: error instanceof Error ? error.message : 'unknown'
            });
            setLatestAccountSyncResult(toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE));
        }
    });

    return getLatestAccountSyncResult();
};

export const requestAccountStatus = async (): Promise<AccountSyncResult> => {
    if (!gameWebSocket.isConnected()) {
        const result = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
        setLatestAccountSyncResult(result);
        return result;
    }

    await runExclusiveAccountResponseRequest(async () => {
        try {
            const resultPromise = waitForAccountSyncResult();
            gameWebSocket.send('ACCOUNT_STATUS', {});
            setLatestAccountSyncResult(await resultPromise);
        } catch {
            setLatestAccountSyncResult(toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE));
        }
    });

    return getLatestAccountSyncResult();
};
