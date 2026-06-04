import {
    beginBrowserLineLogin,
    buildAccountSyncRequestFromAuthorizationCode,
    buildAccountSyncRequestFromLineIdToken,
    buildAccountSyncRequestFromLineProfile,
    consumeLineLoginCallback,
    getAccountDiagnosticsSnapshot,
    getBoundAccountProfile,
    getLatestAccountSyncResult,
    getLineLoginCallbackUrl,
    requestAccountStatus,
    resetAccountSyncStateForTests,
    syncLineAccount,
    syncLineAccountWithAuthorizationCode,
    syncLineAccountWithIdToken,
    toGuestResult
} from './lineAccount';

describe('lineAccount compatibility barrel', () => {
    test('re-exports browser login, request, runtime, and sync helpers', () => {
        [
            beginBrowserLineLogin,
            buildAccountSyncRequestFromAuthorizationCode,
            buildAccountSyncRequestFromLineIdToken,
            buildAccountSyncRequestFromLineProfile,
            consumeLineLoginCallback,
            getAccountDiagnosticsSnapshot,
            getBoundAccountProfile,
            getLatestAccountSyncResult,
            getLineLoginCallbackUrl,
            requestAccountStatus,
            resetAccountSyncStateForTests,
            syncLineAccount,
            syncLineAccountWithAuthorizationCode,
            syncLineAccountWithIdToken,
            toGuestResult
        ].forEach((exportedHelper) => {
            expect(exportedHelper).toEqual(expect.any(Function));
        });
    });
});
