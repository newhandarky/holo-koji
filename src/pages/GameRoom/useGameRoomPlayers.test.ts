import { renderHook } from '@testing-library/react';
import { useGameRoomPlayers } from './useGameRoomPlayers';

const makeState = (players: Array<{ id: string; name?: string; avatarUrl?: string }>) => ({
    players: players.map((player) => ({
        id: player.id,
        name: player.name ?? player.id,
        avatarUrl: player.avatarUrl ?? '',
        hand: [],
        playedCards: [],
        secretCards: [],
        discardedCards: [],
        actionTokens: [],
        score: { charm: 0, tokens: 0 }
    }))
});

describe('useGameRoomPlayers', () => {
    test('uses server player data before local fallback', () => {
        const { result } = renderHook(() => useGameRoomPlayers({
            state: makeState([{ id: 'p1', name: '伺服器玩家', avatarUrl: '/server.png' }]) as any,
            currentPlayerId: 'p1',
            localLineName: '本機玩家',
            localLineAvatar: '/local.png'
        }));

        expect(result.current.hostId).toBe('p1');
        expect(result.current.currentPlayer?.name).toBe('伺服器玩家');
        expect(result.current.playerProfile?.name).toBe('伺服器玩家');
        expect(result.current.displayName).toBe('伺服器玩家');
        expect(result.current.displayAvatar).toBe('/server.png');
    });

    test('creates local player profile when server state has not caught up', () => {
        const { result } = renderHook(() => useGameRoomPlayers({
            state: makeState([]) as any,
            currentPlayerId: 'p-local',
            localLineName: 'LINE 玩家',
            localLineAvatar: '/line.png'
        }));

        expect(result.current.hostId).toBe('');
        expect(result.current.currentPlayer).toBeNull();
        expect(result.current.playerProfile?.id).toBe('p-local');
        expect(result.current.playerProfile?.actionTokens.map((token) => token.type)).toEqual([
            'secret',
            'trade-off',
            'gift',
            'competition'
        ]);
        expect(result.current.displayName).toBe('LINE 玩家');
        expect(result.current.displayAvatar).toBe('/line.png');
    });
});
