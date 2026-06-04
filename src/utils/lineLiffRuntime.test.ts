import config from '../config/environment';
import {
    __resetLiffRuntimeForTests,
    getLiffDiagnosticsSnapshot,
    initLiffIfPossible,
    isLineClient,
    shouldShowLiffDiagnostics
} from './lineLiffRuntime';

const originalLocation = window.location;
const originalUserAgent = navigator.userAgent;
const originalLiffId = config.liffId;
const originalWebAppUrl = config.webAppUrl;

const setLocation = (url: string) => {
    Object.defineProperty(window, 'location', {
        configurable: true,
        value: new URL(url)
    });
};

const setUserAgent = (value: string) => {
    Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value
    });
};

describe('lineLiffRuntime', () => {
    beforeEach(() => {
        config.liffId = 'test-liff';
        config.webAppUrl = 'https://game.example.test/holo-koji';
        setLocation('https://game.example.test/holo-koji/');
        setUserAgent('Mozilla/5.0');
        delete window.liff;
        __resetLiffRuntimeForTests();
    });

    afterEach(() => {
        config.liffId = originalLiffId;
        config.webAppUrl = originalWebAppUrl;
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation
        });
        setUserAgent(originalUserAgent);
        delete window.liff;
        __resetLiffRuntimeForTests();
    });

    test('returns missing when LIFF SDK is unavailable', async () => {
        await expect(initLiffIfPossible()).resolves.toEqual({
            ready: false,
            reason: 'missing'
        });

        expect(getLiffDiagnosticsSnapshot()).toEqual(expect.objectContaining({
            hasSdk: false,
            ready: false,
            fallbackAvailable: true
        }));
    });

    test('returns unsupported-origin without initializing SDK', async () => {
        setLocation('https://preview.example.test/holo-koji/');
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined)
        };

        await expect(initLiffIfPossible()).resolves.toEqual({
            ready: false,
            reason: 'unsupported-origin'
        });
        expect(window.liff.init).not.toHaveBeenCalled();
        expect(shouldShowLiffDiagnostics()).toBe(false);
    });

    test('returns init-failed and keeps ready false when LIFF init rejects', async () => {
        const error = new Error('sdk failed');
        window.liff = {
            init: jest.fn().mockRejectedValue(error)
        };

        await expect(initLiffIfPossible()).resolves.toEqual({
            ready: false,
            reason: 'init-failed',
            error
        });
        expect(getLiffDiagnosticsSnapshot()).toEqual(expect.objectContaining({
            ready: false
        }));
    });

    test('detects LINE client from user agent when SDK client probe is unavailable', () => {
        setUserAgent('Mozilla/5.0 Line/14.0');

        expect(isLineClient()).toBe(true);
        expect(shouldShowLiffDiagnostics()).toBe(true);
    });

    test('reports safe diagnostics without raw profile or token data', () => {
        window.liff = {
            isInClient: jest.fn(() => true),
            isLoggedIn: jest.fn(() => true),
            isApiAvailable: jest.fn(() => true),
            getProfile: jest.fn(),
            getIDToken: jest.fn(() => 'secret-token-value')
        };

        const snapshot = getLiffDiagnosticsSnapshot();

        expect(snapshot).toEqual({
            supportedOrigin: true,
            hasSdk: true,
            ready: false,
            loggedIn: true,
            inLineClient: true,
            shareTargetPickerAvailable: true,
            fallbackAvailable: true
        });
        expect(JSON.stringify(snapshot)).not.toContain('secret-token-value');
    });
});
