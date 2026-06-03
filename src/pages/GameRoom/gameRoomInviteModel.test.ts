import { copyTextWithFallback, getInviteOutcomeMessage, getInviteOutcomeTone } from './gameRoomInviteModel';

describe('gameRoomInviteModel', () => {
    test('maps invite outcomes to stable user-facing messages and tones', () => {
        expect(getInviteOutcomeMessage({ mode: 'share', url: 'https://example.test' })).toBe('LINE 邀請已送出。');
        expect(getInviteOutcomeMessage({ mode: 'copy', url: 'https://example.test' })).toBe('已複製邀請連結，請貼給好友。');
        expect(getInviteOutcomeMessage({ mode: 'cancelled', url: 'https://example.test' })).toBe('已取消 LINE 好友選擇，可以重試或改用連結分享。');
        expect(getInviteOutcomeMessage({ mode: 'unavailable', url: 'https://example.test', reason: 'clipboard-blocked' })).toBe('目前無法自動複製邀請連結，請手動複製下方連結分享。');
        expect(getInviteOutcomeMessage({ mode: 'failed', url: 'https://example.test', reason: 'share-failed' })).toBe('LINE 邀請暫時失敗，請改用下方連結分享。');

        expect(getInviteOutcomeTone({ mode: 'share', url: 'https://example.test' })).toBe('success');
        expect(getInviteOutcomeTone({ mode: 'cancelled', url: 'https://example.test' })).toBe('warning');
        expect(getInviteOutcomeTone({ mode: 'failed', url: 'https://example.test', reason: 'share-failed' })).toBe('danger');
    });

    test('copies with textarea fallback when clipboard API is unavailable', async () => {
        const originalClipboard = navigator.clipboard;
        const originalExecCommand = document.execCommand;
        const execCommand = jest.fn().mockReturnValue(true);
        Object.defineProperty(document, 'execCommand', {
            configurable: true,
            value: execCommand
        });
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: jest.fn().mockRejectedValue(new Error('blocked'))
            }
        });

        await copyTextWithFallback('ROOM01');

        expect(execCommand).toHaveBeenCalledWith('copy');
        expect(document.querySelector('textarea')).not.toBeInTheDocument();

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: originalClipboard
        });
        Object.defineProperty(document, 'execCommand', {
            configurable: true,
            value: originalExecCommand
        });
    });
});
