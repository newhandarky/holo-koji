import config from '../config/environment';

declare global {
    interface Window {
        liff?: any;
    }
}

let liffInitPromise: Promise<void> | null = null;

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

const resolveInviteUrl = (roomId: string) => {
    const origin = window.location.origin;
    const basePath = window.location.pathname.includes('/holo-koji') ? '/holo-koji' : '';
    return `${origin}${basePath}/?roomId=${encodeURIComponent(roomId)}`;
};

export const shareRoomInvite = async (roomId: string) => {
    const inviteUrl = resolveInviteUrl(roomId);
    const message = `一起玩花見小路！點此加入房間：${inviteUrl}`;

    if (!window.liff || !config.liffId) {
        await navigator.clipboard.writeText(inviteUrl);
        return { mode: 'copy' as const, url: inviteUrl };
    }

    await ensureLiffReady();

    if (!window.liff.isInClient()) {
        await navigator.clipboard.writeText(inviteUrl);
        return { mode: 'copy' as const, url: inviteUrl };
    }

    const result = await window.liff.shareTargetPicker([
        {
            type: 'text',
            text: message
        }
    ]);

    if (!result) {
        await navigator.clipboard.writeText(inviteUrl);
        return { mode: 'copy' as const, url: inviteUrl };
    }

    return { mode: 'share' as const, url: inviteUrl };
};
