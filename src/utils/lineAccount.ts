import { AccountSyncResult } from '@newhandarky/hanakoji-game-types';
import { gameWebSocket } from '../services/websocket';
import { LineProfile } from './lineLiff';
import { frontendLogger } from './runtimeLogger';
import config from '../config/environment';
import { ACCOUNT_GUEST_NOTICE, ACCOUNT_SYNC_TIMEOUT_MS } from './lineAccountTypes';
import {
    getLatestAccountSyncResult,
    resetAccountSyncStateForTests as resetRuntimeAccountSyncStateForTests,
    setLatestAccountSyncResult,
    toGuestResult
} from './lineAccountRuntime';

let accountResponseQueue: Promise<unknown> | null = null;

export {
    getAccountDiagnosticsSnapshot,
    getBoundAccountProfile,
    getLatestAccountSyncResult,
    toGuestResult
} from './lineAccountRuntime';

export const resetAccountSyncStateForTests = () => {
    resetRuntimeAccountSyncStateForTests();
    accountResponseQueue = null;
};

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

const runExclusiveAccountResponseRequest = async <T>(request: () => Promise<T>): Promise<T> => {
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
