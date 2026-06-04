import {
    getInviteRoomIdFromLocation,
    getLiffDiagnosticsSnapshot,
    getLiffInviteUrl,
    getLineProfile,
    getVerifiedLineProfile,
    initLiffIfPossible,
    isLineClient,
    shareRoomInvite,
    shouldShowLiffDiagnostics
} from './lineLiff';

describe('lineLiff compatibility barrel', () => {
    test('re-exports runtime helpers', () => {
        expect(typeof getLiffDiagnosticsSnapshot).toBe('function');
        expect(typeof initLiffIfPossible).toBe('function');
        expect(typeof isLineClient).toBe('function');
        expect(typeof shouldShowLiffDiagnostics).toBe('function');
    });

    test('re-exports profile helpers', () => {
        expect(typeof getLineProfile).toBe('function');
        expect(typeof getVerifiedLineProfile).toBe('function');
    });

    test('re-exports invite helpers', () => {
        expect(typeof getInviteRoomIdFromLocation).toBe('function');
        expect(typeof getLiffInviteUrl).toBe('function');
        expect(typeof shareRoomInvite).toBe('function');
    });
});
