declare global {
    interface Window {
        liff?: any;
    }
}

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

export {};
