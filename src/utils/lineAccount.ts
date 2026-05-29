import { AccountSyncResult, LineAccountProfile } from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { LineProfile } from './lineLiff';
import { frontendLogger } from './runtimeLogger';
import config from '../config/environment';

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

export const buildAccountSyncRequestFromLineIdToken = (profile: LineProfile, idToken: string) => ({
    idToken,
    profile: {
        displayName: profile.displayName,
        avatarUrl: profile.pictureUrl
    }
});

export const buildAccountSyncRequestFromAuthorizationCode = (authorizationCode: string, redirectUri: string) => ({
    authorizationCode,
    redirectUri
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

export const syncLineAccountWithIdToken = async (
    profile: LineProfile,
    idToken: string
): Promise<AccountSyncResult> => {
    if (!gameWebSocket.isConnected()) {
        latestAccountSyncResult = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
        return latestAccountSyncResult;
    }

    try {
        const resultPromise = waitForAccountSyncResult();
        gameWebSocket.send('ACCOUNT_SYNC', buildAccountSyncRequestFromLineIdToken(profile, idToken));
        latestAccountSyncResult = await resultPromise;
    } catch (error) {
        frontendLogger.warn('⚠️ LINE account binding failed', {
            error: error instanceof Error ? error.message : 'unknown'
        });
        latestAccountSyncResult = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
    }

    return latestAccountSyncResult;
};

export const syncLineAccountWithAuthorizationCode = async (
    authorizationCode: string,
    redirectUri: string
): Promise<AccountSyncResult> => {
    if (!gameWebSocket.isConnected()) {
        latestAccountSyncResult = toGuestResult('sync-failed', ACCOUNT_GUEST_NOTICE);
        return latestAccountSyncResult;
    }

    try {
        const resultPromise = waitForAccountSyncResult();
        gameWebSocket.send('ACCOUNT_SYNC', buildAccountSyncRequestFromAuthorizationCode(authorizationCode, redirectUri));
        latestAccountSyncResult = await resultPromise;
    } catch (error) {
        frontendLogger.warn('⚠️ LINE callback binding failed', {
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

const LINE_LOGIN_STATE_KEY = 'hanamikoji-line-login-state';
const LINE_LOGIN_REDIRECT_URI_KEY = 'hanamikoji-line-login-redirect-uri';
const LINE_LOGIN_FLOW_KEY = 'hanamikoji-line-login-flow';
const LINE_LOGIN_FLOW_TTL_MS = 10 * 60 * 1000;

const createRandomState = () => {
    const values = new Uint8Array(16);
    window.crypto.getRandomValues(values);
    return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('');
};

export const getLineLoginCallbackUrl = () => {
    const basePath = window.location.pathname.includes('/holo-koji') ? '/holo-koji' : '';
    return `${window.location.origin}${basePath}/?lineCallback=1`;
};

const saveLineLoginFlow = (state: string, redirectUri: string) => {
    const flow = JSON.stringify({
        state,
        redirectUri,
        createdAt: Date.now()
    });

    sessionStorage.setItem(LINE_LOGIN_STATE_KEY, state);
    sessionStorage.setItem(LINE_LOGIN_REDIRECT_URI_KEY, redirectUri);
    localStorage.setItem(LINE_LOGIN_FLOW_KEY, flow);
};

const readStoredLineLoginFlow = () => {
    const sessionState = sessionStorage.getItem(LINE_LOGIN_STATE_KEY) ?? '';
    const sessionRedirectUri = sessionStorage.getItem(LINE_LOGIN_REDIRECT_URI_KEY) ?? '';
    if (sessionState) {
        return {
            state: sessionState,
            redirectUri: sessionRedirectUri || getLineLoginCallbackUrl()
        };
    }

    try {
        const storedFlow = JSON.parse(localStorage.getItem(LINE_LOGIN_FLOW_KEY) ?? '{}');
        const state = typeof storedFlow.state === 'string' ? storedFlow.state : '';
        const redirectUri = typeof storedFlow.redirectUri === 'string' ? storedFlow.redirectUri : '';
        const createdAt = typeof storedFlow.createdAt === 'number' ? storedFlow.createdAt : 0;
        if (!state || !redirectUri || Date.now() - createdAt > LINE_LOGIN_FLOW_TTL_MS) {
            return null;
        }

        return { state, redirectUri };
    } catch {
        return null;
    }
};

const clearStoredLineLoginFlow = () => {
    sessionStorage.removeItem(LINE_LOGIN_STATE_KEY);
    sessionStorage.removeItem(LINE_LOGIN_REDIRECT_URI_KEY);
    localStorage.removeItem(LINE_LOGIN_FLOW_KEY);
};

export const beginBrowserLineLogin = () => {
    const state = createRandomState();
    const redirectUri = getLineLoginCallbackUrl();
    saveLineLoginFlow(state, redirectUri);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.lineChannelId,
        redirect_uri: redirectUri,
        state,
        scope: 'profile openid'
    });

    window.location.assign(`https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`);
};

export const consumeLineLoginCallback = () => {
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get('code') ?? '';
    const returnedState = params.get('state') ?? '';
    const storedFlow = readStoredLineLoginFlow();
    clearStoredLineLoginFlow();

    if (!authorizationCode || !returnedState || !storedFlow || returnedState !== storedFlow.state) {
        return null;
    }

    return {
        authorizationCode,
        redirectUri: storedFlow.redirectUri
    };
};
