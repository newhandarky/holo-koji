import config from '../config/environment';
import { __resetLiffRuntimeForTests } from './lineLiffRuntime';
import {
    getInviteRoomIdFromLocation,
    getLiffInviteUrl,
    shareRoomInvite
} from './lineLiffInvite';

const originalLocation = window.location;
const originalClipboard = navigator.clipboard;
const originalUserAgent = navigator.userAgent;
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

const setUserAgent = (value: string) => {
    Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value
    });
};

describe('lineLiffInvite', () => {
    beforeEach(() => {
        config.liffId = 'test-liff';
        config.webAppUrl = 'https://game.example.test/holo-koji';
        setLocation('https://game.example.test/holo-koji/');
        setUserAgent('Mozilla/5.0');
        setClipboard(jest.fn().mockResolvedValue(undefined));
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
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: originalClipboard
        });
        setUserAgent(originalUserAgent);
        delete window.liff;
        __resetLiffRuntimeForTests();
    });

    test('reads direct query room id before LIFF state', () => {
        setLocation('https://game.example.test/holo-koji/?roomId=abc123&liff.state=%2F%3FroomId%3Dxyz789');

        expect(getInviteRoomIdFromLocation()).toEqual({ roomId: 'abc123', source: 'query' });
    });

    test('reads room id from LIFF state query', () => {
        setLocation('https://game.example.test/holo-koji/?liff.state=%2F%3FroomId%3Dxyz789');

        expect(getInviteRoomIdFromLocation()).toEqual({ roomId: 'xyz789', source: 'liff' });
    });

    test('builds LIFF invite URL when LIFF ID exists', () => {
        expect(getLiffInviteUrl('ROOM01')).toBe('https://liff.line.me/test-liff?roomId=ROOM01');
    });

    test('copies browser invite URL when an explicit LIFF SDK load fails', async () => {
        setUserAgent('Mozilla/5.0 Line/14.0');
        const writeText = jest.fn().mockResolvedValue(undefined);
        setClipboard(writeText);
        const sharing = shareRoomInvite('ROOM01');
        document.getElementById('line-liff-sdk')?.dispatchEvent(new Event('error'));

        await expect(sharing).resolves.toEqual({
            mode: 'copy',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01'
        });
        expect(writeText).toHaveBeenCalledWith('https://game.example.test/holo-koji/?roomId=ROOM01');
    });

    test('copies immediately outside LINE without requesting the LIFF SDK', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        setClipboard(writeText);

        const sharing = shareRoomInvite('ROOM01');

        expect(document.getElementById('line-liff-sdk')).toBeNull();
        await expect(sharing).resolves.toEqual({
            mode: 'copy',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01'
        });
        expect(writeText).toHaveBeenCalledWith('https://game.example.test/holo-koji/?roomId=ROOM01');
    });

    test('copies browser invite URL when LIFF init fails', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        setClipboard(writeText);
        window.liff = {
            init: jest.fn().mockRejectedValue(new Error('init failed')),
            isInClient: jest.fn(() => true),
            isApiAvailable: jest.fn(() => true),
            shareTargetPicker: jest.fn()
        };

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'copy',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01'
        });
        expect(window.liff.shareTargetPicker).not.toHaveBeenCalled();
    });

    test('copies browser invite URL outside LINE client', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        setClipboard(writeText);
        window.liff = {
            init: jest.fn().mockResolvedValue(undefined),
            isInClient: jest.fn(() => false),
            isApiAvailable: jest.fn(() => true),
            shareTargetPicker: jest.fn()
        };

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'copy',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01'
        });
        expect(window.liff.shareTargetPicker).not.toHaveBeenCalled();
    });

    test('returns unavailable with manual URL when clipboard is denied', async () => {
        config.liffId = '';
        setClipboard(jest.fn().mockRejectedValue(new Error('denied')));

        await expect(shareRoomInvite('ROOM01')).resolves.toEqual({
            mode: 'unavailable',
            url: 'https://game.example.test/holo-koji/?roomId=ROOM01',
            reason: 'clipboard-unavailable'
        });
    });

    test('shares flex invite through Share Target Picker in LINE client', async () => {
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

    test('falls back to text invite when flex invite is rejected', async () => {
        const shareTargetPicker = jest.fn()
            .mockRejectedValueOnce(new Error('flex failed'))
            .mockResolvedValueOnce({ status: 'success' });
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
        expect(shareTargetPicker).toHaveBeenNthCalledWith(2, [
            expect.objectContaining({
                type: 'text',
                text: expect.stringContaining('https://liff.line.me/test-liff?roomId=ROOM01')
            })
        ]);
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
});
