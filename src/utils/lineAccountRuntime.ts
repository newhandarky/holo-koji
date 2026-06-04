import type { AccountSyncResult, LineAccountProfile } from '@newhandarky/hanakoji-game-types';
import { temporaryPersistenceStatus } from './lineAccountTypes';

let latestAccountSyncResult: AccountSyncResult = {
    status: 'guest',
    persistenceStatus: temporaryPersistenceStatus
};

export const getLatestAccountSyncResult = () => latestAccountSyncResult;

export const setLatestAccountSyncResult = (result: AccountSyncResult) => {
    latestAccountSyncResult = result;
};

export const resetAccountSyncStateForTests = () => {
    latestAccountSyncResult = {
        status: 'guest',
        persistenceStatus: temporaryPersistenceStatus
    };
};

export const setLatestAccountSyncResultForTests = (result: AccountSyncResult) => {
    setLatestAccountSyncResult(result);
};

export const getAccountDiagnosticsSnapshot = () => ({
    accountSyncStatus: latestAccountSyncResult.status,
    accountPersistenceMode: latestAccountSyncResult.persistenceStatus.mode,
    accountPersistenceAvailable: latestAccountSyncResult.persistenceStatus.available,
    accountPersistenceMessage: latestAccountSyncResult.persistenceStatus.message
});

export const toGuestResult = (
    status: AccountSyncResult['status'] = 'guest',
    guestNotice?: string
): AccountSyncResult => ({
    status,
    guestNotice,
    persistenceStatus: temporaryPersistenceStatus
});

export const getBoundAccountProfile = (result: AccountSyncResult): LineAccountProfile | null => (
    result.status === 'bound' && result.profile ? result.profile : null
);
