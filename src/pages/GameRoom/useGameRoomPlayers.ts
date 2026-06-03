import { useCallback, useMemo } from 'react';
import { ActionToken, GameState, Player } from '@newhandarky/hanakoji-game-types';

const createInitialActionTokens = (): ActionToken[] => [
    { type: 'secret', used: false },
    { type: 'trade-off', used: false },
    { type: 'gift', used: false },
    { type: 'competition', used: false },
];

export const createPlayerProfile = (id: string): Player => ({
    id,
    name: id,
    hand: [],
    playedCards: [],
    secretCards: [],
    discardedCards: [],
    actionTokens: createInitialActionTokens(),
    score: {
        charm: 0,
        tokens: 0
    }
});

interface UseGameRoomPlayersOptions {
    state: GameState;
    currentPlayerId: string;
    localLineName: string;
    localLineAvatar: string;
}

export const useGameRoomPlayers = ({
    state,
    currentPlayerId,
    localLineName,
    localLineAvatar
}: UseGameRoomPlayersOptions) => {
    const hostId = (state as { hostId?: string }).hostId ?? state.players[0]?.id ?? '';
    const currentPlayer = currentPlayerId
        ? (state.players.find(player => player.id === currentPlayerId) ?? null)
        : null;
    const playerProfile = currentPlayerId
        ? (currentPlayer ?? createPlayerProfile(currentPlayerId))
        : null;
    const playersById = useMemo(() => new Map(state.players.map((player) => [player.id, player])), [state.players]);
    const getPlayerDisplayName = useCallback((playerId?: string) => {
        if (!playerId) return '未知玩家';
        const player = playersById.get(playerId);
        return player?.name
            || (playerId === currentPlayerId ? localLineName : '')
            || playerId
            || '未知玩家';
    }, [currentPlayerId, localLineName, playersById]);
    const getPlayerAvatar = useCallback((playerId?: string) => {
        if (!playerId) return '';
        const player = playersById.get(playerId);
        return player?.avatarUrl || (playerId === currentPlayerId ? localLineAvatar : '') || '';
    }, [currentPlayerId, localLineAvatar, playersById]);

    return {
        hostId,
        currentPlayer,
        playerProfile,
        getPlayerDisplayName,
        getPlayerAvatar,
        displayName: getPlayerDisplayName(currentPlayerId),
        displayAvatar: getPlayerAvatar(currentPlayerId)
    };
};
