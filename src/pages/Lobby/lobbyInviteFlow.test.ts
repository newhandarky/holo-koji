import {
    buildErrorPayload,
    buildInvitedRoomNotice,
    copyTextWithTextareaFallback,
    resolveInviteRecovery
} from './lobbyInviteFlow';

describe('lobbyInviteFlow', () => {
    test.each([
        [{ code: 'ROOM_NOT_FOUND', message: '房間不存在' }, 'missing', '找不到這個邀請房間。請確認房號，或請對方重送邀請。'],
        [{ code: 'ROOM_FULL', message: '房間已滿' }, 'full', '這個邀請房間已滿。請對方重送邀請，或回到大廳建立新房間。'],
        [{ code: 'ROOM_ALREADY_STARTED', message: '房間已開始對局' }, 'started', '這個邀請房間已經開始對局。請對方重送邀請，或回到大廳建立新房間。'],
        [{ code: 'PLAYER_ID_TAKEN', message: '此玩家名稱已在房間中使用，請重新加入或更換名稱。' }, 'player-id-taken', '這個玩家名稱已在房間中使用。請確認名稱，或改用其他名稱重新加入。'],
        [{ code: 'INVALID_JOIN_REQUEST', message: '缺少 roomId 或 playerId' }, 'invalid', '這個邀請連結資料不完整。請對方重送邀請，或回到一般加入流程。']
    ])('maps invite error %o to recovery reason %s', (payload, reason, message) => {
        expect(resolveInviteRecovery(payload)).toEqual({ reason, message });
    });

    test('normalizes unknown error payload and invite notice', () => {
        expect(buildErrorPayload(null)).toEqual({ message: '無法加入房間', code: undefined });
        expect(resolveInviteRecovery({ message: 'unknown' })).toEqual({
            reason: 'unknown',
            message: '目前無法加入這個邀請房間。請對方重送邀請，或回到一般加入流程。'
        });
        expect(buildInvitedRoomNotice({ roomId: 'ROOM01', source: 'query' })).toBe(
            '已從邀請連結帶入房間 ROOM01，確認玩家名稱後再加入。'
        );
        expect(buildInvitedRoomNotice(null)).toBeUndefined();
    });

    test('clipboard fallback copies text through textarea when Clipboard API rejects', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: jest.fn().mockRejectedValue(new Error('blocked')) }
        });
        const originalExecCommand = document.execCommand;
        const execCommand = jest.fn().mockReturnValue(true);
        Object.defineProperty(document, 'execCommand', {
            configurable: true,
            value: execCommand
        });

        await copyTextWithTextareaFallback('ROOM01');

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ROOM01');
        expect(execCommand).toHaveBeenCalledWith('copy');
        expect(document.querySelector('textarea')).toBeNull();

        Object.defineProperty(document, 'execCommand', {
            configurable: true,
            value: originalExecCommand
        });
    });
});
