import config from '../config/environment';

export {
    getAccountDiagnosticsSnapshot,
    getBoundAccountProfile,
    getLatestAccountSyncResult,
    toGuestResult
} from './lineAccountRuntime';
export {
    buildAccountSyncRequestFromAuthorizationCode,
    buildAccountSyncRequestFromLineIdToken,
    buildAccountSyncRequestFromLineProfile
} from './lineAccountRequests';
export {
    requestAccountStatus,
    resetAccountSyncStateForTests,
    syncLineAccount,
    syncLineAccountWithAuthorizationCode,
    syncLineAccountWithIdToken
} from './lineAccountSync';

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
