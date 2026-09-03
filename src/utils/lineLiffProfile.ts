import config from '../config/environment';
import { ensureLiffReady, isSupportedLiffOrigin } from './lineLiffRuntime';
import type { LineProfile, VerifiedLineProfile } from './lineLiffTypes';

export const getLineProfile = async (): Promise<LineProfile | null> => {
    if (!config.liffId || !isSupportedLiffOrigin()) {
        return null;
    }

    await ensureLiffReady();
    const liff = window.liff;
    if (!liff) {
        return null;
    }

    if (!liff.isLoggedIn()) {
        if (liff.isInClient()) {
            liff.login();
        }
        return null;
    }

    const profile = await liff.getProfile();
    return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl
    };
};

export const getVerifiedLineProfile = async (): Promise<VerifiedLineProfile | null> => {
    if (!config.liffId || !isSupportedLiffOrigin()) {
        return null;
    }

    await ensureLiffReady();
    const liff = window.liff;
    if (!liff) {
        return null;
    }

    if (!liff.isLoggedIn()) {
        liff.login();
        return null;
    }

    if (typeof liff.getIDToken !== 'function') {
        return null;
    }

    const [profile, idToken] = await Promise.all([
        liff.getProfile(),
        Promise.resolve(liff.getIDToken())
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
