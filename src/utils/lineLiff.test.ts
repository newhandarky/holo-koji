import config from '../config/environment';
import {
    getInviteRoomIdFromLocation,
    getLiffDiagnosticsSnapshot,
    getLiffInviteUrl,
    shareRoomInvite
} from './lineLiff';

const originalLocation = window.location;
const originalClipboard = navigator.clipboard;
const originalLiffId = config.liffId;
const originalWebAppUrl = config.webAppUrl;

const setLocation = (url: string) => {
    Object.defineProperty(window, 'location', {
        configurable: true,
        value: new URL(url)
    });
};

const setClipboard = (writeText: jest.Mock) => {
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText }
    });
};

describe('lineLiff invite helpers', () => {
    beforeEach(() => {
        config.liffId = 'test-liff';
        config.webAppUrl = 'https://game.example.test/holo-koji';
        setLocation('https://game.example.test/holo-koji/');
        setClipboard(jest.fn().mockResolvedValue(undefined));
        delete window.liff;
    });

    afterEach(() => {
        config.liffId = originalLiffId;
        config.webAppUrl = originalWebAppUrl;
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation
        });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: originalClipboard
        });
        delete window.liff;
    });

    test('reads direct query room id', () => {
        setLocation('https://game.example.test/holo-koji/?roomId=abc123');

        expect(getInviteRoomIdFromLocation()).toEqual({ roomId: 'abc123', source: 'query' });
    });

    test('reads room id from LIFF state', () => {
        setLocation('https://game.example.test/holo-koji/?liff.state=%2F%3FroomId%3Dxyz789');

        expect(getInviteRoomIdFromLocation()).toEqual({ roomId: 'xyz789', source: 'liff' });
    });

    test('builds LIFF invite URL when LIFF ID exists', () => {
        expect(getLiffInviteUrl('ROOM01')).toBe('https://liff.line.me/test-liff?roomId=ROOM01');
    });

    test('copies browser invite URL when LIFF SDK is unavailable', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        setClipboard(writeText);

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'copy',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01'
        });
        expect(writeText).toHaveBeenCalledWith('https://game.example.test/holo-koji/?roomId=ROOM01');
    });

    test('copies browser invite URL on unsupported LIFF origin', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        setLocation('https://preview.example.test/holo-koji/');
        setClipboard(writeText);
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isInClient: jest.fn(() => true),
            isApiAvailable: jest.fn(() => true),
            shareTargetPicker: jest.fn()
        };

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'copy',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01'
        });
        expect(window.liff.shareTargetPicker).not.toHaveBeenCalled();
        expect(writeText).toHaveBeenCalledWith('https://game.example.test/holo-koji/?roomId=ROOM01');
    });

    test('returns unavailable with manual URL when clipboard is denied', async () => {
        setClipboard(jest.fn().mockRejectedValue(new Error('denied')));

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'unavailable',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01',
            reason: 'clipboard-unavailable'
        });
    });

    test('falls back to copied URL when LINE client probe fails', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        setClipboard(writeText);
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isInClient: jest.fn(() => {
                throw new Error('probe failed');
            }),
            isApiAvailable: jest.fn(() => true),
            shareTargetPicker: jest.fn()
        };

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'copy',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01'
        });
        expect(window.liff.shareTargetPicker).not.toHaveBeenCalled();
        expect(writeText).toHaveBeenCalledWith('https://game.example.test/holo-koji/?roomId=ROOM01');
    });

    test('falls back to copied URL when Share Target Picker capability probe fails', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        setClipboard(writeText);
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isInClient: jest.fn(() => true),
            isApiAvailable: jest.fn(() => {
                throw new Error('capability failed');
            }),
            shareTargetPicker: jest.fn()
        };

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'copy',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01'
        });
        expect(window.liff.shareTargetPicker).not.toHaveBeenCalled();
        expect(writeText).toHaveBeenCalledWith('https://game.example.test/holo-koji/?roomId=ROOM01');
    });

    test('falls back to manual URL when Share Target Picker is missing and clipboard is unavailable', async () => {
        setClipboard(jest.fn().mockRejectedValue(new Error('denied')));
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isInClient: jest.fn(() => true),
            isApiAvailable: jest.fn(() => true)
        };

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'unavailable',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01',
            reason: 'share-target-picker-unavailable'
        });
    });

    test('shares through Share Target Picker when LIFF is available in client', async () => {
        const shareTargetPicker = jest.fn().mockResolvedValue({ status: 'success' });
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isInClient: jest.fn(() => true),
            isApiAvailable: jest.fn(() => true),
            shareTargetPicker
        };

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'share',
            url: 'https://liff.line.me/test-liff?roomId=ROOM01'
        });
        expect(shareTargetPicker).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ type: 'flex', altText: '銀座十字路對戰邀請' })
        ]));
    });

    test('returns cancelled when Share Target Picker has no result', async () => {
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isInClient: jest.fn(() => true),
            isApiAvailable: jest.fn(() => true),
            shareTargetPicker: jest.fn().mockResolvedValue(undefined)
        };

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'cancelled',
            url: 'https://liff.line.me/test-liff?roomId=ROOM01'
        });
    });

    test('returns failed without exposing raw LIFF error details', async () => {
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isInClient: jest.fn(() => true),
            isApiAvailable: jest.fn(() => true),
            shareTargetPicker: jest.fn().mockRejectedValue(new Error('secret-token-value'))
        };

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'failed',
            url: 'https://liff.line.me/test-liff?roomId=ROOM01',
            reason: 'share-failed'
        });
    });

    test('reports safe invite diagnostics only', () => {
        window.liff = {
            isInClient: jest.fn(() => true),
            isLoggedIn: jest.fn(() => false),
            isApiAvailable: jest.fn(() => true)
        };

        expect(getLiffDiagnosticsSnapshot()).toEqual(expect.objectContaining({
            supportedOrigin: true,
            hasSdk: true,
            inLineClient: true,
            shareTargetPickerAvailable: true,
            fallbackAvailable: true
        }));
    });
});
