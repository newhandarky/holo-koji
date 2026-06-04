import config from '../config/environment';
import type { InviteOutcome } from './lineLiffTypes';
import {
    canUseLineClient,
    canUseShareTargetPicker,
    ensureLiffReady,
    isSupportedLiffOrigin
} from './lineLiffRuntime';

export type {
    InviteOutcome,
    LineProfile,
    SafeInviteDiagnostics,
    VerifiedLineProfile
} from './lineLiffTypes';
export {
    getLiffDiagnosticsSnapshot,
    initLiffIfPossible,
    isLineClient,
    shouldShowLiffDiagnostics
} from './lineLiffRuntime';
export { getLineProfile, getVerifiedLineProfile } from './lineLiffProfile';

const normalizeLiffStateQuery = (state: string) => {
    if (!state) return '';
    const trimmed = state.startsWith('/') ? state.slice(1) : state;
    if (trimmed.includes('?')) {
        return trimmed.split('?')[1] ?? '';
    }
    return trimmed;
};

export const getInviteRoomIdFromLocation = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const directRoomId = searchParams.get('roomId') ?? '';

    if (directRoomId) {
        return { roomId: directRoomId, source: 'query' as const };
    }

    const liffState = searchParams.get('liff.state') ?? '';
    if (!liffState) {
        return { roomId: '', source: 'none' as const };
    }

    const stateQuery = normalizeLiffStateQuery(liffState);
    const stateParams = new URLSearchParams(stateQuery);
    const stateRoomId = stateParams.get('roomId') ?? '';
    return { roomId: stateRoomId, source: 'liff' as const };
};

const resolveInviteUrl = (roomId: string) => {
    const basePath = window.location.pathname.includes('/holo-koji') ? '/holo-koji' : '';
    const fallbackBase = `${window.location.origin}${basePath}`;
    const webBase = config.webAppUrl || fallbackBase;
    return `${webBase}/?roomId=${encodeURIComponent(roomId)}`;
};

const resolveLiffInviteUrl = (roomId: string) => {
    if (!config.liffId) {
        return resolveInviteUrl(roomId);
    }
    return `https://liff.line.me/${config.liffId}?roomId=${encodeURIComponent(roomId)}`;
};

export const getLiffInviteUrl = (roomId: string) => resolveLiffInviteUrl(roomId);

const writeClipboard = async (value: string) => {
    if (!navigator.clipboard?.writeText) {
        return false;
    }

    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        return false;
    }
};

export const shareRoomInvite = async (roomId: string): Promise<InviteOutcome> => {
    const inviteUrl = resolveInviteUrl(roomId);
    const message = `一起玩銀座十字路！房間編號：${roomId}。點此加入對戰`;

    if (!window.liff || !config.liffId || !isSupportedLiffOrigin()) {
        const copied = await writeClipboard(inviteUrl);
        return copied
            ? { mode: 'copy' as const, url: inviteUrl }
            : { mode: 'unavailable' as const, url: inviteUrl, reason: 'clipboard-unavailable' };
    }

    try {
        await ensureLiffReady();
    } catch {
        const copied = await writeClipboard(inviteUrl);
        return copied
            ? { mode: 'copy' as const, url: inviteUrl }
            : { mode: 'unavailable' as const, url: inviteUrl, reason: 'liff-init-failed' };
    }

    if (!canUseLineClient()) {
        const copied = await writeClipboard(inviteUrl);
        return copied
            ? { mode: 'copy' as const, url: inviteUrl }
            : { mode: 'unavailable' as const, url: inviteUrl, reason: 'not-line-client' };
    }

    if (!canUseShareTargetPicker()) {
        const copied = await writeClipboard(inviteUrl);
        return copied
            ? { mode: 'copy' as const, url: inviteUrl }
            : { mode: 'unavailable' as const, url: inviteUrl, reason: 'share-target-picker-unavailable' };
    }

    const liffInviteUrl = resolveLiffInviteUrl(roomId);
    const liffMessage = `${message}：${liffInviteUrl}`;
    const flexMessage = [
        {
            type: 'flex',
            altText: '銀座十字路對戰邀請',
            contents: {
                type: 'bubble',
                size: 'mega',
                hero: {
                    type: 'image',
                    url: `${config.webAppUrl}/images/stamps/message2.jpg`,
                    size: 'full',
                    aspectRatio: '20:13',
                    aspectMode: 'cover',
                    action: {
                        type: 'uri',
                        uri: liffInviteUrl
                    }
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: message,
                            weight: 'bold',
                            size: 'lg',
                            color: '#1DB446'
                        },
                        {
                            type: 'text',
                            text: `房間編號：${roomId}`,
                            size: 'sm',
                            color: '#666666',
                            margin: 'md'
                        },
                        {
                            type: 'text',
                            text: '點擊卡片後確認名稱即可加入對戰',
                            size: 'sm',
                            color: '#999999',
                            margin: 'sm'
                        }
                    ]
                }
            }
        }
    ];

    let result: unknown;
    try {
        result = await window.liff.shareTargetPicker(flexMessage).catch(async () => {
            return window.liff.shareTargetPicker([
                {
                    type: 'text',
                    text: liffMessage
                }
            ]);
        });
    } catch {
        return { mode: 'failed' as const, url: liffInviteUrl, reason: 'share-failed' };
    }

    if (!result) {
        return { mode: 'cancelled' as const, url: liffInviteUrl };
    }

    return { mode: 'share' as const, url: liffInviteUrl };
};
