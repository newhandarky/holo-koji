import config from '../config/environment';
import './lineLiffTypes';

let liffInitPromise: Promise<void> | null = null;
let liffReady = false;

const isLikelyLineClient = () => /Line\//i.test(navigator.userAgent);

export const canUseLineClient = () => {
    if (window.liff && typeof window.liff.isInClient === 'function') {
        try {
            return window.liff.isInClient() === true;
        } catch {
            return false;
        }
    }

    return isLikelyLineClient();
};

export const canUseShareTargetPicker = () => {
    if (typeof window.liff?.shareTargetPicker !== 'function') {
        return false;
    }

    if (typeof window.liff?.isApiAvailable !== 'function') {
        return false;
    }

    try {
        return window.liff.isApiAvailable('shareTargetPicker') === true;
    } catch {
        return false;
    }
};

export const isSupportedLiffOrigin = () => {
    if (isLikelyLineClient()) {
        return true;
    }

    if (!config.webAppUrl) {
        return false;
    }

    try {
        return window.location.origin === new URL(config.webAppUrl).origin;
    } catch {
        return false;
    }
};

export const isLineClient = () => {
    return canUseLineClient();
};

export const ensureLiffReady = async () => {
    if (!window.liff || !config.liffId || !isSupportedLiffOrigin()) {
        return;
    }

    if (!liffInitPromise) {
        liffInitPromise = window.liff.init({ liffId: config.liffId }).catch((error: unknown) => {
            liffInitPromise = null;
            liffReady = false;
            throw error;
        });
    }

    await liffInitPromise;
    liffReady = true;
};

export const initLiffIfPossible = async () => {
    if (!window.liff || !config.liffId) {
        return { ready: false as const, reason: 'missing' as const };
    }

    if (!isSupportedLiffOrigin()) {
        return { ready: false as const, reason: 'unsupported-origin' as const };
    }

    try {
        await ensureLiffReady();
        return { ready: true as const };
    } catch (error) {
        return { ready: false as const, reason: 'init-failed' as const, error };
    }
};

export const shouldShowLiffDiagnostics = () => isLikelyLineClient() || (!!window.liff && isSupportedLiffOrigin());

export const getLiffDiagnosticsSnapshot = () => {
    const supportedOrigin = isSupportedLiffOrigin();
    const hasSdk = Boolean(window.liff);

    let loggedIn: boolean | 'unknown' = 'unknown';
    let inLineClient: boolean | 'unknown' = 'unknown';
    let shareTargetPickerAvailable: boolean | 'unknown' = 'unknown';

    if (hasSdk && config.liffId && supportedOrigin && typeof window.liff?.isLoggedIn === 'function') {
        try {
            loggedIn = window.liff.isLoggedIn();
        } catch {
            loggedIn = 'unknown';
        }
    }

    if (hasSdk && typeof window.liff?.isInClient === 'function') {
        try {
            inLineClient = window.liff.isInClient();
        } catch {
            inLineClient = 'unknown';
        }
    } else if (isLikelyLineClient()) {
        inLineClient = true;
    }

    if (hasSdk && typeof window.liff?.isApiAvailable === 'function') {
        try {
            shareTargetPickerAvailable = window.liff.isApiAvailable('shareTargetPicker');
        } catch {
            shareTargetPickerAvailable = 'unknown';
        }
    }

    return {
        supportedOrigin,
        hasSdk,
        ready: liffReady,
        loggedIn,
        inLineClient,
        shareTargetPickerAvailable,
        fallbackAvailable: true
    };
};

export const __resetLiffRuntimeForTests = () => {
    liffInitPromise = null;
    liffReady = false;
};
