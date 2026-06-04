import { renderHook } from '@testing-library/react';
import { getInviteRoomIdFromLocation } from '../../utils/lineLiff';
import { useLobbyInviteBootstrap } from './useLobbyInviteBootstrap';

jest.mock('../../utils/lineLiff', () => ({
    getInviteRoomIdFromLocation: jest.fn()
}));

const mockGetInviteRoomIdFromLocation = getInviteRoomIdFromLocation as jest.MockedFunction<typeof getInviteRoomIdFromLocation>;

describe('useLobbyInviteBootstrap', () => {
    beforeEach(() => {
        mockGetInviteRoomIdFromLocation.mockReset();
        window.localStorage.clear();
        window.history.replaceState(null, '', '/holo-koji/?liff.state=%3FroomId%3Droom01');
    });

    test('prefills query invite room without auto join side effects', () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: 'abc123', source: 'query' });
        const setRoomId = jest.fn();
        const setMatchMode = jest.fn();
        const setInvitedRoom = jest.fn();
        const setPlayerName = jest.fn();

        renderHook(() => useLobbyInviteBootstrap({
            setRoomId,
            setMatchMode,
            setInvitedRoom,
            setPlayerName
        }));

        expect(setRoomId).toHaveBeenCalledWith('ABC123');
        expect(setMatchMode).toHaveBeenCalledWith('online');
        expect(setInvitedRoom).toHaveBeenCalledWith({ roomId: 'ABC123', source: 'query' });
        expect(setPlayerName).not.toHaveBeenCalled();
    });

    test('prefills returning player id and cleans liff state from URL', () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: 'room01', source: 'liff' });
        window.localStorage.setItem('currentPlayerId', 'p1');
        const replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => undefined);
        const setRoomId = jest.fn();
        const setMatchMode = jest.fn();
        const setInvitedRoom = jest.fn();
        const setPlayerName = jest.fn();

        renderHook(() => useLobbyInviteBootstrap({
            setRoomId,
            setMatchMode,
            setInvitedRoom,
            setPlayerName
        }));

        expect(setRoomId).toHaveBeenCalledWith('ROOM01');
        expect(setInvitedRoom).toHaveBeenCalledWith({ roomId: 'ROOM01', source: 'liff' });
        expect(setPlayerName).toHaveBeenCalledWith('p1');
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', expect.stringContaining('roomId=ROOM01'));
        expect(replaceStateSpy.mock.calls[0][2]).not.toContain('liff.state');
    });

    test('does nothing when invite room id is absent', () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: '', source: 'none' });
        const setRoomId = jest.fn();

        renderHook(() => useLobbyInviteBootstrap({
            setRoomId,
            setMatchMode: jest.fn(),
            setInvitedRoom: jest.fn(),
            setPlayerName: jest.fn()
        }));

        expect(setRoomId).not.toHaveBeenCalled();
    });
});
