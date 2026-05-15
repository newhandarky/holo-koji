import {
    getStoredRoomSessionToken,
    saveRoomSessionToken
} from './roomSession';

describe('roomSession', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    test('stores room session tokens per room and player', () => {
        saveRoomSessionToken('ABC123', 'host', 'host-token');
        saveRoomSessionToken('ABC123', 'guest', 'guest-token');

        expect(getStoredRoomSessionToken('ABC123', 'host')).toBe('host-token');
        expect(getStoredRoomSessionToken('ABC123', 'guest')).toBe('guest-token');
        expect(getStoredRoomSessionToken('OTHER', 'host')).toBeNull();
    });

    test('ignores incomplete room session token records', () => {
        saveRoomSessionToken('', 'host', 'token');
        saveRoomSessionToken('ABC123', '', 'token');
        saveRoomSessionToken('ABC123', 'host', '');

        expect(window.localStorage.length).toBe(0);
        expect(getStoredRoomSessionToken('ABC123', 'host')).toBeNull();
    });
});
