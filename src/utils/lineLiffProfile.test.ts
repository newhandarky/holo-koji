import config from '../config/environment';
import { __resetLiffRuntimeForTests } from './lineLiffRuntime';
import { getLineProfile, getVerifiedLineProfile } from './lineLiffProfile';

const originalLocation = window.location;
const originalLiffId = config.liffId;
const originalWebAppUrl = config.webAppUrl;

const setLocation = (url: string) => {
    Object.defineProperty(window, 'location', {
        configurable: true,
        value: new URL(url)
    });
};

describe('lineLiffProfile', () => {
    beforeEach(() => {
        config.liffId = 'test-liff';
        config.webAppUrl = 'https://game.example.test/holo-koji';
        setLocation('https://game.example.test/holo-koji/');
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
        delete window.liff;
        __resetLiffRuntimeForTests();
    });

    test('returns null without requesting the SDK when LIFF ID is unavailable', async () => {
        config.liffId = '';

        await expect(getLineProfile()).resolves.toBeNull();
        await expect(getVerifiedLineProfile()).resolves.toBeNull();
        expect(document.getElementById('line-liff-sdk')).toBeNull();
    });

    test('loads the SDK when a verified profile is explicitly requested', async () => {
        const profileRequest = getVerifiedLineProfile();
        const script = document.getElementById('line-liff-sdk');
        const init = jest.fn().mockResolvedValue(undefined);

        window.liff = {
            init,
            isLoggedIn: jest.fn(() => true),
            getProfile: jest.fn().mockResolvedValue({
                userId: 'line-user-1',
                displayName: 'LINE 玩家'
            }),
            getIDToken: jest.fn(() => 'id-token-1')
        };
        script?.dispatchEvent(new Event('load'));

        await expect(profileRequest).resolves.toEqual({
            idToken: 'id-token-1',
            profile: {
                userId: 'line-user-1',
                displayName: 'LINE 玩家'
            }
        });
        expect(init).toHaveBeenCalledTimes(1);
    });

    test('returns null on unsupported origin without initializing LIFF', async () => {
        setLocation('https://preview.example.test/holo-koji/');
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isLoggedIn: jest.fn(() => true),
            getProfile: jest.fn()
        };

        await expect(getLineProfile()).resolves.toBeNull();
        expect(window.liff.init).not.toHaveBeenCalled();
        expect(window.liff.getProfile).not.toHaveBeenCalled();
    });

    test('triggers LIFF login for verified profile when not logged in', async () => {
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isLoggedIn: jest.fn(() => false),
            login: jest.fn()
        };

        await expect(getVerifiedLineProfile()).resolves.toBeNull();
        expect(window.liff.login).toHaveBeenCalledTimes(1);
    });

    test('returns null when verified profile has no id token', async () => {
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isLoggedIn: jest.fn(() => true),
            getProfile: jest.fn().mockResolvedValue({
                userId: 'line-user-1',
                displayName: 'LINE 玩家',
                pictureUrl: 'https://example.test/avatar.png'
            }),
            getIDToken: jest.fn(() => '')
        };

        await expect(getVerifiedLineProfile()).resolves.toBeNull();
    });

    test('returns safe profile and id token when LIFF is logged in', async () => {
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isLoggedIn: jest.fn(() => true),
            getProfile: jest.fn().mockResolvedValue({
                userId: 'line-user-1',
                displayName: 'LINE 玩家',
                pictureUrl: 'https://example.test/avatar.png',
                statusMessage: 'raw status should not leak'
            }),
            getIDToken: jest.fn(() => 'id-token-1')
        };

        await expect(getVerifiedLineProfile()).resolves.toEqual({
            idToken: 'id-token-1',
            profile: {
                userId: 'line-user-1',
                displayName: 'LINE 玩家',
                pictureUrl: 'https://example.test/avatar.png'
            }
        });
    });

    test('returns basic LINE profile without extra raw fields', async () => {
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isLoggedIn: jest.fn(() => true),
            getProfile: jest.fn().mockResolvedValue({
                userId: 'line-user-1',
                displayName: 'LINE 玩家',
                pictureUrl: 'https://example.test/avatar.png',
                statusMessage: 'raw status should not leak'
            })
        };

        await expect(getLineProfile()).resolves.toEqual({
            userId: 'line-user-1',
            displayName: 'LINE 玩家',
            pictureUrl: 'https://example.test/avatar.png'
        });
    });
});
