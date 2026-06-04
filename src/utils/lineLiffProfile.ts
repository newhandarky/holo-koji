import config from '../config/environment';
import { ensureLiffReady, isSupportedLiffOrigin } from './lineLiffRuntime';
import type { LineProfile, VerifiedLineProfile } from './lineLiffTypes';

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
