import { AccountSyncResult } from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { ACCOUNT_GUEST_NOTICE, ACCOUNT_SYNC_TIMEOUT_MS } from './lineAccountTypes';
import { toGuestResult } from './lineAccountRuntime';

let accountResponseQueue: Promise<unknown> | null = null;

export const resetAccountResponseQueueForTests = () => {
    accountResponseQueue = null;
};

export const waitForAccountSyncResult = () => new Promise<AccountSyncResult>((resolve) => {
    let settled = false;
    let unsubscribe: () => void = () => undefined;
    const cleanup = (timeoutId: number) => {
        window.clearTimeout(timeoutId);
        unsubscribe();
    };
    const timeoutId = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup(timeoutId);
        resolve(toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE));
    }, ACCOUNT_SYNC_TIMEOUT_MS);

    const handleAccountSyncResult = (payload: AccountSyncResult) => {
        if (settled) return;
        settled = true;
        cleanup(timeoutId);
        resolve(payload);
    };
    const maybeUnsubscribe = gameWebSocket.on('ACCOUNT_SYNC_RESULT', handleAccountSyncResult);
    unsubscribe = typeof maybeUnsubscribe === 'function'
        ? maybeUnsubscribe
        : () => gameWebSocket.off('ACCOUNT_SYNC_RESULT', handleAccountSyncResult);
});

export const runExclusiveAccountResponseRequest = async <T>(request: () => Promise<T>): Promise<T> => {
    const previousRequest = accountResponseQueue;
    const runRequest = (async () => {
        if (previousRequest) {
            await previousRequest.catch(() => undefined);
        }
        return request();
    })();
    const trackedRequest = runRequest.finally(() => {
        if (accountResponseQueue === trackedRequest) {
            accountResponseQueue = null;
        }
    });
    accountResponseQueue = trackedRequest;
    return runRequest;
};
