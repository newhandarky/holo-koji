import { act, renderHook } from '@testing-library/react';
import { shareRoomInvite } from '../../utils/lineLiff';
import { frontendLogger } from '../../utils/runtimeLogger';
import { useGameRoomInviteActions } from './useGameRoomInviteActions';

jest.mock('../../utils/lineLiff', () => ({
    shareRoomInvite: jest.fn(),
    getLiffInviteUrl: jest.fn(() => 'https://liff.line.me/test?roomId=ROOM01')
}));

jest.mock('../../utils/runtimeLogger', () => ({
    frontendLogger: {
        warn: jest.fn()
    }
}));

const mockShareRoomInvite = shareRoomInvite as jest.MockedFunction<typeof shareRoomInvite>;
const mockFrontendLogger = frontendLogger as jest.Mocked<typeof frontendLogger>;

describe('useGameRoomInviteActions', () => {
    beforeEach(() => {
        mockShareRoomInvite.mockReset();
        mockFrontendLogger.warn.mockClear();
    });

    test('toggles room code visibility', () => {
        const { result } = renderHook(() => useGameRoomInviteActions({ roomId: 'ROOM01' }));

        expect(result.current.showRoomCode).toBe(false);

        act(() => {
            result.current.toggleRoomCode();
        });

        expect(result.current.showRoomCode).toBe(true);
    });

    test('records invite outcome from LINE share', async () => {
        mockShareRoomInvite.mockResolvedValue({ mode: 'share', url: 'https://liff.line.me/test?roomId=ROOM01' });
        const { result } = renderHook(() => useGameRoomInviteActions({ roomId: 'ROOM01' }));

        await act(async () => {
            await result.current.handleShareRoomInvite();
        });

        expect(mockShareRoomInvite).toHaveBeenCalledWith('ROOM01');
        expect(result.current.inviteOutcome).toEqual({ mode: 'share', url: 'https://liff.line.me/test?roomId=ROOM01' });
    });

    test('logs failed invite without exposing reason in component state only', async () => {
        mockShareRoomInvite.mockResolvedValue({
            mode: 'failed',
            url: 'https://liff.line.me/test?roomId=ROOM01',
            reason: 'share-failed'
        });
        const { result } = renderHook(() => useGameRoomInviteActions({ roomId: 'ROOM01' }));

        await act(async () => {
            await result.current.handleShareRoomInvite();
        });

        expect(mockFrontendLogger.warn).toHaveBeenCalledWith('⚠️ LINE 邀請失敗', {
            roomId: 'ROOM01',
            reason: 'share-failed'
        });
    });

    test('does nothing when room id is missing', async () => {
        const { result } = renderHook(() => useGameRoomInviteActions({ roomId: undefined }));

        await act(async () => {
            await result.current.handleShareRoomInvite();
        });
        await act(async () => {
            await result.current.copyRoomCode();
        });
        expect(mockShareRoomInvite).not.toHaveBeenCalled();
    });
});
