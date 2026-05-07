import config from '../config/environment';

declare global {
    interface Window {
        liff?: any;
    }
}

let liffInitPromise: Promise<void> | null = null;
let liffReady = false;

const isLikelyLineClient = () => /Line\//i.test(navigator.userAgent);

const canUseLineClient = () => {
    if (window.liff && typeof window.liff.isInClient === 'function') {
        try {
            return window.liff.isInClient() === true;
        } catch {
            return false;
        }
    }

    return isLikelyLineClient();
};

const canUseShareTargetPicker = () => {
    if (typeof window.liff?.shareTargetPicker !== 'function') {
        return false;
    }

    if (typeof window.liff?.isApiAvailable !== 'function') {
        return false;
    }

    try {
        return window.liff.isApiAvailable('shareTargetPicker') === true;
    } catch {
        return false;
    }
};

const isSupportedLiffOrigin = () => {
    if (isLikelyLineClient()) {
        return true;
    }

    if (!config.webAppUrl) {
        return false;
    }

    try {
        return window.location.origin === new URL(config.webAppUrl).origin;
    } catch {
        return false;
    }
};

export const isLineClient = () => {
    return canUseLineClient();
};

export interface LineProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
}

export interface VerifiedLineProfile {
    profile: LineProfile;
    idToken: string;
}

export type InviteOutcome =
    | { mode: 'share'; url: string }
    | { mode: 'copy'; url: string }
    | { mode: 'cancelled'; url: string }
    | { mode: 'unavailable'; url: string; reason: string }
    | { mode: 'failed'; url?: string; reason: string };

export interface SafeInviteDiagnostics {
    supportedOrigin: boolean;
    hasSdk: boolean;
    ready: boolean;
    inLineClient: boolean | 'unknown';
    shareTargetPickerAvailable: boolean | 'unknown';
    fallbackAvailable: boolean;
}

const ensureLiffReady = async () => {
    if (!window.liff || !config.liffId || !isSupportedLiffOrigin()) {
        return;
    }

    if (!liffInitPromise) {
        liffInitPromise = window.liff.init({ liffId: config.liffId }).catch((error: unknown) => {
            liffInitPromise = null;
            liffReady = false;
            throw error;
        });
    }

    await liffInitPromise;
    liffReady = true;
};

export const initLiffIfPossible = async () => {
    if (!window.liff || !config.liffId) {
        return { ready: false as const, reason: 'missing' as const };
    }

    if (!isSupportedLiffOrigin()) {
        return { ready: false as const, reason: 'unsupported-origin' as const };
    }

    try {
        await ensureLiffReady();
        return { ready: true as const };
    } catch (error) {
        return { ready: false as const, reason: 'init-failed' as const, error };
    }
};

export const shouldShowLiffDiagnostics = () => isLikelyLineClient() || (!!window.liff && isSupportedLiffOrigin());

export const getLiffDiagnosticsSnapshot = () => {
    const supportedOrigin = isSupportedLiffOrigin();
    const hasSdk = Boolean(window.liff);

    let loggedIn: boolean | 'unknown' = 'unknown';
    let inLineClient: boolean | 'unknown' = 'unknown';
    let shareTargetPickerAvailable: boolean | 'unknown' = 'unknown';

    if (hasSdk && config.liffId && supportedOrigin && typeof window.liff?.isLoggedIn === 'function') {
        try {
            loggedIn = window.liff.isLoggedIn();
        } catch {
            loggedIn = 'unknown';
        }
    }

    if (hasSdk && typeof window.liff?.isInClient === 'function') {
        try {
            inLineClient = window.liff.isInClient();
        } catch {
            inLineClient = 'unknown';
        }
    } else if (isLikelyLineClient()) {
        inLineClient = true;
    }

    if (hasSdk && typeof window.liff?.isApiAvailable === 'function') {
        try {
            shareTargetPickerAvailable = window.liff.isApiAvailable('shareTargetPicker');
        } catch {
            shareTargetPickerAvailable = 'unknown';
        }
    }

    return {
        supportedOrigin,
        hasSdk,
        ready: liffReady,
        loggedIn,
        inLineClient,
        shareTargetPickerAvailable,
        fallbackAvailable: true
    };
};

export const getLineProfile = async (): Promise<LineProfile | null> => {
    if (!window.liff || !config.liffId || !isSupportedLiffOrigin()) {
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

export const getVerifiedLineProfile = async (): Promise<VerifiedLineProfile | null> => {
    if (!window.liff || !config.liffId || !isSupportedLiffOrigin()) {
        return null;
    }

    await ensureLiffReady();

    if (!window.liff.isLoggedIn()) {
        window.liff.login();
        return null;
    }

    if (typeof window.liff.getIDToken !== 'function') {
        return null;
    }

    const [profile, idToken] = await Promise.all([
        window.liff.getProfile(),
        Promise.resolve(window.liff.getIDToken())
    ]);

    if (!idToken) {
        return null;
    }

    return {
        idToken,
        profile: {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl
        }
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
    const message = `一起玩花見小路！房間編號：${roomId}。點此加入對戰`;

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
