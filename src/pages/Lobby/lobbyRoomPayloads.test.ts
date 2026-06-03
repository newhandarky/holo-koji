import { buildCreateRoomPayload, buildJoinRoomPayload, isCustomSelectionReady } from './lobbyRoomPayloads';

const boundAccountProfile = {
    lineUserId: 'U1234567890',
    displayName: 'LINE 玩家',
    avatarUrl: 'https://example.test/avatar.png',
    createdAt: '2026-05-05T12:00:00.000Z',
    updatedAt: '2026-05-05T12:00:00.000Z',
    counters: {
        gamesPlayed: 0,
        wins: 0,
        lastPlayedAt: null
    }
};

describe('lobbyRoomPayloads', () => {
    test('buildCreateRoomPayload keeps online room payload free of npc-only fields', () => {
        expect(buildCreateRoomPayload({
            playerName: 'host',
            matchMode: 'online',
            aiDifficulty: 'hell',
            selectedGeishaSet: 'default',
            setupMode: 'random',
            selectedCharacterIds: [],
            boundAccountProfile: null
        })).toEqual({
            playerId: 'host',
            displayName: 'host',
            lineUserId: undefined,
            avatarUrl: undefined,
            mode: 'online',
            aiDifficulty: undefined,
            geishaSet: 'default',
            setupMode: 'random'
        });
    });

    test('buildCreateRoomPayload includes npc difficulty, account presentation, and custom selection', () => {
        expect(buildCreateRoomPayload({
            playerName: 'npc-host',
            matchMode: 'npc',
            aiDifficulty: 'expert',
            selectedGeishaSet: 'hololive',
            setupMode: 'custom',
            selectedCharacterIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            boundAccountProfile
        })).toEqual({
            playerId: 'npc-host',
            displayName: 'npc-host',
            lineUserId: 'U1234567890',
            avatarUrl: 'https://example.test/avatar.png',
            mode: 'npc',
            aiDifficulty: 'expert',
            geishaSet: 'hololive',
            setupMode: 'custom',
            customSelection: {
                characterIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
            }
        });
    });

    test('buildJoinRoomPayload only includes join fields and bound account presentation', () => {
        expect(buildJoinRoomPayload({
            roomId: 'ROOM01',
            playerName: 'joiner',
            boundAccountProfile
        })).toEqual({
            roomId: 'ROOM01',
            playerId: 'joiner',
            displayName: 'joiner',
            lineUserId: 'U1234567890',
            avatarUrl: 'https://example.test/avatar.png'
        });
    });

    test('isCustomSelectionReady only requires seven ids for custom setup', () => {
        expect(isCustomSelectionReady('random', [])).toBe(true);
        expect(isCustomSelectionReady('custom', ['a', 'b', 'c', 'd', 'e', 'f'])).toBe(false);
        expect(isCustomSelectionReady('custom', ['a', 'b', 'c', 'd', 'e', 'f', 'g'])).toBe(true);
    });
});
