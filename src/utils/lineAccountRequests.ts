import { LineProfile } from './lineLiffTypes';

export const buildAccountSyncRequestFromLineProfile = (profile: LineProfile) => ({
    profile: {
        displayName: profile.displayName,
        avatarUrl: profile.pictureUrl
    }
});

export const buildAccountSyncRequestFromLineIdToken = (profile: LineProfile, idToken: string) => ({
    idToken,
    profile: {
        displayName: profile.displayName,
        avatarUrl: profile.pictureUrl
    }
});

export const buildAccountSyncRequestFromAuthorizationCode = (authorizationCode: string, redirectUri: string) => ({
    authorizationCode,
    redirectUri
});
