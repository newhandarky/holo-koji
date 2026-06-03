import { ErrorPayload } from '@newhandarky/hanakoji-game-types';

export interface InviteRecovery {
    reason: string;
    message: string;
}

export interface InviteRecoveryNotice extends InviteRecovery {
    roomId: string;
}

export interface InvitedRoom {
    roomId: string;
    source: 'query' | 'liff';
}

export const resolveInviteRecovery = (payload: ErrorPayload): InviteRecovery => {
    const code = typeof payload?.code === 'string' ? payload.code : '';
    const message = typeof payload?.message === 'string' ? payload.message : '無法加入房間';
    if (code === 'ROOM_NOT_FOUND' || message === '房間不存在') {
        return { reason: 'missing', message: '找不到這個邀請房間。請確認房號，或請對方重送邀請。' };
    }
    if (code === 'ROOM_FULL' || message === '房間已滿') {
        return { reason: 'full', message: '這個邀請房間已滿。請對方重送邀請，或回到大廳建立新房間。' };
    }
    if (code === 'ROOM_ALREADY_STARTED') {
        return { reason: 'started', message: '這個邀請房間已經開始對局。請對方重送邀請，或回到大廳建立新房間。' };
    }
    if (code === 'PLAYER_ID_TAKEN') {
        return { reason: 'player-id-taken', message: '這個玩家名稱已在房間中使用。請確認名稱，或改用其他名稱重新加入。' };
    }
    if (code === 'INVALID_JOIN_REQUEST' || message === '缺少 roomId 或 playerId') {
        return { reason: 'invalid', message: '這個邀請連結資料不完整。請對方重送邀請，或回到一般加入流程。' };
    }
    return { reason: 'unknown', message: '目前無法加入這個邀請房間。請對方重送邀請，或回到一般加入流程。' };
};

export const buildErrorPayload = (payload: unknown): ErrorPayload => {
    const candidate = payload && typeof payload === 'object'
        ? payload as Partial<ErrorPayload>
        : null;

    return {
        message: typeof candidate?.message === 'string' ? candidate.message : '無法加入房間',
        code: typeof candidate?.code === 'string' ? candidate.code : undefined
    };
};

export const buildInvitedRoomNotice = (invitedRoom: InvitedRoom | null): string | undefined => (
    invitedRoom
        ? `已從邀請連結帶入房間 ${invitedRoom.roomId}，確認玩家名稱後再加入。`
        : undefined
);

export const copyTextWithTextareaFallback = async (text: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text);
        return;
    } catch {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
};
