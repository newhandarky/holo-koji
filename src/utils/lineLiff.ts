import config from '../config/environment';

declare global {
    interface Window {
        liff?: any;
    }
}

let liffInitPromise: Promise<void> | null = null;

const isLikelyLineClient = () => /Line\//i.test(navigator.userAgent);

export const isLineClient = () => {
    if (window.liff && typeof window.liff.isInClient === 'function') {
        return window.liff.isInClient();
    }
    return isLikelyLineClient();
};

export interface LineProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
}

const ensureLiffReady = async () => {
    if (!window.liff || !config.liffId) {
        return;
    }

    if (!liffInitPromise) {
        liffInitPromise = window.liff.init({ liffId: config.liffId }).catch((error: unknown) => {
            liffInitPromise = null;
            throw error;
        });
    }

    await liffInitPromise;
};

export const initLiffIfPossible = async () => {
    if (!window.liff || !config.liffId) {
        return { ready: false as const, reason: 'missing' as const };
    }

    try {
        await ensureLiffReady();
        return { ready: true as const };
    } catch (error) {
        return { ready: false as const, reason: 'init-failed' as const, error };
    }
};

export const shouldShowLiffDiagnostics = () => isLikelyLineClient() || !!window.liff;

export const getLineProfile = async (): Promise<LineProfile | null> => {
    if (!window.liff || !config.liffId) {
        return null;
    }

    await ensureLiffReady();

    if (!window.liff.isLoggedIn()) {
        if (window.liff.isInClient()) {
            window.liff.login();
        }
        return null;
    }

    const profile = await window.liff.getProfile();
    return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl
    };
};

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

export const shareRoomInvite = async (roomId: string) => {
    const inviteUrl = resolveInviteUrl(roomId);
    const message = `一起玩花見小路！點此加入房間`;

    if (!window.liff || !config.liffId) {
        await navigator.clipboard.writeText(inviteUrl);
        return { mode: 'copy' as const, url: inviteUrl };
    }

    await ensureLiffReady();

    if (!window.liff.isInClient()) {
        await navigator.clipboard.writeText(inviteUrl);
        return { mode: 'copy' as const, url: inviteUrl };
    }

    if (typeof window.liff.isApiAvailable === 'function' && !window.liff.isApiAvailable('shareTargetPicker')) {
        throw new Error('此 LIFF 未啟用 Share Target Picker，請到 LINE Developers 開啟此功能。');
    }

    const liffInviteUrl = resolveLiffInviteUrl(roomId);
    const liffMessage = `一起玩花見小路！點此加入房間：${liffInviteUrl}`;
    const flexMessage = [
        {
            type: 'flex',
            altText: '花見小路對戰邀請',
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
                            text: '點擊卡片直接加入對戰',
                            size: 'sm',
                            color: '#999999',
                            margin: 'sm'
                        }
                    ]
                }
            }
        }
    ];

    const result = await window.liff.shareTargetPicker(flexMessage).catch(async () => {
        return window.liff.shareTargetPicker([
            {
                type: 'text',
                text: liffMessage
            }
        ]);
    });

    if (!result) {
        await navigator.clipboard.writeText(liffInviteUrl);
        return { mode: 'copy' as const, url: liffInviteUrl };
    }

    return { mode: 'share' as const, url: liffInviteUrl };
};
