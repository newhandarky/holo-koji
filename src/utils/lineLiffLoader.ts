import './lineLiffTypes';

const LIFF_SDK_SCRIPT_ID = 'line-liff-sdk';
const LIFF_SDK_SRC = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
const LOADER_OWNED_ATTRIBUTE = 'data-hanamikoji-liff-loader';

let liffSdkLoadPromise: Promise<void> | null = null;
let resetPendingLoad: (() => void) | null = null;

export const loadLiffSdk = (): Promise<void> => {
    if (window.liff) {
        return Promise.resolve();
    }

    if (liffSdkLoadPromise) {
        return liffSdkLoadPromise;
    }

    const existingScript = document.getElementById(LIFF_SDK_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement('script');
    const isLoaderOwned = !existingScript || script.getAttribute(LOADER_OWNED_ATTRIBUTE) === 'true';

    liffSdkLoadPromise = new Promise<void>((resolve, reject) => {
        const cleanup = () => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
            resetPendingLoad = null;
        };

        const fail = () => {
            cleanup();
            liffSdkLoadPromise = null;
            if (isLoaderOwned) {
                script.remove();
            }
            reject(new Error('LIFF SDK 載入失敗'));
        };

        const handleLoad = () => {
            if (!window.liff) {
                fail();
                return;
            }

            cleanup();
            resolve();
        };

        const handleError = () => fail();

        resetPendingLoad = () => {
            cleanup();
            if (isLoaderOwned) {
                script.remove();
            }
        };

        script.addEventListener('load', handleLoad, { once: true });
        script.addEventListener('error', handleError, { once: true });

        if (!existingScript) {
            script.id = LIFF_SDK_SCRIPT_ID;
            script.src = LIFF_SDK_SRC;
            script.async = true;
            script.setAttribute(LOADER_OWNED_ATTRIBUTE, 'true');
            document.head.appendChild(script);
        }
    });

    return liffSdkLoadPromise;
};

export const __resetLiffSdkLoaderForTests = () => {
    resetPendingLoad?.();
    resetPendingLoad = null;
    liffSdkLoadPromise = null;
    document.querySelectorAll(`script[${LOADER_OWNED_ATTRIBUTE}="true"]`).forEach((script) => script.remove());
};
